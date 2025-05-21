from rest_framework import generics
from rest_framework.permissions import IsAuthenticated, BasePermission
from courses.serializers import CourseSerializer, CourseMaterialSerializer
from django.shortcuts import get_object_or_404
from .models import Course, CourseMaterial
from rest_framework.exceptions import ValidationError
from supabase_client import supabase
from rest_framework.response import Response
from rest_framework import status
from urllib.parse import urlparse
from quiz.models import QuizModel
from quiz.tasks import generate_questions_task

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
    # Get course_id from the URL parameters
    course_id = self.kwargs['course_id']
    
    # Ensure the course exists and belongs to the current user
    course = get_object_or_404(Course, id=course_id, user=self.request.user)
    
    # Return all materials related to the course
    return course.materials.all()
  
  def perform_create(self, serializer):
    # get course id from params
    course_id = self.kwargs['course_id']
    course = get_object_or_404(Course, id=course_id)

    serializer.save(course=course)
    # get currently uploaded material
    material = serializer.instance

    # if course has been created, create a quiz then pregenerate questions based on this(just saved) material
    quiz = QuizModel.objects.create(
      course=course, 
      is_generated=True,
      number_of_questions=20
    )
    quiz.material_list.add(material)
    # delay the task to generate questions
    try:
      generate_questions_task.delay(quiz.id, quiz.number_of_questions)
    except Exception as e:
      raise ValidationError(f"Error generating questions: {str(e)}")

class CourseMaterialDetailView(generics.RetrieveUpdateDestroyAPIView):
  serializer_class = CourseMaterialSerializer
  permission_classes = [IsAuthenticated, IsOwner]

  def get_object(self):
    return get_object_or_404(CourseMaterial, id=self.kwargs["material_id"], course__user=self.request.user)
  
  # override the delete method to delete the material from supabase and the object from the database
  def delete(self, request, *args, **kwargs):
    material = self.get_object()
    response = supabase.storage.from_('materials-all').remove([material.material_file_url])
    if 'error' in response and response['error'] is not None:
        return Response(
            {"error": "Failed to delete file from Supabase", "details": str(response['error'])},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    material.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)

# Single instance view of a course, showing details
# and allowing updates
class CourseDetailView(generics.RetrieveUpdateAPIView):
  serializer_class = CourseSerializer
  permission_classes = [IsAuthenticated, IsOwner]

  # Look into the course list in database and select the corresponding course_id from the request
  def get_object(self):
    return get_object_or_404(Course, id=self.kwargs["course_id"], user=self.request.user)
  
class MaterialDetailView(generics.RetrieveUpdateDestroyAPIView):
  serializer_class = CourseMaterialSerializer
  permission_classes = [IsAuthenticated, IsOwner]

  def get_object(self):
    return get_object_or_404(CourseMaterial, id=self.kwargs["material_id"], course__user=self.request.user)
