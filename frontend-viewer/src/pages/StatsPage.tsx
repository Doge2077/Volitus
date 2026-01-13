import Sidebar from '../components/Sidebar'
import UserList from '../components/UserList'
import './StatsPage.css'

function StatsPage() {
  const stats = [
    { label: '总观看时长', value: 1234, max: 2000, unit: '小时', icon: '⏱️', color: '#ff6b6b' },
    { label: '参与投票', value: 567, max: 1000, unit: '次', icon: '🗳️', color: '#9b59b6' },
    { label: '观看直播', value: 89, max: 150, unit: '场', icon: '📺', color: '#5b8dee' },
    { label: '互动消息', value: 2345, max: 3000, unit: '条', icon: '💬', color: '#6bcf7f' },
  ]

  const weeklyData = [
    { day: '周一', value: 45 },
    { day: '周二', value: 68 },
    { day: '周三', value: 52 },
    { day: '周四', value: 78 },
    { day: '周五', value: 92 },
    { day: '周六', value: 85 },
    { day: '周日', value: 70 },
  ]

  const maxWeekly = Math.max(...weeklyData.map(d => d.value))

  return (
    <div className="stats-page">
      <Sidebar />
      <main className="main-content">
        <header className="page-header">
          <h1>我的数据</h1>
        </header>

        <div className="stats-grid">
          {stats.map((stat, idx) => {
            const percentage = (stat.value / stat.max) * 100
            return (
              <div key={idx} className="stat-card">
                <div className="stat-icon">{stat.icon}</div>
                <div className="stat-info">
                  <div className="stat-number">
                    {stat.value.toLocaleString()} <span className="stat-unit">{stat.unit}</span>
                  </div>
                  <div className="stat-label">{stat.label}</div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${percentage}%`, background: stat.color }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="chart-section">
          <h2>本周活跃度</h2>
          <div className="bar-chart">
            {weeklyData.map((data, idx) => {
              const height = (data.value / maxWeekly) * 100
              return (
                <div key={idx} className="bar-item">
                  <div className="bar-wrapper">
                    <div className="bar" style={{ height: `${height}%` }}>
                      <span className="bar-value">{data.value}</span>
                    </div>
                  </div>
                  <span className="bar-label">{data.day}</span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="chart-section">
          <h2>类型分布</h2>
          <div className="pie-chart">
            <svg viewBox="0 0 200 200" className="pie-svg">
              <circle cx="100" cy="100" r="80" fill="none" stroke="#ff6b6b" strokeWidth="40" strokeDasharray="126 377" transform="rotate(-90 100 100)" />
              <circle cx="100" cy="100" r="80" fill="none" stroke="#9b59b6" strokeWidth="40" strokeDasharray="94 377" strokeDashoffset="-126" transform="rotate(-90 100 100)" />
              <circle cx="100" cy="100" r="80" fill="none" stroke="#5b8dee" strokeWidth="40" strokeDasharray="63 377" strokeDashoffset="-220" transform="rotate(-90 100 100)" />
              <circle cx="100" cy="100" r="80" fill="none" stroke="#6bcf7f" strokeWidth="40" strokeDasharray="94 377" strokeDashoffset="-283" transform="rotate(-90 100 100)" />
            </svg>
            <div className="pie-legend">
              <div className="legend-item"><span style={{background: '#ff6b6b'}}></span>悬疑 33%</div>
              <div className="legend-item"><span style={{background: '#9b59b6'}}></span>恐怖 25%</div>
              <div className="legend-item"><span style={{background: '#5b8dee'}}></span>科幻 17%</div>
              <div className="legend-item"><span style={{background: '#6bcf7f'}}></span>其他 25%</div>
            </div>
          </div>
        </div>
      </main>
      <UserList />
    </div>
  )
}

export default StatsPage
