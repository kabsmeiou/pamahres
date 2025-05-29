import os
from dotenv import load_dotenv
from openai import OpenAI
import json
from rest_framework.exceptions import ValidationError
from utils.validators import validate_response_format
import logging

logger = logging.getLogger(__name__)

load_dotenv()

client = OpenAI(
  base_url="https://openrouter.ai/api/v1",
  api_key=os.getenv("OPENAI_API_KEY"),
)

def parse_llm_response(raw_text: str):
  # Remove the ```json\n and trailing ```
  if raw_text.startswith("```json"):
    raw_text = raw_text.strip()[7:]  
  if raw_text.endswith("```"):
    raw_text = raw_text.strip()[:-3]  
  return json.loads(raw_text)

def get_completion(model="deepseek/deepseek-chat:free", *, items: int=5, pdf_content="", max_retries: int=3) -> list:
  """
  This function generates a list of quiz questions from a given material.
  It takes in the number of items to generate and the material to generate the questions from.
  """
  # limit the pdf content to 5000 characters
  material = pdf_content[:5000]

  prompt = [
      {
        "role": "system",
        "content": "You are a helpful tutor that creates quizzes from educational material."
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

    {{
      "question": "Text",
      "type": "TF",
      "answer": "True"
    }}
    or
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

  completion = client.chat.completions.create(
    model=model,
    messages = prompt
  )

  # parse to json
  try:
    response = parse_llm_response(completion.choices[0].message.content)
  except Exception as e:
    logger.error(f"Raw response: {completion.choices[0].message.content}")
    raise ValidationError(f"Error parsing LLM response: {str(e)}")

  # prepare the response and make sure its in the correct format
  retries = 0
  good_response: bool = False
  while (retries < max_retries):
    if validate_response_format(response) == True:
      good_response = True
      break
    retries += 1
    completion = client.chat.completions.create(
      model=model,
      messages = prompt
    )
    response = parse_llm_response(completion.choices[0].message.content)
  
  if good_response == False:
    raise ValidationError("Failed to generate valid response from LLM")

  return response

# function for handling the conversation with the LLM
def get_conversational_completion(model="deepseek/deepseek-chat:free", *, previous_messages: list, new_message: str, context: str) -> list:
  """
  This function handles the conversation with the LLM.
  It takes in a list of previous messages and a new message, and returns a list of responses from the LLM.

  previous_messages: the list of the last few messages in the conversation
  new_message: the new message to be added to the conversation that the llm will respond to
  context: the materials currently available in the course

  note that previous_messages is not the full conversation history, but only the last few messages
  """
  completion = client.chat.completions.create(
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
    ]
  )
  return completion.choices[0].message.content
