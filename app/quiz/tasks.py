from celery import shared_task
from .models import QuizModel
from courses.models import CourseMaterial
from utils.pdf_processor import extract_pdf_content
from utils.openai_generator import get_completion
from utils.question_generator import create_questions_and_options
from rest_framework.exceptions import ValidationError


@shared_task
def generate_questions_task(quiz_id: int, number_of_questions: int):
    quiz = QuizModel.objects.get(id=quiz_id)
    # process the pdf into text
    # divide content into 5000-character chunks and process (haven't done)
    material_ids: list[int] = list(quiz.material_list.values_list('id', flat=True))

    if not material_ids:
        raise ValidationError("Quiz has no associated materials.")

    # check if the material_ids are valid
    if material_ids:
      # fetch materials via ids
      material_list = CourseMaterial.objects.filter(id__in=material_ids)
      # ensure that the number of materials fetched matches the number of material_ids
      if len(material_list) != len(material_ids):
        # Log which material_ids are invalid
        invalid_ids = [material_id for material_id in material_ids if material_id not in material_list.values_list('id', flat=True)]
        raise ValidationError(f"Invalid material IDs: {invalid_ids}")

    pdf_content: str = extract_pdf_content(quiz.material_list.all())

    if not pdf_content:
        raise ValueError("No valid content extracted from the provided materials.")

    try:
        # call the function for generating the questions
        questions: list[dict] = get_completion(items=number_of_questions, pdf_content=pdf_content)
    except Exception as e:
        raise ValidationError(f"Error generating questions: {str(e)}")

    create_questions_and_options(quiz, questions)


# The user will see generate quiz but the generate quiz will just fetch from the pregenerated quiz. 
# The pregenerated quiz is generated upon uploading a material. let's say a pdf with 8000 characters. The pdf will be chunked 
# into 3500 characters each, and then appended to the list of questions. the questions will be then, sorted in a random order so 
# it will give the impression that questions varies all over (because then it would only consist of 1 chunk then the next chunk..etc). 
# The list will have a limit of lets say 40 questions max(twice the number of maximum questions possible).  for every moment the 
# list is not equal to 40(less than), then it will have to regenerate questions.


## gotta setup redis to work with celery and initilize on django start

# WARNING:::: THE QUIZ GENERATION IS SOMETIMES PLACING THE TEXT AS AN ANSWER AND NOT THE LETTER. THIS IS A BUG WITH THE PROMPT.