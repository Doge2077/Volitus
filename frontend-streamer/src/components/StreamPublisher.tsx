import { useEffect, useRef } from 'react'
import AgoraRTC, { IAgoraRTCClient } from 'agora-rtc-sdk-ng'

interface StreamPublisherProps {
  roomId: string
}

const StreamPublisher = ({ roomId }: StreamPublisherProps) => {
  const videoRef = useRef<HTMLDivElement>(null)
  const clientRef = useRef<IAgoraRTCClient | null>(null)

  useEffect(() => {
    const initAgora = async () => {
      // TODO: 从后端获取 Agora 配置
      const APP_ID = 'your_agora_app_id'
      const TOKEN = 'your_token'

      const client = AgoraRTC.createClient({ mode: 'live', codec: 'vp8' })
      clientRef.current = client

      await client.join(APP_ID, roomId, TOKEN, null)

      // 获取摄像头和麦克风
      const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks()

      // 本地预览
      if (videoRef.current) {
        videoTrack.play(videoRef.current)
      }

      // 发布流
      await client.publish([audioTrack, videoTrack])
    }

    initAgora()

    return () => {
      clientRef.current?.leave()
    }
  }, [roomId])

  return (
    <div>
      <h3 style={{ color: 'white', marginTop: 0 }}>摄像头预览</h3>
      <div
        ref={videoRef}
        style={{
          width: '100%',
          height: '300px',
          background: '#000',
          borderRadius: '8px'
        }}
      />
      <p style={{ color: '#aaa', fontSize: '0.9rem', marginTop: '0.5rem' }}>
        房间 ID: {roomId}
      </p>
    </div>
  )
}

export default StreamPublisher
