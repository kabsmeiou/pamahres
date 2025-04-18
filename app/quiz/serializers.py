from rest_framework import serializers
from .models import QuizModel, QuestionModel

class QuizModelSerializer(serializers.ModelSerializer):
  class Meta:
    model = QuizModel
    fields = '__all__'
  
  # extract the materials from the POST request as user selected in the frontend
  def create(self, validated_data):
    materials = validated_data.pop('material_list', [])
    quiz = QuizModel.objects.create(**validated_data)
    quiz.material_list.set(materials)
    return quiz

class QuestionModelSerializer(serializers.ModelSerializer):
  class Meta:
    model = QuestionModel
    fields = '__all__'
