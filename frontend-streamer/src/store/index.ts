import { create } from 'zustand';
import { PlotTemplate } from '../services/api';
import { VoteProgressData, VoteResultData } from '../services/websocket';

export interface PlotNode {
  id: string;
  type: 'normal' | 'vote_point' | 'end';
  image: string;
  text: string;
  next?: string;
}

export interface StreamState {
  // 房间信息
  roomId: string;
  streamerName: string;
  templateId: string;
  isLive: boolean;

  // Agora 配置
  agoraAppId: string;
  agoraToken: string;
  agoraChannel: string;

  // 推流状态
  isPublishing: boolean;
  isCameraOn: boolean;
  isMicOn: boolean;

  // 剧情状态
  currentNode: PlotNode | null;
  plotHistory: PlotNode[];
  availableTemplates: PlotTemplate[];

  // 投票状态
  currentVote: VoteProgressData | null;
  lastVoteResult: VoteResultData | null;

  // 观众统计
  viewerCount: number;

  // WebSocket 连接状态
  wsConnected: boolean;

  // 加载和错误状态
  isLoading: boolean;
  error: string | null;
}

export interface StreamActions {
  // 房间操作
  setRoomInfo: (info: {
    roomId: string;
    streamerName: string;
    templateId: string;
    agoraAppId: string;
    agoraToken: string;
    agoraChannel: string;
  }) => void;
  setIsLive: (isLive: boolean) => void;

  // 推流控制
  setIsPublishing: (isPublishing: boolean) => void;
  toggleCamera: () => void;
  toggleMic: () => void;

  // 剧情操作
  setCurrentNode: (node: PlotNode) => void;
  addToHistory: (node: PlotNode) => void;
  setAvailableTemplates: (templates: PlotTemplate[]) => void;

  // 投票操作
  setCurrentVote: (vote: VoteProgressData | null) => void;
  setLastVoteResult: (result: VoteResultData | null) => void;

  // 观众统计
  setViewerCount: (count: number) => void;

  // WebSocket 状态
  setWsConnected: (connected: boolean) => void;

  // 加载和错误
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;

  // 重置状态
  reset: () => void;
}

const initialState: StreamState = {
  roomId: '',
  streamerName: '',
  templateId: '',
  isLive: false,
  agoraAppId: '',
  agoraToken: '',
  agoraChannel: '',
  isPublishing: false,
  isCameraOn: true,
  isMicOn: true,
  currentNode: null,
  plotHistory: [],
  availableTemplates: [],
  currentVote: null,
  lastVoteResult: null,
  viewerCount: 0,
  wsConnected: false,
  isLoading: false,
  error: null,
};

export const useStreamStore = create<StreamState & StreamActions>((set) => ({
  ...initialState,

  setRoomInfo: (info) =>
    set({
      roomId: info.roomId,
      streamerName: info.streamerName,
      templateId: info.templateId,
      agoraAppId: info.agoraAppId,
      agoraToken: info.agoraToken,
      agoraChannel: info.agoraChannel,
    }),

  setIsLive: (isLive) => set({ isLive }),

  setIsPublishing: (isPublishing) => set({ isPublishing }),

  toggleCamera: () =>
    set((state) => ({ isCameraOn: !state.isCameraOn })),

  toggleMic: () =>
    set((state) => ({ isMicOn: !state.isMicOn })),

  setCurrentNode: (node) => set({ currentNode: node }),

  addToHistory: (node) =>
    set((state) => ({
      plotHistory: [...state.plotHistory, node],
    })),

  setAvailableTemplates: (templates) =>
    set({ availableTemplates: templates }),

  setCurrentVote: (vote) => set({ currentVote: vote }),

  setLastVoteResult: (result) => set({ lastVoteResult: result }),

  setViewerCount: (count) => set({ viewerCount: count }),

  setWsConnected: (connected) => set({ wsConnected: connected }),

  setIsLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  reset: () => set(initialState),
}));
