from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse
from user.models import User
from courses.models import Course, CourseMaterial
from quiz.models import QuizModel, QuestionModel

class QuizViewTests(APITestCase):
    def setUp(self):
        # Create a user for authentication
        self.user = User.objects.create_user(username="testuser", password="password")
        self.token = self.get_jwt_token(self.user) 
        #setup_user_details(self.user)
        
        # Create a course for testing and send a post request to create it
        valid_units = {
            'course_name': 'Test Course',
            'course_code': 'TEST',
            'course_units': 5,  # Valid units should not raise a validation error
        }
        url = reverse('course-list-create')
        response = self.client.post(url, valid_units, HTTP_AUTHORIZATION=f'Bearer {self.token}', format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.course = Course.objects.get(id=response.data['id'])

        # Create a material for testing
        self.material1 = CourseMaterial.objects.create(material_file='test_content.pdf', course=self.course)

        # Create quiz via POST
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
        question = {
            'question':'Test Question', 
            'quiz': self.quiz.id,
            'question_type':'MCQ',
        }
        url = reverse('question-list-create', kwargs={'quiz_id': self.quiz.id})
        response = self.client.post(url, question, HTTP_AUTHORIZATION=f'Bearer {self.token}', format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.question = QuestionModel.objects.get(id=response.data['id'])
    
    def setup_user_details(self, user):
        """Helper method to set up user details."""
        self.user = user
        self.token = self.get_jwt_token(user)
        user.age = 20
        user.education_level = 'Undergraduate'
        user.mbti_type = 'INFP'
        user.save()

    def get_jwt_token(self, user):
        """Helper method to get JWT token for the user."""
        # Obtain JWT token using the TokenObtainPairView
        response = self.client.post(reverse('token_obtain_pair'), data={
            'username': user.username,
            'password': 'password'  # Use the password set during user creation
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

    def test_add_question_to_quiz(self):
        """Should work when adding a question to a quiz"""
        question = {
            'question':'Test Question', 
            'quiz': self.quiz.id,
            'question_type':'MCQ',
        }
        url = reverse('question-list-create', kwargs={'quiz_id': self.quiz.id})
        response = self.client.post(url, question, HTTP_AUTHORIZATION=f'Bearer {self.token}', format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_add_option_to_question(self):
        """Should work when adding an option to a question"""
        option = {
            'question': self.question.id,
            'text': 'Test Option',
            'is_correct': False
        }
        url = reverse('add-option', kwargs={'question_id': self.question.id})
        response = self.client.post(url, option, HTTP_AUTHORIZATION=f'Bearer {self.token}', format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
    
