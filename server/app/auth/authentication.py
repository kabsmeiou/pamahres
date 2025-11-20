import jwt
import time
from jwt.algorithms import RSAAlgorithm
from rest_framework import authentication, exceptions

class ClerkAuth(authentication.BaseAuthentication):
    def authenticate(self, request):
        time_start = time.time()
        auth_header = request.headers.get("Authorization")

        if not auth_header or not auth_header.startswith("Bearer "):
            return None

        token = auth_header.split(" ")[1]

        try:
            from app.middleware import ClerkSDK
            clerk_sdk = ClerkSDK()
            jwks_data = clerk_sdk.get_jwks()
            public_key = RSAAlgorithm.from_jwk(jwks_data["keys"][0])

            payload = jwt.decode(
                token,
                public_key,
                algorithms=["RS256"],
                options={"verify_signature": True},
            )
        except jwt.InvalidTokenError:
            raise exceptions.AuthenticationFailed("Invalid Clerk token")

        user_id = payload.get("sub")
        from django.contrib.auth import get_user_model
        User = get_user_model()

        user, _ = User.objects.get_or_create(username=user_id)
        time_end = time.time()
        print(f"[ClerkAuth] Authentication took {time_end - time_start:.4f} seconds")
        return (user, None)
