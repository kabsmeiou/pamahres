from sentence_transformers import SentenceTransformer
from pinecone import Pinecone, ServerlessSpec
import os
from dotenv import load_dotenv
import logging
from celery import shared_task

logger = logging.getLogger(__name__)

load_dotenv()

# TODO. refactor global variables to a better pattern
_model = None
_pc = None
_index = None

def get_model():
  global _model
  if _model is None:
      _model = SentenceTransformer("all-MiniLM-L6-v2")
  return _model


def get_pinecone():
  global _pc
  if _pc is None:
    _pc = Pinecone(
      api_key=os.getenv("PINECONE_API_KEY"),
    )
  return _pc


def get_index():
  global _index
  if _index is None:
    # Create or connect to an index (if it doesn't exist, create it)
    pc = get_pinecone()
    index_name = "pamahres-shared-index"
    if index_name not in pc.list_indexes().names():
      pc.create_index(
        name=index_name,
        dimension=384,  # MiniLM embedding size
        metric="cosine",
        spec=ServerlessSpec(cloud="aws", region="us-east-1")
      )

    _index = pc.Index(index_name)
  return _index


# Function to embed and upsert chunks into Pinecone
def embed_and_upsert_chunks(*, chunks: list[str], course_id: str):
  model = get_model()
  index = get_index()
  embeddings = model.encode(chunks, convert_to_numpy=True).tolist()  # Convert to list for Pinecone
  vectors = [
    (f"course-{course_id}-chunk-{i}", embeddings[i], {"course_id": course_id, "text": chunks[i]})
    for i in range(len(chunks))
  ]
  index.upsert(vectors)
  print(f"Upserted {len(chunks)} chunks for course {course_id}")


def query_course(question: str, course_id: str, top_k=3):
  model = get_model()
  index = get_index()

  query_embedding = model.encode([question], convert_to_numpy=True).tolist()[0]
  
  results = index.query(
    vector=query_embedding,
    top_k=top_k,
    include_metadata=True,
    filter={"course_id": course_id} # filter by course_id
  )
  
  # Extract the chunk texts from metadata
  relevant_chunks = [match['metadata']['text'] for match in results['matches']]
  return relevant_chunks


@shared_task(bind=True, max_retries=5, default_retry_delay=10)
def delete_course_chunks(self, course_id: str):
  index = get_index()
  try:
    # Delete all vectors associated with the course_id
    index.delete(filter={"course_id": course_id})
  except Exception as e:
    logger.error(f"Error deleting course chunks for course {course_id}: {str(e)}")
    raise self.retry(exc=e)
  return True