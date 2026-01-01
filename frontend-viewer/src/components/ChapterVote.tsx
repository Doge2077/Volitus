import { useState, useEffect } from 'react';
import './ChapterVote.css';

interface Chapter {
  id: number;
  background: any;
  roles: any[];
}

interface VoteOption {
  id: string;
  label: string;
  preview: Chapter;
}

interface ChapterVoteProps {
  roomId: string;
  ws: WebSocket | null;
  onVoteComplete?: (winnerId: string) => void;
}

const ChapterVote: React.FC<ChapterVoteProps> = ({ roomId, ws, onVoteComplete }) => {
  const [isVoting, setIsVoting] = useState(false);
  const [voteId, setVoteId] = useState<string>('');
  const [options, setOptions] = useState<VoteOption[]>([]);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [hasVoted, setHasVoted] = useState(false);
  const [voteProgress, setVoteProgress] = useState<{ [key: string]: number }>({});
  const [totalVoters, setTotalVoters] = useState(0);
  const [votedCount, setVotedCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [winner, setWinner] = useState<string>('');

  useEffect(() => {
    if (!ws) return;

    const handleMessage = (event: MessageEvent) => {
      const message = JSON.parse(event.data);

      switch (message.type) {
        case 'vote:trigger':
          // 触发投票
          setIsVoting(true);
          setVoteId(message.data.vote_id);
          setOptions(message.data.options);
          setTimeLeft(message.data.duration);
          setHasVoted(false);
          setSelectedOption('');
          setVoteProgress({});
          setWinner('');
          break;

        case 'vote:progress':
          // 投票进度
          setVoteProgress(message.data.votes);
          setTotalVoters(message.data.total);
          setVotedCount(message.data.voted_count);
          break;

        case 'vote:result':
          // 投票结果
          setWinner(message.data.winner);
          setVoteProgress(message.data.votes);
          setTimeout(() => {
            setIsVoting(false);
            if (onVoteComplete) {
              onVoteComplete(message.data.winner);
            }
          }, 3000);
          break;

        default:
          break;
      }
    };

    ws.addEventListener('message', handleMessage);

    return () => {
      ws.removeEventListener('message', handleMessage);
    };
  }, [ws, onVoteComplete]);

  // 倒计时
  useEffect(() => {
    if (!isVoting || hasVoted || winner) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isVoting, hasVoted, winner]);

  const handleVote = (optionId: string) => {
    if (hasVoted || !ws) return;

    setSelectedOption(optionId);
    setHasVoted(true);

    // 发送投票到服务器
    ws.send(
      JSON.stringify({
        type: 'vote:cast',
        data: {
          vote_id: voteId,
          option_id: optionId,
          user_id: `user_${Date.now()}`,
        },
      })
    );
  };

  if (!isVoting) {
    return null;
  }

  const getTotalVotes = () => {
    return Object.values(voteProgress).reduce((sum, count) => sum + count, 0);
  };

  const getPercentage = (optionId: string) => {
    const total = getTotalVotes();
    if (total === 0) return 0;
    return Math.round(((voteProgress[optionId] || 0) / total) * 100);
  };

  return (
    <div className="chapter-vote-overlay">
      <div className="chapter-vote-modal">
        <div className="vote-header">
          <h2>选择下一章节剧情</h2>
          {!winner && (
            <div className="vote-timer">
              ⏱️ {timeLeft}秒
            </div>
          )}
        </div>

        {winner && (
          <div className="vote-result-banner">
            🎉 选项 {winner} 胜出！
          </div>
        )}

        <div className="vote-options">
          {options.map((option) => (
            <div
              key={option.id}
              className={`vote-option ${
                selectedOption === option.id ? 'selected' : ''
              } ${winner === option.id ? 'winner' : ''} ${
                hasVoted ? 'disabled' : ''
              }`}
              onClick={() => handleVote(option.id)}
            >
              <div className="option-label">{option.label}</div>
              <div className="option-preview">
                <img
                  src={`/${option.preview.background.image}`}
                  alt={option.label}
                />
              </div>
              {hasVoted && (
                <div className="vote-progress-bar">
                  <div
                    className="vote-progress-fill"
                    style={{ width: `${getPercentage(option.id)}%` }}
                  />
                  <span className="vote-percentage">
                    {voteProgress[option.id] || 0} 票 ({getPercentage(option.id)}%)
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="vote-stats">
          已投票: {votedCount} / {totalVoters}
        </div>
      </div>
    </div>
  );
};

export default ChapterVote;
