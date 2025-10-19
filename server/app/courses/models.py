from django.db import models
from django.utils import timezone
# from django.contrib.postgres.fields import ArrayField
from django.core.validators import FileExtensionValidator
from user.models import User

# Create your models here.
class Course(models.Model):
  user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='courses')
  course_code = models.CharField(max_length=10, null=False, blank=False)
  course_name = models.CharField(max_length=100, null=True, blank=True)
  course_description = models.TextField(null=True, blank=True)
  last_updated_at = models.DateTimeField(auto_now=True)
  is_quick_create = models.BooleanField(default=False)

  def __str__(self):
    return self.course_name
  
  def get_number_of_quizzes(self):
    return self.quizzes.count()
  
  class Meta:
    unique_together = [('user', 'course_code'),
                       ('user', 'course_name')] 


class CourseMaterial(models.Model):
  course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='materials')
  material_file_url = models.CharField(max_length=100)  # Use URLField for external file URLs
  file_name = models.CharField(max_length=100, null=False, blank=False, unique=False)
  file_size = models.PositiveIntegerField()
  file_type = models.CharField(max_length=50)
  uploaded_at = models.DateTimeField(auto_now_add=True)

  # database index for 'course' and 'uploaded_at'
  # querying performence
  class Meta:
    indexes = [
      models.Index(fields=['course', 'uploaded_at']),
    ]
    unique_together = [('course', 'file_name')]
    ordering = ['-uploaded_at']

  
  # @property
  #   def public_url(self):
  #       # Generate the public URL if needed
  #       return f"https://<your-project>.supabase.co/storage/v1/object/public/materials-all/{self.file_path}"

# make new model for messages to allow pagination
# currently, it will be very expensive to store all messages in a single field especially if convo gets too large
class ChatHistory(models.Model):
  course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='conversations')
  name_filter = models.CharField(max_length=100, null=False, blank=True)  # name for the conversation: yyyy-mm-dd-course_code since course_code is unique
  date_created = models.DateTimeField(auto_now_add=True)

  class Meta:
    indexes = [
      models.Index(fields=['course', 'name_filter']),
    ]

  # custom get date to return only the mm-dd-yyyy format
  def get_date(self):
    return self.date_created.strftime("%m-%d-%Y")
  
  
  @classmethod
  def get_today_for_course_and_user(cls, course_id, user):
      today = timezone.now().strftime("%Y-%m-%d")
      name_filter = f"{today}-{course_id}"
      return cls.objects.filter(
          course__id=course_id,
          name_filter=name_filter,
          course__user=user,
      ).first()


SENDER_CHOICES = [
  ('user', 'User'),
  ('ai', 'AI'),
]

class Message(models.Model):
  chat_history = models.ForeignKey(ChatHistory, on_delete=models.CASCADE, related_name='messages')
  sender = models.CharField(choices=SENDER_CHOICES, blank=False, default='user', max_length=5)
  content = models.TextField()
  timestamp = models.DateTimeField(auto_now_add=True)

  class Meta:
    indexes = [
      models.Index(fields=['chat_history']),
    ]
    ordering = ['timestamp']  # Order messages by timestamp in ascending order
  
  def __str__(self):
    return f"{self.sender}: {self.content[:20]}..."