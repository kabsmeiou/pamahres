from courses.models import Course
from datetime import datetime


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