from rest_framework import serializers
from .models import Course, CourseMaterial
import re

class LLMConversationSerializer(serializers.Serializer):
  previous_messages = serializers.JSONField()
  new_message = serializers.CharField()

  def validate_previous_messages(self, value):
    if len(value) > 10:
      raise serializers.ValidationError("Previous messages cannot be more than 10.")
    return value

  def validate_new_message(self, value):
    if len(value) > 1000:
      raise serializers.ValidationError("New message cannot be more than 1000 characters.")
    return value

class CourseSerializer(serializers.ModelSerializer):
  number_of_quizzes = serializers.IntegerField(source='get_number_of_quizzes', read_only=True)

  class Meta:
    model = Course
    fields = '__all__'
    read_only_fields = ['user', 'number_of_quizzes']

# for post requests, only allow pdfs, etc.
# validate file_name as well.
class CourseMaterialSerializer(serializers.ModelSerializer):
  class Meta:
    model = CourseMaterial
    fields = ['id', 'material_file_url', 'file_name', 'file_size', 'file_type', 'uploaded_at']
    read_only_fields = ['uploaded_at']

  # validate functions are called automatically by DRF
  def validate_file_name(self, value):
    if len(value) > 200:
      raise serializers.ValidationError("File name is too long.")
    return value

  def validate_file_type(self, value):
    if 'application/pdf' not in value.lower():  # Check if the MIME type contains 'application/pdf'
        raise serializers.ValidationError("Invalid file type. Only PDF files are allowed.")
    return value
  
  def validate_file_size(self, value):
    # 10mb limit
    if value > 10000000:
      raise serializers.ValidationError("File size is too large.")
    return value