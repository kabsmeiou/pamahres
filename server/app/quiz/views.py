from rest_framework.exceptions import ValidationError
from django.shortcuts import render
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from rest_framework.permissions import AllowAny # <-- Import this!
from django.shortcuts import get_object_or_404
from quiz.serializers import QuizModelSerializer, QuestionModelSerializer, QuestionOptionSerializer
from .models import QuizModel, QuestionModel, QuestionOption
from courses.models import CourseMaterial, Course
from django.http import JsonResponse
import datetime
from .tasks import generate_questions_task, delete_quiz_cache
from utils.validators import validate_quiz_question
import time
import logging
from django.core.cache import cache
from utils.helpers import get_content_from_quizId, generate_questions_by_chunks, save_answers_of_best_score

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

  # limit up to 8 quizzes only
  def perform_create(self, serializer):
    course_id = self.kwargs['course_id']
    course = get_object_or_404(Course, id=course_id)
    try:
      serializer.save(course=course)
      # delete cache so the list method will fetch the latest data
      cache.delete(f'quizzes_serialized_{course_id}')
    except Exception as e:
      raise ValidationError(f"Error creating quiz: {str(e)}")


class QuickCreateQuizView(APIView):
  """
  View to quickly create a quiz without any course association. This is intended for users who want to generate quizzes without being logged in. Also, logged in users can use this view but the limit for them is higher unlike anonymous users that has a limit of 2 quizzes per day.
  """
  permission_classes = [AllowAny]  # allow any user to create a quiz
  throttle_classes = [AnonRateThrottle]  # disable throttling for this view

  def get_throttled_message(self, request):
    return "You have exceeded your daily limit for quick quiz generations. Please try again tomorrow or sign up for unlimited access!"

  def post(self, request, *args, **kwargs):
    """
    Create a quick quiz from uploaded material file URL.
    Expects material_file_url from supabase storage.
    """
    start_time = time.time()
    
    try:
      # Get the material file URL from request
      material_file_url = request.data.get('material_file_url')
      
      if not material_file_url:
        return Response(
          {"error": "Material file URL is required."}, 
          status=status.HTTP_400_BAD_REQUEST
        )
      
      # Get optional parameters with defaults
      quiz_title = request.data.get('quiz_title', 'Quick Created Quiz')
      number_of_questions = int(request.data.get('number_of_questions', 4))
      time_limit_minutes = int(request.data.get('time_limit_minutes', 10))
      file_name = request.data.get('file_name', 'Quick Create Material')
      
      # Validate number of questions
      max_questions = 15 if request.user.is_authenticated else 10
      if number_of_questions > max_questions:
        return Response(
          {"error": f"Maximum {max_questions} questions allowed for your account type."}, 
          status=status.HTTP_400_BAD_REQUEST
        )
      
      # Create a dummy course object to associate the quiz with
      # Handle anonymous users by creating a course without user association
      course_data = {
        'course_name': f"QCC",
        'course_code': f"QC01"
      }
      
      if request.user.is_authenticated:
        course_data['user'] = request.user
      else:
        try:
          # Try to get a system user for anonymous quick creates
          from django.contrib.auth import get_user_model
          User = get_user_model()
          system_user, created = User.objects.get_or_create(
            username='system_quick_create',
            defaults={'email': 'system@pamahres.com'}
          )
          course_data['user'] = system_user
        except Exception:
          return Response(
            {"error": "Unable to create course for anonymous user. Please try again or sign up."}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
          )
      
      course = Course.objects.create(**course_data)
      
      material = CourseMaterial.objects.create(
        course=course,
        material_file_url=material_file_url,  
        file_name=file_name,
        file_size=request.data.get('file_size', 0),  
        file_type=request.data.get('file_type', 'application/pdf') 
      )
      
      quiz = QuizModel.objects.create(
        course=course,
        quiz_title=quiz_title,
        number_of_questions=number_of_questions,
        time_limit_minutes=time_limit_minutes,
      )
      
      quiz.material_list.add(material)
      
      # Extract content from the material and generate questions
      try:
        contents = get_content_from_quizId(quiz.id)
        
        if not contents:
          quiz.delete()
          material.delete()
          course.delete()
          return Response(
            {"error": "No valid content extracted from the provided materials. Please ensure the file contains readable text."}, 
            status=status.HTTP_400_BAD_REQUEST
          )
        
        generate_questions_by_chunks(contents, quiz, quiz.number_of_questions)
        
        quiz.is_generated = True
        quiz.save()
        
        logger.info(f"Quick quiz creation took {time.time() - start_time:.3f} seconds")
        
        return Response({
          "message": "Quiz created successfully.",
          "quiz_id": quiz.id,
          "quiz_title": quiz.quiz_title,
          "number_of_questions": quiz.number_of_questions,
          "status": "completed"
        }, status=status.HTTP_201_CREATED)
      
      # Clean up on error
      except ValidationError as e:
        quiz.delete()
        material.delete()
        course.delete()
        return Response(
          {"error": str(e)}, 
          status=status.HTTP_400_BAD_REQUEST
        )
      except Exception as e:
        quiz.delete()
        material.delete()
        course.delete()
        logger.error(f"Error generating questions: {str(e)}")
        return Response(
          {"error": "Failed to generate quiz questions.", "details": str(e)}, 
          status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
        
    except ValueError as e:
      return Response(
        {"error": "Invalid number provided for questions or time limit."}, 
        status=status.HTTP_400_BAD_REQUEST
      )
    except Exception as e:
      logger.error(f"Unexpected error in QuickCreateQuizView: {str(e)}")
      return Response(
        {"error": "An unexpected error occurred.", "details": str(e)}, 
        status=status.HTTP_500_INTERNAL_SERVER_ERROR
      )

  def get(self, request, quiz_id=None):
    """
    Check quiz status or retrieve quiz details for quick create.
    """
    if not quiz_id:
      return Response(
        {"error": "Quiz ID is required."}, 
        status=status.HTTP_400_BAD_REQUEST
      )
    
    try:
      quiz = get_object_or_404(QuizModel, pk=quiz_id)
      if quiz.is_generated:
        # Return quiz with questions
        serializer = QuizModelSerializer(quiz)
        questions = QuestionModel.objects.filter(quiz=quiz)
        questions_data = QuestionModelSerializer(questions, many=True).data
        
        return Response({
          "quiz": serializer.data,
          "questions": questions_data,
          "status": "completed"
        }, status=status.HTTP_200_OK)
      else:
        return Response({
          "quiz_id": quiz.pk,
          "quiz_title": quiz.quiz_title,
          "status": "generating",
          "message": "Quiz is still being generated. Please check again in a moment."
        }, status=status.HTTP_202_ACCEPTED)
        
    except Exception as e:
      return Response(
        {"error": "Quiz not found or an error occurred.", "details": str(e)}, 
        status=status.HTTP_404_NOT_FOUND
      )

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
      # delete cache of the quiz
      delete_quiz_cache.delay(quiz.course_id)
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
    answer_list: list = request.data

    # check if the answer_list is empty
    if not answer_list:
      raise ValidationError("No answers provided.")

    score: int = 0
    # checking asnwers
    results: list[dict] = []
    question_ids = [answer['question_id'] for answer in answer_list]
    questions: dict = QuestionModel.objects.filter(id__in=question_ids).in_bulk()

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

    # update the quiz score and save the answers of the current best score
    if (score > quiz.quiz_score):
      logger.info(f"Updating quiz score from {quiz.quiz_score} to {score}")
      logger.info(f"asnwers: {answer_list}")
      save_answers_of_best_score(answer_list, questions)
      quiz.quiz_score = score


    quiz.save()
    logger.info(f"Total check quiz answer time took {time.time() - start_time:.3f} seconds")

    # reset cache of quiz list
    cache.delete(f'quizzes_serialized_{quiz.course_id}')

    # update the quiz status
    return Response({"score": score, "results": results}, status=status.HTTP_200_OK)

### LIMIT THE MATERIAL SELECTION TO ONLY ONE(1) PER QUIZ ###
class GenerateQuestionView(generics.GenericAPIView):
  def post(self, request, *args, **kwargs):
    quiz = get_object_or_404(QuizModel, id=kwargs['quiz_id'])
    # get content from the quiz object
    contents: list[str] = get_content_from_quizId(quiz.id)
    
    try:
      # check if theres any quiz that is generated
      generated_quiz = QuizModel.objects.filter(is_generated=True).exclude(id=quiz.id).first()
      if generated_quiz:
        # fetch questions from the generated_quiz and attach to the quiz object
        source_questions = generated_quiz.questions.all()
        requested_count = quiz.number_of_questions
        actual_count = source_questions.count()

        if quiz.number_of_questions > actual_count:
          # so if the number of questions is greater than the number of pregenerated questions,
          # just do another set of tasks to generate the questions for the user and let them wait
          generate_questions_by_chunks(contents, generated_quiz, requested_count)
        else:
          # attach only the number of questions specified in the quiz object
          # basically, steal the questions from the generated_quiz
          # bulk transfer the source_questions to the quiz object
          quiz.questions.set(source_questions[:requested_count])
          
          # decrease the number of questions count in the generated_quiz
          generated_quiz.number_of_questions = max(generated_quiz.number_of_questions - requested_count, 0)
          
          # generate the amount of questions we just stole
          generate_questions_by_chunks(contents, generated_quiz, requested_count)

        quiz.save()
        generated_quiz.save()
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