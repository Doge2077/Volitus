import { useStreamStore } from '../store';
import './VotePanel.css';

const VotePanel = () => {
  const { currentVote, lastVoteResult } = useStreamStore();

  if (!currentVote && !lastVoteResult) {
    return (
      <div className="vote-panel">
        <h3>投票状态</h3>
        <div className="no-vote">
          <p>当前没有进行中的投票</p>
        </div>
      </div>
    );
  }

  return (
    <div className="vote-panel">
      <h3>投票状态</h3>

      {currentVote && (
        <div className="vote-progress">
          <div className="vote-header">
            <span className="vote-label">进行中</span>
            <span className="time-left">{currentVote.time_left}s</span>
          </div>

          <div className="vote-options">
            {Object.entries(currentVote.votes).map(([option, count]) => {
              const percentage = currentVote.total > 0
                ? (count / currentVote.total) * 100
                : 0;

              return (
                <div key={option} className="vote-option">
                  <div className="option-header">
                    <span className="option-label">选项 {option}</span>
                    <span className="option-count">{count} 票</span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="option-percentage">{percentage.toFixed(1)}%</span>
                </div>
              );
            })}
          </div>

          <div className="vote-total">
            总投票数: {currentVote.total}
          </div>
        </div>
      )}

      {lastVoteResult && !currentVote && (
        <div className="vote-result">
          <div className="result-header">
            <span className="result-label">
              {lastVoteResult.passed ? '✓ 投票通过' : '✗ 投票未通过'}
            </span>
          </div>

          <div className="result-winner">
            获胜选项: <strong>{lastVoteResult.winner}</strong>
          </div>

          <div className="result-breakdown">
            {Object.entries(lastVoteResult.votes).map(([option, count]) => (
              <div key={option} className="result-item">
                <span>选项 {option}:</span>
                <span>{count} 票</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VotePanel;
