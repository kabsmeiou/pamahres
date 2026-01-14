# if material has been created, create a quiz then pregenerate questions based on this(just saved) material
# different quiz_generator for each material, so that the quiz_title is unique and each request to 
# generate questions based on that material will have a separate quiz object they can steal from
from utils.helpers import get_content_from_quizId, generate_questions_by_chunks
from services.embedding import embed_and_upsert_chunks
from quiz.models import QuizModel
from celery import shared_task

@shared_task(bind=True, max_retries=3, default_retry_delay=5)
def handle_quiz_pregeneration(material, course, course_id):
    quiz = QuizModel.objects.create(
      quiz_title=f"pregenerated-quiz-{material.id}",
      course=course, 
      is_generated=True,
      number_of_questions=20
    )
    quiz.material_list.add(material)
    try:
      current_material_contents: list[str] = get_content_from_quizId(quiz.id)
      generate_questions_by_chunks(current_material_contents, quiz, 20) # default to 20 questions for pregenerated quizzes
      embed_and_upsert_chunks(chunks=current_material_contents, course_id=course_id)  
    except Exception as e:
      raise Exception(f"Error generating questions: {str(e)}")