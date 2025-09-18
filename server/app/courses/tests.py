from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse
from user.models import User, Profile, UserActivity
from courses.models import Course, CourseMaterial
from typing import Final
import uuid

TEST_PASSWORD: Final[str] = 'testpass123'

class CourseViewTests(APITestCase):
  def setUp(self):
    # Create a test user that mimics Clerk user creation
    self.user = self.create_test_user()
    
    # For testing, we'll use Django's built-in authentication
    # instead of Clerk authentication to avoid external dependencies
    self.client.force_authenticate(user=self.user)

    valid_units = {
      'course_name': 'Test Course',
      'course_code': 'TEST',
      'course_units': 5,  # Valid units should not raise a validation error
    }

    url = reverse('course-list-create')
    response = self.client.post(url, valid_units, format='json')
    self.assertEqual(response.status_code, status.HTTP_201_CREATED)
    self.course = Course.objects.get(id=response.data['id'])


  def create_test_user(self):
      """Create a test user that mimics Clerk user creation."""
      # Generate a unique username that mimics Clerk's user ID format
      clerk_user_id = f"user_{uuid.uuid4().hex[:12]}"
      
      user = User.objects.create(
          username=clerk_user_id,
          email='test@example.com',
          first_name='Test',
          last_name='User'
      )
      
      # Create related objects like Clerk authentication middleware does
      Profile.objects.get_or_create(user=user)
      UserActivity.objects.get_or_create(user=user)
      
      return user


  def test_get_course_detail(self):
    url = reverse('course-detail', kwargs={'course_id': self.course.id})
    response = self.client.get(url, format='json')
    self.assertEqual(response.status_code, status.HTTP_200_OK)
    self.assertEqual(response.data['course_name'], 'Test Course')
    self.assertEqual(response.data['course_code'], 'TEST')


  def test_update_course(self):
    updated_data = {
      'course_name': 'Updated Course Name',
      'course_code': 'UPDATED',
      'course_units': 4,
    }
    url = reverse('course-detail', kwargs={'course_id': self.course.id})
    response = self.client.put(url, updated_data, format='json')
    self.assertEqual(response.status_code, status.HTTP_200_OK)
    self.course.refresh_from_db()
    self.assertEqual(self.course.course_name, 'Updated Course Name')
    self.assertEqual(self.course.course_code, 'UPDATED')


  def test_delete_course(self):
    url = reverse('course-detail', kwargs={'course_id': self.course.id})
    response = self.client.delete(url, format='json')
    self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
    self.assertFalse(Course.objects.filter(id=self.course.id).exists())


  def test_get_course_list(self):
    url = reverse('course-list-create')
    response = self.client.get(url, format='json')
    self.assertEqual(response.status_code, status.HTTP_200_OK)
    self.assertEqual(len(response.data), 1)  # Only one course created in setUp
    self.assertEqual(response.data[0]['course_name'], 'Test Course')


  def test_get_materials(self):
    url = reverse('course-material-list-create', kwargs={'course_id': self.course.id})
    response = self.client.get(url, format='json')
    self.assertEqual(response.status_code, status.HTTP_200_OK)
    self.assertEqual(len(response.data), 0)

  
  def test_delete_material_not_found(self):
    url = reverse('course-material-detail', kwargs={'course_id': self.course.id, 'material_id': 999})
    response = self.client.delete(url, format='json')
    self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


  def test_delete_material_success(self):
    # First, create a material to delete
    material = {
      'material_file_url': "2025-06-05T08:55:05_Concurrency",
      'file_name': 'test_material.pdf',
      'file_type': 'application/pdf',
      'file_size': 1024
    }

    url = reverse('course-material-list-create', kwargs={'course_id': self.course.id})
    response = self.client.post(url, material, format='json')
    self.assertEqual(response.status_code, status.HTTP_201_CREATED)
    material_id = response.data['id']

    # Now, delete the created material
    url = reverse('course-material-detail', kwargs={'course_id': self.course.id, 'material_id': material_id})
    response = self.client.delete(url, format='json')
    self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
    self.assertFalse(CourseMaterial.objects.filter(id=material_id).exists())


  def test_create_material(self):
    material = {
      'material_file_url': "2025-06-05T08:55:05_Concurrency",
      'file_name': 'test_material.pdf',
      'file_type': 'application/pdf',
      'file_size': 1024
    }

    url = reverse('course-material-list-create', kwargs={'course_id': self.course.id})
    response = self.client.post(url, material, format='json')
    self.assertEqual(response.status_code, status.HTTP_201_CREATED)
    self.assertEqual(CourseMaterial.objects.count(), 1)
    self.material1 = CourseMaterial.objects.get(id=response.data['id'])