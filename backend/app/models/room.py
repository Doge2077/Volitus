from pydantic import BaseModel
from typing import Optional, Dict

class RoomCreateRequest(BaseModel):
    streamer_name: str
    template_id: str

class RoomCreateResponse(BaseModel):
    room_id: str
    agora_app_id: str
    agora_token: str
    agora_channel: str
    plot: Dict

class RoomInfoResponse(BaseModel):
    room_id: str
    status: str
    streamer_name: str
    viewer_count: int
    current_plot_node: str
