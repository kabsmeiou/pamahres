from django.urls import path
from .views import QuickCreateQuizView

urlpatterns = [
    path('quick-create/', QuickCreateQuizView.as_view(), name='quick-create-quiz'),
    path('quick-create/<int:quiz_id>/', QuickCreateQuizView.as_view(), name='quick-create-quiz-status'),
]
