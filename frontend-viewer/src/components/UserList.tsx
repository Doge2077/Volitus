import './UserList.css'

interface User {
  id: string
  name: string
  avatar: string
  status: 'online' | 'offline'
}

function UserList() {
  const users: User[] = [
    { id: '1', name: 'Player 1', avatar: '🎮', status: 'online' },
    { id: '2', name: 'Player 2', avatar: '🎯', status: 'online' },
    { id: '3', name: 'Player 3', avatar: '🎪', status: 'online' },
    { id: '4', name: 'Player 4', avatar: '🎨', status: 'offline' },
  ]

  return (
    <aside className="user-list">
      <div className="user-list-header">
        <h3>在线用户</h3>
        <span className="user-count">{users.filter(u => u.status === 'online').length}</span>
      </div>
      <div className="users">
        {users.map(user => (
          <div key={user.id} className={`user-item ${user.status}`}>
            <div className="user-avatar">{user.avatar}</div>
            <span className="status-dot"></span>
          </div>
        ))}
      </div>
    </aside>
  )
}

export default UserList
