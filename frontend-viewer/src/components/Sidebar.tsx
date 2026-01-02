import { useNavigate, useLocation } from 'react-router-dom'
import './Sidebar.css'

function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()

  const navItems = [
    { path: '/', icon: '🏠' },
    { path: '/games', icon: '🎮' },
    { path: '/stats', icon: '📊' },
    { path: '/settings', icon: '⚙️' },
  ]

  return (
    <aside className="sidebar">
      <div className="sidebar-logo" onClick={() => navigate('/')}>V</div>
      <nav className="sidebar-nav">
        {navItems.map(item => (
          <button
            key={item.path}
            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            {item.icon}
          </button>
        ))}
      </nav>
      <div className="sidebar-footer">
        <button className="nav-item">👤</button>
      </div>
    </aside>
  )
}

export default Sidebar
