from rest_framework.exceptions import ValidationError
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
from django.http import JsonResponse

# list of quizzes in the course
class QuizListCreateView(generics.ListCreateAPIView):
  serializer_class = QuizModelSerializer
  permission_classes = [IsAuthenticated]

  def get_queryset(self):
    course_id = self.kwargs['course_id']
    # return all quizzes if no course_id
    if course_id:
      # filter by course, show all the quizzes associated in a course
      return QuizModel.objects.filter(course_id=course_id)
 
  def perform_create(self, serializer):
    course_id = self.kwargs['course_id']
    course = get_object_or_404(Course, id=course_id)
    try:
      serializer.save(course=course)
    except Exception as e:
      raise ValidationError(f"Error creating quiz: {str(e)}")

# delete a quiz
class QuizDeleteView(generics.DestroyAPIView):
  serializer_class = QuizModelSerializer
  permission_classes = [IsAuthenticated]

  def delete(self, request, quiz_id):
    # Logic for deleting the quiz
    try:
        quiz = QuizModel.objects.get(id=quiz_id)
        quiz.delete()
        return JsonResponse({'message': 'Quiz deleted successfully'}, status=204)
    except QuizModel.DoesNotExist:
        return JsonResponse({'error': 'Quiz not found'}, status=404)

# the questions associated with a quiz
# filter the questions from a quiz using quiz_id
# also the create view for the questions
class QuestionListCreateView(generics.ListCreateAPIView):
  serializer_class = QuestionModelSerializer
  permission_classes = [IsAuthenticated]

  def get_queryset(self):
    # get the QuizModel object using quizid
    quiz_id = self.kwargs['quiz_id']
    quiz = get_object_or_404(QuizModel, id=quiz_id)
    return QuestionModel.objects.filter(quiz=quiz)
  
  def perform_create(self, serializer):
    quiz_id = self.kwargs['quiz_id']
    quiz = get_object_or_404(QuizModel, id=quiz_id)
    try:
      serializer.save(quiz=quiz)
    except Exception as e:
      raise ValidationError(f"Error creating question: {str(e)}")

class QuizDetailView(generics.RetrieveAPIView):
  serializer_class = QuizModelSerializer
  permission_classes = [IsAuthenticated]

  def get_object(self):
    quiz_id = self.kwargs['quiz_id']
    return get_object_or_404(QuizModel, id=quiz_id)

class CheckQuizAnswerView(generics.GenericAPIView):
  serializer_class = QuestionModelSerializer
  permission_classes = [IsAuthenticated]

  # expect a list of option_ids and question_ids
  def post(self, request, *args, **kwargs):
    quiz_id = kwargs['quiz_id']
    quiz = get_object_or_404(QuizModel, id=quiz_id)
    # get the list of option_ids
    answer_list = request.data

    # check if the answer_list is empty
    if not answer_list:
      raise ValidationError("No answers provided.")

    score: int = 0
    # check if the answer is correct
    results: list[dict] = []
    for answer in answer_list:
      question = get_object_or_404(QuestionModel, id=answer['question_id'])
      correct_answer = question.correct_answer
      results.append({
        "question_id": question.id,
        "correct_answer": correct_answer,
        "is_correct": answer['answer'].lower() == correct_answer.lower(),
      })
      if results[-1]['is_correct']: # check if the answer is correct (last appended item)
        score += 1

    # update the quiz score
    quiz.quiz_score = max(quiz.quiz_score, score)
    quiz.save()

    return Response({"score": score, "results": results}, status=status.HTTP_200_OK)
    

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
        questions: list[dict] = get_completion(items=quiz.number_of_questions, pdf_content=pdf_content)
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
          correct_answer=item.get('answer')
        )
        for item in questions
      ]

      # Bulk create all questions at once
      created_questions = QuestionModel.objects.bulk_create(question_instances)

      for question, item in zip(created_questions, questions):
        options = item.get('options')
        # generated output doesn't contain options
        if not options:
          dummy_option_text: str = "placeholder"
          try:
            option_instances.append(
              QuestionOption(
                question=question,
                text=dummy_option_text,
                order=0
              )
            )
          except Exception as e:
            raise ValidationError(f"Error creating dummy option for t/f question: {str(e)}")
          continue
        
        option_instances.extend([
          QuestionOption(
            question=question,
            text=option,
            order=index
          )
          for index, option in enumerate(options)
        ])
      
      # Bulk create all options at once
      QuestionOption.objects.bulk_create(option_instances)
      return Response({"message": "Questions generated successfully."}, status=status.HTTP_200_OK)
    except ValidationError as e:
      return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
      return Response({"error": "Unexpected error", "details": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

  