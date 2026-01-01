from fastapi import APIRouter, UploadFile, File, HTTPException
from app.models.video import VideoUploadResponse, VideoAnalysisResponse
from app.services.ai_doubao import analyze_video
import os
import uuid
import json
from datetime import datetime

router = APIRouter()

@router.post("/upload", response_model=VideoUploadResponse)
async def upload_video(
    video: UploadFile = File(...),
    room_id: str = None
):
    """上传视频并开始解析"""

    # 生成视频 ID
    video_id = f"vid_{uuid.uuid4().hex[:12]}"

    # 保存视频文件
    os.makedirs("data/videos", exist_ok=True)
    file_path = f"data/videos/{video_id}.mp4"

    with open(file_path, "wb") as f:
        content = await video.read()
        f.write(content)

    # 创建分析任务（异步）
    analysis_file = f"data/videos/{video_id}_analysis.json"
    analysis_data = {
        "video_id": video_id,
        "room_id": room_id,
        "status": "processing",
        "created_at": int(datetime.now().timestamp())
    }

    with open(analysis_file, "w", encoding="utf-8") as f:
        json.dump(analysis_data, f, ensure_ascii=False, indent=2)

    # TODO: 异步调用豆包 API 分析视频
    # 这里先返回 processing 状态，实际应该启动后台任务

    return VideoUploadResponse(
        video_id=video_id,
        status="processing",
        message="视频上传成功，正在解析中"
    )

@router.get("/analyze/{video_id}", response_model=VideoAnalysisResponse)
async def get_video_analysis(video_id: str):
    """获取视频解析结果"""

    analysis_file = f"data/videos/{video_id}_analysis.json"

    if not os.path.exists(analysis_file):
        raise HTTPException(status_code=404, detail="视频不存在")

    with open(analysis_file, "r", encoding="utf-8") as f:
        data = json.load(f)

    return VideoAnalysisResponse(**data)
