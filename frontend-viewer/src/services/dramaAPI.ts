import axios from 'axios';

const API_BASE_URL = '/api/drama';

export interface DramaProgress {
  chapter_id: number;
  dialogue_index: number;
  role_index: number;
  role: any;
  dialogue: any;
  background: any;
  is_chapter_end: boolean;
  is_story_end: boolean;
  should_trigger_vote: boolean;
}

export interface UserInteraction {
  user_id: string;
  type: 'text' | 'video';
  content: string;
  timestamp: number;
}

export const dramaAPI = {
  // 获取当前状态
  async getState(roomId: string) {
    const response = await axios.get(`${API_BASE_URL}/state/${roomId}`);
    return response.data;
  },

  // 添加用户互动
  async addInteraction(roomId: string, interaction: UserInteraction) {
    const response = await axios.post(`${API_BASE_URL}/interaction/add`, interaction, {
      params: { room_id: roomId },
    });
    return response.data;
  },
};
