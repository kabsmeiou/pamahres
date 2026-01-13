from django.urls import path
from .views import QuizListCreateView, QuestionListCreateView, GenerateQuestionView, QuizDeleteView, QuizDetailView, CheckQuizAnswerView

urlpatterns = [
    path('', QuizListCreateView.as_view(), name='quiz-list-create'), 
    path('<int:quiz_id>/questions/', QuestionListCreateView.as_view(), name='question-list-create'), 
    path('<int:quiz_id>/generate-questions/', GenerateQuestionView.as_view(), name='generate-questions'),
    path('<int:quiz_id>/delete/', QuizDeleteView.as_view(), name='quiz-delete'),
    path('<int:quiz_id>/', QuizDetailView.as_view(), name='quiz-detail'),
    path('<int:quiz_id>/check-answers/', CheckQuizAnswerView.as_view(), name='check-quiz-answers'),
]