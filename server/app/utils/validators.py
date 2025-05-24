from rest_framework.exceptions import ValidationError
from quiz.models import QuestionModel

def validate_quiz_question(question: QuestionModel) -> None:
    if not question.question:
        raise ValidationError("Question text is required.")
    options = question.options.all()
    if not options.exists():
        raise ValidationError("Options are required.")
    if not question.correct_answer:
        raise ValidationError("Answer is required.")