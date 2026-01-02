import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import DiscoveryPage from './pages/DiscoveryPage'
import RoomPage from './pages/RoomPage'
import GamesPage from './pages/GamesPage'
import StatsPage from './pages/StatsPage'
import SettingsPage from './pages/SettingsPage'
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DiscoveryPage />} />
        <Route path="/games" element={<GamesPage />} />
        <Route path="/stats" element={<StatsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/room/:roomId" element={<RoomPage />} />
      </Routes>
    </Router>
  )
}

export default App
