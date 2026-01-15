import json
import re
from typing import Any


def get_data_from_request(request, key: str, default: Any = None) -> Any:
    data = request.data.get(key, default)
    if data is None:
        raise ValueError(f"Missing required parameter: {key}")
    return data

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