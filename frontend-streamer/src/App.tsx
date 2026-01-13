import { useState } from 'react';
import SetupScreen from './components/SetupScreen';
import StreamPublisher from './components/StreamPublisher';
import PlotDisplay from './components/PlotDisplay';
import VotePanel from './components/VotePanel';
import StatsPanel from './components/StatsPanel';
import DramaGame from './components/DramaGame';
import { useStreamStore } from './store';
import { useWebSocket } from './hooks/useWebSocket';
import { roomAPI } from './services/api';
import { wsService } from './services/websocket';
import './App.css';

function App() {
  const [started, setStarted] = useState(false);
  const [gameWindow, setGameWindow] = useState<Window | null>(null);
  const {
    roomId,
    currentNode,
    setCurrentNode,
    addToHistory,
    setIsLive,
  } = useStreamStore();

  // 连接 WebSocket
  useWebSocket(roomId, started);

  // 获取WebSocket实例
  const getWebSocket = () => {
    return wsService.getWebSocket();
  };

  const handleStart = () => {
    setStarted(true);
    setIsLive(true);
  };

  const openGameWindow = () => {
    const width = 1280;
    const height = 720;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;

    const newWindow = window.open(
      `/game?roomId=${roomId}`,
      'DramaGame',
      `width=${width},height=${height},left=${left},top=${top}`
    );

    setGameWindow(newWindow);
  };

  const handleNext = async () => {
    if (!currentNode) return;

    try {
      const response = await roomAPI.nextStep(roomId, {
        current_node: currentNode.id,
      });

      const { next_node, type, vote_id } = response.data;

      if (type === 'vote_point') {
        // 投票点，等待投票结果
        console.log('Reached vote point:', vote_id);
      } else {
        // 普通节点，继续前进
        addToHistory(currentNode);
        // 这里应该从后端获取下一个节点的详细信息
        // 暂时保持当前节点
      }
    } catch (error) {
      console.error('Failed to proceed to next step:', error);
    }
  };

  if (!started) {
    return <SetupScreen onStart={handleStart} />;
  }

  return (
    <div className="app-container fullscreen">
      <StreamPublisher />
      <div className="overlay-panels">
        <StatsPanel />
        <VotePanel />
        <button
          style={{
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '12px 24px',
            fontSize: '16px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            zIndex: 1000,
          }}
          onClick={openGameWindow}
        >
          🎮 打开游戏窗口
        </button>
      </div>
    </div>
  );
}

export default App;
