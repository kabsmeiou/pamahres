from rest_framework.exceptions import ValidationError
from supabase_client import supabase
import pymupdf

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

def extract_pdf_content(material_list: list) -> str:
  # using the list of material objects, fetch pdf files from supabase
  pdf_files = fetch_pdf(material_list)
  
  # extract the text from the pdf
  content = ""
  for material in pdf_files:
    try:
      with pymupdf.open(stream=material, filetype="pdf") as doc:
        for page in doc:
          content += page.get_text()
    except Exception as e:
      raise ValidationError(f"Error extracting text from PDF: {str(e)}")
  return content

def chunk_text(text: str, chunk_size: int=3000, max_chunks: int=4) -> list[str]:
    """Splits the text into chunks of 3000 characters and returns 4 chunks at most."""
    chunks = [text[i:i + chunk_size] for i in range(0, len(text), chunk_size)]
    return chunks[:max_chunks]