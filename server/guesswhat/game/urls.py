from django.urls import path
from .views import DailyWordAdminView, TodayWordInfoView, SubmitGuessView, TodayGuessesView, SetSezWordAdminView, SezTodayWordInfoView, SubmitSezGuessView, SezTodayGuessesView

urlpatterns = [
    path('admin/daily-word/', DailyWordAdminView.as_view(), name='admin-daily-word'),
    path('game/today/', TodayWordInfoView.as_view(), name='game-today'),
    path('game/guess/', SubmitGuessView.as_view(), name='game-guess'),
    path('game/guesses/', TodayGuessesView.as_view(), name='game-guesses'),
    path('sez/today/', SezTodayWordInfoView.as_view(), name='sez-today'),
    path('sez/guess/', SubmitSezGuessView.as_view(), name='sez-guess'),
    path('sez/guesses/', SezTodayGuessesView.as_view(), name='sez-guesses'),
    path('admin/sez-word/', SetSezWordAdminView.as_view(), name='admin-sez-word'),
] 