# get the views from views.py
from django.urls import path
from .views import CourseView, CourseMaterialsView, CourseDetailView, CourseMaterialDetailView, MaterialDetailView, LLMConversationView

# reminder: utilize parameters in urls, if an id is passed, no need to let serializer pass it around
urlpatterns = [
  path('courses/', CourseView.as_view(), name='course-list-create'),
  path('courses/<int:course_id>/', CourseDetailView.as_view(), name='course-detail'),
  path('courses/<int:course_id>/materials/', CourseMaterialsView.as_view(), name='course-material-list-create'),
  path('courses/<int:course_id>/materials/<int:material_id>/', CourseMaterialDetailView.as_view(), name='course-material-detail'),
  path('materials/<int:material_id>/', MaterialDetailView.as_view(), name='material-detail'),
  path('chat/<int:course_id>/', LLMConversationView.as_view(), name='llm-conversation'),
]