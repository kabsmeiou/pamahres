from quiz.models import QuizModel, QuestionModel, QuestionOption
from rest_framework.exceptions import ValidationError
def create_questions_and_options(quiz: QuizModel, questions: list[dict]) -> None:
    if not quiz:
        raise ValidationError("Quiz not found.")
    if not questions:
        raise ValidationError("No questions found.")

    for item in questions:
        question = QuestionModel(
            quiz=quiz,
            question=item['question'],
            question_type=item['type'],
            correct_answer=item.get('answer')
        )
        question.save()

        options = item.get('options')
        if not options:
            QuestionOption.objects.create(
                question=question,
                text="placeholder",
                order=0
            )
            continue

        for index, option in enumerate(options):
            QuestionOption.objects.create(
                question=question,
                text=option,
                order=index
            )