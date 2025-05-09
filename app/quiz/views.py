from django.forms import ValidationError
from django.shortcuts import render
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.shortcuts import get_object_or_404
from quiz.serializers import QuizModelSerializer, QuestionModelSerializer, QuestionOptionSerializer
from .models import QuizModel, QuestionModel, QuestionOption
from .openai_generator import get_completion, extract_pdf_content
from courses.models import CourseMaterial, Course

# list of quizzes in the course
class QuizListCreateView(generics.ListCreateAPIView):
  serializer_class = QuizModelSerializer
  permission_classes = [IsAuthenticated]

  def get_queryset(self):
    course_id = self.kwargs['course_id']
    # return all quizzes if no course_id
    if course_id:
      # filter by course, show all the quizzes associated in a course
      return QuizModel.objects.filter(material_list__course_id=course_id)
 
  def perform_create(self, serializer):
    course_id = self.kwargs['course_id']
    course = get_object_or_404(Course, id=course_id)
    try:
      serializer.save(course=course)
    except Exception as e:
      raise ValidationError(f"Error creating quiz: {str(e)}")

# the questions associated with a quiz
# filter the questions from a quiz using quiz_id
# also the create view for the questions
class QuestionListCreateView(generics.ListCreateAPIView):
  serializer_class = QuestionModelSerializer
  permission_classes = [IsAuthenticated]

  def get_queryset(self):
    quiz_id = self.kwargs['quiz_id']
    # get the QuizModel object using quizid
    return QuestionModel.objects.filter(quiz_id=quiz_id)
  
  def perform_create(self, serializer):
    quiz_id = self.kwargs['quiz_id']
    quiz = get_object_or_404(QuizModel, id=quiz_id)
    try:
      serializer.save(quiz=quiz)
    except Exception as e:
      raise ValidationError(f"Error creating question: {str(e)}")

  # def perform_create(self, serializer):
  #   question_id = self.kwargs['question_id']
  #   question = get_object_or_404(QuestionModel, id=question_id)
  #   try:
  #     serializer.save(question=question)
  #   except Exception as e:
  #     raise ValidationError(f"Error creating option: {str(e)}")

### LIMIT THE MATERIAL SELECTION TO ONLY ONE(1) PER QUIZ ###
# override the create function to process the pdf and generate questions using openai
class GenerateQuestionView(generics.GenericAPIView):
  def post(self, request, *args, **kwargs):
    try:
      quiz_id = kwargs['quiz_id']

      # get the QuizModel object using quizid
      quiz: QuizModel = get_object_or_404(QuizModel, id=quiz_id)

      material_ids: list[int] = quiz.material_list.values_list('id', flat=True)
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
      pdf_content: str = extract_pdf_content(quiz.material_list.all())
      if pdf_content == "":
        raise ValidationError("No valid content extracted from the provided materials.")
      try:
        # call the function for generating the questions
        questions = get_completion(items=quiz.number_of_questions, pdf_content=pdf_content)
      except Exception as e:
        raise ValidationError(f"Error generating questions: {str(e)}")

      question_instances: list[QuestionModel] = []
      option_instances: list[QuestionOption] = []

      # Instead of .create(), construct unsaved instances
      question_instances = [
        QuestionModel(
          quiz=quiz,
          question=item['question'],
          question_type=item['type'],
        )
        for item in questions
      ]

      # Bulk create all questions at once
      created_questions = QuestionModel.objects.bulk_create(question_instances)

      for question, item in zip(created_questions, questions):
        options = item.get('options')
        # generated output doesn't contain options
        if not options:
          dummy_option_text: str = "correct_answer"
          try:
            option_instances.append(
              QuestionOption(
                question=question,
                text=dummy_option_text,
                is_correct=(item.get('answer'))
              )
            )
          except Exception as e:
            raise ValidationError(f"Error creating dummy option for t/f question: {str(e)}")
          continue
        
        option_instances.extend([
          QuestionOption(
            question=question,
            text=option,
            is_correct=(option == item.get('answer'))
          )
          for option in options
        ])
      
      # Bulk create all options at once
      QuestionOption.objects.bulk_create(option_instances)
      return Response({"message": "Questions generated successfully."}, status=status.HTTP_200_OK)
    except ValidationError as e:
      return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
      return Response({"error": "Unexpected error", "details": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

  