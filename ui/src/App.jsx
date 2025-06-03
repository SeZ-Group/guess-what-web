import { useState } from 'react'
import Game from './components/Game'
import Admin from './components/Admin'
import './App.css'

function App() {
  const [adminMode, setAdminMode] = useState(false)

  return (
    <div>
      <header style={{textAlign: 'center', margin: '1em 0'}}>
        <button onClick={() => setAdminMode(false)} disabled={!adminMode}>Game</button>
        <button onClick={() => setAdminMode(true)} disabled={adminMode} style={{marginLeft: '1em'}}>Admin</button>
      </header>
      {adminMode ? <Admin /> : <Game />}
    </div>
  )
}

export default App
