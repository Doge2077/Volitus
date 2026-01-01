# Volitus - 互动直播平台

> 基于 AIGC 的观众共创式互动剧情直播平台

## 🚀 快速开始

### 环境要求
- Python 3.10+
- Node.js 18+
- npm 或 yarn

### 安装依赖

**后端：**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

**观众端：**
```bash
cd frontend-viewer
npm install
```

**主播端：**
```bash
cd frontend-streamer
npm install
```

### 配置环境变量

复制 `backend/.env.example` 为 `backend/.env`，填入你的 API Keys：

```bash
cd backend
cp .env.example .env
# 编辑 .env 文件，填入：
# - DOUBAO_API_KEY（豆包 API）
# - IMAGE_GEN_API_KEY（图片生成 API）
# - AGORA_APP_ID（声网 App ID）
# - AGORA_APP_CERTIFICATE（声网证书）
```

### 启动服务

**后端：**
```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**观众端：**
```bash
cd frontend-viewer
npm run dev
# 访问 http://localhost:5173
```

**主播端：**
```bash
cd frontend-streamer
npm run dev
# 访问 http://localhost:5174
```

## 📚 文档

- [开发指南](./DEV_GUIDE.md) - 完整的技术方案和开发规范
- [PRD 文档](./prd/intro.md) - 产品需求文档

## 🏗️ 项目结构

```
Volitus/
├── backend/              # FastAPI 后端
├── frontend-viewer/      # 观众端（React）
├── frontend-streamer/    # 主播端（React）
├── docs/                 # 文档
└── DEV_GUIDE.md         # 开发指南
```

## 🔧 技术栈

- **后端**: FastAPI + Python 3.10
- **前端**: React 18 + TypeScript + Vite
- **直播**: Agora RTC SDK
- **AI**: 豆包（视频分析）+ DALL-E 3（图片生成）
- **实时通信**: WebSocket

## 📝 开发流程

1. 主播创建房间，选择剧情模板
2. 主播开始推流（摄像头 + 麦克风）
3. 观众进入直播间，观看直播
4. 观众上传视频，AI 解析视频内容
5. 主播触发投票点，观众投票
6. AI 生成新剧情，推送给主播
7. 主播展示新剧情，继续游玩

## 🤝 团队分工

- **成员 1**: AI 处理 + 核心后端
- **成员 2**: 实时通信 + 观众端
- **成员 3**: 主播端全栈

详见 [DEV_GUIDE.md](./DEV_GUIDE.md)

## 📄 License

MIT License
