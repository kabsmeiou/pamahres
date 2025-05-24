from django.contrib import admin
from .models import QuizModel, QuestionModel, QuestionOption

# Register your models here.
admin.site.register(QuizModel)
admin.site.register(QuestionModel)
admin.site.register(QuestionOption)
