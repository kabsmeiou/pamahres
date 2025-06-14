from django.db import models
# from django.contrib.postgres.fields import ArrayField
from django.core.validators import FileExtensionValidator
from user.models import User

# Create your models here.
class Course(models.Model):
  user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='courses')
  course_code = models.CharField(max_length=10, unique=True, null=False, blank=False)
  course_name = models.CharField(max_length=100, unique=True, null=True, blank=True)
  course_description = models.TextField(null=True, blank=True)
  last_updated_at = models.DateTimeField(auto_now=True)

  def __str__(self):
    return self.course_name
  
  def get_number_of_quizzes(self):
    return self.quizzes.count()

class CourseMaterial(models.Model):
  course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='materials')
  material_file_url = models.CharField(max_length=100)  # Use URLField for external file URLs
  file_name = models.CharField(max_length=100)
  file_size = models.PositiveIntegerField()
  file_type = models.CharField(max_length=50)
  uploaded_at = models.DateTimeField(auto_now_add=True)

  # database index for 'course' and 'uploaded_at'
  # querying performence
  class Meta:
    indexes = [
      models.Index(fields=['course', 'uploaded_at']),
    ]
    ordering = ['-uploaded_at']

  
  # @property
  #   def public_url(self):
  #       # Generate the public URL if needed
  #       return f"https://<your-project>.supabase.co/storage/v1/object/public/materials-all/{self.file_path}"


class ChatHistory(models.Model):
  course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='conversations')
  name_filter = models.CharField(max_length=100, null=False, blank=True)  # name for the conversation: yyyy-mm-dd-course_code since course_code is unique
  previous_messages = models.JSONField() 

  class Meta:
    indexes = [
      models.Index(fields=['course', 'name_filter']),
    ]