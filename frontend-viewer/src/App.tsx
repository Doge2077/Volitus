import { useState } from 'react'
import LivePlayer from './components/LivePlayer'
import VoteModal from './components/VoteModal'
import VideoUpload from './components/VideoUpload'
import './App.css'

function App() {
  const [roomId, setRoomId] = useState('')
  const [joined, setJoined] = useState(false)
  const [showVote, setShowVote] = useState(false)

  const handleJoinRoom = () => {
    if (roomId.trim()) {
      setJoined(true)
    }
  }

  if (!joined) {
    return (
      <div className="join-container">
        <h1>Volitus 观众端</h1>
        <div className="join-form">
          <input
            type="text"
            placeholder="输入房间 ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
          />
          <button onClick={handleJoinRoom}>进入直播间</button>
        </div>
      </div>
    )
  }

  return (
    <div className="viewer-container">
      <div className="main-content">
        <LivePlayer roomId={roomId} />
      </div>
      <div className="side-panel">
        <VideoUpload roomId={roomId} />
        <div className="plot-info">
          <h3>当前剧情</h3>
          <p>等待主播开始...</p>
        </div>
      </div>
      {showVote && (
        <VoteModal
          voteId="vote_001"
          options={[
            { id: 'A', label: '神秘访客' },
            { id: 'B', label: '突发事件' },
            { id: 'C', label: '规则变化' }
          ]}
          onVote={(optionId) => {
            console.log('投票:', optionId)
            setShowVote(false)
          }}
          onClose={() => setShowVote(false)}
        />
      )}
    </div>
  )
}

export default App
