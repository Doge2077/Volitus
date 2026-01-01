import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { roomAPI, RoomListItem } from '../services/api'
import './DiscoveryPage.css'

function DiscoveryPage() {
  const [rooms, setRooms] = useState<RoomListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetchRooms()
    // 每10秒刷新一次房间列表
    const interval = setInterval(fetchRooms, 10000)
    return () => clearInterval(interval)
  }, [])

  const fetchRooms = async () => {
    try {
      setLoading(true)
      const data = await roomAPI.getRoomList()
      setRooms(data.rooms)
      setError(null)
    } catch (err) {
      setError('获取直播列表失败')
      console.error('Failed to fetch rooms:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleRoomClick = (roomId: string) => {
    navigate(`/room/${roomId}`)
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000)
    const now = new Date()
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diff < 60) return '刚刚'
    if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`
    if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`
    return date.toLocaleDateString('zh-CN')
  }

  return (
    <div className="discovery-page">
      <header className="discovery-header">
        <h1>Volitus 直播发现</h1>
        <p>观众共创的互动剧情直播平台</p>
      </header>

      {loading && rooms.length === 0 ? (
        <div className="loading">加载中...</div>
      ) : error ? (
        <div className="error">
          <p>{error}</p>
          <button onClick={fetchRooms}>重试</button>
        </div>
      ) : rooms.length === 0 ? (
        <div className="empty-state">
          <p>暂无直播</p>
          <p className="hint">等待主播开播...</p>
        </div>
      ) : (
        <div className="rooms-grid">
          {rooms.map((room) => (
            <div
              key={room.room_id}
              className="room-card"
              onClick={() => handleRoomClick(room.room_id)}
            >
              <div className="room-thumbnail">
                <div className="live-badge">直播中</div>
                <div className="viewer-count">
                  <span className="icon">👥</span>
                  <span>{room.viewer_count}</span>
                </div>
              </div>
              <div className="room-info">
                <h3 className="streamer-name">{room.streamer_name}</h3>
                <p className="room-id">房间号: {room.room_id}</p>
                <p className="created-time">{formatDate(room.created_at)}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && rooms.length > 0 && (
        <div className="refresh-hint">
          列表每10秒自动刷新
        </div>
      )}
    </div>
  )
}

export default DiscoveryPage
