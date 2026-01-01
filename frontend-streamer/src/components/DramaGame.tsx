import { useState, useEffect, useRef } from 'react';
import { dramaAPI } from '../services/dramaAPI';
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

interface DramaGameProps {
  roomId: string;
  storyPath: string;
  ws: WebSocket | null;
}

interface DramaProgress {
  chapter_id: number;
  dialogue_index: number;
  role_index: number;
  role: Role | null;
  dialogue: Dialogue | null;
  background: Background;
  is_chapter_end: boolean;
  is_story_end: boolean;
  should_trigger_vote: boolean;
}

const DramaGame: React.FC<DramaGameProps> = ({ roomId, storyPath, ws }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null);
  const [currentDialogue, setCurrentDialogue] = useState<{
    role: Role;
    text: string;
  } | null>(null);
  const [background, setBackground] = useState<string>('');
  const [storyTitle, setStoryTitle] = useState<string>('');
  const [isVoting, setIsVoting] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  // 监听投票结果
  useEffect(() => {
    if (!ws) return;

    const handleMessage = (event: MessageEvent) => {
      const message = JSON.parse(event.data);

      if (message.type === 'vote:result') {
        // 投票完成，插入胜出的章节
        handleVoteComplete(message.data.winner);
      }
    };

    ws.addEventListener('message', handleMessage);

    return () => {
      ws.removeEventListener('message', handleMessage);
    };
  }, [ws]);

  // 处理投票完成
  const handleVoteComplete = async (winnerId: string) => {
    try {
      // 这里需要根据winnerId获取对应的章节数据
      // 由于后端已经生成了章节，这里直接清空互动数据即可
      await dramaAPI.clearInteractions(roomId);
      setIsVoting(false);
    } catch (error) {
      console.error('处理投票结果失败:', error);
    }
  };

  // 加载剧本
  const loadDrama = async () => {
    try {
      const data = await dramaAPI.loadDrama(roomId, storyPath);
      if (data.success) {
        setStoryTitle(data.meta.title);
        setCurrentChapter(data.first_chapter);
        setBackground(data.first_chapter.background.image);
        setIsLoaded(true);
      }
    } catch (error) {
      console.error('加载剧本失败:', error);
    }
  };

  // 开始游戏
  const startGame = async () => {
    try {
      const data = await dramaAPI.startGame(roomId);
      if (data.success) {
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('开始游戏失败:', error);
    }
  };

  // 推进剧情
  const nextStep = async () => {
    try {
      const data: DramaProgress = await dramaAPI.nextStep(roomId);

      // 更新背景
      setBackground(data.background.image);

      // 更新当前对话
      if (data.role && data.dialogue) {
        setCurrentDialogue({
          role: data.role,
          text: data.dialogue.text,
        });
      }

      // 检查是否剧本结束
      if (data.is_story_end) {
        setIsPlaying(false);
        alert('剧本已完结！');
      }

      // 检查是否需要触发投票
      if (data.should_trigger_vote) {
        await triggerVote();
      }
    } catch (error) {
      console.error('推进剧情失败:', error);
    }
  };

  // 触发投票
  const triggerVote = async () => {
    try {
      // 获取互动数据
      const interactionsData = await dramaAPI.getInteractions(roomId);
      const interactions = interactionsData.interactions;

      // 触发投票
      await dramaAPI.triggerChapterVote(roomId, interactions);
      setIsVoting(true);
    } catch (error) {
      console.error('触发投票失败:', error);
    }
  };

  // 点击画布推进
  const handleCanvasClick = () => {
    if (isPlaying && !isVoting) {
      nextStep();
    }
  };

  useEffect(() => {
    if (roomId && storyPath) {
      loadDrama();
    }
  }, [roomId, storyPath]);

  if (!isLoaded) {
    return (
      <div className="drama-loading">
        <p>加载剧本中...</p>
      </div>
    );
  }

  if (!isPlaying) {
    return (
      <div className="drama-start-screen">
        <h1>{storyTitle}</h1>
        <button onClick={startGame} className="start-button">
          开始游戏
        </button>
      </div>
    );
  }

  return (
    <div
      className="drama-game-canvas"
      ref={canvasRef}
      onClick={handleCanvasClick}
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

      {/* 投票中提示 */}
      {isVoting && (
        <div className="voting-overlay">
          <div className="voting-message">
            观众正在投票选择下一章节...
          </div>
        </div>
      )}

      {/* 点击提示 */}
      {!isVoting && <div className="click-hint">点击屏幕继续</div>}
    </div>
  );
};

export default DramaGame;
