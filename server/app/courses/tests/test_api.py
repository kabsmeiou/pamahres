from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse
from user.models import User
from courses.models import Course, CourseMaterial, ChatHistory, Message
from quiz.models import QuizModel
from typing import Final
from unittest.mock import patch

TEST_PASSWORD: Final[str] = 'testpass123'

class CourseViewTests(APITestCase):
  def setUp(self):
    # Create a test user that mimics Clerk user creation
    self.user = User.objects.create_user(username='quizuser', password=TEST_PASSWORD)
    self.course = Course.objects.create(user=self.user, course_name='Test Course', course_description='Course Description')
    self.client.force_authenticate(user=self.user)

  def test_create_course(self):
    url = reverse('course-list-create')
    data = {
      'course_name': 'New Course',
      'course_code': 'NEW101',
      'course_units': 3,
    }
    response = self.client.post(url, data, format='json')
    self.assertEqual(response.status_code, status.HTTP_201_CREATED)
    self.assertEqual(Course.objects.count(), 2)
    self.assertEqual(Course.objects.get(id=response.data['id']).course_name, 'New Course')

  def test_get_course_detail(self):
    url = reverse('course-detail', kwargs={'course_id': self.course.id})
    response = self.client.get(url, format='json')
    self.assertEqual(response.status_code, status.HTTP_200_OK)
    self.assertEqual(response.data['course_name'], 'Test Course')
    self.assertEqual(response.data['course_description'], 'Course Description')

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

  @patch('courses.views.delete_course_chunks')
  def test_delete_course(self, mock_delete_chunks):
    url = reverse('course-detail', kwargs={'course_id': self.course.id})
    response = self.client.delete(url, format='json')
    self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
    self.assertFalse(Course.objects.filter(id=self.course.id).exists())
    mock_delete_chunks.assert_called_once_with(str(self.course.id))

  def test_get_course_list(self):
    url = reverse('course-list-create')
    response = self.client.get(url, format='json')
    self.assertEqual(response.status_code, status.HTTP_200_OK)
    self.assertEqual(len(response.data), 1)
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


class CourseMaterialTests(APITestCase):
  def setUp(self):
    self.user = User.objects.create_user(username='materialuser', password=TEST_PASSWORD)
    self.course = Course.objects.create(user=self.user, course_name='Material Course', course_description='Course Description')
    self.client.force_authenticate(user=self.user)

  @patch('courses.views.get_content_from_quizId')
  @patch('courses.views.generate_questions_by_chunks')
  @patch('courses.views.embed_and_upsert_chunks')
  def test_add_material(self, mock_embed, mock_generate, mock_get_content):
    url = reverse('course-material-list-create', kwargs={'course_id': self.course.id})
    data = {
      'file_name': 'Lecture 1',
      'file_size': 2048,
      'file_type': 'application/pdf',
      'material_file_url': 'http://example.com/lecture1.pdf'
    }
    response = self.client.post(url, data, format='json')
    self.assertEqual(response.status_code, status.HTTP_201_CREATED)
    self.assertEqual(CourseMaterial.objects.count(), 1)
    material = CourseMaterial.objects.get(id=response.data['id'])
    # get the pregenerated quiz associated with the material
    quiz = QuizModel.objects.filter(quiz_title=f'pregenerated-quiz-{material.id}').first()
    self.assertIsNotNone(quiz)
    self.assertEqual(material.file_name, 'Lecture 1')
    self.assertEqual(material.file_size, 2048)
    self.assertEqual(material.file_type, 'application/pdf')
    self.assertEqual(material.material_file_url, 'http://example.com/lecture1.pdf')
    mock_get_content.assert_called_once_with(quiz.id) # quizId generated here is 1
    mock_generate.assert_called_once_with(mock_get_content.return_value, quiz, 20)
    mock_embed.assert_called_once_with(chunks=mock_get_content.return_value, course_id=self.course.id)

  def test_get_material_detail(self):
    material = CourseMaterial.objects.create(course=self.course, file_name='Lecture 1', file_size=2048, file_type='application/pdf', material_file_url='http://example.com/lecture1.pdf')
    url = reverse('course-material-detail', kwargs={'course_id': self.course.id, 'material_id': material.id})
    response = self.client.get(url, format='json')
    self.assertEqual(response.status_code, status.HTTP_200_OK)
    self.assertEqual(response.data['file_name'], 'Lecture 1')
    self.assertEqual(response.data['file_size'], 2048)


  def test_delete_material(self):
    material = CourseMaterial.objects.create(course=self.course, file_name='Lecture 1', file_size=2048, file_type='application/pdf', material_file_url='http://example.com/lecture1.pdf')
    url = reverse('course-material-detail', kwargs={'course_id': self.course.id, 'material_id': material.id})
    response = self.client.delete(url, format='json')
    self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
    self.assertFalse(CourseMaterial.objects.filter(id=material.id).exists())
  

class ChatHistoryTests(APITestCase):
  def setUp(self):
    self.user = User.objects.create_user(username='chatuser', password=TEST_PASSWORD)
    self.course = Course.objects.create(user=self.user, course_name='Chat Course', course_description='Course Description')
    self.client.force_authenticate(user=self.user)

  def test_get_chat_histories(self):
    ChatHistory.objects.create(course=self.course, name_filter='2024-01-01-Chat101')
    url = reverse('chat-history', kwargs={'course_id': self.course.id})
    response = self.client.get(url, format='json')
    self.assertEqual(response.status_code, status.HTTP_200_OK)
    self.assertEqual(len(response.data), 1)

  def test_get_chat_history_messages(self):
    chat_history = ChatHistory.objects.create(course=self.course, name_filter='2024-01-01-Chat101')
    Message.objects.create(chat_history=chat_history, sender='user', content='Hello')
    Message.objects.create(chat_history=chat_history, sender='ai', content='Hi there!')
    url = reverse('chat-history-messages', kwargs={'course_id': self.course.id, 'chat_history_id': chat_history.id})
    response = self.client.get(url, format='json')
    self.assertEqual(response.status_code, status.HTTP_200_OK)
    self.assertEqual(len(response.data), 2)
    self.assertEqual(response.data[0]['content'], 'Hello')
    self.assertEqual(response.data[1]['content'], 'Hi there!')


class ChatHistoryDetailTests(APITestCase):
  def setUp(self):
    self.user = User.objects.create_user(username='chatdetailuser', password=TEST_PASSWORD)
    self.course = Course.objects.create(user=self.user, course_name='Chat Detail Course', course_description='Course Description')
    self.chat_history = ChatHistory.objects.create(course=self.course, name_filter='2024-01-01-Chat101')
    self.client.force_authenticate(user=self.user)

  def test_get_chat_history_detail(self):
    url = reverse('chat-history-detail', kwargs={'chat_history_id': self.chat_history.id})
    response = self.client.get(url, format='json')
    self.assertEqual(response.status_code, status.HTTP_200_OK)
    self.assertEqual(response.data['id'], self.chat_history.id)
    self.assertEqual(response.data['name_filter'], '2024-01-01-Chat101')

  def test_delete_chat_history(self):
    url = reverse('chat-history-detail', kwargs={'chat_history_id': self.chat_history.id})
    response = self.client.delete(url, format='json')
    self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
    self.assertFalse(ChatHistory.objects.filter(id=self.chat_history.id).exists())

