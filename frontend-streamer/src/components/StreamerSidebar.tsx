import './StreamerSidebar.css'

function StreamerSidebar() {
  return (
    <aside className="streamer-sidebar">
      <div className="sidebar-logo">S</div>
      <nav className="sidebar-nav">
        <button className="nav-item active">🎬</button>
        <button className="nav-item">📊</button>
        <button className="nav-item">⚙️</button>
      </nav>
      <div className="sidebar-footer">
        <button className="nav-item live-indicator">🔴</button>
      </div>
    </aside>
  )
}

export default StreamerSidebar
