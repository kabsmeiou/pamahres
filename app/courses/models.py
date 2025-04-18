from django.db import models
# from django.contrib.postgres.fields import ArrayField
from user.models import User

DAYS_OF_WEEK = [
  (0, 'Monday'),
  (1, 'Tuesday'),
  (2, 'Wednesday'),
  (3, 'Thursday'),
  (4, 'Friday'),
  (5, 'Saturday'),
  (6, 'Sunday'),
]

# Create your models here.
class Course(models.Model):
  user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='courses')
  course_name = models.CharField(max_length=100, unique=True, null=False, blank=False)
  course_units = models.PositiveIntegerField(blank=True, null=True)
  start_time = models.TimeField(blank=True, null=True)
  end_time = models.TimeField(blank=True, null=True)
  # days = ArrayField(models.IntegerField(choices=DAYS_OF_WEEK), blank=True, default=list)

  # def get_days(self):
  #   return [DAYS_OF_WEEK[day][1] for day in self.days]

  def __str__(self):
    return self.course_name


class CourseMaterial(models.Model):
  course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='course_materials')
  material_path = models.CharField(max_length=100, null=False, blank=False)
  material_file = models.FileField(upload_to='course_materials/', null=False, blank=False)
  uploaded_at = models.DateTimeField(auto_now_add=True)

  def __str__(self):
    return f"{self.course.course_name} - {self.material_file.name}"