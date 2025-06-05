import os
from dotenv import load_dotenv
from openai import OpenAI
import json
from rest_framework.exceptions import ValidationError
from utils.validators import validate_response_format
import logging
import re

logger = logging.getLogger(__name__)

load_dotenv()

# can use openrouter or groq
client = OpenAI(
  base_url="https://api.groq.com/openai/v1",
  api_key=os.getenv("GROK_API_KEY",),
)

def parse_llm_response(raw_text: str):
  # Use regex to find the first JSON array in the text
  match = re.search(r"\[\s*{.*?}\s*]", raw_text, re.DOTALL)
  if match:
    try:
      return json.loads(match.group(0))
    except json.JSONDecodeError as e:
      raise ValueError(f"Failed to parse extracted JSON: {e}")
  else:
    raise ValueError("No JSON array found in response.")


# deepseek/deepseek-chat:free 
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


# use deepseek from open router for convo
# can use openrouter or groq
openai_client = OpenAI(
  base_url="https://openrouter.ai/api/v1",
  api_key=os.getenv("OPENAI_API_KEY"),
)

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
  completion = openai_client.chat.completions.create(
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
  response = completion.choices[0].message.content
  # clean up the response
  response = response.strip()
  return response
