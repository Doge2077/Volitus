# 剧本互动游戏功能 - 集成指南

## 功能概述

这个剧本互动游戏功能实现了一个完整的互动式剧本播放系统,支持:

1. **剧本游戏播放** - 点击推进的对话式剧本游戏
2. **实时同步** - 主播端和观众端同步显示游戏状态
3. **用户互动收集** - 收集观众的视频和文字互动
4. **投票系统** - 每5个互动触发一次章节投票
5. **动态章节插入** - 根据投票结果动态插入新章节

## 文件结构

### 后端文件

```
backend/
├── app/
│   ├── models/
│   │   └── drama.py              # 剧本游戏数据模型
│   ├── api/
│   │   └── drama.py              # 剧本游戏API路由
│   └── ws/
│       └── websocket.py          # WebSocket增强(投票功能)
```

### 前端文件

#### 主播端 (frontend-streamer)
```
frontend-streamer/src/
├── components/
│   ├── DramaGame.tsx             # 剧本游戏组件
│   └── DramaGame.css             # 样式文件
└── services/
    └── dramaAPI.ts               # API服务封装
```

#### 观众端 (frontend-viewer)
```
frontend-viewer/src/
├── components/
│   ├── DramaGame.tsx             # 剧本游戏观众端组件
│   ├── DramaGame.css             # 样式文件
│   ├── ChapterVote.tsx           # 章节投票组件
│   ├── ChapterVote.css           # 投票样式
│   ├── ChatWindow.tsx            # 增强的聊天窗口(收集互动)
│   └── VideoUpload.tsx           # 增强的视频上传(收集互动)
└── services/
    └── dramaAPI.ts               # API服务封装
```

## API 接口

### 1. 加载剧本
```http
POST /api/drama/load
Content-Type: application/json

{
  "room_id": "room_001",
  "story_path": "drama/story.json"
}
```

### 2. 开始游戏
```http
POST /api/drama/start?room_id=room_001
```

### 3. 推进剧情
```http
POST /api/drama/next
Content-Type: application/json

{
  "room_id": "room_001"
}
```

### 4. 获取游戏状态
```http
GET /api/drama/state/{room_id}
```

### 5. 添加用户互动
```http
POST /api/drama/interaction/add?room_id=room_001
Content-Type: application/json

{
  "user_id": "user_123",
  "type": "text",  // "text" | "video"
  "content": "互动内容",
  "timestamp": 1234567890
}
```

### 6. 触发章节投票
```http
POST /api/drama/vote/trigger
Content-Type: application/json

{
  "room_id": "room_001",
  "interactions": [...]
}
```

### 7. 插入章节
```http
POST /api/drama/chapter/insert
Content-Type: application/json

{
  "room_id": "room_001",
  "chapter": {...},
  "insert_after_id": 3
}
```

## WebSocket 事件

### 剧本相关事件

#### 游戏开始
```json
{
  "type": "drama:start",
  "data": {
    "chapter_id": 1,
    "background": {...},
    "roles": [...]
  }
}
```

#### 剧情推进
```json
{
  "type": "drama:progress",
  "data": {
    "chapter_id": 1,
    "dialogue_index": 0,
    "role": {...},
    "dialogue": {...},
    "background": {...},
    "is_chapter_end": false,
    "is_story_end": false
  }
}
```

#### 新章节
```json
{
  "type": "drama:new_chapter",
  "data": {
    "chapter_id": 2,
    "background": {...},
    "roles": [...]
  }
}
```

#### 剧本结束
```json
{
  "type": "drama:end",
  "data": {
    "message": "剧本已完结"
  }
}
```

### 投票相关事件

#### 触发投票
```json
{
  "type": "vote:trigger",
  "data": {
    "vote_id": "vote_123",
    "options": [
      {
        "id": "A",
        "label": "选项描述",
        "preview": {...}
      }
    ],
    "duration": 15
  }
}
```

#### 投票进度
```json
{
  "type": "vote:progress",
  "data": {
    "vote_id": "vote_123",
    "votes": {"A": 10, "B": 5, "C": 3},
    "total": 20,
    "voted_count": 18
  }
}
```

#### 投票结果
```json
{
  "type": "vote:result",
  "data": {
    "vote_id": "vote_123",
    "winner": "A",
    "votes": {"A": 12, "B": 5, "C": 3},
    "passed": true
  }
}
```

## 使用方法

### 主播端集成

1. **在主播端App中引入DramaGame组件**

```tsx
import DramaGame from './components/DramaGame';
import { useWebSocket } from './hooks/useWebSocket';

function StreamerApp() {
  const roomId = "room_001";
  const ws = useWebSocket(roomId, 'streamer');

  return (
    <div>
      {/* 其他组件... */}
      <DramaGame
        roomId={roomId}
        storyPath="drama/story.json"
        ws={ws}
      />
    </div>
  );
}
```

2. **流程说明**
   - 加载剧本后显示开始按钮
   - 点击开始游戏,加载第一章节
   - 点击画面推进对话
   - 每5个用户互动自动触发投票
   - 投票完成后继续播放

### 观众端集成

1. **在观众端RoomPage中引入组件**

```tsx
import DramaGameViewer from '../components/DramaGame';
import ChapterVote from '../components/ChapterVote';
import { wsService } from '../services/websocket';

function RoomPage() {
  const roomId = "room_001";
  const ws = wsService.getConnection();

  return (
    <div>
      <DramaGameViewer roomId={roomId} ws={ws} />
      <ChapterVote roomId={roomId} ws={ws} />
      {/* 聊天和视频上传组件已自动收集互动 */}
    </div>
  );
}
```

2. **流程说明**
   - 通过WebSocket同步主播端的游戏状态
   - 观众上传视频或发送聊天自动记录互动
   - 达到5个互动时弹出投票界面
   - 投票结果同步到主播端

## 剧本JSON格式

参考 `drama/story.json` 的结构:

```json
{
  "meta": {
    "title": "剧本标题",
    "version": "1.0.0",
    "author": "作者",
    "description": "描述"
  },
  "chapters": [
    {
      "id": 1,
      "background": {
        "id": "bg_id",
        "image": "assets/backgrounds/bg.png"
      },
      "roles": [
        {
          "id": "role_id",
          "name": "角色名",
          "avatar": "assets/roles/avatar.png",
          "dialogues": [
            {
              "time": 0,
              "text": "对话内容"
            }
          ]
        }
      ]
    }
  ]
}
```

## 核心功能流程

### 1. 游戏播放流程
```
主播选择剧本 -> 加载剧本 -> 开始游戏 -> 显示第一章 ->
点击推进对话 -> 检查是否需要投票 -> 继续推进或触发投票
```

### 2. 互动收集流程
```
观众发送文字/上传视频 -> 前端调用互动API -> 后端记录互动 ->
累计5个互动 -> 返回should_trigger_vote=true
```

### 3. 投票流程
```
触发投票 -> 后端生成3个章节选项 -> WebSocket广播投票 ->
观众投票 -> 实时更新进度 -> 80%观众投票后结束 ->
广播获胜选项 -> 插入获胜章节 -> 清空互动记录
```

### 4. 章节插入流程
```
投票获胜 -> 获取获胜章节数据 -> 调用插入API ->
后端插入到当前章节后 -> 更新story.json ->
主播继续游戏时会播放新章节
```

## 注意事项

1. **资源路径**: 确保 `assets/` 目录下有对应的背景和角色图片
2. **WebSocket连接**: 主播和观众都需要建立WebSocket连接
3. **投票阈值**: 当前设置为80%观众投票后结束,可在 `websocket.py` 中调整
4. **互动触发数**: 当前设置为每5个互动触发投票,可在 `drama.py` 中调整
5. **AI生成**: 当前投票选项为Mock数据,需要集成实际的AI API

## 下一步优化

1. **集成AI API** - 实现真实的章节生成
2. **增加音效** - 添加背景音乐和音效
3. **角色动画** - 添加角色进入/离开动画
4. **对话打字效果** - 实现文字逐字显示
5. **存档功能** - 支持保存游戏进度
6. **多语言支持** - 支持多语言剧本

## 测试建议

1. 启动后端: `cd backend && uvicorn app.main:app --reload`
2. 启动主播端: `cd frontend-streamer && npm run dev`
3. 启动观众端: `cd frontend-viewer && npm run dev`
4. 创建房间并选择剧本
5. 在观众端发送5条消息触发投票
6. 验证投票和章节插入功能

## 疑难解答

### Q: 游戏无法加载?
A: 检查 `drama/story.json` 路径是否正确,以及JSON格式是否合法

### Q: 投票不触发?
A: 确认已发送至少5条互动消息,检查后端日志

### Q: 观众端看不到游戏?
A: 检查WebSocket是否连接成功,查看浏览器控制台

### Q: 章节不插入?
A: 检查后端API调用是否成功,验证story.json写入权限
