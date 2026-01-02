import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { roomAPI, RoomListItem } from '../services/api'
import Sidebar from '../components/Sidebar'
import UserList from '../components/UserList'
import './DiscoveryPage.css'

function DiscoveryPage() {
  const [rooms, setRooms] = useState<RoomListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetchRooms()
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

  const featuredRoom = rooms[0]

  return (
    <div className="discovery-page">
      <Sidebar />
      <main className="main-content">
        <header className="page-header">
          <h1>发现直播</h1>
          <div className="search-bar">
            <input type="text" placeholder="搜索..." />
          </div>
        </header>

        {featuredRoom && (
          <section className="featured-section">
            <div className="featured-card" onClick={() => handleRoomClick(featuredRoom.room_id)}>
              <div className="featured-badge">🔥 热门</div>
              <div className="featured-content">
                <h2>{featuredRoom.streamer_name}</h2>
                <p>房间号: {featuredRoom.room_id}</p>
                <button className="join-btn">加入直播</button>
              </div>
              <div className="featured-stats">
                <div className="stat-item">
                  <span className="stat-icon">👥</span>
                  <span>{featuredRoom.viewer_count}</span>
                </div>
              </div>
            </div>
          </section>
        )}

        <section className="rooms-section">
          <div className="section-header">
            <h2>新游戏</h2>
            <button className="see-all">查看全部 →</button>
          </div>

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
            </div>
          ) : (
            <div className="rooms-grid">
              {rooms.slice(1).map((room) => (
                <div key={room.room_id} className="room-card" onClick={() => handleRoomClick(room.room_id)}>
                  <div className="room-thumbnail">
                    <div className="live-badge">直播中</div>
                  </div>
                  <div className="room-info">
                    <h3>{room.streamer_name}</h3>
                    <p className="room-meta">{formatDate(room.created_at)}</p>
                    <div className="room-stats">
                      <span>👥 {room.viewer_count}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="stats-section">
          <h2>统计数据</h2>
          <div className="stats-card">
            <div className="stat-circle">
              <span className="stat-value">{rooms.reduce((sum, r) => sum + r.viewer_count, 0)}</span>
              <span className="stat-label">总观众</span>
            </div>
          </div>
        </section>
      </main>
      <UserList />
    </div>
  )
}

export default DiscoveryPage
