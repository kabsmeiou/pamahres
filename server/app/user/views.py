from django.shortcuts import render
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated, AllowAny
from user.serializers import UserSerializer
from rest_framework.response import Response
from rest_framework.views import APIView
from django.http import JsonResponse


class ProfileView(generics.RetrieveAPIView):
  permission_classes = [IsAuthenticated]
  serializer_class = UserSerializer

  def get_object(self):
    return self.request.user

  
from django.http import JsonResponse
from app.middleware import ClerkSDK

class ClerkProtectedView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return JsonResponse({"message": "Clerk authentication successful", "user": str(request.user)})