from django.urls import path
from .views import DailyWordAdminView, TodayWordInfoView, SubmitGuessView, TodayGuessesView

urlpatterns = [
    path('admin/daily-word/', DailyWordAdminView.as_view(), name='admin-daily-word'),
    path('game/today/', TodayWordInfoView.as_view(), name='game-today'),
    path('game/guess/', SubmitGuessView.as_view(), name='game-guess'),
    path('game/guesses/', TodayGuessesView.as_view(), name='game-guesses'),
] 