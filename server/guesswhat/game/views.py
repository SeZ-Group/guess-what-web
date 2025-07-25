from django.shortcuts import render
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils import timezone
from .models import DailyWord, Guess, SezWord
from .serializers import DailyWordSerializer, GuessSerializer
from django.shortcuts import get_object_or_404
from datetime import date
import os


# Load valid words from both assets/distinct_words.txt and assets/big.txt
ASSETS_DIR = os.path.join(os.path.dirname(__file__), 'assets')
word_files = ['distinct_words.txt', 'big.txt']
VALID_WORDS = set()
for fname in word_files:
    with open(os.path.join(ASSETS_DIR, fname), encoding='utf-8') as f:
        VALID_WORDS.update(line.strip().lower() for line in f if line.strip())

# Admin: Set or update today's word/config
class DailyWordAdminView(APIView):
    def post(self, request):
        today = date.today()
        data = request.data.copy()
        data['date'] = today
        daily_word, created = DailyWord.objects.update_or_create(
            date=today,
            defaults={
                'word': data.get('word'),
                'hint': data.get('hint', ''),
                'max_attempts': data.get('max_attempts', 7),
                'hint_attempt': data.get('hint_attempt', 4),
            }
        )
        serializer = DailyWordSerializer(daily_word)
        return Response(serializer.data)

# User: Get today's word info (no word revealed)
class TodayWordInfoView(APIView):
    def get(self, request):
        today = date.today()
        daily_word = get_object_or_404(DailyWord, date=today)
        data = DailyWordSerializer(daily_word).data
        data.pop('word', None)  # Remove the word from the response
        data['word_length'] = len(daily_word.word)
        return Response(data)

# User: Submit a guess
class SubmitGuessView(APIView):
    def post(self, request):
        today = date.today()
        daily_word = get_object_or_404(DailyWord, date=today)
        guess_text = request.data.get('guess', '').lower()
        user_identifier = request.data.get('user_identifier')
        if not user_identifier or not guess_text:
            return Response({'error': 'Missing user_identifier or guess.'}, status=400)
        # Check if guess is a valid word
        if guess_text not in VALID_WORDS:
            return Response({'error': 'کلمه‌ت بی‌معنیه!'}, status=400)
        # Count previous attempts
        prev_attempts = Guess.objects.filter(word=daily_word, user_identifier=user_identifier).count()
        if prev_attempts >= daily_word.max_attempts:
            return Response({'error': 'Max attempts reached.'}, status=403)
        # Color feedback logic
        result = []
        answer = daily_word.word.lower()
        guess_letters = list(guess_text)
        answer_letters = list(answer)
        used = [False] * len(answer_letters)
        # First pass: green
        for i, letter in enumerate(guess_letters):
            if i < len(answer_letters) and letter == answer_letters[i]:
                result.append('green')
                used[i] = True
            else:
                result.append(None)
        # Second pass: yellow/red
        for i, letter in enumerate(guess_letters):
            if result[i] == 'green':
                continue
            if letter in answer_letters:
                # Find a yellow (unused, wrong place)
                found = False
                for j, ans_letter in enumerate(answer_letters):
                    if not used[j] and letter == ans_letter and i != j:
                        found = True
                        used[j] = True
                        break
                if found:
                    result[i] = 'yellow'
                else:
                    result[i] = 'red'
            else:
                result[i] = 'red'
        guess_obj = Guess.objects.create(
            user_identifier=user_identifier,
            word=daily_word,
            guess=guess_text,
            attempt_number=prev_attempts + 1,
            result=result
        )
        serializer = GuessSerializer(guess_obj)
        response_data = serializer.data
        # Add hint if applicable
        if guess_obj.attempt_number >= daily_word.hint_attempt:
            response_data['hint'] = daily_word.hint
        return Response(response_data)

# User: Get all guesses for today
class TodayGuessesView(APIView):
    def get(self, request):
        today = date.today()
        user_identifier = request.query_params.get('user_identifier')
        if not user_identifier:
            return Response({'error': 'Missing user_identifier.'}, status=400)
        daily_word = get_object_or_404(DailyWord, date=today)
        guesses = Guess.objects.filter(word=daily_word, user_identifier=user_identifier).order_by('attempt_number')
        serializer = GuessSerializer(guesses, many=True)
        return Response(serializer.data)

# Sez: Set or update today's word/config
class SetSezWordAdminView(APIView):
    def post(self, request):
        today = date.today()
        data = request.data.copy()
        data['date'] = today
        sez_word, created = SezWord.objects.update_or_create(
            date=today,
            defaults={
                'word': data.get('word'),
                'hint': data.get('hint', ''),
                'max_attempts': data.get('max_attempts', 7),
                'hint_attempt': data.get('hint_attempt', 4),
            }
        )
        return Response({'success': True})

# Sez: Get today's word info (no word revealed)
class SezTodayWordInfoView(APIView):
    def get(self, request):
        today = date.today()
        sez_word = get_object_or_404(SezWord, date=today)
        data = {
            'hint': sez_word.hint,
            'max_attempts': sez_word.max_attempts,
            'hint_attempt': sez_word.hint_attempt,
            'word_length': len(sez_word.word)
        }
        return Response(data)

# Sez: Submit a guess
class SubmitSezGuessView(APIView):
    def post(self, request):
        today = date.today()
        sez_word = get_object_or_404(SezWord, date=today)
        guess_text = request.data.get('guess', '').lower()
        user_identifier = request.data.get('user_identifier')
        if not user_identifier or not guess_text:
            return Response({'error': 'Missing user_identifier or guess.'}, status=400)
        prev_attempts = Guess.objects.filter(word_id=sez_word.id, word__date=today, user_identifier=user_identifier).count()
        if prev_attempts >= sez_word.max_attempts:
            return Response({'error': 'Max attempts reached.'}, status=403)
        # Color feedback logic (same as before)
        result = []
        answer = sez_word.word.lower()
        guess_letters = list(guess_text)
        answer_letters = list(answer)
        used = [False] * len(answer_letters)
        for i, letter in enumerate(guess_letters):
            if i < len(answer_letters) and letter == answer_letters[i]:
                result.append('green')
                used[i] = True
            else:
                result.append(None)
        for i, letter in enumerate(guess_letters):
            if result[i] == 'green':
                continue
            if letter in answer_letters:
                found = False
                for j, ans_letter in enumerate(answer_letters):
                    if not used[j] and letter == ans_letter and i != j:
                        found = True
                        used[j] = True
                        break
                if found:
                    result[i] = 'yellow'
                else:
                    result[i] = 'red'
            else:
                result[i] = 'red'
        guess_obj = Guess.objects.create(
            user_identifier=user_identifier,
            word_id=sez_word.id,
            guess=guess_text,
            attempt_number=prev_attempts + 1,
            result=result
        )
        response_data = {
            'id': guess_obj.id,
            'user_identifier': guess_obj.user_identifier,
            'word': guess_obj.word_id,
            'guess': guess_obj.guess,
            'attempt_number': guess_obj.attempt_number,
            'result': guess_obj.result,
            'timestamp': guess_obj.timestamp,
        }
        if guess_obj.attempt_number >= sez_word.hint_attempt:
            response_data['hint'] = sez_word.hint
        return Response(response_data)

# Sez: Get all guesses for today
class SezTodayGuessesView(APIView):
    def get(self, request):
        today = date.today()
        user_identifier = request.query_params.get('user_identifier')
        if not user_identifier:
            return Response({'error': 'Missing user_identifier.'}, status=400)
        sez_word = get_object_or_404(SezWord, date=today)
        guesses = Guess.objects.filter(word_id=sez_word.id, user_identifier=user_identifier).order_by('attempt_number')
        data = [
            {
                'id': g.id,
                'user_identifier': g.user_identifier,
                'word': g.word_id,
                'guess': g.guess,
                'attempt_number': g.attempt_number,
                'result': g.result,
                'timestamp': g.timestamp,
            }
            for g in guesses
        ]
        return Response(data)
