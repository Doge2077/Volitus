export interface WSMessage {
  type: string;
  data: any;
  timestamp: number;
}

export interface VoteTriggerData {
  vote_id: string;
  options: Array<{ id: string; label: string }>;
  duration: number;
}

export interface VoteProgressData {
  vote_id: string;
  votes: Record<string, number>;
  total: number;
  time_left: number;
}

export interface VoteResultData {
  vote_id: string;
  winner: string;
  votes: Record<string, number>;
  passed: boolean;
}

export interface PlotUpdateData {
  node_id: string;
  image_url: string;
  text: string;
  next: string;
}

export interface ViewerCountData {
  count: number;
}

type MessageHandler = (data: any) => void;

class WebSocketService {
  private ws: WebSocket | null = null;
  private handlers: Map<string, MessageHandler[]> = new Map();
  private reconnectTimer: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private roomId: string = '';
  private role: 'streamer' | 'viewer' = 'streamer';

  connect(roomId: string, role: 'streamer' | 'viewer' = 'streamer') {
    this.roomId = roomId;
    this.role = role;

    const wsUrl = import.meta.env.VITE_WS_URL || `ws://${window.location.hostname}:8031/ws`;
    const url = `${wsUrl}?room_id=${roomId}&role=${role}`;

    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
    };

    this.ws.onmessage = (event) => {
      try {
        const message: WSMessage = JSON.parse(event.data);
        this.handleMessage(message);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      this.attemptReconnect();
    };
  }

  private handleMessage(message: WSMessage) {
    const handlers = this.handlers.get(message.type);
    if (handlers) {
      handlers.forEach(handler => handler(message.data));
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnect attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);

    this.reconnectTimer = setTimeout(() => {
      console.log(`Reconnecting... (attempt ${this.reconnectAttempts})`);
      this.connect(this.roomId, this.role);
    }, delay);
  }

  on(eventType: string, handler: MessageHandler) {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler);
  }

  off(eventType: string, handler: MessageHandler) {
    const handlers = this.handlers.get(eventType);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  send(type: string, data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const message: WSMessage = {
        type,
        data,
        timestamp: Date.now(),
      };
      this.ws.send(JSON.stringify(message));
    } else {
      console.error('WebSocket is not connected');
    }
  }

  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.handlers.clear();
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  getWebSocket(): WebSocket | null {
    return this.ws;
  }
}

export const wsService = new WebSocketService();
export default wsService;
