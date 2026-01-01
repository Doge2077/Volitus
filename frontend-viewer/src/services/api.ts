import axios from 'axios'

const API_BASE_URL = 'http://localhost:8000/api'

export interface RoomListItem {
  room_id: string
  streamer_name: string
  viewer_count: number
  status: string
  template_id: string
  created_at: number
}

export interface RoomListResponse {
  rooms: RoomListItem[]
}

export interface RoomInfo {
  room_id: string
  status: string
  streamer_name: string
  viewer_count: number
  current_plot_node: string
}

export interface AgoraConfig {
  agora_app_id: string
  agora_token: string
  agora_channel: string
}

export const roomAPI = {
  // 获取所有直播中的房间列表
  getRoomList: async (): Promise<RoomListResponse> => {
    const response = await axios.get(`${API_BASE_URL}/room/list`)
    return response.data
  },

  // 获取房间详细信息
  getRoomInfo: async (roomId: string): Promise<RoomInfo> => {
    const response = await axios.get(`${API_BASE_URL}/room/${roomId}`)
    return response.data
  },

  // 获取房间的 Agora 配置
  getAgoraConfig: async (roomId: string): Promise<AgoraConfig> => {
    const response = await axios.get(`${API_BASE_URL}/room/${roomId}/agora`)
    return response.data
  }
}
