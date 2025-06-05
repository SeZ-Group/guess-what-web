import React, { useState, useEffect, useRef } from 'react';
import { getTodayWordInfo, submitGuess, getGuesses } from '../api/gameApi';
import html2canvas from 'html2canvas';

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

function isSuccess(guessResult, wordLength) {
  return guessResult && guessResult.length === wordLength && guessResult.every(c => c === 'green');
}

function toFarsiNumber(n) {
  return n.toString().replace(/[0-9]/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);
}

export default function Game() {
  const [wordInfo, setWordInfo] = useState(null);
  const [guesses, setGuesses] = useState([]);
  const [guessArr, setGuessArr] = useState([]); // array of chars
  const [feedback, setFeedback] = useState(null);
  const [hint, setHint] = useState(null);
  const [error, setError] = useState('');
  const userId = getUserId();
  const inputRefs = useRef([]);
  const gameRef = useRef(null);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    getTodayWordInfo().then(data => {
      setWordInfo(data);
      setGuessArr(Array(data.word_length).fill(''));
    });
    getGuesses(userId).then(setGuesses);
  }, [userId]);

  const wordLength = wordInfo?.word_length || 0;
  const maxAttempts = wordInfo ? wordInfo.max_attempts : 7;

  const handleInputChange = (e, idx) => {
    const val = e.target.value.replace(/[^a-zA-Zآ-ی]/g, '').slice(0, 1);
    const newArr = [...guessArr];
    newArr[idx] = val;
    setGuessArr(newArr);
    if (val && idx < guessArr.length - 1) {
      inputRefs.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === 'Backspace') {
      if (guessArr[idx]) {
        // just clear this box
        const newArr = [...guessArr];
        newArr[idx] = '';
        setGuessArr(newArr);
      } else if (idx > 0) {
        // move to previous box
        inputRefs.current[idx - 1]?.focus();
        const newArr = [...guessArr];
        newArr[idx - 1] = '';
        setGuessArr(newArr);
      }
    } else if (e.key === 'ArrowLeft' && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    } else if (e.key === 'ArrowRight' && idx < guessArr.length - 1) {
      inputRefs.current[idx + 1]?.focus();
    }
  };

  const handleGuess = async (e) => {
    e.preventDefault();
    setError('');
    setFeedback(null);
    setHint(null);
    const guess = guessArr.join('').toLowerCase();
    if (!guess || guess.length !== guessArr.length || guessArr.includes('')) return;
    try {
      const res = await submitGuess(userId, guess);
      if (res.error) {
        setError(res.error === 'Max attempts reached.' ? 'تعداد تلاش‌های شما به پایان رسیده است.' : 'خطا: ' + res.error);
      } else {
        setFeedback(res.result);
        setHint(res.hint);
        setGuesses([...guesses, res]);
      }
      setGuessArr(Array(guessArr.length).fill(''));
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError('خطای شبکه!');
    }
  };

  // Success/fail logic
  const lastGuess = guesses[guesses.length - 1];
  const isWin = lastGuess && isSuccess(lastGuess.result, wordLength);
  const isFail = guesses.length === maxAttempts && !isWin;

  // Open share modal automatically on win
  useEffect(() => {
    if (isWin) setShowShareModal(true);
  }, [isWin]);

  // Share handler
  const handleShare = async () => {
    if (!gameRef.current) return;
    // Hide letters before screenshot
    const guessRows = gameRef.current.querySelectorAll('.guesses-list .guess-row');
    const originalLetters = [];
    guessRows.forEach(row => {
      const spans = row.querySelectorAll('.letter-box');
      const rowLetters = [];
      spans.forEach(span => {
        rowLetters.push(span.textContent);
        span.textContent = '●';
      });
      originalLetters.push(rowLetters);
    });
    // Capture only the guesses-list
    const guessesList = gameRef.current.querySelector('.guesses-list');
    if (guessesList) {
      await html2canvas(guessesList, {useCORS: true, backgroundColor: null}).then(canvas => {
        canvas.toBlob(async (blob) => {
          // Restore original letters
          guessRows.forEach((row, i) => {
            const spans = row.querySelectorAll('.letter-box');
            spans.forEach((span, j) => {
              span.textContent = originalLetters[i][j];
            });
          });
          if (!blob) return;
          const file = new File([blob], 'guess-what-result.png', { type: 'image/png' });
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            try {
              await navigator.share({
                files: [file],
                title: 'نتیجه بازی حدس کلمه!',
                text: 'من تونستم کلمه امروز رو تو بازی حدس کلمه پیدا کنم! تو هم امتحان کن!'
              });
            } catch (err) {
              // کاربر شیر را کنسل کرد
            }
          } else {
            // دانلود تصویر برای کاربرانی که Web Share ندارند
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'guess-what-result.png';
            a.click();
            URL.revokeObjectURL(url);
          }
        }, 'image/png');
      });
    }
    setShowShareModal(false);
  };

  // Close modal on outside click
  const handleModalBackgroundClick = (e) => {
    if (e.target.classList.contains('share-modal-bg')) {
      setShowShareModal(false);
    }
  };

  return (
    <div className="game-container" ref={gameRef}>
      <div className="logo-title">
        <h2>Guess What?</h2>
        {/* <span className="logo-emoji" role="img" aria-label="guess">🤔</span> */}
      </div>
      {wordInfo && (
        <div className="attempts-info">
          <p>تلاش: {toFarsiNumber(guesses.length)} از {toFarsiNumber(maxAttempts)}</p>
        </div>
      )}
      {isWin && (
        <>
          <div className="success-message" dir='rtl'> عالی بودی! 🎉</div>
        </>
      )}
      {isFail && (
        <div className="fail-message" dir='rtl'>
           نشد دیگه فدای سرت. 😢<br />
          فردا یه روزه جدیده با یه کلمه جدید.
        </div>
      )}
      {/* Share Modal */}
      {showShareModal && (
        <div className="share-modal-bg" onClick={handleModalBackgroundClick}>
          <div className="share-modal" dir="rtl">
            <div className="close-modal-wrapper">
              <button className="close-modal" onClick={() => setShowShareModal(false)} title="بستن">&times;</button>
              <span className="close-modal-label">بستن</span>
            </div>
            <div className="share-modal-title">دوست داری نتیجه‌ات رو با بقیه به اشتراک بذاری؟</div>
            <button className="share-btn-modal" onClick={handleShare}>اشتراک‌گذاری</button>
          </div>
        </div>
      )}
      <form onSubmit={handleGuess} autoComplete="off">
        <div className="input-row" dir="rtl">
          {guessArr.map((char, i) => (
            <input
              key={i}
              ref={el => (inputRefs.current[i] = el)}
              type="text"
              className="letter-box input-box input-char"
              value={char}
              onChange={e => handleInputChange(e, i)}
              onKeyDown={e => handleKeyDown(e, i)}
              maxLength={1}
              autoFocus={i === 0}
              disabled={guesses.length >= maxAttempts || isWin || isFail}
              style={{ textAlign: 'center', direction: 'rtl', textTransform: 'uppercase', fontFamily: 'Vazirmatn, Tahoma, Arial, sans-serif', fontWeight: 800, fontSize: '1.7em', letterSpacing: '0.05em', color: '#1976d2', verticalAlign: 'middle' }}
            />
          ))}
        </div>
        <button type="submit" disabled={guesses.length >= maxAttempts || guessArr.includes('') || isWin || isFail}> حدس بزن</button>
      </form>
      {error && <div className="error">{error}</div>}
      {hint && <div className="hint">راهنما: {hint}</div>}
      <div className="guesses-list" dir="rtl">
        {guesses.map((g, idx) => (
          <div key={idx} className="guess-row" dir="rtl">
            {g.guess.split('').map((letter, i) => (
              <span key={i} className={`letter-box ${colorClass(g.result[i])}`}>{letter.toUpperCase()}</span>
            ))}
          </div>
        ))}
      </div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;700&display=swap');
        body, #root {
          background: linear-gradient(135deg, #f8fafc 0%, #e0e7ef 100%) !important;
          min-height: 100vh;
        }
        .game-container {
          background: #fff;
          max-width: 340px;
          margin: 1.2rem auto;
          padding: 1.2rem 0.7rem 1rem 0.7rem;
          border: 1px solid #e0e0e0;
          border-radius: 16px;
          font-family: 'Vazirmatn', Tahoma, Arial, sans-serif;
          box-shadow: 0 4px 16px 0 rgba(60,60,60,0.10);
        }
        .logo-title {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5em;
          margin-bottom: 0.7em;
        }
        .logo-emoji {
          font-size: 2.2em;
          margin-bottom: 0.2em;
        }
        h2 {
          text-align: center;
          color: #1976d2;
          margin: 0;
          font-size: 1.2em;
          font-family: 'Vazirmatn', Tahoma, Arial, sans-serif;
          font-weight: 700;
          letter-spacing: 0.01em;
        }
        .attempts-info {
          text-align: center;
          margin-bottom: 1.2em;
          color: #000 !important;
        }
        .letter-box, .input-box { color: #222; transition: background 0.2s, color 0.2s, border 0.2s; }
        .letter-box {
          display: inline-block;
          width: 1.7em;
          height: 1.7em;
          line-height: 1.7em;
          margin: 0 4px;
          text-align: center;
          font-weight: bold;
          border-radius: 7px;
          font-size: 1.1em;
          border: 2px solid #bdbdbd;
          background: #f5f7fa;
          box-shadow: 0 2px 8px 0 #e0e7ef44;
          animation: popin 0.3s cubic-bezier(.68,-0.55,.27,1.55);
        }
        .input-char {
          background: #fff;
          border: 2px solid #bdbdbd;
          outline: none;
          font-size: 1.1em;
          font-weight: bold;
          text-transform: uppercase;
          padding: 0;
          margin: 0 4px;
          width: 1.7em;
          height: 1.7em;
          text-align: center;
          border-radius: 7px;
          box-shadow: 0 2px 8px 0 #e0e7ef22;
          transition: border 0.2s, box-shadow 0.2s;
          text-align: center;
          vertical-align: middle;
        }
        .input-char:focus {
          border: 2px solid #1976d2;
          box-shadow: 0 0 0 2px #1976d244;
        }
        .letter-green { background: #43a047 !important; color: #fff !important; border-color: #388e3c !important; }
        .letter-yellow { background: #ffe082 !important; color: #333 !important; border-color: #ffb300 !important; }
        .letter-red { background: #e57373 !important; color: #fff !important; border-color: #b71c1c !important; }
        .error { color: #d32f2f; margin-top: 1em; text-align: center; font-weight: bold; }
        .hint { color: #1976d2; margin-top: 1em; text-align: center; font-weight: bold; }
        .success-message { color: #388e3c; background: #e8f5e9; border: 1px solid #388e3c; border-radius: 10px; padding: 0.7em; margin: 1em 0; text-align: center; font-size: 1em; font-weight: bold; box-shadow: 0 2px 8px 0 #388e3c22; }
        .fail-message { color: #b71c1c; background: #ffebee; border: 1px solid #b71c1c; border-radius: 10px; padding: 0.7em; margin: 1em 0; text-align: center; font-size: 1em; font-weight: bold; box-shadow: 0 2px 8px 0 #b71c1c22; }
        .guesses-list {
          margin-top: 1.7em;
          direction: rtl;
        }
        .guess-row {
          margin-bottom: 0.5em;
          display: flex;
          justify-content: center;
          direction: rtl;
        }
        .input-row {
          display: flex;
          justify-content: center;
          margin-bottom: 0.8em;
          position: relative;
          min-height: 2em;
        }
        button[type="submit"] {
          width: 100%;
          background: linear-gradient(90deg, #1976d2 0%, #64b5f6 100%);
          color: #fff;
          border: none;
          border-radius: 7px;
          padding: 0.6em 0;
          font-size: 1em;
          font-weight: bold;
          margin-top: 0.5em;
          cursor: pointer;
          box-shadow: 0 2px 8px 0 #1976d222;
          transition: background 0.2s, box-shadow 0.2s;
        }
        button[type="submit"]:hover:not(:disabled) {
          background: linear-gradient(90deg, #1565c0 0%, #42a5f5 100%);
          box-shadow: 0 4px 16px 0 #1976d244;
        }
        button[type="submit"]:disabled {
          background: #e0e0e0;
          color: #aaa;
          cursor: not-allowed;
          box-shadow: none;
        }
        .guess-number {
          color: #fff;
          background: linear-gradient(90deg, #1976d2 0%, #64b5f6 100%);
          border-radius: 6px;
          padding: 0.2em 0.7em;
          font-size: 1em;
          font-weight: bold;
          margin: 0.5em auto 0.2em auto;
          display: inline-block;
          box-shadow: 0 2px 8px 0 #1976d222;
          letter-spacing: 0.03em;
        }
        .guess-number span {
          font-size: 1.2em;
          font-weight: 900;
          color: #fff;
        }
        .share-btn {
          width: 100%;
          margin: 1em auto 0 auto;
          display: block;
          background: linear-gradient(90deg, #43a047 0%, #64b5f6 100%);
          color: #fff;
          border: none;
          border-radius: 7px;
          padding: 0.7em 0;
          font-size: 1em;
          font-weight: bold;
          cursor: pointer;
          box-shadow: 0 2px 8px 0 #43a04722;
          transition: background 0.2s, box-shadow 0.2s;
        }
        .share-btn:hover {
          background: linear-gradient(90deg, #388e3c 0%, #42a5f5 100%);
          box-shadow: 0 4px 16px 0 #43a04744;
        }
        .share-modal-bg {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(30,40,60,0.25);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .share-modal {
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 8px 32px 0 #1976d244;
          padding: 1.2em 0.7em 1em 0.7em;
          min-width: 220px;
          max-width: 90vw;
          position: relative;
          text-align: center;
          padding-top: 1.2em;
        }
        .close-modal-wrapper {
          position: absolute;
          top: 0.7em;
          right: 0.7em;
          display: flex;
          align-items: center;
          gap: 0.3em;
          z-index: 10;
        }
        .close-modal {
          background: none;
          border: none;
          font-size: 2em;
          color: #888;
          cursor: pointer;
          transition: color 0.2s;
          line-height: 1;
          padding: 0;
        }
        .close-modal:hover {
          color: #d32f2f;
        }
        .close-modal-label {
          color: #888;
          font-size: 1em;
          font-weight: 500;
          cursor: pointer;
          user-select: none;
        }
        .share-modal-title {
          font-size: 1.2em;
          font-weight: bold;
          margin-bottom: 1.2em;
          color: #1976d2;
          margin-top: 1.7em;
        }
        .share-btn-modal {
          width: 100%;
          background: linear-gradient(90deg, #43a047 0%, #64b5f6 100%);
          color: #fff;
          border: none;
          border-radius: 7px;
          padding: 0.7em 0;
          font-size: 1em;
          font-weight: bold;
          cursor: pointer;
          box-shadow: 0 2px 8px 0 #43a04722;
          transition: background 0.2s, box-shadow 0.2s;
          margin-bottom: 1em;
        }
        .share-btn-modal:hover {
          background: linear-gradient(90deg, #388e3c 0%, #42a5f5 100%);
          box-shadow: 0 4px 16px 0 #43a04744;
        }
        .share-modal-tip {
          color: #888;
          font-size: 0.98em;
        }
        @media (max-width: 480px) {
          .game-container {
            max-width: 98vw;
            padding: 0.7rem 0.2rem 0.7rem 0.2rem;
            border-radius: 10px;
          }
          .logo-title {
            margin-bottom: 0.5em;
          }
          h2 {
            font-size: 1em;
          }
          .letter-box, .input-char {
            width: 1.2em;
            height: 1.2em;
            font-size: 0.95em;
            border-radius: 5px;
          }
          .input-row {
            min-height: 1.3em;
            margin-bottom: 0.5em;
          }
          .success-message, .fail-message {
            font-size: 0.95em;
            padding: 0.5em;
            border-radius: 7px;
          }
          .guess-number {
            font-size: 0.95em;
            padding: 0.15em 0.5em;
            border-radius: 4px;
          }
          button[type="submit"] {
            font-size: 0.95em;
            padding: 0.5em 0;
            border-radius: 5px;
          }
          .share-modal {
            min-width: 120px;
            padding: 1.2em 0.2em 0.7em 0.2em;
            border-radius: 8px;
            padding-top: 1.2em;
          }
          .share-btn-modal, .share-btn {
            font-size: 0.95em;
            border-radius: 5px;
            padding: 0.5em 0;
          }
          .share-modal-title {
            margin-top: 1.3em;
          }
          .close-modal-wrapper {
            top: 0.5em;
            right: 0.5em;
            gap: 0.2em;
          }
          .close-modal-label {
            font-size: 0.95em;
          }
        }
      `}</style>
    </div>
  );
} 