import React, { useState } from 'react';
import { setDailyWord } from '../api/gameApi';

export default function Admin() {
  const [word, setWord] = useState('');
  const [hint, setHint] = useState('');
  const [maxAttempts, setMaxAttempts] = useState(7);
  const [hintAttempt, setHintAttempt] = useState(4);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      const res = await setDailyWord({ word, hint, max_attempts: maxAttempts, hint_attempt: hintAttempt });
      if (res.word) {
        setMessage('Word set for today!');
      } else {
        setError('Failed to set word.');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  return (
    <div className="admin-container">
      <h2>Admin: Set Today&apos;s Word</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Word: <input value={word} onChange={e => setWord(e.target.value)} required /></label>
        </div>
        <div>
          <label>Hint: <input value={hint} onChange={e => setHint(e.target.value)} /></label>
        </div>
        <div>
          <label>Max Attempts: <input type="number" value={maxAttempts} min={1} max={20} onChange={e => setMaxAttempts(Number(e.target.value))} /></label>
        </div>
        <div>
          <label>Hint Attempt: <input type="number" value={hintAttempt} min={1} max={20} onChange={e => setHintAttempt(Number(e.target.value))} /></label>
        </div>
        <button type="submit">Set Word</button>
      </form>
      {message && <div className="success">{message}</div>}
      {error && <div className="error">{error}</div>}
      <style>{`
        .admin-container { max-width: 400px; margin: 2rem auto; padding: 2rem; border: 1px solid #ccc; border-radius: 8px; }
        label { display: block; margin-bottom: 1em; }
        input[type="text"], input[type="number"] { margin-left: 0.5em; }
        .success { color: #4caf50; margin-top: 1em; }
        .error { color: #f44336; margin-top: 1em; }
      `}</style>
    </div>
  );
} 