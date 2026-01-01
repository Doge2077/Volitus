import { useEffect, useCallback, useRef } from 'react';
import { agoraService, AgoraConfig } from '../services/agora';
import { useStreamStore } from '../store';

export const useAgora = (config: AgoraConfig | null, autoStart: boolean = false) => {
  const videoRef = useRef<HTMLDivElement | null>(null);
  const {
    setIsPublishing,
    isCameraOn,
    isMicOn,
    setError,
  } = useStreamStore();

  const initAndPublish = useCallback(async () => {
    if (!config) return;

    try {
      // 初始化 Agora
      await agoraService.init(config);

      // 创建本地轨道
      await agoraService.createTracks();

      // 播放视频预览
      if (videoRef.current) {
        agoraService.playVideo(videoRef.current);
      }

      // 发布流
      await agoraService.publish();
      setIsPublishing(true);
    } catch (error) {
      console.error('Failed to init and publish:', error);
      setError(error instanceof Error ? error.message : 'Failed to start stream');
    }
  }, [config, setIsPublishing, setError]);

  const stopPublish = useCallback(async () => {
    try {
      await agoraService.unpublish();
      await agoraService.leave();
      setIsPublishing(false);
    } catch (error) {
      console.error('Failed to stop publish:', error);
    }
  }, [setIsPublishing]);

  const toggleCamera = useCallback(() => {
    if (isCameraOn) {
      agoraService.muteVideo();
    } else {
      agoraService.unmuteVideo();
    }
  }, [isCameraOn]);

  const toggleMic = useCallback(() => {
    if (isMicOn) {
      agoraService.muteAudio();
    } else {
      agoraService.unmuteAudio();
    }
  }, [isMicOn]);

  useEffect(() => {
    if (autoStart && config) {
      initAndPublish();
    }

    return () => {
      agoraService.leave();
    };
  }, [autoStart, config, initAndPublish]);

  // 同步摄像头和麦克风状态
  useEffect(() => {
    toggleCamera();
  }, [isCameraOn]);

  useEffect(() => {
    toggleMic();
  }, [isMicOn]);

  return {
    videoRef,
    initAndPublish,
    stopPublish,
    toggleCamera,
    toggleMic,
    isPublishing: agoraService.isPublished(),
  };
};
