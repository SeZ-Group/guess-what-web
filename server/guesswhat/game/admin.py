from django.contrib import admin
from .models import DailyWord, Guess, SezWord

# Register your models here.
admin.site.register(DailyWord)
admin.site.register(Guess)
admin.site.register(SezWord)
