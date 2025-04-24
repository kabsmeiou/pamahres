import os
from dotenv import load_dotenv
from openai import OpenAI
import fitz
import json

load_dotenv()

client = OpenAI(
  base_url="https://openrouter.ai/api/v1",
  api_key=os.getenv("OPENAI_API_KEY"),
)

def extract_pdf_content(material_list: list) -> str:
  # extract the text from the pdf
  ###  IMPORTANT: Replace material_file.path to material_path on production ###
  
  content = ""
  for material in material_list:
    with fitz.open(material.material_file.path) as doc:
      for page in doc:
        content += page.get_text()
  return content

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
    # extra_headers={
    #   "HTTP-Referer": "<YOUR_SITE_URL>", # Optional. Site URL for rankings on openrouter.ai.
    #   "X-Title": "<YOUR_SITE_NAME>", # Optional. Site title for rankings on openrouter.ai.
    # },
    extra_body={},
    model=model,
    messages=[
      {
        "role": "system",
        "content": "You are a helpful tutor that creates quizzes from educational material."
      },
      {
        "role": "user",
        "content": f"Here is the material:\n{material}\n\nGenerate a {items}-item quiz consisting of exactly {items // 2} True/False questions and {(items + 1) // 2} multiple-choice questions. Each multiple-choice question should have 1 correct answer and 3 plausible incorrect options. Make sure the questions are clear, accurate, and directly based on the provided content. Respond in this exact JSON format: ['question': '...', 'type': 'multiple_choice or t/f', 'options': ['option_a', 'option_b', 'option_c', 'option_d'], 'answer': 'letter_only if multiple choice else true/false', ...]"
      }
    ]
  )
  # prepare the response and make sure its in the correct format
  response = parse_llm_response(completion.choices[0].message.content)
  return response