import { useState } from 'react';
import SetupScreen from './components/SetupScreen';
import StreamPublisher from './components/StreamPublisher';
import PlotDisplay from './components/PlotDisplay';
import VotePanel from './components/VotePanel';
import StatsPanel from './components/StatsPanel';
import { useStreamStore } from './store';
import { useWebSocket } from './hooks/useWebSocket';
import { roomAPI } from './services/api';
import './App.css';

function App() {
  const [started, setStarted] = useState(false);
  const {
    roomId,
    currentNode,
    setCurrentNode,
    addToHistory,
    setIsLive,
  } = useStreamStore();

  // 连接 WebSocket
  useWebSocket(roomId, started);

  const handleStart = () => {
    setStarted(true);
    setIsLive(true);
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
        <PlotDisplay
          image={currentNode?.image || ''}
          text={currentNode?.text || ''}
          onNext={handleNext}
        />
      </div>
    </div>
  );
}

export default App;
