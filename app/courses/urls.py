# get the views from views.py
from django.urls import path
from .views import CourseView, CourseMaterialsView, CourseDetailView
from rest_framework_simplejwt.views import TokenObtainPairView

urlpatterns = [
  path('', CourseView.as_view(), name='courses'),
  path('<int:course_id>/', CourseDetailView.as_view(), name='course_detail'),
  path('<int:course_id>/materials/', CourseMaterialsView.as_view(), name='course_materials'),
]