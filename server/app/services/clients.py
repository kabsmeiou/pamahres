from dotenv import load_dotenv
import os
import logging

from openai import OpenAI
from groq import Groq

load_dotenv()

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

try:
  groq_client = OpenAI(
    base_url="https://api.groq.com/openai/v1",
    api_key=os.getenv("GROK_API_KEY",),
  )
except Exception as e:
  logger.error(f"Error initializing Groq client: {e}")
  groq_client = None
  

try:
  groq_v2 = OpenAI(
    base_url="https://api.groq.com/openai/v1",
    api_key=os.getenv("GROQ_API_KEY",),
  )
except Exception as e:
  logger.error(f"Error initializing OpenAI client: {e}")