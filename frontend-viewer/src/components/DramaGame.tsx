import { useState, useEffect } from 'react';
import { getImageUrl } from '../utils/placeholderImages';
import './DramaGame.css';

interface Dialogue {
  time: number;
  text: string;
}

interface Role {
  id: string;
  name: string;
  avatar: string;
  dialogues: Dialogue[];
}

interface Background {
  id: string;
  image: string;
}

interface Chapter {
  id: number;
  background: Background;
  roles: Role[];
}

interface DramaGameViewerProps {
  roomId: string;
  ws: WebSocket | null;
}

const DramaGameViewer: React.FC<DramaGameViewerProps> = ({ roomId, ws }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null);
  const [currentDialogue, setCurrentDialogue] = useState<{
    role: Role;
    text: string;
  } | null>(null);
  const [background, setBackground] = useState<string>('');
  const [storyTitle, setStoryTitle] = useState<string>('');

  useEffect(() => {
    if (!ws) return;

    const handleMessage = (event: MessageEvent) => {
      const message = JSON.parse(event.data);

      switch (message.type) {
        case 'drama:start':
          // 游戏开始
          setIsPlaying(true);
          setCurrentChapter({
            id: message.data.chapter_id,
            background: message.data.background,
            roles: message.data.roles,
          });
          setBackground(message.data.background.image);
          break;

        case 'drama:progress':
          // 剧情推进
          const data = message.data;
          setBackground(data.background.image);
          if (data.role && data.dialogue) {
            setCurrentDialogue({
              role: data.role,
              text: data.dialogue.text,
            });
          }
          break;

        case 'drama:new_chapter':
          // 新章节
          setCurrentChapter({
            id: message.data.chapter_id,
            background: message.data.background,
            roles: message.data.roles,
          });
          setBackground(message.data.background.image);
          setCurrentDialogue(null);
          break;

        case 'drama:end':
          // 剧本结束
          setIsPlaying(false);
          alert(message.data.message);
          break;

        default:
          break;
      }
    };

    ws.addEventListener('message', handleMessage);

    return () => {
      ws.removeEventListener('message', handleMessage);
    };
  }, [ws]);

  if (!isPlaying) {
    return (
      <div className="drama-waiting">
        <p>等待主播开始游戏...</p>
      </div>
    );
  }

  return (
    <div
      className="drama-game-canvas viewer"
      style={{
        backgroundImage: `url(${getImageUrl(background)})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* 角色显示区域 */}
      {currentChapter && (
        <div className="roles-container">
          {currentChapter.roles.map((role) => (
            <div key={role.id} className="role-avatar">
              <img src={getImageUrl(role.avatar)} alt={role.name} />
            </div>
          ))}
        </div>
      )}

      {/* 对话框 */}
      {currentDialogue && (
        <div className="dialogue-box">
          <div className="dialogue-name">{currentDialogue.role.name}</div>
          <div className="dialogue-text">{currentDialogue.text}</div>
        </div>
      )}

      {/* 观众模式提示 */}
      <div className="viewer-mode-badge">观众模式</div>
    </div>
  );
};

export default DramaGameViewer;
