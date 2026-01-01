from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Dict, List
import json
from datetime import datetime

router = APIRouter()

# 连接管理器
class ConnectionManager:
    def __init__(self):
        # room_id -> {role -> [websockets]}
        self.active_connections: Dict[str, Dict[str, List[WebSocket]]] = {}

    async def connect(self, websocket: WebSocket, room_id: str, role: str):
        await websocket.accept()
        if room_id not in self.active_connections:
            self.active_connections[room_id] = {"viewer": [], "streamer": []}
        self.active_connections[room_id][role].append(websocket)

    def disconnect(self, websocket: WebSocket, room_id: str, role: str):
        if room_id in self.active_connections:
            self.active_connections[room_id][role].remove(websocket)

    async def send_to_room(self, room_id: str, message: dict, role: str = None):
        """发送消息到房间（可指定角色）"""
        if room_id not in self.active_connections:
            return

        message["timestamp"] = int(datetime.now().timestamp())
        text = json.dumps(message, ensure_ascii=False)

        if role:
            # 只发送给指定角色
            for connection in self.active_connections[room_id].get(role, []):
                await connection.send_text(text)
        else:
            # 发送给所有人
            for role_connections in self.active_connections[room_id].values():
                for connection in role_connections:
                    await connection.send_text(text)

manager = ConnectionManager()

@router.websocket("")
async def websocket_endpoint(websocket: WebSocket, room_id: str, role: str):
    """WebSocket 连接入口"""

    await manager.connect(websocket, room_id, role)

    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)

            # 处理不同类型的消息
            if message["type"] == "vote:cast":
                # 处理投票
                await handle_vote(room_id, message["data"])

            elif message["type"] == "chat:message":
                # 处理聊天消息
                await handle_chat_message(room_id, message["data"], role)

            elif message["type"] == "ping":
                # 心跳
                await websocket.send_text(json.dumps({"type": "pong"}))

    except WebSocketDisconnect:
        manager.disconnect(websocket, room_id, role)
        # 通知房间观众数量变化
        if role == "viewer":
            viewer_count = len(manager.active_connections.get(room_id, {}).get("viewer", []))
            await manager.send_to_room(room_id, {
                "type": "room:viewer_count",
                "data": {"count": viewer_count}
            })

async def handle_vote(room_id: str, vote_data: dict):
    """处理投票"""
    # TODO: 实现投票逻辑
    # 1. 记录投票
    # 2. 计算票数
    # 3. 判断是否达到 2/3
    # 4. 广播投票进度
    pass

async def handle_chat_message(room_id: str, chat_data: dict, sender_role: str):
    """处理聊天消息"""
    # 广播聊天消息到房间所有人
    await manager.send_to_room(room_id, {
        "type": "chat:message",
        "data": {
            "id": chat_data.get("id"),
            "type": chat_data.get("type", "text"),
            "content": chat_data.get("content"),
            "sender": chat_data.get("sender"),
            "sender_role": sender_role,
            "timestamp": int(datetime.now().timestamp() * 1000),
            "videoUrl": chat_data.get("videoUrl")
        }
    })

