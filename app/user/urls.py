# get the views from views.py
from django.urls import path
from .views import Signup, Logout, ProfileView
from rest_framework_simplejwt.views import TokenObtainPairView

urlpatterns = [
  path('api-signup/', Signup.as_view(), name='signup'),
  path('api-login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
  path('api-refresh/', TokenObtainPairView.as_view(), name='token_refresh'),
  path('api-logout/', Logout.as_view(), name='logout'),
  path('api-profile/', ProfileView.as_view(), name='profile'),
]