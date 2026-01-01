# Volitus 主播端

Volitus 互动直播平台的主播端应用，基于 React + TypeScript + Agora RTC 构建。

## 功能特性

### ✅ 已实现功能

1. **房间创建和配置**
   - 主播名称设置
   - 剧情模板选择
   - 房间信息管理

2. **音视频推流**
   - Agora RTC 集成
   - 摄像头预览
   - 麦克风/摄像头控制
   - 实时推流状态显示

3. **剧情展示系统**
   - PPT式剧情图片展示
   - 平滑切换动画
   - 剧情文本显示
   - 下一步控制

4. **实时投票管理**
   - 投票进度实时显示
   - 投票结果展示
   - 进度条可视化

5. **观众统计**
   - 实时在线观众数
   - WebSocket连接状态
   - 推流状态监控
   - 观众趋势图表

6. **WebSocket实时通信**
   - 投票事件监听
   - 剧情更新推送
   - 观众数量同步
   - 自动重连机制

7. **游戏风格UI**
   - 暗色主题设计
   - 渐变色按钮和边框
   - 圆角卡片布局
   - 流畅动画效果

## 技术栈

- **框架**: React 18 + TypeScript
- **构建工具**: Vite
- **状态管理**: Zustand
- **直播SDK**: Agora RTC SDK 4.x
- **HTTP客户端**: Axios
- **WebSocket**: 原生 WebSocket API

## 项目结构

```
frontend-streamer/
├── src/
│   ├── components/          # React组件
│   │   ├── SetupScreen.tsx      # 房间创建界面
│   │   ├── StreamPublisher.tsx  # 推流组件
│   │   ├── PlotDisplay.tsx      # 剧情展示
│   │   ├── VotePanel.tsx        # 投票面板
│   │   └── StatsPanel.tsx       # 统计面板
│   ├── services/            # 服务层
│   │   ├── api.ts              # REST API封装
│   │   ├── websocket.ts        # WebSocket封装
│   │   └── agora.ts            # Agora SDK封装
│   ├── hooks/               # 自定义Hooks
│   │   ├── useWebSocket.ts
│   │   └── useAgora.ts
│   ├── store/               # 状态管理
│   │   └── index.ts            # Zustand store
│   ├── App.tsx              # 主应用
│   └── main.tsx             # 入口文件
├── package.json
├── tsconfig.json
├── vite.config.ts
└── .env.example
```

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并配置：

```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_WS_URL=ws://localhost:8000/ws
```

### 3. 启动开发服务器

```bash
npm run dev
```

应用将在 http://localhost:5174 启动

### 4. 构建生产版本

```bash
npm run build
```

## 核心功能说明

### 房间创建流程

1. 主播输入名称
2. 选择剧情模板
3. 点击"开始直播"
4. 后端创建房间并返回Agora配置
5. 自动初始化推流

### 推流控制

- **摄像头控制**: 点击摄像头按钮开关
- **麦克风控制**: 点击麦克风按钮开关
- **状态监控**: 实时显示推流状态

### 剧情管理

- **查看当前剧情**: 显示剧情图片和文本
- **切换剧情**: 点击"下一步"按钮
- **投票点处理**: 自动触发投票，等待结果

### 投票系统

- **实时进度**: 显示各选项投票数和百分比
- **倒计时**: 显示剩余投票时间
- **结果展示**: 投票结束后显示获胜选项

## API接口

### REST API

- `POST /api/room/create` - 创建房间
- `GET /api/room/:id` - 获取房间信息
- `POST /api/room/:id/next` - 进入下一步
- `GET /api/plot/templates` - 获取剧情模板列表

### WebSocket事件

**接收事件:**
- `vote:trigger` - 触发投票
- `vote:progress` - 投票进度更新
- `vote:result` - 投票结果
- `plot:update` - 剧情更新
- `room:viewer_count` - 观众数量更新

## 设计特色

### 游戏风格UI

- **配色方案**: 深紫色背景 + 粉紫渐变
- **卡片设计**: 半透明毛玻璃效果
- **按钮样式**: 渐变色 + 悬停动画
- **图标**: Material Design风格

### 动画效果

- **淡入动画**: 组件加载时
- **滑入动画**: 剧情切换时
- **进度条动画**: 投票进度更新
- **悬停效果**: 按钮和卡片交互

## 浏览器兼容性

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 注意事项

1. **摄像头权限**: 首次使用需授予浏览器摄像头和麦克风权限
2. **HTTPS要求**: 生产环境必须使用HTTPS（Agora要求）
3. **网络要求**: 建议上行带宽 > 2Mbps
4. **WebSocket连接**: 确保后端WebSocket服务正常运行

## 开发建议

### 添加新组件

1. 在 `src/components/` 创建组件文件
2. 创建对应的CSS文件
3. 在需要的地方导入使用

### 添加新API

1. 在 `src/services/api.ts` 添加接口定义
2. 在组件中通过 `import { api } from '../services/api'` 使用

### 添加新状态

1. 在 `src/store/index.ts` 添加状态和操作
2. 在组件中通过 `useStreamStore()` 访问

## 故障排查

### 推流失败

- 检查Agora App ID和Token是否正确
- 确认浏览器已授予摄像头/麦克风权限
- 查看浏览器控制台错误信息

### WebSocket连接失败

- 确认后端服务已启动
- 检查WebSocket URL配置
- 查看网络防火墙设置

### 剧情不更新

- 检查WebSocket连接状态
- 确认后端正确推送剧情更新事件
- 查看浏览器控制台日志

## 参考资源

- [Agora React SDK文档](https://docs.agora.io/en/video-calling/get-started/get-started-sdk)
- [Zustand文档](https://docs.pmnd.rs/zustand/getting-started/introduction)
- [Vite文档](https://vitejs.dev/)

## 许可证

MIT License
