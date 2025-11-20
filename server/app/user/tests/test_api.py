from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse
from user.models import User, Profile
from unittest.mock import patch
import jwt

class ClerkAuthTest(APITestCase):
    @patch('app.middleware.ClerkSDK.get_jwks')
    @patch('jwt.decode')
    def test_clerk_authentication_success(self, mock_jwt_decode, mock_get_jwks):
        mock_get_jwks.return_value = {
            "keys": [
                {
                    "kty": "RSA",
                    "kid": "testkey",
                    "use": "sig",
                    "n": "testmodulus",
                    "e": "AQAB"
                }
            ]
        }
        mock_jwt_decode.return_value = {
            "sub": "test_user_id"
        }

        url = reverse('course-list-create')
        self.client.credentials(HTTP_AUTHORIZATION='Bearer testtoken')
        response = self.client.get(url)

        self.assertNotEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn('test_user_id', [user.username for user in User.objects.all()])

    @patch('app.middleware.ClerkSDK.get_jwks')
    @patch('jwt.decode', side_effect=jwt.InvalidTokenError)
    def test_clerk_authentication_failure(self, mock_jwt_decode, mock_get_jwks):
        mock_get_jwks.return_value = {
            "keys": [
                {
                    "kty": "RSA",
                    "kid": "testkey",
                    "use": "sig",
                    "n": "testmodulus",
                    "e": "AQAB"
                }
            ]
        }

        url = reverse('course-list-create')  
        self.client.credentials(HTTP_AUTHORIZATION='Bearer invalidtoken')
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


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
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    

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