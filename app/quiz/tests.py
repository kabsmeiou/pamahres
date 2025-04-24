from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse
from user.models import User
from courses.models import Course, CourseMaterial
from quiz.models import QuizModel, QuestionModel
from rest_framework_simplejwt.tokens import RefreshToken

class QuizViewTests(APITestCase):
    def setUp(self):
        # Create a user for authentication
        self.user = User.objects.create_user(username="testuser", password="password")
        self.token = self.get_jwt_token(self.user) 
        #setup_user_details(self.user)
        
        # Create a course for testing
        self.course = Course.objects.create(course_name="Test Course", user=self.user)
        # Create a material linked to the course
        self.material1 = CourseMaterial.objects.create(material_path='test_content.pdf', material_file='test_content.pdf', course=self.course)
    
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
    
    def test_generate_questions_from_pdf(self):
        """Test the quiz creation and question generation from PDF."""
        quiz_data = {
            "course": self.course.id,
            "quiz_title": "Quiz From PDF",
            "number_of_questions": 5,
            "material_list": [self.material1.id]  # Ensure this ID is valid
        }

        url = reverse('quiz-list-create', kwargs={'course_id': self.course.id})
        response = self.client.post(url, quiz_data, HTTP_AUTHORIZATION=f'Bearer {self.token}')
        # print(response.data)  
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # fetch the questions from the newly created quiz
        quiz_id = response.data['id']
        questions_url = reverse('question-list', kwargs={'quiz_id': quiz_id, 'course_id': self.course.id})
        questions_response = self.client.get(questions_url, HTTP_AUTHORIZATION=f'Bearer {self.token}')
        
        self.assertEqual(questions_response.status_code, status.HTTP_200_OK)
        self.assertGreater(len(questions_response.data), 0)  # Ensure questions were generated
        print(questions_response.data)

