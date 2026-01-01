import { useEffect, useRef, useState } from 'react'
import AgoraRTC, { IAgoraRTCClient, IAgoraRTCRemoteUser } from 'agora-rtc-sdk-ng'
import { roomAPI } from '../services/api'

interface LivePlayerProps {
  roomId: string
}

const LivePlayer = ({ roomId }: LivePlayerProps) => {
  const videoRef = useRef<HTMLDivElement>(null)
  const clientRef = useRef<IAgoraRTCClient | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initAgora = async () => {
      try {
        setLoading(true)
        setError(null)

        // 从后端获取 Agora 配置
        const config = await roomAPI.getAgoraConfig(roomId)
        console.log('获取到的 Agora 配置:', config)
        console.log('App ID 类型:', typeof config.agora_app_id)
        console.log('App ID 值:', config.agora_app_id)

        if (!config.agora_app_id) {
          setError('Agora App ID 未配置')
          setLoading(false)
          return
        }

        const client = AgoraRTC.createClient({ mode: 'live', codec: 'vp8' })
        clientRef.current = client

        // 设置为观众角色
        await client.setClientRole('audience')

        client.on('user-published', async (user: IAgoraRTCRemoteUser, mediaType: 'audio' | 'video') => {
          console.log('用户发布:', user.uid, mediaType)
          await client.subscribe(user, mediaType)

          if (mediaType === 'video' && videoRef.current) {
            console.log('播放视频')
            user.videoTrack?.play(videoRef.current)
          }

          if (mediaType === 'audio') {
            console.log('播放音频')
            user.audioTrack?.play()
          }
        })

        client.on('user-unpublished', (user: IAgoraRTCRemoteUser) => {
          console.log('用户停止发布:', user.uid)
        })

        console.log('正在加入频道:', config.agora_channel)
        console.log('使用的参数 - App ID:', config.agora_app_id, 'Channel:', config.agora_channel)
        await client.join(
          config.agora_app_id,
          config.agora_channel,
          config.agora_token || null,
          null
        )
        console.log('成功加入频道')
        setLoading(false)
      } catch (err) {
        console.error('Agora 初始化失败:', err)
        setError('直播连接失败')
        setLoading(false)
      }
    }

    initAgora()

    return () => {
      clientRef.current?.leave()
    }
  }, [roomId])

  return (
    <div style={{ width: '100%', height: '100%', background: '#000', position: 'relative' }}>
      <div ref={videoRef} style={{ width: '100%', height: '100%' }} />
      {loading && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: 'white',
          fontSize: '1.2rem'
        }}>
          正在连接直播...
        </div>
      )}
      {error && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: '#ff4757',
          fontSize: '1.2rem',
          textAlign: 'center'
        }}>
          {error}
        </div>
      )}
    </div>
  )
}

export default LivePlayer
