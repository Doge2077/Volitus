import Sidebar from '../components/Sidebar'
import UserList from '../components/UserList'
import './SettingsPage.css'

function SettingsPage() {
  const settings = [
    { title: '账号设置', icon: '👤', items: ['修改昵称', '更换头像'] },
    { title: '通知设置', icon: '🔔', items: ['直播提醒', '投票通知'] },
    { title: '隐私设置', icon: '🔒', items: ['在线状态', '观看记录'] },
    { title: '显示设置', icon: '🎨', items: ['主题模式', '字体大小'] },
  ]

  return (
    <div className="settings-page">
      <Sidebar />
      <main className="main-content">
        <header className="page-header">
          <h1>设置</h1>
        </header>

        <div className="settings-list">
          {settings.map((section, idx) => (
            <div key={idx} className="setting-section">
              <div className="section-header">
                <span className="section-icon">{section.icon}</span>
                <h3>{section.title}</h3>
              </div>
              <div className="section-items">
                {section.items.map((item, i) => (
                  <div key={i} className="setting-item">
                    <span>{item}</span>
                    <button className="setting-btn">→</button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
      <UserList />
    </div>
  )
}

export default SettingsPage
