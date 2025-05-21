import os
from dotenv import load_dotenv
from openai import OpenAI
import json

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

def get_completion(model="deepseek/deepseek-chat:free", *, items: int=5, pdf_content="") -> list:
  # limit the pdf content to 5000 characters
  material = pdf_content[:5000]

  completion = client.chat.completions.create(
    model=model,
    messages=[
      {
        "role": "system",
        "content": "You are a helpful tutor that creates quizzes from educational material."
      },
      {
        "role": "user",
        "content": f"Here is the material:\n\n```{material}```\n\nGenerate a quiz with exactly {items} questions: {items // 2} True/False questions and {(items + 1) // 2} multiple-choice questions. Each multiple-choice question should have 1 correct answer and 3 plausible incorrect options. Make sure the questions are clear, accurate, and directly based on the provided content. Respond strictly in this exact JSON format: ['question': '...', 'type': 'multiple_choice or t/f', 'options': ['option_a', 'option_b', 'option_c', 'option_d'], 'answer': 'a', 'b', 'c', 'd', if multiple choice else true/false, ...]"
      }
    ]
  )
  # prepare the response and make sure its in the correct format
  try:
    response = parse_llm_response(completion.choices[0].message.content)
  except Exception as e:
    raise ValidationError(f"Error parsing LLM response: {str(e)}")
  return response