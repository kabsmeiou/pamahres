from django.urls import path
from .views import QuizListCreateView, QuestionListView

urlpatterns = [
    path('quizzes/<int:course_id>/', QuizListCreateView.as_view(), name='quiz-list-create'), 
    path('quizzes/<int:quiz_id>/questions/', QuestionListView.as_view(), name='question-list'), 
]