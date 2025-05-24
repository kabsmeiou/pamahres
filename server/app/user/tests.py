from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse
from django.contrib.auth import get_user_model
from user.models import Profile
from unittest.mock import patch

User = get_user_model()

class ClerkAuthTest(APITestCase):
    @patch('rest_framework_simplejwt.authentication.JWTAuthentication.authenticate')
    @patch('app.middleware.JWTAuthenticationMiddleware.decode_jwt')  # Mock the decode_jwt method
    def test_clerk_protected_view_with_valid_token(self, mock_decode_jwt, mock_authenticate):
        # Mock the authentication to simulate a valid user
        User = get_user_model()
        user = User.objects.create(username='clerkuser', email='clerk@example.com')

        # Mock the return value of authenticate and decode_jwt
        mock_authenticate.return_value = (user, None)
        mock_decode_jwt.return_value = user  # Return the mocked user when decoding the JWT

        # Make the GET request with the mock token
        url = reverse('clerk_protected')
        response = self.client.get(url, HTTP_AUTHORIZATION='Bearer testtoken')

        # Print the response for debugging
        print(response.json())

        # Check if the response is successful and contains the expected message
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('Clerk authentication successful', response.json()['message'])
