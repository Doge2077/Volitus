# Volitus 互动直播平台 - 开发指南

> **开发周期：24 小时 | 团队：3 人 | 技术栈：FastAPI + React + Agora**

---

## 📋 项目概述

Volitus 是一个基于 AIGC 的观众共创式互动剧情直播平台。观众可以上传视频、投票决定剧情走向，AI 实时生成新剧情内容推送给主播。

### 核心功能
1. ✅ 真实音视频直播（主播摄像头 + 麦克风）
2. ✅ 观众上传视频 → AI 解析 → 返回结构化标签
3. ✅ 实时投票系统（2/3 通过机制）
4. ✅ AI 生成剧情图片 → 推送给主播
5. ✅ 主播展示剧情（PPT 式图片切换）

---

## 🏗️ 技术栈

### 后端（统一）
- **框架**: FastAPI 0.109+
- **WebSocket**: `fastapi-websocket`
- **HTTP 客户端**: `httpx`
- **文件处理**: `python-multipart`
- **图片处理**: `Pillow`
- **Python 版本**: 3.10+

### 前端（统一）
- **框架**: React 18 + TypeScript
- **构建工具**: Vite
- **直播 SDK**: Agora RTC SDK 4.x
- **状态管理**: Zustand（轻量）
- **HTTP 客户端**: axios
- **WebSocket**: 原生 WebSocket API

### AI 服务
- **视频分析**: 豆包（Doubao）API
- **图片生成**: DALL-E 3 / Stable Diffusion API

### 直播服务
- **方案**: Agora（声网）
- **免费额度**: 10,000 分钟/月
- **延迟**: 1-3 秒

---

## 📁 项目结构（Monorepo）

```
Volitus/
├── backend/                    # 后端服务（FastAPI）
│   ├── app/
│   │   ├── main.py            # FastAPI 入口
│   │   ├── config.py          # 配置管理
│   │   ├── api/               # REST API 路由
│   │   │   ├── __init__.py
│   │   │   ├── video.py       # 视频上传、解析
│   │   │   ├── plot.py        # 剧情管理
│   │   │   └── room.py        # 房间管理
│   │   ├── ws/                # WebSocket 处理
│   │   │   ├── __init__.py
│   │   │   ├── manager.py     # 连接管理器
│   │   │   ├── vote.py        # 投票逻辑
│   │   │   └── plot.py        # 剧情推送
│   │   ├── services/          # 业务逻辑
│   │   │   ├── __init__.py
│   │   │   ├── ai_doubao.py   # 豆包 API 调用
│   │   │   ├── ai_image.py    # 图片生成
│   │   │   ├── plot.py        # 剧情拼接
│   │   │   └── vote.py        # 投票计算
│   │   ├── models/            # 数据模型（Pydantic）
│   │   │   ├── __init__.py
│   │   │   ├── video.py
│   │   │   ├── plot.py
│   │   │   └── vote.py
│   │   └── utils/             # 工具函数
│   │       ├── __init__.py
│   │       └── file.py
│   ├── data/                  # 数据存储（JSON）
│   │   ├── plots/             # 剧情模板
│   │   │   └── template_001.json
│   │   ├── videos/            # 上传的视频
│   │   ├── images/            # 生成的图片
│   │   └── rooms/             # 房间状态
│   ├── requirements.txt       # Python 依赖
│   ├── .env.example          # 环境变量模板
│   └── README.md
│
├── frontend-viewer/           # 观众端（React）
│   ├── src/
│   │   ├── components/
│   │   │   ├── LivePlayer.tsx      # 直播播放器
│   │   │   ├── VoteModal.tsx       # 投票弹窗
│   │   │   ├── VideoUpload.tsx     # 视频上传
│   │   │   └── PlotInfo.tsx        # 剧情信息展示
│   │   ├── services/
│   │   │   ├── agora.ts            # Agora SDK 封装
│   │   │   ├── websocket.ts        # WebSocket 封装
│   │   │   └── api.ts              # REST API 封装
│   │   ├── hooks/
│   │   │   ├── useWebSocket.ts
│   │   │   └── useAgora.ts
│   │   ├── store/
│   │   │   └── index.ts            # Zustand store
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── README.md
│
├── frontend-streamer/         # 主播端（React）
│   ├── src/
│   │   ├── components/
│   │   │   ├── StreamPublisher.tsx  # 推流组件
│   │   │   ├── PlotDisplay.tsx      # 剧情展示（PPT）
│   │   │   ├── PlotSelector.tsx     # 剧情选择
│   │   │   └── CameraPreview.tsx    # 摄像头预览
│   │   ├── services/
│   │   │   ├── agora.ts
│   │   │   ├── websocket.ts
│   │   │   └── api.ts
│   │   ├── hooks/
│   │   │   ├── useWebSocket.ts
│   │   │   └── useAgora.ts
│   │   ├── store/
│   │   │   └── index.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── README.md
│
├── docs/                      # 文档
│   ├── API.md                # REST API 接口文档
│   ├── WEBSOCKET.md          # WebSocket 事件文档
│   ├── DATA_FORMAT.md        # 数据格式规范
│   └── DEPLOY.md             # 部署文档
│
├── .gitignore
└── README.md                  # 项目总览
```

---

## 👥 团队分工

### 成员 1：AI 处理 + 核心后端
**负责模块：**
- ✅ FastAPI 基础框架搭建
- ✅ 视频上传接口（`/api/video/upload`）
- ✅ 豆包 API 调用（视频解析）
- ✅ 图片生成 API 调用
- ✅ 剧情 JSON 读取、拼接逻辑
- ✅ 剧情模板管理接口

**交付接口：**
```
POST   /api/video/upload          # 上传视频
GET    /api/video/analyze/:id     # 获取解析结果
POST   /api/plot/generate          # 生成新剧情
GET    /api/plot/templates         # 获取剧情模板列表
GET    /api/plot/:id               # 获取剧情详情
```

**关键文件：**
- `backend/app/api/video.py`
- `backend/app/api/plot.py`
- `backend/app/services/ai_doubao.py`
- `backend/app/services/ai_image.py`
- `backend/app/services/plot.py`

---

### 成员 2：实时通信 + 观众端
**负责模块：**
- ✅ WebSocket 服务（投票、剧情推送）
- ✅ 投票逻辑（计票、广播、2/3 判定）
- ✅ 房间管理（创建、加入、状态同步）
- ✅ 观众端前端（直播播放、投票界面、视频上传）
- ✅ Agora SDK 集成（观众端拉流）

**交付接口：**
```
WebSocket: ws://domain/ws?room_id=xxx&role=viewer

事件：
- vote:trigger    # 触发投票
- vote:cast       # 用户投票
- vote:result     # 投票结果
- plot:sync       # 剧情同步
```

**关键文件：**
- `backend/app/ws/manager.py`
- `backend/app/ws/vote.py`
- `backend/app/services/vote.py`
- `frontend-viewer/src/components/LivePlayer.tsx`
- `frontend-viewer/src/components/VoteModal.tsx`
- `frontend-viewer/src/services/websocket.ts`

---

### 成员 3：主播端全栈
**负责模块：**
- ✅ 主播端前端（推流、剧情展示）
- ✅ Agora SDK 集成（主播端推流）
- ✅ 剧情图片展示逻辑（PPT 式切换）
- ✅ 房间创建接口
- ✅ Agora Token 生成

**交付接口：**
```
POST   /api/room/create           # 创建房间
GET    /api/room/:id              # 获取房间信息
POST   /api/room/:id/next         # 主播点击"下一步"
```

**关键文件：**
- `backend/app/api/room.py`
- `frontend-streamer/src/components/StreamPublisher.tsx`
- `frontend-streamer/src/components/PlotDisplay.tsx`
- `frontend-streamer/src/services/agora.ts`

---

## 🔌 API 接口规范

### 基础信息
- **Base URL**: `http://your-domain.com/api`
- **WebSocket URL**: `ws://your-domain.com/ws`
- **认证**: 暂不需要（MVP）

### REST API

#### 1. 视频管理

**上传视频**
```http
POST /api/video/upload
Content-Type: multipart/form-data

Body:
  video: File (max 100MB)
  room_id: string

Response 200:
{
  "video_id": "vid_12345",
  "status": "processing",
  "message": "视频上传成功，正在解析中"
}
```

**获取解析结果**
```http
GET /api/video/analyze/:video_id

Response 200:
{
  "video_id": "vid_12345",
  "status": "completed",  // processing | completed | failed
  "result": {
    "characters": ["人物", "动物"],
    "action": "追逐",
    "emotion": "搞笑",
    "style": "夸张",
    "keywords": ["跑", "摔倒", "反转"]
  },
  "timestamp": 1704067200
}
```

#### 2. 剧情管理

**获取剧情模板列表**
```http
GET /api/plot/templates

Response 200:
{
  "templates": [
    {
      "id": "template_001",
      "name": "神秘冒险",
      "description": "一场充满未知的冒险",
      "thumbnail": "/images/template_001.jpg"
    }
  ]
}
```

**生成新剧情**
```http
POST /api/plot/generate
Content-Type: application/json

Body:
{
  "room_id": "room_001",
  "video_analysis": {
    "characters": ["人物"],
    "action": "追逐",
    "emotion": "搞笑"
  },
  "insert_point": "node_003"
}

Response 200:
{
  "plot_id": "plot_12345",
  "node_id": "node_003_insert",
  "image_url": "/images/plot_12345.jpg",
  "text": "突然，一个神秘人物出现并开始追逐你！",
  "next": "node_004"
}
```

#### 3. 房间管理

**创建房间**
```http
POST /api/room/create
Content-Type: application/json

Body:
{
  "streamer_name": "主播名称",
  "template_id": "template_001"
}

Response 200:
{
  "room_id": "room_001",
  "agora_app_id": "your_app_id",
  "agora_token": "token_string",
  "agora_channel": "room_001",
  "plot": {
    "current_node": "start",
    "image_url": "/images/start.jpg"
  }
}
```

**获取房间信息**
```http
GET /api/room/:room_id

Response 200:
{
  "room_id": "room_001",
  "status": "live",  // live | ended
  "streamer_name": "主播名称",
  "viewer_count": 42,
  "current_plot_node": "node_003"
}
```

**主播点击下一步**
```http
POST /api/room/:room_id/next
Content-Type: application/json

Body:
{
  "current_node": "node_002"
}

Response 200:
{
  "next_node": "node_003",
  "type": "vote_point",  // normal | vote_point
  "vote_id": "vote_001"  // 如果是 vote_point
}
```

---

## 🔄 WebSocket 事件规范

### 连接
```javascript
const ws = new WebSocket('ws://domain/ws?room_id=room_001&role=viewer');
// role: viewer | streamer
```

### 事件格式
```typescript
interface WSMessage {
  type: string;
  data: any;
  timestamp: number;
}
```

### 投票相关事件

**服务器 → 所有观众：触发投票**
```json
{
  "type": "vote:trigger",
  "data": {
    "vote_id": "vote_001",
    "options": [
      { "id": "A", "label": "神秘访客" },
      { "id": "B", "label": "突发事件" },
      { "id": "C", "label": "规则变化" }
    ],
    "duration": 15
  },
  "timestamp": 1704067200
}
```

**观众 → 服务器：投票**
```json
{
  "type": "vote:cast",
  "data": {
    "vote_id": "vote_001",
    "option_id": "A"
  }
}
```

**服务器 → 所有人：投票进度**
```json
{
  "type": "vote:progress",
  "data": {
    "vote_id": "vote_001",
    "votes": { "A": 45, "B": 30, "C": 25 },
    "total": 100,
    "time_left": 10
  },
  "timestamp": 1704067205
}
```

**服务器 → 所有人：投票结果**
```json
{
  "type": "vote:result",
  "data": {
    "vote_id": "vote_001",
    "winner": "A",
    "votes": { "A": 67, "B": 20, "C": 13 },
    "passed": true
  },
  "timestamp": 1704067215
}
```

### 剧情相关事件

**服务器 → 主播：剧情更新**
```json
{
  "type": "plot:update",
  "data": {
    "node_id": "node_003_insert",
    "image_url": "/images/plot_12345.jpg",
    "text": "一个神秘访客出现了...",
    "next": "node_004"
  },
  "timestamp": 1704067220
}
```

**服务器 → 观众：剧情同步**
```json
{
  "type": "plot:sync",
  "data": {
    "current_node": "node_003_insert",
    "description": "主播遇到了神秘访客"
  },
  "timestamp": 1704067220
}
```

### 房间状态事件

**服务器 → 所有人：观众数量更新**
```json
{
  "type": "room:viewer_count",
  "data": {
    "count": 42
  },
  "timestamp": 1704067200
}
```

---

## 📊 数据格式规范

### 剧情模板 JSON

**文件位置**: `backend/data/plots/template_001.json`

```json
{
  "id": "template_001",
  "name": "神秘冒险",
  "description": "一场充满未知的冒险",
  "thumbnail": "/images/template_001.jpg",
  "nodes": [
    {
      "id": "start",
      "type": "normal",
      "image": "/images/start.jpg",
      "text": "你来到了一个神秘的森林...",
      "next": "node_001"
    },
    {
      "id": "node_001",
      "type": "vote_point",
      "image": "/images/node_001.jpg",
      "text": "前方出现了岔路口，观众们正在决定你的命运...",
      "vote_config": {
        "duration": 15,
        "threshold": 0.67,
        "options": [
          {
            "id": "A",
            "label": "神秘访客",
            "template": "npc_encounter"
          },
          {
            "id": "B",
            "label": "突发事件",
            "template": "sudden_event"
          },
          {
            "id": "C",
            "label": "规则变化",
            "template": "rule_change"
          }
        ]
      },
      "next": "node_002"
    },
    {
      "id": "node_002",
      "type": "normal",
      "image": "/images/node_002.jpg",
      "text": "你继续前进...",
      "next": "end"
    },
    {
      "id": "end",
      "type": "end",
      "image": "/images/end.jpg",
      "text": "冒险结束！"
    }
  ]
}
```

### 视频解析结果 JSON

**文件位置**: `backend/data/videos/vid_12345_analysis.json`

```json
{
  "video_id": "vid_12345",
  "room_id": "room_001",
  "status": "completed",
  "analysis": {
    "characters": ["人物", "动物"],
    "action": "追逐",
    "emotion": "搞笑",
    "style": "夸张",
    "keywords": ["跑", "摔倒", "反转"],
    "duration": 15.5
  },
  "raw_response": "豆包 API 原始返回...",
  "created_at": 1704067200,
  "updated_at": 1704067210
}
```

### 插入内容模板 JSON

**文件位置**: `backend/data/plots/insert_templates.json`

```json
{
  "npc_encounter": {
    "type": "npc_encounter",
    "image_prompt": "A {style} scene where a {character} suddenly appears and starts {action}, {emotion} atmosphere",
    "text_template": "突然，{character}出现了，并且开始{action}！"
  },
  "sudden_event": {
    "type": "sudden_event",
    "image_prompt": "A {style} scene showing {action} happening unexpectedly, {emotion} mood",
    "text_template": "意外发生了！{action}突然出现！"
  },
  "rule_change": {
    "type": "rule_change",
    "image_prompt": "A {style} scene with mysterious rules changing, {emotion} atmosphere",
    "text_template": "规则改变了！现在你必须{action}！"
  }
}
```

### 房间状态 JSON

**文件位置**: `backend/data/rooms/room_001.json`

```json
{
  "room_id": "room_001",
  "streamer_name": "主播名称",
  "template_id": "template_001",
  "status": "live",
  "current_node": "node_001",
  "viewers": ["viewer_001", "viewer_002"],
  "votes": {
    "vote_001": {
      "status": "completed",
      "winner": "A",
      "votes": { "A": 67, "B": 20, "C": 13 }
    }
  },
  "created_at": 1704067200,
  "updated_at": 1704067300
}
```

---

## 🚀 快速开始

### 1. 环境准备

**安装依赖：**
```bash
# 后端
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# 观众端
cd frontend-viewer
npm install

# 主播端
cd frontend-streamer
npm install
```

**配置环境变量：**
```bash
# backend/.env
DOUBAO_API_KEY=your_doubao_api_key
DOUBAO_API_URL=https://ark.cn-beijing.volces.com/api/v3

IMAGE_GEN_API_KEY=your_image_gen_api_key
IMAGE_GEN_API_URL=https://api.openai.com/v1/images/generations

AGORA_APP_ID=your_agora_app_id
AGORA_APP_CERTIFICATE=your_agora_app_certificate

BACKEND_HOST=0.0.0.0
BACKEND_PORT=8000
```

### 2. 启动服务

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

### 3. 测试流程

1. 主播端：创建房间，选择剧情模板
2. 主播端：开始推流（摄像头 + 麦克风）
3. 观众端：输入房间 ID，进入直播间
4. 观众端：上传视频，等待解析
5. 主播端：点击"下一步"，触发投票点
6. 观众端：投票选择剧情
7. 系统：生成新剧情，推送给主播
8. 主播端：展示新剧情图片

---

## 🔧 开发规范

### Git 分支管理
```
main              # 主分支（稳定版本）
├── dev           # 开发分支
│   ├── feature/backend-api      # 成员 1
│   ├── feature/websocket        # 成员 2
│   └── feature/streamer-ui      # 成员 3
```

### 提交规范
```
feat: 新功能
fix: 修复 bug
docs: 文档更新
style: 代码格式
refactor: 重构
test: 测试
chore: 构建/工具
```

### 代码规范
- **Python**: PEP 8
- **TypeScript**: ESLint + Prettier
- **命名**: 小驼峰（变量/函数）、大驼峰（类/组件）

---

## ⏱️ 24 小时开发计划

### 第 1-2 小时：环境搭建
- [ ] 注册 Agora 账号，获取 App ID
- [ ] 注册豆包 API，获取 API Key
- [ ] 初始化项目，安装依赖
- [ ] 定义接口规范（三人一起）

### 第 2-8 小时：核心功能开发
- [ ] **成员 1**: 视频上传接口 + 豆包 API 调用（可用 mock）
- [ ] **成员 2**: WebSocket 服务 + 投票逻辑
- [ ] **成员 3**: 主播端推流 + 剧情展示

### 第 8-16 小时：功能完善
- [ ] **成员 1**: 剧情拼接 + 图片生成
- [ ] **成员 2**: 观众端前端 + 拉流集成
- [ ] **成员 3**: 主播端完善 + 剧情切换

### 第 16-20 小时：联调测试
- [ ] 三人联调完整流程
- [ ] 修复 bug
- [ ] 优化 UI

### 第 20-24 小时：部署上线
- [ ] 部署到服务器
- [ ] 测试完整流程
- [ ] 准备演示

---

## 📚 参考资源

### Agora 文档
- [Agora React 快速开始](https://www.agora.io/en/blog/building-a-video-chat-app-using-react-hooks-and-agora/)
- [Agora API Examples](https://github.com/AgoraIO/API-Examples-Web)

### FastAPI 文档
- [FastAPI WebSocket](https://fastapi.tiangolo.com/advanced/websockets/)
- [FastAPI 最佳实践](https://fastapi.tiangolo.com/tutorial/)

### 豆包 API
- [豆包 API 文档](https://docs.apiyi.com/api-capabilities/video-understanding)

---

## ❓ 常见问题

### Q1: Agora 推流失败？
**A**: 检查 App ID 和 Token 是否正确，确保浏览器允许摄像头/麦克风权限。

### Q2: WebSocket 连接失败？
**A**: 检查后端是否启动，防火墙是否开放端口。

### Q3: 视频上传太慢？
**A**: 限制视频大小（< 50MB），或使用视频压缩。

### Q4: 豆包 API 调用失败？
**A**: 检查 API Key 是否正确，是否有免费额度。

---

## 📞 联系方式

- **技术问题**: 在项目 Issues 中提问
- **紧急问题**: 团队内部沟通群

---

**祝开发顺利！24 小时冲刺加油！🚀**
