import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 房间相关接口
export interface CreateRoomRequest {
  streamer_name: string;
  template_id: string;
}

export interface CreateRoomResponse {
  room_id: string;
  agora_app_id: string;
  agora_token: string;
  agora_channel: string;
  plot: {
    current_node: string;
    image_url: string;
  };
}

export interface RoomInfo {
  room_id: string;
  status: 'live' | 'ended';
  streamer_name: string;
  viewer_count: number;
  current_plot_node: string;
}

export interface NextStepRequest {
  current_node: string;
}

export interface NextStepResponse {
  next_node: string;
  type: 'normal' | 'vote_point';
  vote_id?: string;
}

// 剧情相关接口
export interface PlotTemplate {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
}

export interface PlotTemplatesResponse {
  templates: PlotTemplate[];
}

export const roomAPI = {
  createRoom: (data: CreateRoomRequest) =>
    api.post<CreateRoomResponse>('/room/create', data),

  getRoomInfo: (roomId: string) =>
    api.get<RoomInfo>(`/room/${roomId}`),

  nextStep: (roomId: string, data: NextStepRequest) =>
    api.post<NextStepResponse>(`/room/${roomId}/next`, data),
};

export const plotAPI = {
  getTemplates: () =>
    api.get<PlotTemplatesResponse>('/plot/templates'),

  getPlotDetail: (plotId: string) =>
    api.get(`/plot/${plotId}`),
};

export default api;
