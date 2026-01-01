import './PlotDisplay.css'

interface PlotDisplayProps {
  image: string
  text: string
  onNext: () => void
}

const PlotDisplay = ({ image, text, onNext }: PlotDisplayProps) => {
  return (
    <div className="plot-display">
      <div className="plot-text">{text || '等待剧情...'}</div>
      <button className="next-button" onClick={onNext} disabled={!text}>
        下一步 →
      </button>
    </div>
  )
}

export default PlotDisplay
