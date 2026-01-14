import time
import logging
from django.shortcuts import get_object_or_404
from django.db import transaction
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework.permissions import IsAuthenticated, BasePermission


from courses.serializers import CourseSerializer, CourseMaterialSerializer, LLMConversationSerializer, ChatHistorySerializer, MessageSerializer
from .models import Course, CourseMaterial, ChatHistory, Message
from quiz.models import QuizModel
from quiz.tasks import delete_material_and_quiz
from .services.conversation import handle_llm_conversation
from services.embedding import delete_course_chunks
from .services.quiz_pregeneration import handle_quiz_pregeneration

logger = logging.getLogger(__name__)

# Check if the user is the owner, use as permission for the views
class IsOwner(BasePermission):
  def has_object_permission(self, request, view, obj):
    return obj.user == request.user

# ########################
# FLOW FOR CHAT MESSAGES
# user -> client -> client sends to server
# server -> stores Message object in current ChatHistory(name_filter)
# server -> returns the chat history to the client
# client receives the current day ChatHistory -> back to user
# other history can be fetched on the history tab
# ########################

class ChatHistoryMessageView(generics.ListCreateAPIView):
  serializer_class = MessageSerializer
  permission_classes = [IsAuthenticated, IsOwner]

  def get_queryset(self):
    chat_history_id = None
    if 'chat_history_id' not in self.kwargs:
      # get today's chat history for the course and user
      chat_history_id = ChatHistory.get_today_for_course_and_user(
        course_id=self.kwargs['course_id'],
        user=self.request.user
      )
      if not chat_history_id:
        return Message.objects.none()
    else:
      chat_history_id = self.kwargs['chat_history_id']
    chat_history_messages = Message.objects.filter(
      chat_history=chat_history_id,
    )
    return chat_history_messages


# view to get chat history
class ChatHistoryView(generics.ListAPIView):
  serializer_class = ChatHistorySerializer
  permission_classes = [IsAuthenticated, IsOwner]

  def get_queryset(self):
    # get the course id from the url
    course_id = self.kwargs['course_id']
    
    # filter chat history based on course_id AND user_id
    chat_histories = ChatHistory.objects.filter(
      course__id=course_id,
      course__user=self.request.user
    ).order_by('-id')

    return chat_histories

class ChatHistoryDetailView(generics.RetrieveDestroyAPIView):
  serializer_class = ChatHistorySerializer
  permission_classes = [IsAuthenticated, IsOwner]

  def get_object(self):
    chat_history = get_object_or_404(ChatHistory, id=self.kwargs['chat_history_id'], course__user=self.request.user)
    return chat_history

class LLMConversationView(generics.GenericAPIView):
  serializer_class = LLMConversationSerializer
  permission_classes = [IsAuthenticated, IsOwner]

  def post(self, request, *args, **kwargs):
    serializer = self.get_serializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    # get the data from the serializer
    previous_messages = serializer.validated_data['previous_messages']
    new_message = serializer.validated_data['new_message']

    course = get_object_or_404(Course, id=self.kwargs['course_id'])

    reply = handle_llm_conversation(
      user=request.user,
      course=course,
      previous_messages=previous_messages,
      new_message=new_message,
    )

    return Response({"reply": reply}, status=status.HTTP_200_OK)
    
# View function for showing the courses that the current user has made.
# Also serves as a view for creating new courses
class CourseView(generics.ListCreateAPIView):
  serializer_class = CourseSerializer
  permission_classes = [IsAuthenticated, IsOwner]

  def get_queryset(self):
    start_time = time.time()
    courses = self.request.user.courses.filter(is_quick_create=False)
    logger.info(f"Total get_queryset method of course list took {time.time() - start_time:.3f} seconds")
    return courses
  
  def perform_create(self, serializer):
    serializer.save(user=self.request.user)


# View for showing all the materials in a course. It will return the materials'
# associated with the user and the course he clicked.
# This also serves as a view for uploading new materials.
class CourseMaterialsView(generics.ListCreateAPIView):
  serializer_class = CourseMaterialSerializer
  permission_classes = [IsAuthenticated, IsOwner]

  def get_queryset(self):
    course_id = self.kwargs['course_id']
    course = get_object_or_404(Course, id=course_id)
    
    # Return all materials related to the course
    materials = course.materials.all()
    return materials
  
  def perform_create(self, serializer):
    # get course id from params
    course_id: str = self.kwargs['course_id']
    course = get_object_or_404(Course, id=course_id)

    serializer.save(course=course)
    # get currently uploaded material
    material = serializer.instance

    handle_quiz_pregeneration(
      material=material,
      course=course,
      course_id=course_id
    )

class CourseMaterialDetailView(generics.RetrieveUpdateDestroyAPIView):
  serializer_class = CourseMaterialSerializer
  permission_classes = [IsAuthenticated, IsOwner]

  def get_object(self):
    start_time = time.time()
    material = get_object_or_404(CourseMaterial, id=self.kwargs["material_id"], course__user=self.request.user)
    logger.info(f"Total get_object method of course material detail view took {time.time() - start_time:.3f} seconds")
    return material
  
  # override the delete method to delete the material from supabase and the object from the database
  def delete(self, request, *args, **kwargs):
    material = self.get_object()
    quiz_title = f"pregenerated-quiz-{material.id}"
    file_url = material.material_file_url
    with transaction.atomic():
      QuizModel.objects.filter(quiz_title=quiz_title).delete()
      material.delete()
      transaction.on_commit(lambda: delete_material_and_quiz.delay(file_url))
    return Response(status=status.HTTP_204_NO_CONTENT)

# Single instance view of a course, showing details
# and allowing updates
class CourseDetailView(generics.RetrieveUpdateDestroyAPIView):
  serializer_class = CourseSerializer
  permission_classes = [IsAuthenticated, IsOwner]
  lookup_url_kwarg = "course_id"
  queryset = Course.objects.all() 

  # override delete to ensure that index is deleted from Pinecone
  def delete(self, request, *args, **kwargs):
    course = self.get_object()
    course_id = str(course.id)
    with transaction.atomic():
      # delete the course object
      course.delete()
      # delete all chunks associated with the course from Pinecone
      transaction.on_commit(lambda: delete_course_chunks.delay(course_id))
    return Response(status=status.HTTP_204_NO_CONTENT)

class MaterialDetailView(generics.RetrieveUpdateDestroyAPIView):
  serializer_class = CourseMaterialSerializer
  permission_classes = [IsAuthenticated, IsOwner]

  def get_object(self):
    return get_object_or_404(CourseMaterial, id=self.kwargs["material_id"], course__user=self.request.user)
