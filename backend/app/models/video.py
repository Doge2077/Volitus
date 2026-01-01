from pydantic import BaseModel
from typing import Optional, Dict, List

class VideoUploadResponse(BaseModel):
    video_id: str
    status: str
    message: str

class VideoAnalysis(BaseModel):
    characters: List[str]
    action: str
    emotion: str
    style: str
    keywords: List[str]

class VideoAnalysisResponse(BaseModel):
    video_id: str
    status: str
    result: Optional[VideoAnalysis] = None
    timestamp: Optional[int] = None
