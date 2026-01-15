"""
can make get_completion use a shared_task since it takes some time to complete
the convo function can stay synchronous since we should receive the response for every user message
"""
from django.utils import timezone
from rest_framework.exceptions import ValidationError
import logging
import time

from courses.services.chat_service import add_to_chat_history

from .clients import groq_client, groq_v2
from .llm import get_llm_completion

logger = logging.getLogger(__name__)

def get_completion(model="meta-llama/llama-4-scout-17b-16e-instruct", *, items: int=5, pdf_content="", max_retries: int=3) -> list:
  """
  This function generates a list of quiz questions from a given material.
  It takes in the number of items to generate and the material to generate the questions from.

  Args:
    model (str): The model to use for generating the questions.
    items (int): The number of quiz questions to generate.
    pdf_content (str): The content of the PDF material to generate questions from. This expects the content to be <= 3000 characters as preprocessed by 
    max_retries (int): The maximum number of retries to get a valid response.
  """

  material = pdf_content.strip()

  if not material:
    raise ValidationError("Material content is empty. Please provide valid content to generate quiz questions.")
  
  response = get_llm_completion.delay(
    client=groq_client,
    model=model,
    material=material,
    items=items
  )

  return response


# function for handling the conversation with the LLM
def get_conversational_completion(
    course, 
    model="openai/gpt-oss-20b", 
    *, previous_messages: list, new_message: str, context: str, name_filter: str):
  """
  This function handles the conversation with the LLM.
  It takes in a list of previous messages and a new message, and returns a string of responses from the LLM.

  previous_messages: the list of the last few messages in the conversation
  new_message: the new message to be added to the conversation that the llm will respond to
  context: the materials currently available in the course

  note that previous_messages is not the full conversation history, but only the last few messages
  """

  completion = groq_v2.chat.completions.create(
    model=model,
    messages = [
      {
        "role": "system",
        "content": context
      },
      *previous_messages,
      {
        "role": "user",
        "content": new_message
      }
    ],
    stream=True
  )
  
  full_response = ""
  try:
    for chunk in completion:
      delta = chunk.choices[0].delta.content
      if delta is not None:
        full_response += delta
        # Format as SSE: data: <content>\n\n
        yield f"data: {delta}\n\n"
  finally:
    # Ensure chat history is saved even if client disconnects
    response = full_response.strip()
    if response:
      add_to_chat_history(
        name_filter=name_filter,
        new_message=response,
        sender="ai",
        course=course
      )

