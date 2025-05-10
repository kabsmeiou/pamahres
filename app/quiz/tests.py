from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse
from user.models import User
from courses.models import Course, CourseMaterial
from quiz.models import QuizModel, QuestionModel
from typing import Final

TEST_PASSWORD: Final[str] = 'testpass123'

class QuizViewTests(APITestCase):
    def setUp(self):
        # Create a user for authentication
        url = reverse('signup')
        data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'first_name': 'Test',
            'last_name': 'User',
            'password': TEST_PASSWORD
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        user = User.objects.get(username='testuser')
        self.user = user
        self.token = self.get_jwt_token(self.user) 
        
        # A course for testing and send a post request to create it
        valid_units = {
            'course_name': 'Test Course',
            'course_code': 'TEST',
        }
        url = reverse('course-list-create')
        response = self.client.post(url, valid_units, HTTP_AUTHORIZATION=f'Bearer {self.token}', format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.course = Course.objects.get(id=response.data['id'])

        # Attach a material for testing
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
        self.material1 = CourseMaterial.objects.get(id=response.data['id'])
        
        # quiz via POST
        dummy_quiz = {
            'course': self.course.id,
            'quiz_title': 'Test Quiz',
            'material_list': [self.material1.id],
        }
        url = reverse('quiz-list-create', kwargs={'course_id': self.course.id})
        response = self.client.post(url, dummy_quiz, HTTP_AUTHORIZATION=f'Bearer {self.token}', format='json')
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
        response = self.client.post(url, question1, HTTP_AUTHORIZATION=f'Bearer {self.token}', format='json')
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
        response = self.client.post(url, question2, HTTP_AUTHORIZATION=f'Bearer {self.token}', format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.question2 = QuestionModel.objects.get(id=response.data['id'])

    
    # def setup_user_details(self, user):
    #     """Helper method to set up user details."""
    #     self.user = user
    #     self.token = self.get_jwt_token(user)
    #     user.age = 20
    #     user.education_level = 'Undergraduate'
    #     user.mbti_type = 'INFP'
    #     user.save()

    def get_jwt_token(self, user):
        """Helper method to get JWT token for the user."""
        # Obtain JWT token using the TokenObtainPairView
        response = self.client.post(reverse('token_obtain_pair'), data={
            'username': user.username,
            'password': TEST_PASSWORD # Use the password set during user creation
        })
        return response.data['access']  # Return the access token
    
    def test_create_quiz(self):
        """Confirm quiz creation worked in setUp"""
        self.assertEqual(self.quiz.quiz_title, 'Test Quiz')
    
    # def test_generate_quiz(self):
    #     """Should work when generating a quiz"""
    #     url = reverse('generate-questions', kwargs={'quiz_id': self.quiz.id})
    #     response = self.client.post(url, HTTP_AUTHORIZATION=f'Bearer {self.token}', format='json')
    #     self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_question_setup(self):
        """Should be able to find the created questions in the quiz"""
        url = reverse('question-list-create', kwargs={'quiz_id': self.quiz.id})
        response = self.client.get(url, HTTP_AUTHORIZATION=f'Bearer {self.token}', format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_options_for_question_setup(self):
        """Should be able to see the options for each question fetched in quiz_id"""
        url = reverse('question-list-create', kwargs={'quiz_id': self.quiz.id})
        response = self.client.get(url, HTTP_AUTHORIZATION=f'Bearer {self.token}', format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        options_for_question_1 = QuestionModel.objects.get(id=response.data[0]['id']).options.all()
        options_for_question_2 = QuestionModel.objects.get(id=response.data[1]['id']).options.all()
        self.assertGreater(len(options_for_question_1), 2)
        self.assertGreater(len(options_for_question_2), 2)

    def test_add_question_to_quiz_without_options(self):
        """Should not work when adding a question without options"""
        question = {
            'question':'Test Question 2', 
            'quiz': self.quiz.id,
            'question_type':'MCQ',
        }
        url = reverse('question-list-create', kwargs={'quiz_id': self.quiz.id})
        response = self.client.post(url, question, HTTP_AUTHORIZATION=f'Bearer {self.token}', format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_invalid_option_count(self):
        """Should not work when adding a question to a quiz with invalid option count"""
        question = {
            'question':'Test Question', 
            'quiz': self.quiz.id,
            'question_type':'MCQ',
            'options': [
                {"text": "3", "is_correct": False},
                {"text": "4", "is_correct": True},
                {"text": "5", "is_correct": False},
                {"text": "6", "is_correct": False},
                {"text": "8", "is_correct": False}
            ]
        }
        url = reverse('question-list-create', kwargs={'quiz_id': self.quiz.id})
        response = self.client.post(url, question, HTTP_AUTHORIZATION=f'Bearer {self.token}', format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_invalid_option_boolean(self):
        """Should not work when adding a question to a quiz with options for a t/f type question"""
        question = {
            'question':'Test Question', 
            'quiz': self.quiz.id,
            'question_type':'TF',
            'options': [
                {"text": "3", "is_correct": False},
                {"text": "4", "is_correct": True},
            ]
        }
        url = reverse('question-list-create', kwargs={'quiz_id': self.quiz.id})
        response = self.client.post(url, question, HTTP_AUTHORIZATION=f'Bearer {self.token}', format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_valid_boolean_question(self):
        """Should not work when adding a question to a quiz with options for a t/f type question"""
        question = {
            'question':'Test Question', 
            'quiz': self.quiz.id,
            'question_type':'TF',
            'options': [
                {'text': 'correct_answer', 'is_correct': True}
            ]
        }
        url = reverse('question-list-create', kwargs={'quiz_id': self.quiz.id})
        response = self.client.post(url, question, HTTP_AUTHORIZATION=f'Bearer {self.token}', format='json')
        # print(response.data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)


    def test_generate_quiz(self):
        """Should work when generating a quiz"""
        url = reverse('generate-questions', kwargs={'quiz_id': self.quiz.id})
        response = self.client.post(url, HTTP_AUTHORIZATION=f'Bearer {self.token}', format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    # def test_add_option_to_question(self):
    #     """Should work when adding an option to a question"""
    #     option = {
    #         'question': self.question.id,
    #         'text': 'Test Option',
    #         'is_correct': False
    #     }
    #     url = reverse('add-option', kwargs={'question_id': self.question.id})
    #     response = self.client.post(url, option, HTTP_AUTHORIZATION=f'Bearer {self.token}', format='json')
    #     self.assertEqual(response.status_code, status.HTTP_201_CREATED)
    
    # def test_invalid_add_option_to_question(self):
    #     """Should work when adding an option to a question"""
    #     option = {
    #         'question': self.question.id,
    #         'text': 'Test Option',
    #         'is_correct': False
    #     }
    #     url = reverse('add-option', kwargs={'question_id': self.question.id})
    #     response = self.client.post(url, option, HTTP_AUTHORIZATION=f'Bearer {self.token}', format='json')
    #     self.assertEqual(response.status_code, status.HTTP_201_CREATED)
