import { useState } from 'react'
import StreamPublisher from './components/StreamPublisher'
import PlotDisplay from './components/PlotDisplay'
import './App.css'

function App() {
  const [roomId, setRoomId] = useState('')
  const [started, setStarted] = useState(false)
  const [currentPlot, setCurrentPlot] = useState({
    image: '/images/forest_start.jpg',
    text: '选择剧情模板开始直播'
  })

  const handleStartStream = async () => {
    // TODO: 调用后端创建房间
    const mockRoomId = 'room_' + Date.now()
    setRoomId(mockRoomId)
    setStarted(true)
  }

  if (!started) {
    return (
      <div className="setup-container">
        <h1>Volitus 主播端</h1>
        <div className="setup-form">
          <input type="text" placeholder="主播名称" />
          <select>
            <option>选择剧情模板</option>
            <option value="template_001">神秘森林冒险</option>
          </select>
          <button onClick={handleStartStream}>开始直播</button>
        </div>
      </div>
    )
  }

  return (
    <div className="streamer-container">
      <div className="stream-section">
        <StreamPublisher roomId={roomId} />
      </div>
      <div className="plot-section">
        <PlotDisplay
          image={currentPlot.image}
          text={currentPlot.text}
          onNext={() => console.log('下一步')}
        />
      </div>
    </div>
  )
}

export default App
