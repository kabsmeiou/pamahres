from rest_framework import serializers
from .models import Course, CourseMaterial
import re

class CourseSerializer(serializers.ModelSerializer):
  class Meta:
    model = Course
    fields = '__all__'
    read_only_fields = ['user']

# for post requests, only allow pdfs, etc.
# validate file_name as well.
class CourseMaterialSerializer(serializers.ModelSerializer):
  class Meta:
    model = CourseMaterial
    fields = ['id', 'material_file_url', 'file_name', 'file_size', 'file_type', 'uploaded_at']
    read_only_fields = ['uploaded_at']

    # validate functions are called automatically by DRF
    def validate_file_name(self, value):
      if len(value) > 100:
        raise serializers.ValidationError("File name is too long.")
      return value

    def validate_file_type(self, value):
      if value.lower() not in ['pdf']:
        raise serializers.ValidationError("File type is too long.")
      return value
    
    def validate_file_size(self, value):
      # 10mb limit
      if value > 10000000:
        raise serializers.ValidationError("File size is too large.")
      return value
    
    def validate_material_file_url(self, value):
      if not re.match(r"^https://.*supabase.co.*", value):
        raise serializers.ValidationError("Invalid file URL (must be a Supabase URL).")
      return value
