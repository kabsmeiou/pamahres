from rest_framework import generics
from rest_framework.permissions import IsAuthenticated, BasePermission
from courses.serializers import CourseSerializer, CourseMaterialSerializer, LLMConversationSerializer, ChatHistorySerializer, MessageSerializer
from django.shortcuts import get_object_or_404
from .models import Course, CourseMaterial, ChatHistory, Message
from rest_framework.exceptions import ValidationError
from supabase_client import supabase
from rest_framework.response import Response
from rest_framework import status
from quiz.models import QuizModel
from quiz.tasks import delete_material_and_quiz
from utils.helpers import get_content_from_quizId, generate_questions_by_chunks, add_to_chat_history
from services.openai_generator import get_conversational_completion
import time
import logging
import tiktoken
import datetime
from services.embedding import embed_and_upsert_chunks, query_course, delete_course_chunks

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
      # get the current date and course_id from the url
      course_id = self.kwargs['course_id']
      today = datetime.datetime.now().strftime("%Y-%m-%d")
      name_filter = f"{today}-{course_id}"
      # get chat history based on course_id, name_filter, user_id
      chat_history_id = ChatHistory.objects.filter(
        course__id=course_id,
        name_filter=name_filter,
        course__user=self.request.user,
      ).first()

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

    if not chat_histories:
      logger.info(f"No chat histories found for course_id: {course_id} and user_id: {self.request.user.id}")

    return chat_histories
  
class LLMConversationView(generics.GenericAPIView):
  serializer_class = LLMConversationSerializer
  permission_classes = [IsAuthenticated, IsOwner]

  def post(self, request, *args, **kwargs):
    start_time = time.time()
    serializer = self.get_serializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    # get the data from the serializer
    previous_messages = serializer.validated_data['previous_messages']
    new_message = serializer.validated_data['new_message']

    # save the new message to the chat history
    name_filter = f"{datetime.datetime.now().strftime('%Y-%m-%d')}-{self.kwargs['course_id']}"
    add_to_chat_history(
      name_filter=name_filter,
      new_message=new_message,
      sender="user",
      user_id=self.request.user.id,
      course_id=self.kwargs['course_id']
    )
    logger.info(f"{name_filter} chat history updated with new message.")

    # get course info
    course_id: str = self.kwargs['course_id']
    course = get_object_or_404(Course, id=course_id, user=self.request.user)
    user_name = self.request.user.first_name
    course_name = course.course_name

    relevant_chunks = query_course(new_message, course_id)
    # build the context for the LLM(man tgey stupid)
    context = (
        f"You are a helpful assistant for the course '{course_name}'. Your answers are brief and to the point. Strictly 4 sentences maximum."
        f"If there are no relevant chunks, let the user know that you cannot find any relevant information and tell them to upload at the materials tab. "
        f"The user's name is {user_name.split(' ')[0]}. "
        f"Relevant course material:\n\n"
        + "\n\n".join(relevant_chunks)
    )

    # get the encoding for the LLM, count tokens for context to optimize the response
    encoding = tiktoken.get_encoding("cl100k_base")
    tokens = encoding.encode(context)

    logger.info(f"Context tokens count: {len(tokens)}")
    logger.info(f"time taken to build context: {time.time() - start_time:.3f} seconds")

    start_time = time.time()
    # get the response from the LLM
    response: str = get_conversational_completion(
      previous_messages=previous_messages, 
      new_message=new_message, 
      context=context
    )
    # add the llm response to the chat history
    add_to_chat_history(
      name_filter=name_filter,
      new_message=response,
      sender="ai",
      user_id=self.request.user.id,
      course_id=self.kwargs['course_id']
    )
    logger.info(f"time taken to get response from LLM: {time.time() - start_time:.3f} seconds")
    return Response({"reply": response}, status=status.HTTP_200_OK)
    
# View function for showing the courses that the current user has made.
# Also serves as a view for creating new courses
class CourseView(generics.ListCreateAPIView):
  serializer_class = CourseSerializer
  permission_classes = [IsAuthenticated, IsOwner]

  def get_queryset(self):
    start_time = time.time()
    courses = self.request.user.courses.all()
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
    start_time = time.time()
    # Get course_id from the URL parameters
    course_id = self.kwargs['course_id']
    
    # Ensure the course exists and belongs to the current user
    course = get_object_or_404(Course, id=course_id, user=self.request.user)
    
    # Return all materials related to the course
    materials = course.materials.all()
    logger.info(f"Total get_queryset method of course materials view took {time.time() - start_time:.3f} seconds")
    return materials
  
  def perform_create(self, serializer):
    start_time = time.time()
    # get course id from params
    course_id: str = self.kwargs['course_id']
    course = get_object_or_404(Course, id=course_id)

    serializer.save(course=course)
    # get currently uploaded material
    material = serializer.instance

    # if course has been created, create a quiz then pregenerate questions based on this(just saved) material
    # different quiz_generator for each material, so that the quiz_title is unique and each request to 
    # generate questions based on that material will have a separate quiz object they can steal from
    quiz = QuizModel.objects.create(
      quiz_title=f"pregenerated-quiz-{material.id}",
      course=course, 
      is_generated=True,
      number_of_questions=20
    )
    quiz.material_list.add(material)
    # delay the task to generate questions
    try:
      logger.info(f"Generating questions for quiz: {quiz.id}")
      current_material_contents: list[str] = get_content_from_quizId(quiz.id)
      generate_questions_by_chunks(current_material_contents, quiz, 20) # default to 20 questions for pregenerated quizzes

      # embed current material contents into a vector database for chatbot
      embed_and_upsert_chunks(chunks=current_material_contents, course_id=course_id)
    except Exception as e:
      raise ValidationError(f"Error generating questions: {str(e)}")
    logger.info(f"Total perform_create of material creation took {time.time() - start_time:.3f} seconds")

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
    start_time = time.time()
    material = self.get_object()
    quiz_title = f"pregenerated-quiz-{material.id}"
    file_url = material.material_file_url
    material_id = material.id
    # Delete objects immediately in DB (or just mark deleted depending on your logic)
    QuizModel.objects.filter(quiz_title=quiz_title).delete()
    material.delete()
    logger.info(f"Deleted material: {material_id}")
    logger.info(f"Deleted quiz: {quiz_title}")
    # check if quiz still exists
    quiz = QuizModel.objects.filter(quiz_title=quiz_title).first()
    if quiz:
      logger.info(f"Quiz still exists: {quiz.id}")
    else:
      logger.info(f"Quiz does not exist: {quiz_title}")
    # Then queue the actual Supabase removal async
    delete_material_and_quiz.delay(quiz_title, file_url)
    logger.info(f"Total delete method of course material detail view took {time.time() - start_time:.3f} seconds")
    return Response(status=status.HTTP_204_NO_CONTENT)

# Single instance view of a course, showing details
# and allowing updates
class CourseDetailView(generics.RetrieveUpdateDestroyAPIView):
  serializer_class = CourseSerializer
  permission_classes = [IsAuthenticated, IsOwner]
  lookup_url_kwarg = "course_id" # Specify the URL keyword argument for course_id

  # Look into the course list in database and select the corresponding course_id from the request
  def get_object(self):
    start_time = time.time()
    course = get_object_or_404(Course, id=self.kwargs["course_id"], user=self.request.user)
    logger.info(f"Total get_object method of course detail view took {time.time() - start_time:.3f} seconds")
    return course
  
  # override delete to ensure that index is deleted from Pinecone
  def delete(self, request, *args, **kwargs):
    start_time = time.time()
    course = self.get_object()
    course_id = str(course.id)
    # delete all chunks associated with the course
    try:
      logger.info(f"Deleting course chunks for course: {course_id}")
      # delete all chunks associated with the course from Pinecone
      delete_course_chunks(course_id)
    except Exception as e:
      logger.error(f"Error deleting course chunks: {str(e)}")
      raise ValidationError(f"Error deleting course chunks: {str(e)}")
    # delete the course object
    course.delete()
    logger.info(f"Deleted course: {course_id}")
    logger.info(f"Total delete method of course detail view took {time.time() - start_time:.3f} seconds")
    return Response(status=status.HTTP_204_NO_CONTENT)

class MaterialDetailView(generics.RetrieveUpdateDestroyAPIView):
  serializer_class = CourseMaterialSerializer
  permission_classes = [IsAuthenticated, IsOwner]

  def get_object(self):
    return get_object_or_404(CourseMaterial, id=self.kwargs["material_id"], course__user=self.request.user)
