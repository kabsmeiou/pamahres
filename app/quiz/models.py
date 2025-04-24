from django.db import models
from courses.models import CourseMaterial
from courses.models import Course
# quiz model that is linked to materials in a course and specifies the number of questions
class QuizModel(models.Model):
  course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='quizzes')
  material_list = models.ManyToManyField(CourseMaterial, related_name="quiz_references")
  # add quiz_score here
  number_of_questions = models.PositiveIntegerField(default=5)
  quiz_title = models.CharField(max_length=100, unique=True)

  def __str__(self):
    return self.quiz_title

QUESTION_TYPE_CHOICES = [
  ('t/f', 'True/False'),
  ('multiple_choice', 'Multiple Choice')
]

# question model
# has the type of question(t/f or multiple_choice)
class QuestionModel(models.Model):
  quiz = models.ForeignKey(QuizModel, on_delete=models.CASCADE, related_name='questions')
  # counters for the number of correct and incorrect answers
  correct_answer_count = models.PositiveIntegerField(default=0)
  incorrect_answer_count = models.PositiveIntegerField(default=0)

  # question-specific variables
  question = models.CharField(max_length=1000)
  question_type = models.CharField(max_length=20, choices=QUESTION_TYPE_CHOICES, blank=False, null=False)
  correct_answer = models.CharField(max_length=50)
  question_option_1 = models.CharField(max_length=100, blank=True, null=True)
  question_option_2 = models.CharField(max_length=100, blank=True, null=True)
  question_option_3 = models.CharField(max_length=100, blank=True, null=True)
  question_option_4 = models.CharField(max_length=100, blank=True, null=True)

  def __str__(self):
    return self.question
  
  def get_options(self):
    if self.question_type == "t/f":
      return ["True", "False", self.correct_answer]
    else:
      return [self.question_option_1, self.question_option_2, self.question_option_3, self.question_option_4, self.correct_answer]