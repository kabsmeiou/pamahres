# get the views from views.py
from django.urls import path
from .views import ProfileView, ClerkProtectedView, UserDetailView

urlpatterns = [
  path('profile/', ProfileView.as_view(), name='profile'),
  path('user/', UserDetailView.as_view(), name='user-detail'),
  path('clerk-protected/', ClerkProtectedView.as_view(), name='clerk_protected'),
]