import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import LivePlayer from '../components/LivePlayer'
import VoteModal from '../components/VoteModal'
import VideoUpload from '../components/VideoUpload'
import ChatWindow from '../components/ChatWindow'
import DramaGameViewer from '../components/DramaGame'
import ChapterVote from '../components/ChapterVote'
import { roomAPI } from '../services/api'
import { wsService } from '../services/websocket'
import './RoomPage.css'

function RoomPage() {
  const { roomId } = useParams<{ roomId: string }>()
  const navigate = useNavigate()
  const [showVote, setShowVote] = useState(false)
  const [roomInfo, setRoomInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!roomId) {
      navigate('/')
      return
    }

    fetchRoomInfo()
  }, [roomId, navigate])

  const fetchRoomInfo = async () => {
    if (!roomId) return

    try {
      setLoading(true)
      const info = await roomAPI.getRoomInfo(roomId)
      setRoomInfo(info)
      setError(null)
    } catch (err) {
      setError('房间不存在或已结束')
      console.error('Failed to fetch room info:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleBackToDiscovery = () => {
    navigate('/')
  }

  if (loading) {
    return (
      <div className="room-loading">
        <div className="loading-spinner"></div>
        <p>正在进入直播间...</p>
      </div>
    )
  }

  if (error || !roomInfo) {
    return (
      <div className="room-error">
        <h2>进入直播间失败</h2>
        <p>{error}</p>
        <button onClick={handleBackToDiscovery}>返回发现页</button>
      </div>
    )
  }

  return (
    <div className="room-page">
      <div className="room-header">
        <button className="back-button" onClick={handleBackToDiscovery}>
          ← 返回
        </button>
        <div className="room-title">
          <h2>{roomInfo.streamer_name}的直播间</h2>
          <span className="room-id-badge">房间号: {roomId}</span>
        </div>
        <div className="room-stats">
          <span className="viewer-count">👥 {roomInfo.viewer_count} 在线</span>
        </div>
      </div>

      <div className="viewer-container">
        <div className="main-content">
          <LivePlayer roomId={roomId!} />
          {/* 剧本游戏显示 */}
          <DramaGameViewer roomId={roomId!} ws={wsService.getWebSocket()} />
        </div>
        <div className="side-panel">
          <VideoUpload roomId={roomId!} />
          <ChatWindow roomId={roomId!} />
        </div>
      </div>

      {/* 章节投票 */}
      <ChapterVote roomId={roomId!} ws={wsService.getWebSocket()} />

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

export default RoomPage
