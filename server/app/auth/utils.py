from django.contrib.auth import get_user_model

User = get_user_model()

def get_or_create_django_user(request):
    """Lazy load the Django user only when needed."""
    clerk_user_id = getattr(request, "clerk_user_id", None)
    if not clerk_user_id:
        return None

    # Cache inside request so DB is hit once per request
    if hasattr(request, "_cached_django_user"):
        return request._cached_django_user

    user, created = User.objects.get_or_create(
        username=clerk_user_id,
        defaults={"first_name": "", "last_name": "", "email": ""},
    )

    request._cached_django_user = user
    return user
