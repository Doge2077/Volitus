import Sidebar from '../components/Sidebar'
import UserList from '../components/UserList'
import './GamesPage.css'

function GamesPage() {
  const genres = [
    { id: 1, name: '悬疑推理', icon: '🔍', count: 12 },
    { id: 2, name: '恐怖惊悚', icon: '👻', count: 8 },
    { id: 3, name: '爱情浪漫', icon: '💕', count: 15 },
    { id: 4, name: '科幻冒险', icon: '🚀', count: 10 },
    { id: 5, name: '历史剧情', icon: '📜', count: 6 },
    { id: 6, name: '喜剧搞笑', icon: '😂', count: 9 },
  ]

  return (
    <div className="games-page">
      <Sidebar />
      <main className="main-content">
        <header className="page-header">
          <h1>剧本类型</h1>
        </header>

        <div className="genres-grid">
          {genres.map(genre => (
            <div key={genre.id} className="genre-card">
              <div className="genre-icon">{genre.icon}</div>
              <h3>{genre.name}</h3>
              <p>{genre.count} 个剧本</p>
            </div>
          ))}
        </div>
      </main>
      <UserList />
    </div>
  )
}

export default GamesPage
