import { useEffect, useRef } from 'react'
import AgoraRTC, { IAgoraRTCClient, IAgoraRTCRemoteUser } from 'agora-rtc-sdk-ng'

interface LivePlayerProps {
  roomId: string
}

const LivePlayer = ({ roomId }: LivePlayerProps) => {
  const videoRef = useRef<HTMLDivElement>(null)
  const clientRef = useRef<IAgoraRTCClient | null>(null)

  useEffect(() => {
    const initAgora = async () => {
      // TODO: 从后端获取 Agora 配置
      const APP_ID = 'your_agora_app_id'
      const TOKEN = 'your_token'

      const client = AgoraRTC.createClient({ mode: 'live', codec: 'vp8' })
      clientRef.current = client

      client.on('user-published', async (user: IAgoraRTCRemoteUser, mediaType: 'audio' | 'video') => {
        await client.subscribe(user, mediaType)

        if (mediaType === 'video' && videoRef.current) {
          user.videoTrack?.play(videoRef.current)
        }

        if (mediaType === 'audio') {
          user.audioTrack?.play()
        }
      })

      await client.join(APP_ID, roomId, TOKEN, null)
    }

    initAgora()

    return () => {
      clientRef.current?.leave()
    }
  }, [roomId])

  return (
    <div style={{ width: '100%', height: '100%', background: '#000' }}>
      <div ref={videoRef} style={{ width: '100%', height: '100%' }} />
    </div>
  )
}

export default LivePlayer
