from fastapi import APIRouter, HTTPException
from app.models.room import RoomCreateRequest, RoomCreateResponse, RoomInfoResponse, RoomListResponse, RoomListItem, AgoraConfigResponse
from app.config import get_settings
import os
import json
import uuid
from datetime import datetime
from typing import List
from agora_token_builder import RtcTokenBuilder
import time

router = APIRouter()
settings = get_settings()

def generate_agora_token(channel_name: str, uid: int = 0, role: int = 1):
    """生成Agora RTC Token
    role: 1=publisher(主播), 2=subscriber(观众)
    """
    app_id = settings.agora_app_id
    app_certificate = settings.agora_app_certificate

    if not app_certificate:
        return ""

    expiration_time_in_seconds = 3600 * 24  # 24小时
    current_timestamp = int(time.time())
    privilege_expired_ts = current_timestamp + expiration_time_in_seconds

    token = RtcTokenBuilder.buildTokenWithUid(
        app_id, app_certificate, channel_name, uid, role, privilege_expired_ts
    )
    return token

@router.post("/create", response_model=RoomCreateResponse)
async def create_room(request: RoomCreateRequest):
    """创建直播间"""

    room_id = f"room_{uuid.uuid4().hex[:8]}"

    # 读取剧情模板
    template_file = f"data/plots/{request.template_id}.json"
    if not os.path.exists(template_file):
        raise HTTPException(status_code=404, detail="剧情模板不存在")

    with open(template_file, "r", encoding="utf-8") as f:
        template = json.load(f)

    # 创建房间数据
    room_data = {
        "room_id": room_id,
        "streamer_name": request.streamer_name,
        "template_id": request.template_id,
        "status": "live",
        "current_node": "start",
        "viewers": [],
        "votes": {},
        "created_at": int(datetime.now().timestamp())
    }

    os.makedirs("data/rooms", exist_ok=True)
    with open(f"data/rooms/{room_id}.json", "w", encoding="utf-8") as f:
        json.dump(room_data, f, ensure_ascii=False, indent=2)

    # TODO: 生成 Agora Token
    agora_token = generate_agora_token(room_id, uid=0, role=1)  # role=1 主播

    # 获取起始剧情
    start_node = next(node for node in template["nodes"] if node["id"] == "start")

    return RoomCreateResponse(
        room_id=room_id,
        agora_app_id=settings.agora_app_id,
        agora_token=agora_token,
        agora_channel=room_id,
        plot={
            "current_node": "start",
            "image_url": start_node["image"]
        }
    )

@router.get("/list", response_model=RoomListResponse)
async def get_room_list():
    """获取所有直播中的房间列表"""

    rooms_dir = "data/rooms"
    if not os.path.exists(rooms_dir):
        return RoomListResponse(rooms=[])

    room_list = []
    for filename in os.listdir(rooms_dir):
        if filename.endswith(".json"):
            room_file = os.path.join(rooms_dir, filename)
            try:
                with open(room_file, "r", encoding="utf-8") as f:
                    room_data = json.load(f)

                # 只返回正在直播的房间
                if room_data.get("status") == "live":
                    room_list.append(RoomListItem(
                        room_id=room_data["room_id"],
                        streamer_name=room_data["streamer_name"],
                        viewer_count=len(room_data.get("viewers", [])),
                        status=room_data["status"],
                        template_id=room_data.get("template_id", ""),
                        created_at=room_data.get("created_at", 0)
                    ))
            except Exception as e:
                print(f"Error reading room file {filename}: {e}")
                continue

    # 按创建时间倒序排序
    room_list.sort(key=lambda x: x.created_at, reverse=True)

    return RoomListResponse(rooms=room_list)

@router.get("/{room_id}", response_model=RoomInfoResponse)
async def get_room_info(room_id: str):
    """获取房间信息"""

    room_file = f"data/rooms/{room_id}.json"
    if not os.path.exists(room_file):
        raise HTTPException(status_code=404, detail="房间不存在")

    with open(room_file, "r", encoding="utf-8") as f:
        room_data = json.load(f)

    return RoomInfoResponse(
        room_id=room_data["room_id"],
        status=room_data["status"],
        streamer_name=room_data["streamer_name"],
        viewer_count=len(room_data["viewers"]),
        current_plot_node=room_data["current_node"]
    )

@router.post("/{room_id}/next")
async def room_next(room_id: str, current_node: str):
    """主播点击下一步"""

    # TODO: 实现剧情推进逻辑
    # 1. 读取当前剧情节点
    # 2. 判断是否是投票点
    # 3. 如果是投票点,触发投票
    # 4. 如果不是，直接进入下一个节点

    return {
        "next_node": "node_002",
        "type": "normal"
    }

@router.get("/{room_id}/agora", response_model=AgoraConfigResponse)
async def get_agora_config(room_id: str):
    """获取房间的 Agora 配置"""

    room_file = f"data/rooms/{room_id}.json"
    if not os.path.exists(room_file):
        raise HTTPException(status_code=404, detail="房间不存在")

    # TODO: 生成观众端的 Agora Token
    # 目前返回空 token，如果 Agora 项目设置为测试模式则可以不需要 token
    agora_token = generate_agora_token(room_id, uid=0, role=2)  # role=2 观众

    return AgoraConfigResponse(
        agora_app_id=settings.agora_app_id,
        agora_token=agora_token,
        agora_channel=room_id
    )
