from django.db import models

# Create your models here.

class DailyWord(models.Model):
    word = models.CharField(max_length=32)
    hint = models.CharField(max_length=256, blank=True)
    date = models.DateField(unique=True)
    max_attempts = models.IntegerField(default=7)
    hint_attempt = models.IntegerField(default=4)

    def __str__(self):
        return f"{self.date}: {self.word}"

class Guess(models.Model):
    user_identifier = models.CharField(max_length=128)  # device ID or session key
    word = models.ForeignKey(DailyWord, on_delete=models.CASCADE)
    guess = models.CharField(max_length=32)
    attempt_number = models.IntegerField()
    result = models.JSONField()  # e.g., ["green", "yellow", ...]
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user_identifier} - {self.word.date} - Attempt {self.attempt_number}"
