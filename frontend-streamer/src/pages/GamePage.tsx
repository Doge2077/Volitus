import { useEffect } from 'react';
import DramaGame from '../components/DramaGame';
import { wsService } from '../services/websocket';

const GamePage = () => {
  const params = new URLSearchParams(window.location.search);
  const roomId = params.get('roomId') || '';

  useEffect(() => {
    if (roomId) {
      wsService.connect(roomId, 'streamer');
    }
  }, [roomId]);

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <DramaGame
        roomId={roomId}
        storyPath="../drama/story.json"
        ws={wsService.getWebSocket()}
      />
    </div>
  );
};

export default GamePage;
