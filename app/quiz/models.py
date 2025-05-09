from django.db import models
from courses.models import CourseMaterial
from courses.models import Course
from django.core.validators import MinValueValidator, MaxValueValidator
from django.core.exceptions import ValidationError

# quiz model that is linked to materials in a course and specifies the number of questions
class QuizModel(models.Model):
  course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='quizzes')
  material_list = models.ManyToManyField(CourseMaterial, related_name="quiz_references")
  time_limit_minutes = models.PositiveIntegerField( # quiz time limit
    default=10,
    help_text="Time limit in minutes",
    validators=[MinValueValidator(1)],
  )
  # add quiz_score here
  quiz_score = models.PositiveIntegerField(
    default=0,
    help_text="Current quiz score", # record highest score
    validators=[MinValueValidator(0)],
  )
  number_of_questions = models.PositiveIntegerField(
    default=5,
    validators=[
      MinValueValidator(1),  # At least 1 question
      MaxValueValidator(20),  # Max 20 questions
    ],
  )
  quiz_title = models.CharField(max_length=100, unique=True)
  uploaded_at = models.DateTimeField(auto_now_add=True)

  class Meta:
    indexes = [
      models.Index(fields=['course', 'quiz_title']),
    ]
    constraints = [
      models.UniqueConstraint(
        fields=['course', 'quiz_title'],
        name='unique_quiz_title_per_course'
      ),
    ]
    ordering = ['-uploaded_at']

  def __str__(self):
    return self.quiz_title

# add options to a model
# validate number of options (only <= 4 for now)
# MCQ must have >= 3 options 
class QuestionOption(models.Model):
  question = models.ForeignKey('QuestionModel', on_delete=models.CASCADE, related_name='options')
  text = models.CharField(max_length=200, null=False, blank=False)
  is_correct = models.BooleanField(null=False, default=False)

  # index by questions fk
  class Meta:
    indexes = [
      models.Index(fields=['question']),
    ]
    ordering = ['id']

  def __str__(self):
      return f"{self.text} {'(Correct)' if self.is_correct else ''}"

class QuestionModel(models.Model):
  QUESTION_TYPE_CHOICES = [
    ('MCQ', 'Multiple Choice'),
    ('TF', 'True/False'),
  ]
  quiz = models.ForeignKey(QuizModel, on_delete=models.CASCADE, related_name='questions')
  question = models.CharField(max_length=1000)
  question_type = models.CharField(max_length=3, choices=QUESTION_TYPE_CHOICES, default='MCQ')
  correct_answer_count = models.PositiveIntegerField(default=0)
  incorrect_answer_count = models.PositiveIntegerField(default=0)

  # indexing quiz for faster lookup when i filter questions by quiz
  class Meta:
    indexes = [
      models.Index(fields=['quiz']),
    ]
    ordering = ['id']

  def __str__(self):
    return self.question

  def get_options(self):
    if self.question_type == 'TF':
      return ['True', 'False']
    return [option.text for option in self.options.all()]

  def get_correct_answer(self):
    if self.question_type == 'TF':
      return self.options.filter(is_correct=True).first().text
    return self.options.filter(is_correct=True).first()

  def clean(self):
    if self.question_type == 'MCQ' and self.options.count() < 2:
      raise ValidationError("MCQ questions must have at least 2 options.")
    if self.question_type == 'TF' and self.options.exists():
      raise ValidationError("True/False questions should not have custom options.")
    