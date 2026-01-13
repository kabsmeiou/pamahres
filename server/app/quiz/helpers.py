from datetime import datetime

from courses.models import Course, CourseMaterial
from quiz.models import QuizModel

def create_dummy_course(request):
    """
    Create or reuse a lightweight course to associate with quick-created quizzes.

    - Reuse the same course (code 'QC01') for the requesting user if it exists.
    - Otherwise, create it with a unique, timestamped name to avoid unique_together collisions.
    """
    user = request.user

    # Reuse if already exists for this user
    existing = Course.objects.filter(user=user, course_code="QC01").first()
    if existing:
        return existing

    # Create with a timestamped name to avoid (user, course_name) unique_together conflicts
    course_name = f"QC{datetime.now().strftime('%Y%m%d%H%M%S')}"
    course = Course.objects.create(
        user=user,
        course_code="QC01",
        course_name=course_name,
        is_quick_create=True
    )
    return course


def setup_quiz_and_material_object_for_quick_create(request, *, course, material_file_url, file_name, quiz_title, number_of_questions, time_limit_minutes):
    """
    Create or reuse a lightweight course and material object for quick-created quizzes.
    """
          
    # check if material_file already exists in the supabase storage / database. 
    # if it exists, use the existing material.

    existing_material = CourseMaterial.objects.filter(
        course=course,
        file_name=file_name,
    ).first()

    if not existing_material:
        material = CourseMaterial.objects.create(
            course=course,
            material_file_url=material_file_url,
            file_name=file_name,
            file_size=request.data.get('file_size', 0),
            file_type=request.data.get('file_type', 'application/pdf'),
        )
    else:
        material = existing_material

    existing_quiz = QuizModel.objects.filter(
        course=course,
        quiz_title=quiz_title,
    ).first()

    if not existing_quiz:
        quiz = QuizModel.objects.create(
            course=course,
            quiz_title=quiz_title,
            number_of_questions=number_of_questions,
            time_limit_minutes=time_limit_minutes,
        )
        quiz.material_list.add(material)
    else:
        quiz = existing_quiz
      
    return quiz