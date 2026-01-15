from celery import shared_task
from django.core.exceptions import ValidationError
import logging

from utils.utils import parse_llm_response

logger = logging.getLogger(__name__)

@shared_task(bind=True, max_retries=3)
def get_llm_completion(
  self, 
  *, client, model: str, material: str, items: int, 
):
  prompt = [
    {
      "role": "system",
      "content": "You are a helpful tutor that creates quizzes from key points from educational materials. You only respond in JSON format exactly as the user describes."
    },
    {
      "role": "user",
      "content": f"""
  Given the material below:

    {material}

    Generate exactly {items} quiz questions:
    - {items // 2} True/False
    - {(items + 1) // 2} Multiple Choice (1 correct + 3 plausible distractors)

    Return your response as a **raw JSON array**, with each question object formatted like this:
    True/False example:
    {{
      "question": "Text",
      "type": "TF",
      "answer": "true"
    }}
    
    Multiple Choice example:
    {{
      "question": "Text",
      "type": "MCQ",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer": "a"
    }}

    Use only lowercase letters ("a"-"d") for multiple choice answers. Do not include any explanations, markdown, or extra text. Ensure the JSON is valid and parsable.
    """
      }
    ]

  try:
    completion = client.chat.completions.create(
      model=model,
      messages=prompt
    )
  except Exception as e:
    logger.error(f"Error during LLM completion: {str(e)}")
    raise self.retry(exc=e, countdown=2 ** self.request.retries)

  # parse to json
  try:
    response = parse_llm_response(completion.choices[0].message.content)
  except Exception as e:
    logger.error(f"Raw response: {completion.choices[0].message.content}")
    raise ValidationError(f"Error parsing LLM response: {str(e)}")
    
  return response