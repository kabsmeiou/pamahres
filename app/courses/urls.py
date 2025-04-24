# get the views from views.py
from django.urls import path
from .views import CourseView, CourseMaterialsView, CourseDetailView
from rest_framework_simplejwt.views import TokenObtainPairView

urlpatterns = [
  path('courses/', CourseView.as_view(), name='course-list-create'),
  path('courses/<int:course_id>/', CourseDetailView.as_view(), name='course-detail'),
  path('courses/<int:course_id>/materials/', CourseMaterialsView.as_view(), name='course-materials'),
]