import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import DiscoveryPage from './pages/DiscoveryPage'
import RoomPage from './pages/RoomPage'
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DiscoveryPage />} />
        <Route path="/room/:roomId" element={<RoomPage />} />
      </Routes>
    </Router>
  )
}

export default App
