import React, { useState, useEffect } from 'react';
import { getTodayWordInfo, submitGuess, getGuesses } from '../api/gameApi';

const USER_ID_KEY = 'guess-what-user-id';
function getUserId() {
  let id = localStorage.getItem(USER_ID_KEY);
  if (!id) {
    id = 'user-' + Math.random().toString(36).slice(2, 10);
    localStorage.setItem(USER_ID_KEY, id);
  }
  return id;
}

function colorClass(color) {
  if (color === 'green') return 'letter-green';
  if (color === 'yellow') return 'letter-yellow';
  if (color === 'red') return 'letter-red';
  return '';
}

export default function Game() {
  const [wordInfo, setWordInfo] = useState(null);
  const [guesses, setGuesses] = useState([]);
  const [guess, setGuess] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [hint, setHint] = useState(null);
  const [error, setError] = useState('');
  const userId = getUserId();

  useEffect(() => {
    getTodayWordInfo().then(setWordInfo);
    getGuesses(userId).then(setGuesses);
  }, [userId]);

  const handleGuess = async (e) => {
    e.preventDefault();
    setError('');
    setFeedback(null);
    setHint(null);
    if (!guess) return;
    try {
      const res = await submitGuess(userId, guess);
      if (res.error) {
        setError(res.error);
      } else {
        setFeedback(res.result);
        setHint(res.hint);
        setGuesses([...guesses, res]);
      }
      setGuess('');
    } catch (err) {
      setError('Network error');
    }
  };

  return (
    <div className="game-container">
      <h2>Guess the Word!</h2>
      {wordInfo && (
        <div>
          <p>Attempts: {guesses.length} / {wordInfo.max_attempts}</p>
        </div>
      )}
      <form onSubmit={handleGuess}>
        <input
          type="text"
          value={guess}
          onChange={e => setGuess(e.target.value)}
          maxLength={32}
          disabled={guesses.length >= (wordInfo ? wordInfo.max_attempts : 7)}
        />
        <button type="submit" disabled={guesses.length >= (wordInfo ? wordInfo.max_attempts : 7)}>Guess</button>
      </form>
      {error && <div className="error">{error}</div>}
      {hint && <div className="hint">Hint: {hint}</div>}
      <div className="guesses-list">
        {guesses.map((g, idx) => (
          <div key={idx} className="guess-row">
            {g.guess.split('').map((letter, i) => (
              <span key={i} className={`letter-box ${colorClass(g.result[i])}`}>{letter}</span>
            ))}
          </div>
        ))}
      </div>
      <style>{`
        .game-container { max-width: 400px; margin: 2rem auto; padding: 2rem; border: 1px solid #ccc; border-radius: 8px; }
        .letter-box { display: inline-block; width: 2em; height: 2em; line-height: 2em; margin: 0 2px; text-align: center; font-weight: bold; border-radius: 4px; }
        .letter-green { background: #4caf50; color: #fff; }
        .letter-yellow { background: #ffeb3b; color: #333; }
        .letter-red { background: #f44336; color: #fff; }
        .error { color: #f44336; margin-top: 1em; }
        .hint { color: #2196f3; margin-top: 1em; }
        .guesses-list { margin-top: 1em; }
        .guess-row { margin-bottom: 0.5em; }
      `}</style>
    </div>
  );
} 