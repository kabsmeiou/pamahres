from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse
from user.models import User
from courses.models import Course, CourseMaterial
import fitz

class CourseViewTests(APITestCase):
  def setUp(self):
    # Create a user for authentication
    self.user = User.objects.create_user(username="testuser", password="password")
    self.token = self.get_jwt_token(self.user)

    valid_units = {
      'course_name': 'Test Course',
      'course_code': 'TEST',
      'course_units': 5,  # Valid units should not raise a validation error
    }

    url = reverse('course-list-create')
    response = self.client.post(url, valid_units, HTTP_AUTHORIZATION=f'Bearer {self.token}', format='json')
    self.assertEqual(response.status_code, status.HTTP_201_CREATED)
    self.course = Course.objects.get(id=response.data['id'])

  def get_jwt_token(self, user):
    """Helper method to get JWT token for the user."""
    # Obtain JWT token using the TokenObtainPairView
    response = self.client.post(reverse('token_obtain_pair'), data={
        'username': user.username,
        'password': 'password'
    })
    return response.data['access']
  
  def test_create_invalid_course_code(self):
    """Test creating a course with invalid units."""
    invalid_unit = {
      'course_name': 'Test Course',
      'course_code': None,
    }

    url = reverse('course-list-create')
    response = self.client.post(url, invalid_unit, HTTP_AUTHORIZATION=f'Bearer {self.token}', format='json')  
    self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

  
  def test_create_invalid_course_duplicate_course_name(self):
    """Should fail when creating a course with non-positive integers in the units field."""
    invalid_unit = {
      'course_name': 'Test Course',
      'course_code': 'code2',
    }
    url = reverse('course-list-create')
    response = self.client.post(url, invalid_unit, HTTP_AUTHORIZATION=f'Bearer {self.token}', format='json')
    self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

  def test_create_invalid_course_with_empty_string(self):
    """Should fail when creating an empty course name"""
    invalid_unit = {
      'course_name': "", # No course name should raise a validation error
    }

    url = reverse('course-list-create')
    response = self.client.post(url, invalid_unit, HTTP_AUTHORIZATION=f'Bearer {self.token}', format='json')
    self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

  def test_create_valid_course(self):
    """Should work when creating a course that meets the model's expected input"""
    valid_units = {
      'course_name': 'Test Course 2',
      'course_code': 'TEST2',
    }

    url = reverse('course-list-create')
    response = self.client.post(url, valid_units, HTTP_AUTHORIZATION=f'Bearer {self.token}', format='json')
    self.assertEqual(response.status_code, status.HTTP_201_CREATED)

  def test_course_material(self):
    """"Should be able to add materials in the course"""
    material = {
      'material_file_url': "https://yszhqkacyhudqdjjncjc.supabase.co/storage/v1/object/public/images//inbound1750991441972193945.webp",
      'file_name': 'test.pdf',
      'file_type': 'pdf',
      'file_size': 1024
    }

    url = reverse('course-material-list-create', kwargs={'course_id': self.course.id})
    response = self.client.post(url, material, HTTP_AUTHORIZATION=f'Bearer {self.token}', format='json')
    self.assertEqual(response.status_code, status.HTTP_201_CREATED)
    self.assertEqual(CourseMaterial.objects.count(), 1)