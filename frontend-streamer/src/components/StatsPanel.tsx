import { useStreamStore } from '../store';
import './StatsPanel.css';

const StatsPanel = () => {
  const { viewerCount, wsConnected, isPublishing } = useStreamStore();

  return (
    <div className="stats-panel">
      <h3>实时统计</h3>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon viewer">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-value">{viewerCount}</div>
            <div className="stat-label">在线观众</div>
          </div>
        </div>

        <div className="stat-card">
          <div className={`stat-icon connection ${wsConnected ? 'connected' : 'disconnected'}`}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-value">{wsConnected ? '已连接' : '未连接'}</div>
            <div className="stat-label">WebSocket</div>
          </div>
        </div>

        <div className="stat-card">
          <div className={`stat-icon stream ${isPublishing ? 'live' : 'offline'}`}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-value">{isPublishing ? '直播中' : '离线'}</div>
            <div className="stat-label">推流状态</div>
          </div>
        </div>
      </div>

      <div className="stats-chart">
        <div className="chart-header">
          <span>观众趋势</span>
        </div>
        <div className="chart-placeholder">
          <svg width="100%" height="80" viewBox="0 0 200 80" preserveAspectRatio="none">
            <defs>
              <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ff6b9d" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#ff6b9d" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M0,60 L20,55 L40,50 L60,45 L80,40 L100,35 L120,30 L140,35 L160,30 L180,25 L200,20"
              fill="none"
              stroke="#ff6b9d"
              strokeWidth="2"
            />
            <path
              d="M0,60 L20,55 L40,50 L60,45 L80,40 L100,35 L120,30 L140,35 L160,30 L180,25 L200,20 L200,80 L0,80 Z"
              fill="url(#chartGradient)"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default StatsPanel;
