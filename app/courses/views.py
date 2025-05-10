from rest_framework import generics
from rest_framework.permissions import IsAuthenticated, BasePermission
from courses.serializers import CourseSerializer, CourseMaterialSerializer
from django.shortcuts import get_object_or_404
from .models import Course
from rest_framework.exceptions import ValidationError

# Check if the user is the owner, use as permission for the views
class IsOwner(BasePermission):
  def has_object_permission(self, request, view, obj):
    return obj.user == request.user
    
# View function for showing the courses that the current user has made.
# Also serves as a view for creating new courses
class CourseView(generics.ListCreateAPIView):
  serializer_class = CourseSerializer
  permission_classes = [IsAuthenticated, IsOwner]

  def get_queryset(self):
    return self.request.user.courses.all()

  def perform_create(self, serializer):
    serializer.save(user=self.request.user)
  
# View for showing all the materials in a course. It will return the materials'
# associated with the user and the course he clicked.
# This also serves as a view for uploading new materials.
class CourseMaterialsView(generics.ListCreateAPIView):
  serializer_class = CourseMaterialSerializer
  permission_classes = [IsAuthenticated, IsOwner]

  def get_queryset(self):
    return self.request.user.courses.course_materials.all()
  
  def perform_create(self, serializer):
    # get course id from params
    course_id = self.kwargs['course_id']
    try:
      course = get_object_or_404(Course, id=course_id)
    except Exception as e:
      raise ValidationError(f"Error creating material: {str(e)}")
    serializer.save(course=course)


# Single instance view of a course, showing details
# and allowing updates
class CourseDetailView(generics.RetrieveUpdateAPIView):
  serializer_class = CourseSerializer
  permission_classes = [IsAuthenticated, IsOwner]

  # Look into the course list in database and select the corresponding course_id from the request
  def get_object(self):
    return get_object_or_404(Course, id=self.kwargs["course_id"], user=self.request.user)
  
