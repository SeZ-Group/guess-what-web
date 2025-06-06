import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Game from './components/Game';
import About from './components/About';
import SezGame from './components/SezGame';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Game />} />
        <Route path="/about" element={<About />} />
        <Route path="/sez" element={<SezGame />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
