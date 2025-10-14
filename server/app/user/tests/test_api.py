from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse
from user.models import User, Profile
from unittest.mock import patch

class ClerkAuthTest(APITestCase):
    @patch('rest_framework_simplejwt.authentication.JWTAuthentication.authenticate')
    @patch('app.middleware.JWTAuthenticationMiddleware.decode_jwt')
    def test_clerk_protected_view_with_valid_token(self, mock_decode_jwt, mock_authenticate):
        user = User.objects.create(username='clerkuser', email='clerk@example.com')
        mock_authenticate.return_value = (user, None)
        mock_decode_jwt.return_value = user 
        url = reverse('clerk_protected')
        response = self.client.get(url, HTTP_AUTHORIZATION='Bearer testtoken')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('Clerk authentication successful', response.json()['message'])

    @patch('rest_framework_simplejwt.authentication.JWTAuthentication.authenticate')
    @patch('app.middleware.JWTAuthenticationMiddleware.decode_jwt') 
    def test_clerk_protected_view_with_invalid_token(self, mock_decode_jwt, mock_authenticate):
        mock_authenticate.return_value = None
        mock_decode_jwt.return_value = None
        url = reverse('clerk_protected')
        response = self.client.get(url, HTTP_AUTHORIZATION='Bearer invalidtoken')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn('detail', response.json())


class UserAPITest(APITestCase):
    @patch('rest_framework_simplejwt.authentication.JWTAuthentication.authenticate')
    @patch('app.middleware.JWTAuthenticationMiddleware.decode_jwt')
    def setUp(self, mock_decode_jwt, mock_authenticate):
        self.user = User.objects.create_user(username='testuser', password='testpass')
        mock_authenticate.return_value = (self.user, None)
        mock_decode_jwt.return_value = self.user
        self.client.force_authenticate(user=self.user)

    def test_user_detail(self):
        url = reverse('user-detail')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], self.user.username)
        self.assertEqual(response.data['email'], self.user.email)
    
    def test_user_detail_unauthenticated(self):
        self.client.force_authenticate(user=None)
        url = reverse('user-detail')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    

class ProfileAPITest(APITestCase):
    @patch('rest_framework_simplejwt.authentication.JWTAuthentication.authenticate')
    @patch('app.middleware.JWTAuthenticationMiddleware.decode_jwt')
    def setUp(self, mock_decode_jwt, mock_authenticate):
        self.user = User.objects.create_user(username='testuser', password='testpass')
        mock_authenticate.return_value = (self.user, None)
        mock_decode_jwt.return_value = self.user
        self.client.force_authenticate(user=self.user)
        self.profile = Profile.objects.create(user=self.user, age=20, education_level='Undergraduate')

    def test_get_profile(self):
        url = reverse('profile')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['user'], self.user.id)

    def test_update_profile(self):
        url = reverse('profile')
        data = {
            'mbti_type': 'INTJ',
            'age': 25,
            'education_level': 'Graduate',
            'user_course': 'Computer Science',
            'target_study_hours': 10,
            'current_grade': 90,
        }
        response = self.client.put(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.profile.refresh_from_db()
        self.assertEqual(self.profile.mbti_type, 'INTJ')
        self.assertEqual(self.profile.age, 25)
        self.assertEqual(self.profile.education_level, 'Graduate')
        self.assertEqual(self.profile.user_course, 'Computer Science')
        self.assertEqual(self.profile.target_study_hours, 10)
        self.assertEqual(self.profile.current_grade, 90)
    

    def test_update_partial_profile(self):
        url = reverse('profile')
        data = {
            'age': 30,
        }
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.profile.refresh_from_db()
        self.assertEqual(self.profile.age, 30)