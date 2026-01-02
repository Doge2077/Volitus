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
  const pipVideoRef = useRef<HTMLDivElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [streamMode, setStreamMode] = useState<'camera' | 'screen'>('camera');
  const [showCameraInScreen, setShowCameraInScreen] = useState(false);
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
      setStreamMode('camera');
      setError('');
      console.log('开始推流到Agora频道');
    } catch (err) {
      console.error('Failed to start stream:', err);
      setError('无法启动直播');
    }
  };

  const switchToScreen = async () => {
    try {
      await agoraService.switchToScreen();
      if (videoRef.current) {
        videoRef.current.innerHTML = '';
      }
      setStreamMode('screen');
    } catch (err) {
      console.error('Failed to switch to screen:', err);
      setError('无法切换到屏幕共享');
    }
  };

  const switchToCamera = async () => {
    try {
      await agoraService.switchToCamera();
      if (videoRef.current) {
        agoraService.playVideo(videoRef.current);
      }
      setStreamMode('camera');
      setShowCameraInScreen(false);
    } catch (err) {
      console.error('Failed to switch to camera:', err);
      setError('无法切换到摄像头');
    }
  };

  const toggleCameraInScreen = () => {
    if (!showCameraInScreen && pipVideoRef.current) {
      const track = agoraService.getLocalVideoTrack();
      if (track) {
        track.play(pipVideoRef.current);
      }
    }
    setShowCameraInScreen(!showCameraInScreen);
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

  const toggleCamera = () => {
    const track = agoraService.getLocalVideoTrack();
    if (track) {
      track.setEnabled(isCameraOff);
    }
    setIsCameraOff(!isCameraOff);
  };

  const togglePause = async () => {
    if (isPaused) {
      await agoraService.publish();
      setIsPublishing(true);
    } else {
      await agoraService.unpublish();
      setIsPublishing(false);
    }
    setIsPaused(!isPaused);
  };

  useEffect(() => {
    return () => {
      agoraService.leave();
    };
  }, []);

  return (
    <div className="stream-publisher fullscreen">
      <div ref={videoRef} className="video-preview fullscreen" />
      {showCameraInScreen && streamMode === 'screen' && (
        <div
          ref={pipVideoRef}
          style={{
            position: 'absolute',
            bottom: '80px',
            right: '20px',
            width: '240px',
            height: '180px',
            borderRadius: '8px',
            overflow: 'hidden',
            border: '2px solid #fff',
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
            zIndex: 100,
          }}
        />
      )}
      {!isStreaming && (
        <div className="camera-off-overlay">
          <p>点击播放按钮启动摄像头</p>
        </div>
      )}
      <div className="floating-controls">
        {!isStreaming ? (
          <button className="control-btn primary" onClick={startCamera} title="开始直播">
            <span className="btn-icon">▶</span>
            <span className="btn-text">开始直播</span>
          </button>
        ) : (
          <>
            <button className={`control-btn ${isPaused ? 'warning' : 'secondary'}`} onClick={togglePause} title={isPaused ? '继续直播' : '暂停直播'}>
              <span className="btn-icon">{isPaused ? '▶' : '⏸'}</span>
            </button>
            <button className={`control-btn ${isMicMuted ? 'danger' : 'secondary'}`} onClick={toggleMicMute} title={isMicMuted ? '开麦' : '闭麦'}>
              <span className="btn-icon">{isMicMuted ? '🔇' : '🎤'}</span>
            </button>
            <button className={`control-btn ${isCameraOff ? 'danger' : 'secondary'}`} onClick={toggleCamera} title={isCameraOff ? '开启摄像头' : '关闭摄像头'}>
              <span className="btn-icon">{isCameraOff ? '📷' : '📹'}</span>
            </button>
            {streamMode === 'camera' ? (
              <button className="control-btn secondary" onClick={switchToScreen} title="切换到屏幕共享">
                <span className="btn-icon">🖥️</span>
              </button>
            ) : (
              <>
                <button className="control-btn secondary" onClick={switchToCamera} title="切换到摄像头">
                  <span className="btn-icon">📹</span>
                </button>
                <button
                  className={`control-btn ${showCameraInScreen ? 'active' : 'secondary'}`}
                  onClick={toggleCameraInScreen}
                  title={showCameraInScreen ? '隐藏头像' : '显示头像'}
                >
                  <span className="btn-icon">👤</span>
                </button>
              </>
            )}
            <button className="control-btn danger" onClick={stopStream} title="停止直播">
              <span className="btn-icon">⏹</span>
            </button>
          </>
        )}
      </div>
      {isStreaming && (
        <div className="floating-info">
          <span className="stream-type">
            {streamMode === 'camera' ? '📹 摄像头' : `🖥️ 屏幕${showCameraInScreen ? ' + 头像' : ''}`}
          </span>
          <span className="room-id">房间: {roomId}</span>
        </div>
      )}
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default StreamPublisher;
