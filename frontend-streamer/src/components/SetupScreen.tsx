import { useState, useEffect } from 'react';
import { plotAPI, roomAPI, PlotTemplate } from '../services/api';
import { useStreamStore } from '../store';
import './SetupScreen.css';

interface SetupScreenProps {
  onStart: () => void;
}

const SetupScreen = ({ onStart }: SetupScreenProps) => {
  const [streamerName, setStreamerName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [templates, setTemplates] = useState<PlotTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { setRoomInfo, setCurrentNode, setAvailableTemplates } = useStreamStore();

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const response = await plotAPI.getTemplates();
      setTemplates(response.data.templates);
      setAvailableTemplates(response.data.templates);
      if (response.data.templates.length > 0) {
        setSelectedTemplate(response.data.templates[0].id);
      }
    } catch (err) {
      console.error('Failed to load templates:', err);
      setError('加载剧情模板失败');
    }
  };

  const handleStart = async () => {
    if (!streamerName.trim()) {
      setError('请输入主播名称');
      return;
    }

    if (!selectedTemplate) {
      setError('请选择剧情模板');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await roomAPI.createRoom({
        streamer_name: streamerName,
        template_id: selectedTemplate,
      });

      const { room_id, agora_app_id, agora_token, agora_channel, plot } = response.data;

      // 保存房间信息到状态
      setRoomInfo({
        roomId: room_id,
        streamerName,
        templateId: selectedTemplate,
        agoraAppId: agora_app_id,
        agoraToken: agora_token,
        agoraChannel: agora_channel,
      });

      // 设置初始剧情节点
      setCurrentNode({
        id: plot.current_node,
        type: 'normal',
        image: plot.image_url,
        text: '欢迎来到互动直播！',
      });

      onStart();
    } catch (err) {
      console.error('Failed to create room:', err);
      setError('创建房间失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="setup-screen">
      <div className="setup-container">
        <div className="setup-header">
          <div className="logo">🎬</div>
          <h1 className="setup-title">Volitus</h1>
          <p className="setup-subtitle">互动直播平台</p>
        </div>

        <div className="setup-form">
          <div className="form-group">
            <input
              type="text"
              placeholder="输入主播名称"
              value={streamerName}
              onChange={(e) => setStreamerName(e.target.value)}
              disabled={loading}
              className="input-field"
            />
          </div>

          <div className="form-group">
            <select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              disabled={loading}
              className="select-field"
            >
              {templates.length === 0 && <option value="">加载剧情模板...</option>}
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button
            className="start-button"
            onClick={handleStart}
            disabled={loading || !streamerName.trim() || !selectedTemplate}
          >
            {loading ? '创建中...' : '开始直播'}
          </button>
        </div>

        <div className="setup-footer">
          <p>📹 确保摄像头和麦克风已连接</p>
        </div>
      </div>
    </div>
  );
};

export default SetupScreen;
