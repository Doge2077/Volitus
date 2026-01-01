import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import GamePage from './pages/GamePage.tsx'
import './index.css'

const isGamePage = window.location.pathname === '/game';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {isGamePage ? <GamePage /> : <App />}
  </React.StrictMode>,
)
