import { useEffect, useCallback } from 'react';
import { wsService } from '../services/websocket';
import { useStreamStore } from '../store';
import type {
  VoteTriggerData,
  VoteProgressData,
  VoteResultData,
  PlotUpdateData,
  ViewerCountData,
} from '../services/websocket';

export const useWebSocket = (roomId: string, enabled: boolean = true) => {
  const {
    setWsConnected,
    setCurrentVote,
    setLastVoteResult,
    setCurrentNode,
    setViewerCount,
  } = useStreamStore();

  // 投票触发处理
  const handleVoteTrigger = useCallback((data: VoteTriggerData) => {
    console.log('Vote triggered:', data);
    setCurrentVote({
      vote_id: data.vote_id,
      votes: {},
      total: 0,
      time_left: data.duration,
    });
  }, [setCurrentVote]);

  // 投票进度处理
  const handleVoteProgress = useCallback((data: VoteProgressData) => {
    setCurrentVote(data);
  }, [setCurrentVote]);

  // 投票结果处理
  const handleVoteResult = useCallback((data: VoteResultData) => {
    setLastVoteResult(data);
    setCurrentVote(null);
  }, [setLastVoteResult, setCurrentVote]);

  // 剧情更新处理
  const handlePlotUpdate = useCallback((data: PlotUpdateData) => {
    console.log('Plot updated:', data);
    setCurrentNode({
      id: data.node_id,
      type: 'normal',
      image: data.image_url,
      text: data.text,
      next: data.next,
    });
  }, [setCurrentNode]);

  // 观众数量更新处理
  const handleViewerCount = useCallback((data: ViewerCountData) => {
    setViewerCount(data.count);
  }, [setViewerCount]);

  useEffect(() => {
    if (!enabled || !roomId) return;

    // 连接 WebSocket
    wsService.connect(roomId, 'streamer');
    setWsConnected(true);

    // 注册事件处理器
    wsService.on('vote:trigger', handleVoteTrigger);
    wsService.on('vote:progress', handleVoteProgress);
    wsService.on('vote:result', handleVoteResult);
    wsService.on('plot:update', handlePlotUpdate);
    wsService.on('room:viewer_count', handleViewerCount);

    // 清理函数
    return () => {
      wsService.off('vote:trigger', handleVoteTrigger);
      wsService.off('vote:progress', handleVoteProgress);
      wsService.off('vote:result', handleVoteResult);
      wsService.off('plot:update', handlePlotUpdate);
      wsService.off('room:viewer_count', handleViewerCount);
      wsService.disconnect();
      setWsConnected(false);
    };
  }, [
    roomId,
    enabled,
    setWsConnected,
    handleVoteTrigger,
    handleVoteProgress,
    handleVoteResult,
    handlePlotUpdate,
    handleViewerCount,
  ]);

  return {
    isConnected: wsService.isConnected(),
    send: wsService.send.bind(wsService),
  };
};
