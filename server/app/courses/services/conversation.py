from .chat_service import add_to_chat_history, build_chat_prompt
from services.openai_generator import get_conversational_completion
from django.utils import timezone

import logging

logger = logging.getLogger(__name__)

def handle_llm_conversation(
    *,
    user,
    course,
    previous_messages,
    new_message,
):
    name_filter = f"{timezone.now():%Y-%m-%d}-{course.id}"

    add_to_chat_history(
        name_filter=name_filter,
        new_message=new_message,
        sender="user",
        course=course,
    )

    context = build_chat_prompt(
        first_name=user.first_name,
        course_name=course.course_name,
        course_id=course.id,
        new_message=new_message,
    )

    generator = get_conversational_completion(
        course=course,
        model="openai/gpt-oss-20b",
        previous_messages=previous_messages,
        new_message=new_message,
        context=context,
        name_filter=name_filter,
    )

    return generator
