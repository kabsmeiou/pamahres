from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse
from user.models import User
from courses.models import Course, CourseMaterial


class CourseViewTests(APITestCase):
  def setUp(self):
    # Create a user for authentication
    self.user = User.objects.create_user(username="testuser", password="password")
    self.token = self.get_jwt_token(self.user)

  def get_jwt_token(self, user):
    """Helper method to get JWT token for the user."""
    # Obtain JWT token using the TokenObtainPairView
    response = self.client.post(reverse('token_obtain_pair'), data={
        'username': user.username,
        'password': 'password'  # Use the password set during user creation
    })
    return response.data['access']  # Return the access token
  
  def test_create_invalid_course_with_non_numeric_units(self):
    """Test creating a course with invalid units."""
    invalid_unit = {
      'course_name': 'Test Course',
      'course_units': 'invalid_unit',  # Invalid units should raise a validation error
    }

    url = reverse('course-list-create')
    response = self.client.post(url, invalid_unit, HTTP_AUTHORIZATION=f'Bearer {self.token}', format='json')  
    self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

  
  def test_create_invalid_course_with_negative_units(self):
    """Should fail when creating a course with non-positive integers in the units field."""
    invalid_unit = {
      'course_name': 'Test Course',
      'course_units': -4,  # Invalid units should raise a validation error
    }

    url = reverse('course-list-create')
    response = self.client.post(url, invalid_unit, HTTP_AUTHORIZATION=f'Bearer {self.token}', format='json')
    self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

  def test_create_valid_course(self):
    """Should work when creating a course that meets the model's expected input"""
    invalid_units = {
      'course_name': 'Test Course',
      'course_units': 5,  # Invalid units should raise a validation error
    }

    url = reverse('course-list-create')
    response = self.client.post(url, invalid_units, HTTP_AUTHORIZATION=f'Bearer {self.token}', format='json')  
    self.assertEqual(response.status_code, status.HTTP_201_CREATED)

  def test_course_material(self):
    pass