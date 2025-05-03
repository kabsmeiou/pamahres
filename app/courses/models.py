from django.db import models
# from django.contrib.postgres.fields import ArrayField
from django.core.validators import FileExtensionValidator
from user.models import User

# Create your models here.
class Course(models.Model):
  user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='courses')
  course_code = models.CharField(max_length=10, unique=True, null=False, blank=False)
  course_name = models.CharField(max_length=100, unique=True, null=True, blank=True)

  def __str__(self):
    return self.course_name

class CourseMaterial(models.Model):
  course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='materials')
  material_file = models.FileField(
    upload_to='course_materials/',
    validators=[FileExtensionValidator(allowed_extensions=['pdf', 'docx', 'pptx', 'jpg', 'png'])],
    null=False,
    blank=False
  )
  file_size = models.PositiveIntegerField(null=True)
  file_type = models.CharField(max_length=50, null=True)
  uploaded_at = models.DateTimeField(auto_now_add=True)

  # database index for 'course' and 'uploaded_at'
  # querying performence
  class Meta:
    indexes = [
      models.Index(fields=['course', 'uploaded_at']),
    ]
    ordering = ['-uploaded_at']

  def save(self, *args, **kwargs):
    if self.material_file:
      self.file_size = self.material_file.size
      self.file_type = self.material_file.name.split('.')[-1].lower()
    super().save(*args, **kwargs)

  def __str__(self):
    return f"{self.course.name} - {self.material_file.name}"

  def __str__(self):
    return f"{self.course.course_name} - {self.material_file.name}"