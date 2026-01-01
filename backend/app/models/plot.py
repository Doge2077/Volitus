from pydantic import BaseModel
from typing import Optional, Dict

class PlotTemplate(BaseModel):
    id: str
    name: str
    description: str
    thumbnail: str

class PlotGenerateRequest(BaseModel):
    room_id: str
    video_analysis: Dict
    insert_point: str

class PlotGenerateResponse(BaseModel):
    plot_id: str
    node_id: str
    image_url: str
    text: str
    next: str
