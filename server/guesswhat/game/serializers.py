from rest_framework import serializers
from .models import DailyWord, Guess

class DailyWordSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyWord
        fields = ['id', 'word', 'hint', 'date', 'max_attempts', 'hint_attempt']
        read_only_fields = ['id']

class GuessSerializer(serializers.ModelSerializer):
    class Meta:
        model = Guess
        fields = ['id', 'user_identifier', 'word', 'guess', 'attempt_number', 'result', 'timestamp']
        read_only_fields = ['id', 'timestamp'] 