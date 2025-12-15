from django.urls import path
from .views import QuizListCreateView, QuestionListCreateView, GenerateQuestionView, QuizDeleteView, QuizDetailView, CheckQuizAnswerView, QuickCreateQuizView

urlpatterns = [
    path('', QuizListCreateView.as_view(), name='quiz-list-create'), 
    path('<int:quiz_id>/questions/', QuestionListCreateView.as_view(), name='question-list-create'), 
    path('<int:quiz_id>/generate-questions/', GenerateQuestionView.as_view(), name='generate-questions'),
    path('<int:quiz_id>/delete/', QuizDeleteView.as_view(), name='quiz-delete'),
    path('<int:quiz_id>/', QuizDetailView.as_view(), name='quiz-detail'),
    path('<int:quiz_id>/check-answers/', CheckQuizAnswerView.as_view(), name='check-quiz-answers'),
    # Quick create endpoints
    path('quick-create/', QuickCreateQuizView.as_view(), name='quick-create-quiz'),
    path('quick-create/<int:quiz_id>/', QuickCreateQuizView.as_view(), name='quick-create-quiz-status'),
]