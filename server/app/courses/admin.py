from django.contrib import admin
from .models import Course, CourseMaterial, ChatHistory, Message

# Register your models here.
admin.site.register(Course)
admin.site.register(CourseMaterial)
admin.site.register(Message)
admin.site.register(ChatHistory)