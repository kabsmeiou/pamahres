from rest_framework import serializers
from .models import QuizModel, QuestionModel, QuestionOption

class QuizModelSerializer(serializers.ModelSerializer):
  class Meta:
    model = QuizModel
    fields = ['id', 'material_list', 'number_of_questions', 'quiz_title']
    read_only_fields = ['course']
  
  # extract the materials from the POST request as user selected in the frontend
  def create(self, validated_data):
    materials = validated_data.pop('material_list', [])
    quiz = QuizModel.objects.create(**validated_data)
    quiz.material_list.set(materials)
    return quiz
  
class QuestionOptionSerializer(serializers.ModelSerializer):
  class Meta:
    model = QuestionOption
    fields = ['text', 'is_correct']
    
class QuestionModelSerializer(serializers.ModelSerializer):
  options = QuestionOptionSerializer(many=True, write_only=True)

  class Meta:
    model = QuestionModel
    fields = ['id', 'question', 'question_type', 'quiz', 'options']

  def validate(self, data):
    options = data.get('options', [])
    # validate number of options
    if data['question_type'] == 'MCQ':
      if len(options) < 3: # must be at least 3 options included
        raise serializers.ValidationError("MCQ questions must have at least 3 options.")
      if len(options) > 4: # must not be more than 4 options in mcq
        raise serializers.ValidationError("MCQ questions must have at most 4 options.")
    elif data['question_type'] == 'TF':
      # creating a t/f question requires passing a dummy option called "correct_answer"
      # this option should have an "is_correct" field set to True or False
      # len == 1 which means correct_answer is set to True or False as "is_correct"
      if len(options) == 0:
        raise serializers.ValidationError("Please provide a correct answer.")
      elif len(options) >= 2:
        raise serializers.ValidationError("True/False questions should not have custom options.")
    
    # validate correct answer
    has_correct_answer: bool = any(option['is_correct'] for option in options)
    if not has_correct_answer:
      raise serializers.ValidationError("Questions must have at least one correct answer.")
    return data

  def create(self, validated_data):
    options_data = validated_data.pop('options')
    question = QuestionModel.objects.create(**validated_data)
    for option in options_data:
      QuestionOption.objects.create(question=question, **option)
    return question