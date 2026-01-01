import { useState, useEffect, useRef } from 'react'
import { wsService, ChatMessage } from '../services/websocket'
import './ChatWindow.css'

interface Message {
  id: string
  type: 'text' | 'video'
  content: string
  sender: string
  timestamp: number
  videoUrl?: string
  sender_role?: string
}

interface ChatWindowProps {
  roomId: string
}

function ChatWindow({ roomId }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const mediaRecorderRef = useRef<any>(null)

  // 滚动到最新消息
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // 初始化WebSocket连接
  useEffect(() => {
    // 连接WebSocket
    wsService.connect(roomId, 'viewer')

    // 监听聊天消息
    const unsubscribe = wsService.onChatMessage((chatMsg: ChatMessage) => {
      setMessages(prev => [...prev, chatMsg])
    })

    // 清理函数 - 在组件卸载时断开连接
    return () => {
      unsubscribe()
      wsService.disconnect()
    }
  }, [roomId])

  // 发送文字消息
  const handleSendMessage = async () => {
    if (!inputText.trim()) return

    const newMessage: Message = {
      id: `msg_${Date.now()}`,
      type: 'text',
      content: inputText,
      sender: '观众',  // 统一显示为"观众"
      timestamp: Date.now()
    }

    // 通过WebSocket发送消息到服务器，服务器会广播给所有人（包括自己）
    wsService.sendChatMessage(newMessage)

    // 发送到后端收集用户互动
    try {
      await fetch('http://localhost:8000/api/drama/interaction/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          room_id: roomId,
          interaction: {
            user_id: `user_${Date.now()}`,
            type: 'text',
            content: inputText,
            timestamp: Date.now()
          }
        })
      })
    } catch (error) {
      console.error('发送互动数据失败:', error)
    }

    setInputText('')
  }

  // 按键处理
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // 开始语音识别 (使用Web Speech API)
  const startRecording = () => {
    // 检查浏览器是否支持Web Speech API
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

    if (!SpeechRecognition) {
      alert('您的浏览器不支持语音识别功能,请使用Chrome、Edge或Safari浏览器')
      return
    }

    try {
      const recognition = new SpeechRecognition()
      recognition.lang = 'zh-CN' // 设置为中文
      recognition.continuous = false // 单次识别
      recognition.interimResults = false // 不需要临时结果

      recognition.onstart = () => {
        setIsRecording(true)
        console.log('开始语音识别...')
      }

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        console.log('识别结果:', transcript)

        // 将识别的文字添加到输入框
        setInputText(prev => prev + transcript)
      }

      recognition.onerror = (event: any) => {
        console.error('语音识别错误:', event.error)
        setIsRecording(false)

        if (event.error === 'no-speech') {
          alert('未检测到语音,请重试')
        } else if (event.error === 'not-allowed') {
          alert('麦克风权限被拒绝,请在浏览器设置中允许麦克风访问')
        } else {
          alert(`语音识别失败: ${event.error}`)
        }
      }

      recognition.onend = () => {
        setIsRecording(false)
        console.log('语音识别结束')
      }

      // 保存recognition实例
      mediaRecorderRef.current = recognition as any
      recognition.start()
    } catch (error) {
      console.error('启动语音识别失败:', error)
      alert('启动语音识别失败,请检查麦克风权限')
      setIsRecording(false)
    }
  }

  // 停止语音识别
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      try {
        mediaRecorderRef.current.stop()
      } catch (error) {
        console.error('停止语音识别失败:', error)
      }
      setIsRecording(false)
    }
  }

  // 格式化时间
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="chat-window">
      <div className="chat-header">
        <h3>聊天室</h3>
        <span className="online-count">👥 在线</span>
      </div>

      <div className="chat-messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`message ${msg.sender === '我' ? 'message-self' : ''}`}>
            <div className="message-sender">{msg.sender}</div>
            <div className="message-content">
              {msg.type === 'text' ? (
                <p>{msg.content}</p>
              ) : (
                <div className="message-video">
                  <video src={msg.videoUrl} controls className="video-preview" />
                  <p className="video-caption">{msg.content}</p>
                </div>
              )}
            </div>
            <div className="message-time">{formatTime(msg.timestamp)}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-area">
        <div className="input-controls">
          <button
            className={`voice-button ${isRecording ? 'recording' : ''}`}
            onClick={isRecording ? stopRecording : startRecording}
            title={isRecording ? '点击停止录音' : '点击开始语音输入'}
          >
            {isRecording ? '🔴' : '🎤'}
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="输入消息..."
            className="message-input"
          />

          <button
            className="send-button"
            onClick={handleSendMessage}
            disabled={!inputText.trim()}
          >
            发送
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChatWindow
