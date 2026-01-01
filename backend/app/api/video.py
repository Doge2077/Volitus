import json
import os
import uuid
from datetime import datetime

from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks

from ..models.video import VideoUploadResponse, VideoAnalysisResponse
from ..services.dify_service import DifyService
from ..config import get_settings

router = APIRouter()
settings = get_settings()
dify_service = DifyService(settings.dify_api_key)


async def process_video_task(video_id: str, file_path: str, room_id: str):
    """后台任务：调用 Dify 处理视频"""
    analysis_file = f"data/videos/{video_id}_analysis.json"

    try:
        result = await dify_service.process_video(file_path, room_id)

        analysis_data = {
            "video_id": video_id,
            "room_id": room_id,
            "status": "completed",
            "result": result.get("data", {}),
            "created_at": int(datetime.now().timestamp())
        }
    except Exception as e:
        import traceback
        error_detail = f"{type(e).__name__}: {str(e)}\n{traceback.format_exc()}"
        print(f"Dify处理失败: {error_detail}")
        analysis_data = {
            "video_id": video_id,
            "room_id": room_id,
            "status": "failed",
            "error": error_detail,
            "created_at": int(datetime.now().timestamp())
        }

    with open(analysis_file, "w", encoding="utf-8") as f:
        json.dump(analysis_data, f, ensure_ascii=False, indent=2)


@router.post("/upload", response_model=VideoUploadResponse)
async def upload_video(
        background_tasks: BackgroundTasks,
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

    # 创建初始分析记录
    analysis_file = f"data/videos/{video_id}_analysis.json"
    analysis_data = {
        "video_id": video_id,
        "room_id": room_id,
        "status": "processing",
        "created_at": int(datetime.now().timestamp())
    }

    with open(analysis_file, "w", encoding="utf-8") as f:
        json.dump(analysis_data, f, ensure_ascii=False, indent=2)

    # 启动后台任务调用 Dify
    background_tasks.add_task(process_video_task, video_id, file_path, room_id)

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
