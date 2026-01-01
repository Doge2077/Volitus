import { useState } from 'react'
import axios from 'axios'
import './VideoUpload.css'

interface VideoUploadProps {
  roomId: string
}

const VideoUpload = ({ roomId }: VideoUploadProps) => {
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 100 * 1024 * 1024) {
      setMessage('视频文件不能超过 100MB')
      return
    }

    setUploading(true)
    setMessage('上传中...')

    const formData = new FormData()
    formData.append('video', file)
    formData.append('room_id', roomId)

    try {
      const response = await axios.post('/api/video/upload', formData)
      setMessage(`上传成功！视频 ID: ${response.data.video_id}`)

      // 发送到后端收集用户互动
      try {
        await axios.post('/api/drama/interaction/add', {
          room_id: roomId,
          interaction: {
            user_id: `user_${Date.now()}`,
            type: 'video',
            content: response.data.video_id,
            timestamp: Date.now()
          }
        })
      } catch (error) {
        console.error('发送互动数据失败:', error)
      }
    } catch (error) {
      setMessage('上传失败，请重试')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="video-upload">
      <h3>上传视频</h3>
      <p className="upload-hint">上传你感兴趣的视频片段，影响剧情走向</p>
      <label className="upload-button">
        <input
          type="file"
          accept="video/*"
          onChange={handleFileSelect}
          disabled={uploading}
          style={{ display: 'none' }}
        />
        {uploading ? '上传中...' : '选择视频'}
      </label>
      {message && <p className="upload-message">{message}</p>}
    </div>
  )
}

export default VideoUpload
