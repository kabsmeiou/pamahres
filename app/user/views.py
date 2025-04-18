from django.shortcuts import render
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated, AllowAny
from user.serializers import UserSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

# login/signup views
class Signup(generics.CreateAPIView):
  permission_classes = [AllowAny]
  serializer_class = UserSerializer

class Login(TokenObtainPairView):
  permission_classes = [AllowAny]


class Logout(generics.GenericAPIView):
  permission_classes = [IsAuthenticated]

  def post(self, request):
    try:
      refresh_token = request.data["refresh"]
      token = RefreshToken(refresh_token)
      token.blacklist()  # Blacklist the refresh token
      return Response({"message": "Logout successful"}, status=200)
    except Exception as e:
      return Response({"error": "Invalid token"}, status=400)


class ProfileView(generics.RetrieveAPIView):
  permission_classes = [IsAuthenticated]
  serializer_class = UserSerializer

  def get_object(self):
    return self.request.user