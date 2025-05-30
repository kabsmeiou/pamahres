from celery import shared_task
from .models import QuizModel
from courses.models import CourseMaterial
from utils.pdf_processor import extract_pdf_content
from services.openai_generator import get_completion
from utils.question_generator import create_questions_and_options
from rest_framework.exceptions import ValidationError
from supabase_client import supabase
from django.core.cache import cache
from django.shortcuts import get_object_or_404
import logging

logger = logging.getLogger(__name__)

@shared_task
def generate_questions_task(pdf_content: str, quizId: int, number_of_questions: int):

    # fetch quiz because celery serializes the arguments
    quiz = get_object_or_404(QuizModel, id=quizId)

    try:
        # call the function for generating the questions
        questions: list[dict] = get_completion(items=number_of_questions, pdf_content=pdf_content)
    except Exception as e:
        raise ValidationError(f"Error generating questions: {str(e)}")

    logger.info(f"Creating questions and options for quiz at generate_questions_task: {quiz}")
    create_questions_and_options(quiz, questions)


@shared_task
def delete_material_and_quiz(quiz_title: str, file_url: str):
    try:
        response = supabase.storage.from_('materials-all').remove([file_url])
        print(response)
        return "Delete successful"
    except Exception as e:
        # Catch any error from Supabase removal
        return f"Error deleting file: {str(e)}"


@shared_task
def delete_quiz_cache(course_id):
    cache.delete(f'quizzes_serialized_{course_id}')

# WARNING:::: THE QUIZ GENERATION IS SOMETIMES PLACING THE TEXT AS AN ANSWER AND NOT THE LETTER. THIS IS A BUG WITH THE PROMPT.