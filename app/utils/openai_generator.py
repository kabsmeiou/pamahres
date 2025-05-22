import os
from dotenv import load_dotenv
from openai import OpenAI
import json
from rest_framework.exceptions import ValidationError

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
        "content": f"""
            Given the material below:

            ```{material}```

            Generate exactly {items} quiz questions:
            - {items // 2} True/False
            - {(items + 1) // 2} Multiple Choice (1 correct + 3 plausible distractors)

            Your response should STRICTLY be a JSON array consisting of the following:
            [
              {{
                "question": "Text",
                "type": "t/f",
                "answer": "True"
              }},
              {{
                "question": "Text",
                "type": "multiple_choice",
                "options": ["Option A", "Option B", "Option C", "Option D"],
                "answer": "a"
              }}
            ]
            Use only letters ("a"-"d") for answers. No explanations or extra text. Base all questions strictly on the material.
            """
      }
    ]
  )
  # prepare the response and make sure its in the correct format
  try:
    response = parse_llm_response(completion.choices[0].message.content)
  except Exception as e:
    raise ValidationError(f"Error parsing LLM response: {str(e)}")
  return response