from django.test import TestCase
from django.core.exceptions import ValidationError
from user.models import User
from courses.models import ChatHistory, Course, CourseMaterial, Message


class CourseModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='testpass')
        self.course = Course.objects.create(user=self.user, course_name='Sample Course', course_description='sample')

    def test_course_creation(self):
        self.assertEqual(self.course.course_name, 'Sample Course')
        self.assertEqual(self.course.course_description, 'sample')
        self.assertEqual(self.course.user, self.user)

    def test_course_str_representation(self):
        self.assertEqual(str(self.course), 'Sample Course')
    
    def test_get_number_of_quizzes(self):
        self.assertEqual(self.course.get_number_of_quizzes(), 0)
    
    def test_set_course_code(self):
        self.course.course_code = 'a'*10
        self.course.save()
        self.assertEqual(self.course.course_code, 'a'*10)

    def test_set_invalid_course_code(self):
        with self.assertRaises(Exception):
            self.course.course_code = 'a'*11
            self.course.full_clean()
            self.course.save()


class CourseMaterialModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='testpass')
        self.course = Course.objects.create(user=self.user, course_name='Sample Course', course_description='sample', course_code='CS101')

    def test_course_material_creation(self):
        material = CourseMaterial.objects.create(course=self.course, file_name='Lecture 1', file_size=2048, file_type='application/pdf', material_file_url='http://example.com/lecture1.pdf')
        self.assertEqual(material.course, self.course)
        self.assertEqual(material.file_name, 'Lecture 1')
        self.assertEqual(material.file_size, 2048)
        self.assertEqual(material.file_type, 'application/pdf')
        self.assertEqual(material.material_file_url, 'http://example.com/lecture1.pdf')

    # def test_course_material_invalid_file_type(self):
    #     with self.assertRaises(ValidationError):
    #         material = CourseMaterial.objects.create(course=self.course, file_name='Lecture 1', file_size=2048, file_type='text/plain', material_file_url='http://example.com/lecture1.txt')   
    #         material.full_clean()
    #         material.save()

    def test_course_material_delete(self):
        material = CourseMaterial.objects.create(course=self.course, file_name='Lecture 1', file_size=2048, file_type='application/pdf', material_file_url='http://example.com/lecture1.pdf')
        material_id = material.id
        material.delete()
        self.assertFalse(CourseMaterial.objects.filter(id=material_id).exists())


class ChatHistoryModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='testpass')
        self.course = Course.objects.create(user=self.user, course_name='Sample Course', course_description='sample', course_code='CS101')

    def test_chat_history_creation(self):
        chat = ChatHistory.objects.create(course=self.course, name_filter='2023-10-01-CS101')
        self.assertEqual(chat.course, self.course)
        self.assertEqual(chat.name_filter, '2023-10-01-CS101')
        self.assertIsNotNone(chat.date_created)

    def test_chat_history_get_date(self):
        chat = ChatHistory.objects.create(course=self.course, name_filter='2023-10-01-CS101')
        self.assertEqual(chat.get_date(), chat.date_created.strftime('%m-%d-%Y'))
    

class MessageModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='testpass')
        self.course = Course.objects.create(user=self.user, course_name='Sample Course', course_description='sample', course_code='CS101')
        self.chat = ChatHistory.objects.create(course=self.course, name_filter='2023-10-01-CS101')

    def test_message_creation(self):
        message = Message.objects.create(chat_history=self.chat, sender='user', content='Hello, this is a test message.')
        self.assertEqual(message.chat_history, self.chat)
        self.assertEqual(message.sender, 'user')
        self.assertEqual(message.content, 'Hello, this is a test message.')
        self.assertIsNotNone(message.timestamp)

    def test_message_str_representation(self):
        message = Message.objects.create(chat_history=self.chat, sender='user', content='Hello, this is a test message.')
        self.assertEqual(str(message), f"{message.sender}: {message.content[:20]}...")
        self.assertIsNotNone(message.timestamp)