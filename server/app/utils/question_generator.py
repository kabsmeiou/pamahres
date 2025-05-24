from quiz.models import QuizModel, QuestionModel, QuestionOption
from rest_framework.exceptions import ValidationError
def create_questions_and_options(quiz: QuizModel, questions: list[dict]) -> None:
    if not quiz:
        raise ValidationError("Quiz not found.")

    if not questions:
        raise ValidationError("No questions found.")

    question_instances: list[QuestionModel] = [
        QuestionModel(
            quiz=quiz,
            question=item['question'],
            question_type=item['type'],
            correct_answer=item.get('answer')
        )
        for item in questions
    ]

    created_questions = QuestionModel.objects.bulk_create(question_instances)

    option_instances: list[QuestionOption] = []

    for question, item in zip(created_questions, questions):
        options = item.get('options')
        if not options:
            option_instances.append(
                QuestionOption(
                    question=question,
                    text="placeholder",
                    order=0
                )
            )
            continue

        option_instances.extend([
            QuestionOption(
                question=question,
                text=option,
                order=index
            )
            for index, option in enumerate(options)
        ])

    QuestionOption.objects.bulk_create(option_instances)