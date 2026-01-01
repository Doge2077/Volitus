import './PlotDisplay.css'

interface PlotDisplayProps {
  image: string
  text: string
  onNext: () => void
}

const PlotDisplay = ({ image, text, onNext }: PlotDisplayProps) => {
  return (
    <div className="plot-display">
      <div className="plot-image-container">
        <img src={image} alt="剧情" className="plot-image" />
      </div>
      <div className="plot-text">{text}</div>
      <button className="next-button" onClick={onNext}>
        下一步 →
      </button>
    </div>
  )
}

export default PlotDisplay
