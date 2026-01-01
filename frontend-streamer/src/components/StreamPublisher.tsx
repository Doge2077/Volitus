import { useEffect, useRef, useState } from 'react';
import { useStreamStore } from '../store';
import { agoraService } from '../services/agora';
import './StreamPublisher.css';

const StreamPublisher = () => {
  const {
    roomId,
    agoraAppId,
    agoraToken,
    agoraChannel,
    setIsPublishing,
  } = useStreamStore();

  const videoRef = useRef<HTMLDivElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [error, setError] = useState('');

  const startCamera = async () => {
    try {
      await agoraService.init({
        appId: agoraAppId,
        channel: agoraChannel,
        token: agoraToken,
      });
      await agoraService.createTracks();
      if (videoRef.current) {
        agoraService.playVideo(videoRef.current);
      }
      await agoraService.publish();
      setIsStreaming(true);
      setIsPublishing(true);
      setError('');
      console.log('开始推流到Agora频道');
    } catch (err) {
      console.error('Failed to start stream:', err);
      setError('无法启动直播');
    }
  };

  const stopStream = async () => {
    try {
      await agoraService.unpublish();
      await agoraService.leave();
      setIsStreaming(false);
      setIsPublishing(false);
    } catch (err) {
      console.error('Failed to stop stream:', err);
    }
  };

  const toggleMicMute = () => {
    if (isMicMuted) {
      agoraService.unmuteAudio();
    } else {
      agoraService.muteAudio();
    }
    setIsMicMuted(!isMicMuted);
  };

  useEffect(() => {
    return () => {
      agoraService.leave();
    };
  }, []);

  return (
    <div className="stream-publisher fullscreen">
      <div ref={videoRef} className="video-preview fullscreen" />
      {!isStreaming && (
        <div className="camera-off-overlay">
          <p>点击播放按钮启动摄像头</p>
        </div>
      )}
      <div className="floating-controls">
        {!isStreaming ? (
          <button className="control-btn start-stream" onClick={startCamera} title="启动摄像头">
            开始直播
          </button>
        ) : (
          <>
            <button className="control-btn muted" onClick={stopStream} title="停止直播">
              停止
            </button>
            <button className="control-btn" onClick={toggleMicMute} title={isMicMuted ? '开麦' : '闭麦'}>
              {isMicMuted ? '开麦' : '闭麦'}
            </button>
          </>
        )}
      </div>
      {isStreaming && (
        <div className="floating-info">
          <span className="room-id">房间: {roomId}</span>
        </div>
      )}
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default StreamPublisher;
