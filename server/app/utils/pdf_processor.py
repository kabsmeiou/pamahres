from rest_framework.exceptions import ValidationError
from supabase_client import supabase
import pymupdf
import logging

logger = logging.getLogger(__name__)

# Use supabase here, initialize the client, fetch the pdf as a list,
# the return as a list of pdfs
# It will be returned to extract_pdf_content and will be processed
def fetch_pdf(material_list: list) -> list:
  try:
    pdf_files = []
    for material in material_list:
      material_path: str = material.material_file_url
      try:
        # Supabase download returns bytes directly
        pdf_data = supabase.storage.from_('materials-all').download(material_path)
        if pdf_data:  # If we got the data successfully
          pdf_files.append(pdf_data)
        else:
          raise ValidationError(f"Failed to download {material_path}")
      except Exception as e:
        raise ValidationError(f"Failed to download {material_path}: {str(e)}")
  except Exception as e:
    raise ValidationError(f"Error fetching PDF: {str(e)}")
  return pdf_files

import unicodedata
import re

def clean_text(text: str) -> str:
  """
  Cleans the extracted text by normalizing unicode, removing non-printable characters,
  and collapsing excessive whitespace while preserving paragraph breaks.
  """
  if not text:
      return ""
  # Normalize unicode
  text = unicodedata.normalize("NFKC", text)
  # Remove non-printable/control characters except newlines
  text = re.sub(r"[^\x20-\x7E\n]", "", text)
  # Replace multiple newlines with double newline (paragraph)
  text = re.sub(r"\n\s*\n+", "\n\n", text)
  # Collapse multiple spaces/tabs
  text = re.sub(r"[ \t]+", " ", text)
  # Strip leading/trailing whitespace on each line
  text = "\n".join(line.strip() for line in text.splitlines())
  return text.strip()


def extract_pdf_content(material_list: list) -> str:
    """
    Extracts and cleans text content from a list of PDF materials.
    """
    pdf_files = fetch_pdf(material_list)
    if not pdf_files:
        raise ValidationError("No PDF files found in the provided materials.")

    content_parts = []
    for idx, material in enumerate(pdf_files):
        try:
            with pymupdf.open(stream=material, filetype="pdf") as doc:
                for page in doc:
                  blocks = page.get_text("blocks")
                  blocks.sort(key=lambda b: (b[1], b[0]))  # vertical, then horizontal
                  page_text = "\n".join(b[4] for b in blocks if len(b[4].strip()) > 20)
                  content_parts.append(page_text.strip())
        except Exception as e:
            # Optionally log the error and continue
            # print(f"Error extracting text from PDF {idx}: {str(e)}")
            logger.error(f"Error extracting text from PDF {idx}: {str(e)}")
            continue
    content = "\n\n".join(content_parts)
    return clean_text(content)

def chunk_text(text: str, chunk_size: int = 3000, max_chunks: int = 4) -> list[str]:
    """
    Splits the text into chunks of up to chunk_size characters, trying to split at paragraph boundaries.
    """
    paragraphs = text.split('\n\n')
    chunks = []
    current_chunk = ""
    for para in paragraphs:
        if len(current_chunk) + len(para) + 2 <= chunk_size: # +2 for the newlines
            # If adding this paragraph doesn't exceed the chunk size, add it to the current chunk
            current_chunk += (para + "\n\n")
        else:
            # If it exceeds, finalize the current chunk and start a new one
            if current_chunk:
                chunks.append(current_chunk.strip())
            # Start a new chunk with the current paragraph
            current_chunk = para + "\n\n"
        # If we reach the maximum number of chunks, break early
        if len(chunks) >= max_chunks:
            break
    # Add the last chunk if it exists and we haven't reached the max chunks
    if current_chunk and len(chunks) < max_chunks:
        chunks.append(current_chunk.strip())
    return chunks[:max_chunks]