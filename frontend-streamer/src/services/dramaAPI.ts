import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/drama';

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

export interface Chapter {
  id: number;
  background: any;
  roles: any[];
}

export const dramaAPI = {
  // 加载剧本
  async loadDrama(roomId: string, storyPath: string) {
    const response = await axios.post(`${API_BASE_URL}/load`, {
      room_id: roomId,
      story_path: storyPath,
    });
    return response.data;
  },

  // 开始游戏
  async startGame(roomId: string) {
    const response = await axios.post(`${API_BASE_URL}/start`, null, {
      params: { room_id: roomId },
    });
    return response.data;
  },

  // 推进剧情
  async nextStep(roomId: string): Promise<DramaProgress> {
    const response = await axios.post(`${API_BASE_URL}/next`, {
      room_id: roomId,
    });
    return response.data;
  },

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

  // 获取互动数据
  async getInteractions(roomId: string) {
    const response = await axios.get(`${API_BASE_URL}/interaction/${roomId}`);
    return response.data;
  },

  // 清空互动数据
  async clearInteractions(roomId: string) {
    const response = await axios.post(`${API_BASE_URL}/interaction/clear/${roomId}`);
    return response.data;
  },

  // 触发章节投票
  async triggerChapterVote(roomId: string, interactions: UserInteraction[]) {
    const response = await axios.post(`${API_BASE_URL}/vote/trigger`, {
      room_id: roomId,
      interactions,
    });
    return response.data;
  },

  // 插入章节
  async insertChapter(roomId: string, chapter: Chapter, insertAfterId: number) {
    const response = await axios.post(`${API_BASE_URL}/chapter/insert`, {
      room_id: roomId,
      chapter,
      insert_after_id: insertAfterId,
    });
    return response.data;
  },
};
