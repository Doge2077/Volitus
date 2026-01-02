import { useEffect } from 'react';
import DramaGame from '../components/DramaGame';
import { wsService } from '../services/websocket';
import './GamePage.css';

const GamePage = () => {
  const params = new URLSearchParams(window.location.search);
  const roomId = params.get('roomId') || '';

  useEffect(() => {
    if (roomId) {
      wsService.connect(roomId, 'streamer');
    }
  }, [roomId]);

  return (
    <div className="game-page">
      <div className="animated-background">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
      </div>
      <DramaGame
        roomId={roomId}
        storyPath="../drama/story.json"
        ws={wsService.getWebSocket()}
      />
    </div>
  );
};

export default GamePage;
