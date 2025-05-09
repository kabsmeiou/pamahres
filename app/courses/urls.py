# get the views from views.py
from django.urls import path
from .views import CourseView, CourseMaterialsView, CourseDetailView
from rest_framework_simplejwt.views import TokenObtainPairView

# reminder: utilize parameters in urls, if an id is passed, no need to let serializer pass it around
urlpatterns = [
  path('courses/', CourseView.as_view(), name='course-list-create'),
  path('courses/<int:course_id>/', CourseDetailView.as_view(), name='course-detail'),
  path('courses/<int:course_id>/materials/', CourseMaterialsView.as_view(), name='course-material-list-create'),
]