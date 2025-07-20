from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.
class User(AbstractUser):
  # index the username
  username = models.CharField(max_length=150, unique=True)
  quick_create_credit = models.PositiveIntegerField(default=3)

  def __str__(self):
    return self.username

# create option for mbti
MBTI_CHOICES = [
  ('ENFP', 'ENFP'),
  ('INFP', 'INFP'),
  ('ENFJ', 'ENFJ'),
  ('INFJ', 'INFJ'),
  ('ENTJ', 'ENTJ'),
  ('INTJ', 'INTJ'),
  ('ENTP', 'ENTP'),
  ('INTP', 'INTP'),
  ('ESFJ', 'ESFJ'),
  ('ISFJ', 'ISFJ'),
  ('ESTJ', 'ESTJ'),
  ('ISTJ', 'ISTJ'),
  ('ESFP', 'ESFP'),
  ('ISFP', 'ISFP'),
  ('ESTP', 'ESTP'),
  ('ISTP', 'ISTP'),
]

EDUCATION_LEVEL_CHOICES = [
  ('Elementary', 'Elementary'),
  ('High School', 'High School'),
  ('Undergraduate', 'Undergraduate'),
  ('Graduate', 'Graduate'),
]


class Profile(models.Model):
  user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
  # use user.first_name for the name
  # use choices for mbti and education level
  mbti_type = models.CharField(max_length=4, choices=MBTI_CHOICES, blank=True, null=True)
  age = models.PositiveIntegerField(blank=True, null=True)
  education_level = models.CharField(max_length=20, choices=EDUCATION_LEVEL_CHOICES, blank=True, null=True)
  user_course = models.CharField(max_length=100, blank=True)
  target_study_hours = models.PositiveIntegerField(blank=True, null=True)
  current_grade = models.PositiveIntegerField(blank=True, null=True)

  def __str__(self):
    return self.user.first_name


class UserActivity(models.Model):
  user = models.OneToOneField(User, on_delete=models.CASCADE)
  last_login = models.DateTimeField(auto_now=True)
  quiz_attempts = models.PositiveIntegerField(default=0)
  materials_uploaded = models.PositiveIntegerField(default=0)


class UserSettings(models.Model):
  user = models.OneToOneField(User, on_delete=models.CASCADE)
  notification_preferences = models.BooleanField(default=False)