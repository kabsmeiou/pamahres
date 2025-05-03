from django.urls import path
from .views import QuizListCreateView, QuestionListCreateView, GenerateQuestionView, QuestionOptionCreateView

urlpatterns = [
    path('courses/<int:course_id>/quizzes/', QuizListCreateView.as_view(), name='quiz-list-create'), 
    path('quizzes/<int:quiz_id>/questions/', QuestionListCreateView.as_view(), name='question-list-create'), 
    path('quizzes/<int:quiz_id>/generate-questions/', GenerateQuestionView.as_view(), name='generate-questions'),
    path('question/<int:question_id>/option/', QuestionOptionCreateView.as_view(), name='add-option'), 
]