from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse
from django.contrib.auth import get_user_model
from user.models import Profile

User = get_user_model()

class UserRegistrationTest(APITestCase):
  def test_user_registration_creates_profile(self):
    url = reverse('signup')
    data = {
      'username': 'testuser',
      'email': 'test@example.com',
      'first_name': 'Test',
      'last_name': 'User',
      'password': 'testpass123'
    }
    response = self.client.post(url, data, format='json')
    self.assertEqual(response.status_code, status.HTTP_201_CREATED)
    user = User.objects.get(username='testuser')
    self.assertTrue(Profile.objects.filter(user=user).exists())
