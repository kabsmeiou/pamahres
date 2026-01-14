from celery import shared_task
import logging
from django.core.cache import cache
from django.shortcuts import get_object_or_404

from .models import QuizModel
from services.openai_generator import get_completion
from utils.question_generator import create_questions_and_options
from supabase_client import supabase

logger = logging.getLogger(__name__)

@shared_task(bind=True, max_retries=3, default_retry_delay=5)
def generate_questions_task(self, pdf_content: str, quizId: int, number_of_questions: int):
    # fetch quiz because celery serializes the arguments
    quiz = get_object_or_404(QuizModel, id=quizId)

    try:
        # call the function for generating the questions
        questions: list[dict] = get_completion(items=number_of_questions, pdf_content=pdf_content)
    except Exception as e:
        logger.error(f"Error generating questions for quiz {quizId}: {str(e)}")
        raise self.retry(exc=e)

    logger.info(f"Creating questions and options for quiz at generate_questions_task: {quiz}")
    create_questions_and_options(quiz, questions)


@shared_task(bind=True, max_retries=3, default_retry_delay=10)
def delete_material_and_quiz(self, file_url: str):
    try:
        supabase.storage.from_('materials-all').remove([file_url])
    except Exception as e:
        logger.error(f"Error deleting file {file_url}: {str(e)}")
        raise self.retry(exc=e)


@shared_task(bind=True)
def delete_quiz_cache(self, course_id):
    cache.delete(f'quizzes_serialized_{course_id}')

# WARNING:::: THE QUIZ GENERATION IS SOMETIMES PLACING THE TEXT AS AN ANSWER AND NOT THE LETTER. THIS IS A BUG WITH THE PROMPT.