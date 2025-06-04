const API_BASE =
  window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://127.0.0.1:8000/api'
    : 'https://guesswhatserver.darkube.app/api';

export async function getTodayWordInfo() {
  const res = await fetch(`${API_BASE}/game/today/`);
  return res.json();
}

export async function submitGuess(user_identifier, guess) {
  const res = await fetch(`${API_BASE}/game/guess/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_identifier, guess })
  });
  return res.json();
}

export async function getGuesses(user_identifier) {
  const res = await fetch(`${API_BASE}/game/guesses/?user_identifier=${encodeURIComponent(user_identifier)}`);
  return res.json();
}

export async function setDailyWord({ word, hint, max_attempts, hint_attempt }) {
  const res = await fetch(`${API_BASE}/admin/daily-word/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ word, hint, max_attempts, hint_attempt })
  });
  return res.json();
} 