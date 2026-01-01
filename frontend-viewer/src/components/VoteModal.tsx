import { useState } from 'react'
import './VoteModal.css'

interface VoteOption {
  id: string
  label: string
}

interface VoteModalProps {
  voteId: string
  options: VoteOption[]
  onVote: (optionId: string) => void
  onClose: () => void
}

const VoteModal = ({ options, onVote, onClose }: VoteModalProps) => {
  const [selected, setSelected] = useState<string | null>(null)
  const [timeLeft] = useState(15)  // TODO: 实现倒计时功能

  const handleVote = () => {
    if (selected) {
      onVote(selected)
    }
  }

  return (
    <div className="vote-modal-overlay">
      <div className="vote-modal">
        <h2>观众投票</h2>
        <p className="vote-timer">剩余时间: {timeLeft}秒</p>
        <div className="vote-options">
          {options.map((option) => (
            <button
              key={option.id}
              className={`vote-option ${selected === option.id ? 'selected' : ''}`}
              onClick={() => setSelected(option.id)}
            >
              {option.label}
            </button>
          ))}
        </div>
        <div className="vote-actions">
          <button onClick={handleVote} disabled={!selected}>
            确认投票
          </button>
          <button onClick={onClose} className="cancel">
            取消
          </button>
        </div>
      </div>
    </div>
  )
}

export default VoteModal
