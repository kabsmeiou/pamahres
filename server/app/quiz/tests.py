from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse
from django.test import override_settings
from user.models import User, Profile, UserActivity
from courses.models import Course, CourseMaterial
from quiz.models import QuizModel, QuestionModel
from typing import Final
import uuid
from unittest.mock import patch

TEST_PASSWORD: Final[str] = 'testpass123'

class QuizViewTests(APITestCase):
    def setUp(self):
        # Create a test user that mimics Clerk user creation
        self.user = self.create_test_user()
        
        # For testing, we'll use Django's built-in authentication
        # instead of Clerk authentication to avoid external dependencies
        self.client.force_authenticate(user=self.user)
        
        # A course for testing and send a post request to create it
        valid_units = {
            'course_name': 'Test Course',
            'course_code': 'TEST',
        }
        url = reverse('course-list-create')
        response = self.client.post(url, valid_units, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.course = Course.objects.get(id=response.data['id'])

        # Attach a material for testing
        material = {
            'material_file_url': "https://example.com/test.pdf",
            'file_name': 'test_quiz_material.pdf',
            'file_type': 'application/pdf',
            'file_size': 1024
        }

        url = reverse('course-material-list-create', kwargs={'course_id': self.course.id})
        response = self.client.post(url, material, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(CourseMaterial.objects.count(), 1)
        self.material1 = CourseMaterial.objects.get(id=response.data['id'])
        
        # quiz via POST
        dummy_quiz = {
            'course': self.course.id,
            'quiz_title': 'Test Quiz',
            'material_list': [self.material1.id],
        }
        url = reverse('quiz-list-create', kwargs={'course_id': self.course.id})
        response = self.client.post(url, dummy_quiz, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.quiz = QuizModel.objects.get(id=response.data['id'])

        # setup question for the quiz
        question1 = {
            'question':'Test Question 1', 
            'quiz': self.quiz.id,
            'question_type':'MCQ',
            'options': [
                {"text": "3", "is_correct": False},
                {"text": "4", "is_correct": True},
                {"text": "5", "is_correct": False}
            ]
        }
        url = reverse('question-list-create', kwargs={'quiz_id': self.quiz.id})
        response = self.client.post(url, question1, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.question1 = QuestionModel.objects.get(id=response.data['id'])

        # another question
        question2 = {
            'question':'Test Question 2', 
            'quiz': self.quiz.id,
            'question_type':'MCQ',
            'options': [
                {"text": "3", "is_correct": False},
                {"text": "4", "is_correct": True},
                {"text": "5", "is_correct": False},
                {"text": "6", "is_correct": False}
            ]
        }
        url = reverse('question-list-create', kwargs={'quiz_id': self.quiz.id})
        response = self.client.post(url, question2, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.question2 = QuestionModel.objects.get(id=response.data['id'])


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