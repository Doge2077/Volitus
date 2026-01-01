from fastapi import APIRouter, HTTPException
from app.models.room import RoomCreateRequest, RoomCreateResponse, RoomInfoResponse
import os
import json
import uuid
from datetime import datetime

router = APIRouter()

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
    agora_token = "mock_token"

    # 获取起始剧情
    start_node = next(node for node in template["nodes"] if node["id"] == "start")

    return RoomCreateResponse(
        room_id=room_id,
        agora_app_id="your_agora_app_id",  # 从配置读取
        agora_token=agora_token,
        agora_channel=room_id,
        plot={
            "current_node": "start",
            "image_url": start_node["image"]
        }
    )

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
    # 3. 如果是投票点，触发投票
    # 4. 如果不是，直接进入下一个节点

    return {
        "next_node": "node_002",
        "type": "normal"
    }
