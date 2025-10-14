from django.test import TestCase
from django.core.exceptions import ValidationError
from django.db import IntegrityError
from user.models import User
from courses.models import Course, CourseMaterial
from quiz.models import QuizModel, QuestionModel, QuestionOption
from typing import Final
import uuid

TEST_PASSWORD: Final[str] = 'testpass123'

class QuizModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password=TEST_PASSWORD)
        self.course = Course.objects.create(
            user=self.user, 
            course_name='Test Course', 
            course_description='A test course',
            course_code='TEST101'
        )
        self.material = CourseMaterial.objects.create(
            course=self.course,
            file_name='Test Material',
            file_size=1024,
            file_type='application/pdf',
            material_file_url='http://example.com/test.pdf'
        )

    def test_quiz_creation(self):
        quiz = QuizModel.objects.create(
            course=self.course,
            quiz_title='Test Quiz',
            number_of_questions=5,
            time_limit_minutes=15
        )
        self.assertEqual(quiz.course, self.course)
        self.assertEqual(quiz.quiz_title, 'Test Quiz')
        self.assertEqual(quiz.number_of_questions, 5)
        self.assertEqual(quiz.time_limit_minutes, 15)
        self.assertEqual(quiz.quiz_score, 0)
        self.assertFalse(quiz.is_generated)
        self.assertIsNone(quiz.last_taken)

    def test_quiz_str_representation(self):
        quiz = QuizModel.objects.create(
            course=self.course,
            quiz_title='Test Quiz'
        )
        self.assertEqual(str(quiz), 'Test Quiz')

    def test_quiz_with_materials(self):
        quiz = QuizModel.objects.create(
            course=self.course,
            quiz_title='Test Quiz'
        )
        quiz.material_list.add(self.material)
        self.assertIn(self.material, quiz.material_list.all())

    def test_current_number_of_questions(self):
        quiz = QuizModel.objects.create(
            course=self.course,
            quiz_title='Test Quiz'
        )
        self.assertEqual(quiz.current_number_of_questions(), 0)
        
        # Add a question
        QuestionModel.objects.create(
            quiz=quiz,
            question='Test question?',
            question_type='MCQ',
            correct_answer='A'
        )
        self.assertEqual(quiz.current_number_of_questions(), 1)

    def test_quiz_time_limit_validation(self):
        # Test minimum time limit
        with self.assertRaises(ValidationError):
            quiz = QuizModel(
                course=self.course,
                quiz_title='Test Quiz',
                time_limit_minutes=0
            )
            quiz.full_clean()

        # Test maximum time limit
        with self.assertRaises(ValidationError):
            quiz = QuizModel(
                course=self.course,
                quiz_title='Test Quiz',
                time_limit_minutes=31
            )
            quiz.full_clean()

    def test_quiz_number_of_questions_validation(self):
        # Test maximum number of questions
        with self.assertRaises(ValidationError):
            quiz = QuizModel(
                course=self.course,
                quiz_title='Test Quiz',
                number_of_questions=21
            )
            quiz.full_clean()

    def test_unique_quiz_title_per_course(self):
        QuizModel.objects.create(
            course=self.course,
            quiz_title='Unique Quiz'
        )
        
        # Should raise IntegrityError for duplicate title in same course
        with self.assertRaises(IntegrityError):
            QuizModel.objects.create(
                course=self.course,
                quiz_title='Unique Quiz'
            )

    def test_same_quiz_title_different_courses(self):
        # Create another course
        user2 = User.objects.create_user(username='testuser2', password=TEST_PASSWORD)
        course2 = Course.objects.create(
            user=user2,
            course_name='Test Course 2',
            course_description='Another test course',
            course_code='TEST102'
        )
        
        # Same quiz title should work for different courses
        quiz1 = QuizModel.objects.create(
            course=self.course,
            quiz_title='Same Title'
        )
        quiz2 = QuizModel.objects.create(
            course=course2,
            quiz_title='Same Title'
        )
        
        self.assertNotEqual(quiz1.course, quiz2.course)
        self.assertEqual(quiz1.quiz_title, quiz2.quiz_title)


class QuestionModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password=TEST_PASSWORD)
        self.course = Course.objects.create(
            user=self.user,
            course_name='Test Course',
            course_description='A test course',
            course_code='TEST101'
        )
        self.quiz = QuizModel.objects.create(
            course=self.course,
            quiz_title='Test Quiz'
        )

    def test_mcq_question_creation(self):
        question = QuestionModel.objects.create(
            quiz=self.quiz,
            question='What is 2+2?',
            question_type='MCQ',
            correct_answer='4'
        )
        self.assertEqual(question.quiz, self.quiz)
        self.assertEqual(question.question, 'What is 2+2?')
        self.assertEqual(question.question_type, 'MCQ')
        self.assertEqual(question.correct_answer, '4')
        self.assertIsNone(question.user_answer)

    def test_tf_question_creation(self):
        question = QuestionModel.objects.create(
            quiz=self.quiz,
            question='The sky is blue.',
            question_type='TF',
            correct_answer='True'
        )
        self.assertEqual(question.question_type, 'TF')
        self.assertEqual(question.correct_answer, 'True')

    def test_question_str_representation(self):
        question = QuestionModel.objects.create(
            quiz=self.quiz,
            question='Test question?'
        )
        self.assertEqual(str(question), 'Test question?')

    def test_get_options_for_tf_question(self):
        question = QuestionModel.objects.create(
            quiz=self.quiz,
            question='Test true/false question?',
            question_type='TF'
        )
        options = question.get_options()
        self.assertEqual(options, ['True', 'False'])

    def test_get_options_for_mcq_question(self):
        question = QuestionModel.objects.create(
            quiz=self.quiz,
            question='Test MCQ question?',
            question_type='MCQ'
        )
        
        # Add options
        QuestionOption.objects.create(question=question, text='Option A', order=1)
        QuestionOption.objects.create(question=question, text='Option B', order=2)
        QuestionOption.objects.create(question=question, text='Option C', order=3)
        
        options = question.get_options()
        self.assertEqual(len(options), 3)
        self.assertIn('Option A', options)
        self.assertIn('Option B', options)
        self.assertIn('Option C', options)

    def test_mcq_validation_insufficient_options(self):
        question = QuestionModel.objects.create(
            quiz=self.quiz,
            question='Test MCQ question?',
            question_type='MCQ'
        )
        
        # Add only one option
        QuestionOption.objects.create(question=question, text='Option A', order=1)
        
        with self.assertRaises(ValidationError):
            question.clean()

    def test_tf_validation_with_custom_options(self):
        question = QuestionModel.objects.create(
            quiz=self.quiz,
            question='Test TF question?',
            question_type='TF'
        )
        
        # Add custom option to TF question (should not be allowed)
        QuestionOption.objects.create(question=question, text='Custom Option', order=1)
        
        with self.assertRaises(ValidationError):
            question.clean()


class QuestionOptionTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password=TEST_PASSWORD)
        self.course = Course.objects.create(
            user=self.user,
            course_name='Test Course',
            course_description='A test course',
            course_code='TEST101'
        )
        self.quiz = QuizModel.objects.create(
            course=self.course,
            quiz_title='Test Quiz'
        )
        self.question = QuestionModel.objects.create(
            quiz=self.quiz,
            question='Test MCQ question?',
            question_type='MCQ',
            correct_answer='Option A'
        )

    def test_option_creation(self):
        option = QuestionOption.objects.create(
            question=self.question,
            text='Option A',
            order=1
        )
        self.assertEqual(option.question, self.question)
        self.assertEqual(option.text, 'Option A')
        self.assertEqual(option.order, 1)

    def test_option_str_representation_correct(self):
        option = QuestionOption.objects.create(
            question=self.question,
            text='Option A',
            order=1
        )
        # This option matches the correct answer
        self.assertEqual(str(option), 'Option A')

    def test_option_str_representation_incorrect(self):
        option = QuestionOption.objects.create(
            question=self.question,
            text='Option B',
            order=2
        )
        # This option doesn't match the correct answer
        self.assertEqual(str(option), 'Option A')

    def test_options_ordering(self):
        option3 = QuestionOption.objects.create(
            question=self.question,
            text='Option C',
            order=3
        )
        option1 = QuestionOption.objects.create(
            question=self.question,
            text='Option A',
            order=1
        )
        option2 = QuestionOption.objects.create(
            question=self.question,
            text='Option B',
            order=2
        )
        
        # Test that options are ordered by the 'order' field
        options = list(self.question.options.all())
        self.assertEqual(options[0], option1)
        self.assertEqual(options[1], option2)
        self.assertEqual(options[2], option3)


