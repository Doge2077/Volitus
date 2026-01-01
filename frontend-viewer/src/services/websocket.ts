// WebSocket service for real-time communication

export interface WSMessage {
  type: string
  data: any
  timestamp: number
}

export interface ChatMessage {
  id: string
  type: 'text' | 'video'
  content: string
  sender: string
  sender_role: string
  timestamp: number
  videoUrl?: string
}

class WebSocketService {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 3000
  private messageHandlers: Map<string, Set<(data: any) => void>> = new Map()

  connect(roomId: string, role: 'viewer' | 'streamer') {
    // 如果已经有连接，先断开
    if (this.ws && this.ws.readyState !== WebSocket.CLOSED) {
      console.log('关闭现有WebSocket连接')
      this.ws.close()
    }

    const wsUrl = `ws://localhost:8000/ws?room_id=${roomId}&role=${role}`

    this.ws = new WebSocket(wsUrl)

    this.ws.onopen = () => {
      console.log('WebSocket connected')
      this.reconnectAttempts = 0
    }

    this.ws.onmessage = (event) => {
      try {
        const message: WSMessage = JSON.parse(event.data)
        this.handleMessage(message)
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error)
      }
    }

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error)
    }

    this.ws.onclose = () => {
      console.log('WebSocket disconnected')
      this.handleReconnect(roomId, role)
    }
  }

  private handleMessage(message: WSMessage) {
    const handlers = this.messageHandlers.get(message.type)
    if (handlers) {
      handlers.forEach(handler => handler(message.data))
    }

    // 也触发通用处理器
    const allHandlers = this.messageHandlers.get('*')
    if (allHandlers) {
      allHandlers.forEach(handler => handler(message))
    }
  }

  private handleReconnect(roomId: string, role: 'viewer' | 'streamer') {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(`Reconnecting... Attempt ${this.reconnectAttempts}`)
      setTimeout(() => {
        this.connect(roomId, role)
      }, this.reconnectDelay)
    } else {
      console.error('Max reconnect attempts reached')
    }
  }

  on(eventType: string, handler: (data: any) => void) {
    if (!this.messageHandlers.has(eventType)) {
      this.messageHandlers.set(eventType, new Set())
    }
    this.messageHandlers.get(eventType)!.add(handler)

    // 返回取消订阅的函数
    return () => {
      const handlers = this.messageHandlers.get(eventType)
      if (handlers) {
        handlers.delete(handler)
      }
    }
  }

  off(eventType: string, handler?: (data: any) => void) {
    if (!handler) {
      this.messageHandlers.delete(eventType)
    } else {
      const handlers = this.messageHandlers.get(eventType)
      if (handlers) {
        handlers.delete(handler)
      }
    }
  }

  send(type: string, data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const message = { type, data }
      this.ws.send(JSON.stringify(message))
    } else {
      console.error('WebSocket is not connected')
    }
  }

  // 聊天相关方法
  sendChatMessage(message: Omit<ChatMessage, 'timestamp' | 'sender_role'>) {
    this.send('chat:message', message)
  }

  onChatMessage(handler: (message: ChatMessage) => void) {
    return this.on('chat:message', handler)
  }

  // 投票相关方法
  castVote(voteId: string, optionId: string) {
    this.send('vote:cast', { vote_id: voteId, option_id: optionId })
  }

  onVoteTrigger(handler: (data: any) => void) {
    return this.on('vote:trigger', handler)
  }

  onVoteProgress(handler: (data: any) => void) {
    return this.on('vote:progress', handler)
  }

  onVoteResult(handler: (data: any) => void) {
    return this.on('vote:result', handler)
  }

  // 房间相关方法
  onViewerCountUpdate(handler: (data: { count: number }) => void) {
    return this.on('room:viewer_count', handler)
  }

  onPlotSync(handler: (data: any) => void) {
    return this.on('plot:sync', handler)
  }

  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this.messageHandlers.clear()
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN
  }

  getWebSocket(): WebSocket | null {
    return this.ws
  }
}

// 创建单例
export const wsService = new WebSocketService()
