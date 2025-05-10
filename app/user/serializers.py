from rest_framework import serializers
from .models import User, Profile, UserSettings, UserActivity

class UserSerializer(serializers.HyperlinkedModelSerializer):
  password = serializers.CharField(
    write_only=True,
    style={'input_type': 'password'},
    required=True
  )

  class Meta:
    model = User
    fields = [
      'id', 'username', 'email', 
      'first_name', 'last_name',
      'password'
    ]
  
  def create(self, validated_data):
    user = User.objects.create_user(**validated_data)
    Profile.objects.create(user=user)
    UserActivity.objects.create(user=user)
    return user
  

class ProfileSerializer(serializers.ModelSerializer):
  class Meta:
    model = Profile
    fields = [
      'id', 'user', 'mbti_type', 'age', 
      'education_level', 'course', 'target_study_hours', 
      'current_grade'
    ]

class UserSettingsSerializer(serializers.HyperlinkedModelSerializer):
  class Meta:
    model = UserSettings
    fields = ['id', 'user', 'notification_preferences']

class UserActivitySerializer(serializers.HyperlinkedModelSerializer):
  class Meta:
    model = UserActivity
    fields = [
      'id', 'user', 'last_login', 
      'quiz_attempts', 'materials_uploaded'
    ]