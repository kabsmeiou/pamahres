import logging
from django.shortcuts import get_object_or_404
from quiz.models import QuizModel
from courses.models import CourseMaterial
from utils.pdf_processor import extract_pdf_content, chunk_text
from utils.question_generator import create_questions_and_options
from quiz.tasks import generate_questions_task
from rest_framework.exceptions import ValidationError

logger = logging.getLogger(__name__)

def get_content_from_quizId(quiz_id: int) -> list[str]:
    """
    Fetches the quiz by its ID and extracts content from associated materials.

    Args:
        quiz_id (int): The ID of the quiz (since its extracted from params in views).
    Returns:
        list[str]: The extracted content from the materials associated with the quiz.
    Raises:
        ValidationError: If the quiz has no associated materials or if any material ID is invalid.
        ValueError: If no valid content is extracted from the provided materials.
    """
    logger.info(f"Fetching quiz for id: {quiz_id}")
    quiz = get_object_or_404(QuizModel, id=quiz_id)

    # get list of material ids associated with the quiz
    material_ids: list[int] = list(quiz.material_list.values_list('id', flat=True))

    if not material_ids:
        raise ValidationError("Quiz has no associated materials.")

    logger.info(f"Extracting content from materials for quiz {quiz_id}: {material_ids}")
    # check if the material_ids are valid
    if material_ids:
      # fetch materials via ids
      material_list = CourseMaterial.objects.filter(id__in=material_ids)
      # ensure that the number of materials fetched matches the number of material_ids
      if len(material_list) != len(material_ids):
        # Log which material_ids are invalid
        invalid_ids = [material_id for material_id in material_ids if material_id not in material_list.values_list('id', flat=True)]
        raise ValidationError(f"Invalid material IDs: {invalid_ids}")
      
    # process the pdf into text
    pdf_content: str = extract_pdf_content(list(material_list))

    if not pdf_content:
        raise ValueError("No valid content extracted from the provided materials.")
    
    # divide content into 4 chunks and process
    pdf_content_chunks: list[str] = chunk_text(pdf_content) # by default chunk size is 3000 characters
    logger.info(f"Extracted content from quiz {quiz_id} with {len(pdf_content_chunks)} chunks.")
    return pdf_content_chunks


def generate_questions_by_chunks(pdf_content_chunks: list[str], quiz: QuizModel, requested_count: int) -> None:
    """
    Generates questions for a quiz based on the provided content chunks.

    Args:
        pdf_content_chunks (list[str]): List of content chunks extracted from the quiz materials.
        quiz (QuizModel): The quiz model instance to which the questions will be added.
        number_of_questions (int): The number of questions to generate.

    Returns:
        None
    """

    # generate questions by batch(4 per chunk)
    if len(pdf_content_chunks) < 1 :
        raise ValidationError("No content chunks available to generate questions.")
    
    number_of_chunks: int = len(pdf_content_chunks)

    # number of questions to be generated for each api call is divided by 4
    # best case, we can generate 4 questions per chunk
    questions_per_completion: list[int] = [requested_count // number_of_chunks] * number_of_chunks

    # distribute remaining questions fairly
    remaining_questions = requested_count - sum(questions_per_completion)
    for i in range(remaining_questions):
        questions_per_completion[i % number_of_chunks] += 1
    
    for i, chunk in enumerate(pdf_content_chunks):
        # generate questions for each chunk
        logger.info(f"Generating {questions_per_completion[i]} questions for chunk {i+1}/{number_of_chunks}.")
        try:
            generate_questions_task.delay(chunk, quiz.id, questions_per_completion[i])
        except Exception as e:
            logger.error(f"Error generating questions for chunk {i+1}: {str(e)}")
            raise ValidationError(f"Error generating questions: {str(e)}")
    
    logger.info(f"Generated {requested_count} questions for quiz {quiz}.")