from courses.models import ChatHistory, Message
from services.embedding import query_course

def add_to_chat_history(name_filter: str, new_message: str, sender: str, course) -> None:
  chat_history, created = ChatHistory.objects.get_or_create(
    course=course,
    name_filter=name_filter,
  )

  Message.objects.create(
    chat_history=chat_history,
    sender=sender,
    content=new_message
  )

def build_chat_prompt(first_name: str, course_name: str, course_id: str, new_message: str) -> str:
    user_name = first_name
    course_name = course_name
    relevant_chunks = query_course(new_message, course_id)
    # build the context for the LLM(man tgey stupid)
    context = (
        f"You are a helpful assistant for the course '{course_name}'. Your answers are brief and to the point. Strictly 4 sentences maximum."
        f"If there are no relevant chunks, let the user know that you cannot find any relevant information and tell them to upload at the materials tab. "
        f"The user's name is {user_name.split(' ')[0]}. "
        f"Relevant course material:\n\n"
        + "\n\n".join(relevant_chunks)
    )
    return context