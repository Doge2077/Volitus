import AgoraRTC, {
  IAgoraRTCClient,
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
  ILocalVideoTrack,
  ILocalAudioTrack,
} from 'agora-rtc-sdk-ng';

export interface AgoraConfig {
  appId: string;
  channel: string;
  token: string;
  uid?: string | number | null;
}

export interface StreamStats {
  videoPacketLoss: number;
  audioPacketLoss: number;
  rtt: number;
}

class AgoraService {
  private client: IAgoraRTCClient | null = null;
  private localVideoTrack: ICameraVideoTrack | null = null;
  private localAudioTrack: IMicrophoneAudioTrack | null = null;
  private isPublishing = false;

  async init(config: AgoraConfig) {
    try {
      // 创建客户端
      this.client = AgoraRTC.createClient({
        mode: 'live',
        codec: 'vp8',
      });

      // 设置为主播角色
      await this.client.setClientRole('host');

      // 加入频道
      await this.client.join(
        config.appId,
        config.channel,
        config.token,
        config.uid || null
      );

      console.log('Agora client joined successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize Agora:', error);
      throw error;
    }
  }

  async createTracks() {
    try {
      [this.localAudioTrack, this.localVideoTrack] =
        await AgoraRTC.createMicrophoneAndCameraTracks(
          {
            // 音频配置
            encoderConfig: 'music_standard',
          },
          {
            // 视频配置
            encoderConfig: {
              width: 1280,
              height: 720,
              frameRate: 30,
              bitrateMin: 600,
              bitrateMax: 1000,
            },
          }
        );

      console.log('Local tracks created');
      return {
        audioTrack: this.localAudioTrack,
        videoTrack: this.localVideoTrack,
      };
    } catch (error) {
      console.error('Failed to create tracks:', error);
      throw error;
    }
  }

  async publish() {
    if (!this.client || !this.localAudioTrack || !this.localVideoTrack) {
      throw new Error('Client or tracks not initialized');
    }

    try {
      await this.client.publish([this.localAudioTrack, this.localVideoTrack]);
      this.isPublishing = true;
      console.log('Published local tracks');
    } catch (error) {
      console.error('Failed to publish tracks:', error);
      throw error;
    }
  }

  async unpublish() {
    if (!this.client || !this.isPublishing) return;

    try {
      await this.client.unpublish([this.localAudioTrack!, this.localVideoTrack!]);
      this.isPublishing = false;
      console.log('Unpublished local tracks');
    } catch (error) {
      console.error('Failed to unpublish tracks:', error);
    }
  }

  playVideo(element: HTMLElement) {
    if (this.localVideoTrack) {
      this.localVideoTrack.play(element);
    }
  }

  stopVideo() {
    if (this.localVideoTrack) {
      this.localVideoTrack.stop();
    }
  }

  muteAudio() {
    if (this.localAudioTrack) {
      this.localAudioTrack.setEnabled(false);
    }
  }

  unmuteAudio() {
    if (this.localAudioTrack) {
      this.localAudioTrack.setEnabled(true);
    }
  }

  muteVideo() {
    if (this.localVideoTrack) {
      this.localVideoTrack.setEnabled(false);
    }
  }

  unmuteVideo() {
    if (this.localVideoTrack) {
      this.localVideoTrack.setEnabled(true);
    }
  }

  async getStats(): Promise<StreamStats | null> {
    if (!this.client || !this.isPublishing) return null;

    try {
      const stats = this.client.getRTCStats();
      return {
        videoPacketLoss: 0, // 需要从详细统计中获取
        audioPacketLoss: 0,
        rtt: stats.RTT || 0,
      };
    } catch (error) {
      console.error('Failed to get stats:', error);
      return null;
    }
  }

  async leave() {
    try {
      // 停止并关闭本地轨道
      if (this.localAudioTrack) {
        this.localAudioTrack.stop();
        this.localAudioTrack.close();
        this.localAudioTrack = null;
      }

      if (this.localVideoTrack) {
        this.localVideoTrack.stop();
        this.localVideoTrack.close();
        this.localVideoTrack = null;
      }

      // 离开频道
      if (this.client) {
        await this.client.leave();
        this.client = null;
      }

      this.isPublishing = false;
      console.log('Left Agora channel');
    } catch (error) {
      console.error('Failed to leave:', error);
    }
  }

  getClient() {
    return this.client;
  }

  isPublished() {
    return this.isPublishing;
  }
}

export const agoraService = new AgoraService();
export default agoraService;
