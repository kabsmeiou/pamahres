from rest_framework.exceptions import ValidationError
from quiz.models import QuestionModel
import json
import logging

logger = logging.getLogger(__name__)

def validate_quiz_question(question: QuestionModel) -> None:
    if not question.question:
        raise ValidationError("Question text is required.")
    options = question.options.all()
    if not options.exists():
        raise ValidationError("Options are required.")
    if not question.correct_answer:
        raise ValidationError("Answer is required.")
        
def validate_response_format(response: list[dict]) -> bool:
    """
    Validate the format of the list of question dictionaries from the LLM.
    """
    if not isinstance(response, list):
        logger.error(f"Expected list, got: {type(response)}")
        return False

    for item in response:
        if not isinstance(item, dict):
            logger.error(f"Item is not a dict: {item}")
            return False

        required_keys = ['question', 'type', 'answer']
        for key in required_keys:
            if key not in item:
                logger.error(f"Missing key '{key}' in response: {item}")
                return False

        if item['type'] not in ['TF', 'MCQ']:
            logger.error(f"Invalid type: {item['type']}")
            return False

        if item['type'] == 'MCQ':
            if 'options' not in item:
                logger.error(f"Missing 'options' for MCQ: {item}")
                return False
            if len(item['options']) != 4:
                logger.error(f"MCQ does not have 4 options: {item}")
                return False
            if item['answer'] not in ['a', 'b', 'c', 'd']:
                logger.error(f"Invalid MCQ answer: {item['answer']}")
                return False

    return True