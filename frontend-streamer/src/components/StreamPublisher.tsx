import { useEffect, useRef, useState } from 'react';
import { useStreamStore } from '../store';
import './StreamPublisher.css';

const StreamPublisher = () => {
  const {
    roomId,
    isCameraOn,
    isMicOn,
    toggleCamera,
    toggleMic,
  } = useStreamStore();

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [streamType, setStreamType] = useState<'camera' | 'screen'>('camera');
  const [error, setError] = useState('');

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsStreaming(true);
      setStreamType('camera');
      setError('');
    } catch (err) {
      console.error('Failed to get camera:', err);
      setError('无法访问摄像头');
    }
  };

  const startScreen = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsStreaming(true);
      setStreamType('screen');
      setError('');
    } catch (err) {
      console.error('Failed to get screen:', err);
      setError('无法录制屏幕');
    }
  };

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsStreaming(false);
  };

  const toggleMicMute = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicMuted(!audioTrack.enabled);
      }
    }
  };

  useEffect(() => {
    return () => {
      stopStream();
    };
  }, []);

  return (
    <div className="stream-publisher fullscreen">
      <video ref={videoRef} autoPlay playsInline muted className="video-preview fullscreen" />

      {!isStreaming && (
        <div className="camera-off-overlay">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 1l22 22M16 16v1a2 2 0 01-2 2H3a2 2 0 01-2-2V7a2 2 0 012-2h2m5.66 0H14a2 2 0 012 2v3.34l1 1L23 7v10" />
          </svg>
          <p>点击播放按钮启动摄像头</p>
        </div>
      )}

      <div className="floating-controls">
        {!isStreaming ? (
          <>
            <button className="control-btn start-stream" onClick={startCamera} title="启动摄像头">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
            <button className="control-btn" onClick={startScreen} title="录制屏幕">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <path d="M8 21h8M12 17v4" />
              </svg>
            </button>
          </>
        ) : (
          <>
            <button className="control-btn muted" onClick={stopStream} title="停止直播">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="6" width="12" height="12" />
              </svg>
            </button>
            <button className={`control-btn ${isMicMuted ? 'muted' : ''}`} onClick={toggleMicMute} title={isMicMuted ? '开麦' : '闭麦'}>
              {isMicMuted ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="1" y1="1" x2="23" y2="23" />
                  <path d="M9 9v3a3 3 0 005.12 2.12M15 9.34V4a3 3 0 00-5.94-.6" />
                  <path d="M17 16.95A7 7 0 015 12v-2m14 0v2a7 7 0 01-.11 1.23" />
                  <line x1="12" y1="19" x2="12" y2="23" />
                  <line x1="8" y1="23" x2="16" y2="23" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
                  <path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8" />
                </svg>
              )}
            </button>
          </>
        )}
      </div>

      {isStreaming && (
        <div className="floating-info">
          <span className="stream-type">{streamType === 'camera' ? '📹' : '🖥️'}</span>
          <span className="room-id">房间: {roomId}</span>
        </div>
      )}

      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default StreamPublisher;
