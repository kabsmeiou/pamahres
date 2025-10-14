from django.core.exceptions import ValidationError
from django.test import TestCase
from user.models import Profile, User, UserActivity
from unittest.mock import patch


class UserModelTests(TestCase):
    def test_create_user(self):
        user = User.objects.create_user(username='testuser', password='testpass123')
        self.assertEqual(user.username, 'testuser')
        self.assertTrue(user.check_password('testpass123'))

    def test_default_quick_create_credit(self):
        user = User.objects.create_user(username='testuser', password='testpass123')
        self.assertEqual(user.quick_create_credit, 3)

    def test_unique_username(self):
        User.objects.create_user(username='testuser', password='testpass123')
        with self.assertRaises(Exception):
            User.objects.create_user(username='testuser', password='anotherpass')

class ProfileModelTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='testpass123')

    def test_create_profile(self):
        profile = Profile.objects.create(user=self.user, age=20, education_level='Undergraduate')
        self.assertEqual(profile.user.username, 'testuser')

    def test_str_method(self):
        profile = Profile.objects.create(user=self.user, age=20)
        self.assertEqual(str(profile), self.user.first_name)

    def test_set_mbti_type(self):
        profile = Profile.objects.create(user=self.user)
        profile.mbti_type = 'INTJ'
        profile.save()
        self.assertEqual(profile.mbti_type, 'INTJ')
    
    def test_invalid_mbti_type(self):
        profile = Profile.objects.create(user=self.user)
        with self.assertRaises(ValidationError):
            profile.mbti_type = 'INVALID'
            profile.full_clean()
            profile.save()
    
    def test_set_education_level(self):
        profile = Profile.objects.create(user=self.user)
        profile.education_level = 'Graduate'
        profile.save()
        self.assertEqual(profile.education_level, 'Graduate')
    
    def test_invalid_education_level(self):
        profile = Profile.objects.create(user=self.user)
        with self.assertRaises(ValidationError):
            profile.education_level = 'InvalidLevel'
            profile.full_clean()
            profile.save()
    
    def test_set_age(self):
        profile = Profile.objects.create(user=self.user)
        profile.age = 25
        profile.save()
        self.assertEqual(profile.age, 25)

    def test_invalid_age(self):
        profile = Profile.objects.create(user=self.user)
        with self.assertRaises(Exception):
            profile.age = -5
            profile.save()
    
    def test_user_course(self):
        profile = Profile.objects.create(user=self.user)
        profile.user_course = 'Computer Science'
        profile.save()
        self.assertEqual(profile.user_course, 'Computer Science')

    def test_invalid_user_course(self):
        profile = Profile.objects.create(user=self.user)
        with self.assertRaises(ValidationError):
            profile.user_course = 'A' * 61
            profile.full_clean()
            profile.save()
    
    def test_set_target_study_hours(self):
        profile = Profile.objects.create(user=self.user)
        profile.target_study_hours = 10
        profile.save()
        self.assertEqual(profile.target_study_hours, 10)

    def test_invalid_target_study_hours(self):
        profile = Profile.objects.create(user=self.user)
        with self.assertRaises(Exception):
            profile.target_study_hours = -3
            profile.save()
    
    def test_set_current_grade(self):
        profile = Profile.objects.create(user=self.user)
        profile.current_grade = 85
        profile.save()
        self.assertEqual(profile.current_grade, 85)

    def test_invalid_current_grade(self):
        profile = Profile.objects.create(user=self.user)
        with self.assertRaises(Exception):
            profile.current_grade = -10
            profile.save()

class UserActivityModelTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='testpass123')

    def test_create_user_activity(self):
        activity = UserActivity.objects.create(user=self.user)
        self.assertEqual(activity.user.username, 'testuser')
        self.assertEqual(activity.quiz_attempts, 0)
        self.assertEqual(activity.materials_uploaded, 0)

    def test_update_quiz_attempts(self):
        activity = UserActivity.objects.create(user=self.user)
        activity.quiz_attempts += 1
        activity.save()
        self.assertEqual(activity.quiz_attempts, 1)

    def test_update_materials_uploaded(self):
        activity = UserActivity.objects.create(user=self.user)
        activity.materials_uploaded += 2
        activity.save()
        self.assertEqual(activity.materials_uploaded, 2)

