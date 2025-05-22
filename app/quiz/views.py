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
from utils.question_generator import create_questions_and_options
from courses.models import CourseMaterial, Course
from django.http import JsonResponse
import datetime
from .tasks import generate_questions_task
from utils.validators import validate_quiz_question
import time
import logging
from django.core.cache import cache

logger = logging.getLogger(__name__)

# list of quizzes in the course
class QuizListCreateView(generics.ListCreateAPIView):
  serializer_class = QuizModelSerializer
  permission_classes = [IsAuthenticated]

  def get_queryset(self):
    start_time = time.time()
    course_id = self.kwargs['course_id']
    # return all quizzes if no course_id
    if course_id:
      # filter by course, show all the quizzes associated in a course
      # show only the quizzes that are not marked as generated(let generated quizzes on standby)
      quizzes = QuizModel.objects.filter(course_id=course_id, is_generated=False)
      logger.info(f"Total get_queryset method of quiz list took {time.time() - start_time:.3f} seconds")
      return quizzes
    

  def list(self, request, *args, **kwargs):
    start_time = time.time()
    course_id = self.kwargs.get('course_id')
    cache_key = f'quizzes_serialized_{course_id}'
    cached_data = cache.get(cache_key)

    if cached_data:
      logger.info(f"Total list method cache hit took {time.time() - start_time:.3f} seconds")
      return Response(cached_data)

    queryset = self.get_queryset()
    serializer = self.get_serializer(queryset, many=True)
    cache.set(cache_key, serializer.data, timeout=300)  # cache for 5 mins
    logger.info(f"Total list method took {time.time() - start_time:.3f} seconds")
    return Response(serializer.data)


  def perform_create(self, serializer):
    course_id = self.kwargs['course_id']
    course = get_object_or_404(Course, id=course_id)
    try:
      serializer.save(course=course)
      # delete cache so the list method will fetch the latest data
      cache.delete(f'quizzes_serialized_{course_id}')
    except Exception as e:
      raise ValidationError(f"Error creating quiz: {str(e)}")

# delete a quiz
class QuizDeleteView(generics.DestroyAPIView):
  serializer_class = QuizModelSerializer
  permission_classes = [IsAuthenticated]

  def delete(self, request, quiz_id):
    # Logic for deleting the quiz
    try:
      start_time = time.time()
      quiz = QuizModel.objects.get(id=quiz_id)
      quiz.delete()
      cache.delete(f'quizzes_serialized_{quiz.course_id}')
      logger.info(f"Total delete quiz time took {time.time() - start_time:.3f} seconds")
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
    start_time = time.time()
    # get the QuizModel object using quizid
    quiz_id = self.kwargs['quiz_id']
    quiz = get_object_or_404(QuizModel, id=quiz_id)
    questions = quiz.questions.all()
    logger.info(f"Total get_queryset method of question list took {time.time() - start_time:.3f} seconds")
    return questions
    
  
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
    start_time = time.time()
    quiz_id = kwargs['quiz_id']
    quiz = get_object_or_404(QuizModel, id=quiz_id)
    # update last_taken
    quiz.last_taken = datetime.datetime.now()
    quiz.save()

    # get the list of option_ids
    answer_list = request.data

    # check if the answer_list is empty
    if not answer_list:
      raise ValidationError("No answers provided.")

    score: int = 0
    # check if the answer is correct
    results: list[dict] = []
    question_ids = [answer['question_id'] for answer in answer_list]
    questions = QuestionModel.objects.filter(id__in=question_ids).in_bulk()

    for answer in answer_list:
      question = questions[answer['question_id']]
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
    logger.info(f"Total check quiz answer time took {time.time() - start_time:.3f} seconds")
    return Response({"score": score, "results": results}, status=status.HTTP_200_OK)

### LIMIT THE MATERIAL SELECTION TO ONLY ONE(1) PER QUIZ ###
class GenerateQuestionView(generics.GenericAPIView):
  def post(self, request, *args, **kwargs):
    start_time = time.time()
    # get current quiz object
    db_fetch_start = time.time()
    quiz = get_object_or_404(QuizModel, id=kwargs['quiz_id'])
    db_fetch_end = time.time()
    logger.info(f"Total db fetch time took {db_fetch_end - db_fetch_start:.3f} seconds")

    try:
      # check if theres any quiz that is generated
      generated_quiz_fetch_start = time.time()
      generated_quiz = QuizModel.objects.filter(is_generated=True).exclude(id=quiz.id).first()
      generated_quiz_fetch_end = time.time()
      logger.info(f"Total generated quiz fetch time took {generated_quiz_fetch_end - generated_quiz_fetch_start:.3f} seconds")
      if generated_quiz:
        # fetch questions from the generated_quiz and attach to the quiz object
        source_questions_fetch_start = time.time()
        source_questions = generated_quiz.questions.all()
        source_questions_fetch_end = time.time()
        logger.info(f"Total source questions fetch time took {source_questions_fetch_end - source_questions_fetch_start:.3f} seconds")
        requested_count = quiz.number_of_questions
        actual_count = source_questions.count()

        # attach only the number of questions specified in the quiz object
        # if the number of questions is greater than the number of questions in the generated_quiz, then attach all the questions
        # basically, steal the questions from the generated_quiz
        if quiz.number_of_questions > actual_count:
          save_questions_start = time.time()
          # bulk transfer the source_questions to the quiz object
          quiz.questions.set(source_questions)
          save_questions_end = time.time()
          logger.info(f"Total save questions time took {save_questions_end - save_questions_start:.3f} seconds")
          # generate 20 questions again for the generated_quiz object in the background
          generated_quiz.number_of_questions = 0
          generate_questions_task.delay(generated_quiz.id, 20)
          logger.info(f"Total request > generated post method took {time.time() - start_time:.3f} seconds")
        else:
          save_questions_start = time.time()
          # bulk transfer the source_questions to the quiz object
          quiz.questions.set(source_questions[:requested_count])
          save_questions_end = time.time()
          logger.info(f"Total save questions time took {save_questions_end - save_questions_start:.3f} seconds")
          # decrease the number of questions count in the generated_quiz
          generated_quiz.number_of_questions = max(generated_quiz.number_of_questions - requested_count, 0)
          
          # generate the amount of questions we just stole
          generate_questions_task.delay(generated_quiz.id, requested_count)

        quiz.save()
        generated_quiz.save()
        logger.info(f"Total post method took {start_time - time.time():.3f} seconds")
        return Response({"message": "Quiz already generated."}, status=status.HTTP_200_OK)
      else:
        print("Generating questions...")
        # generate the questions
        # load the quiz from request.data and attach the info to the quiz object
        try:
          generate_questions_task.delay(quiz.id, quiz.number_of_questions)
        except Exception as e:
          return Response({"error": "Unexpected error", "details": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

      return Response({"message": "Questions generated successfully."}, status=status.HTTP_200_OK)
    except ValidationError as e:
      return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
      return Response({"error": "Unexpected error", "details": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)