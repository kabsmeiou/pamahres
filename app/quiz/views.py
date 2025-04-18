from django.forms import ValidationError
from django.shortcuts import render
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.shortcuts import get_object_or_404
from quiz.serializers import QuizModelSerializer, QuestionModelSerializer
from .models import QuizModel, QuestionModel
from .openai_generator import get_completion, extract_pdf_content
from courses.models import CourseMaterial

# the questions associated with a quiz
# filter the questions from a quiz using quiz_id
class QuestionListView(generics.ListAPIView):
  serializer_class = QuestionModelSerializer
  permission_classes = [IsAuthenticated]

  def get_queryset(self):
    quiz_id = self.kwargs['quiz_id']
    # get the QuizModel object using quizid
    return QuestionModel.objects.filter(quiz_id=quiz_id)

# list of quizzes in the course
class QuizListCreateView(generics.ListCreateAPIView):
  serializer_class = QuizModelSerializer
  permission_classes = [IsAuthenticated]

  def get_queryset(self):
    course_id = self.kwargs['course_id']
    # filter by course, show all the quizzes associated in a course
    return QuizModel.objects.filter(material_list__course_id=course_id)
  
  ### LIMIT THE MATERIAL SELECTION TO ONLY ONE(1) PER QUIZ ###
  # override the create function to process the pdf and generate questions using openai
  def perform_create(self, serializer):
    quiz = serializer.save()
    
    material_ids = self.request.data.get('material_list', [])
    # print("material_ids", material_ids)
    if material_ids:
      # fetch materials via ids
      material_list = CourseMaterial.objects.filter(id__in=material_ids)
      # ensure that the number of materials fetched matches the number of material_ids
      if len(material_list) != len(material_ids):
        # Log which material_ids are invalid
        invalid_ids = [material_id for material_id in material_ids if material_id not in material_list.values_list('id', flat=True)]
        raise ValidationError(f"Invalid material IDs: {invalid_ids}")

    # process the pdf into text
    # divide content into 5000-character chunks and process (haven't done)
    pdf_content = extract_pdf_content(quiz.material_list.all())
    if not pdf_content:
      raise ValidationError("No valid content extracted from the provided materials.")
    
    try:
      # call the function for generating the questions
      questions = get_completion(items=quiz.number_of_questions, pdf_content=pdf_content)
    except Exception as e:
      raise ValidationError(f"Error generating questions: {str(e)}")

    # save the questions to the database
    for item in questions:
      current_question = QuestionModel.objects.create(
        quiz=quiz,
        question=item['question'],
        question_type=item['type'],
        correct_answer=item['answer'],
      )
      if item['type'] == 'multiple_choice':
        current_question.question_option_1 = item['options'][0]
        current_question.question_option_2 = item['options'][1]
        current_question.question_option_3 = item['options'][2]
        current_question.question_option_4 = item['options'][3]
        current_question.save()