from pydantic import BaseModel
from typing import Optional, Dict

class VideoUploadResponse(BaseModel):
    video_id: str
    status: str
    message: str

class VideoAnalysis(BaseModel):
    characters: list[str]
    action: str
    emotion: str
    style: str
    keywords: list[str]

class VideoAnalysisResponse(BaseModel):
    video_id: str
    status: str
    result: Optional[VideoAnalysis] = None
    timestamp: Optional[int] = None
