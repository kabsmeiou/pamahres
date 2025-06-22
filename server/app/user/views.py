from django.shortcuts import render
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated, AllowAny
from user.serializers import UserSerializer, ProfileSerializer, UserWithProfileSerializer
from user.models import User, Profile
from rest_framework.views import APIView
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
import logging

logger = logging.getLogger(__name__)

class ProfileView(generics.RetrieveUpdateAPIView):
  permission_classes = [IsAuthenticated]
  serializer_class = ProfileSerializer

  def get_object(self):
    return self.request.user.profile

class UserDetailView(generics.RetrieveAPIView):
  permission_classes = [IsAuthenticated]
  serializer_class = UserWithProfileSerializer

  def get_object(self):
     return self.request.user

from django.http import JsonResponse
from app.middleware import ClerkSDK

class ClerkProtectedView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return JsonResponse({"message": "Clerk authentication successful", "user": str(request.user)})