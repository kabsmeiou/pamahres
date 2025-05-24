from django.contrib import admin
from .models import Course, CourseMaterial

# Register your models here.
admin.site.register(Course)
admin.site.register(CourseMaterial)