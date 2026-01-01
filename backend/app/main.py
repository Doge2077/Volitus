from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

app = FastAPI(
    title="Volitus API",
    description="互动直播平台后端 API",
    version="1.0.0"
)

# CORS 配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 生产环境需要限制
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 静态文件服务
os.makedirs("data/images", exist_ok=True)
os.makedirs("data/videos", exist_ok=True)
app.mount("/images", StaticFiles(directory="data/images"), name="images")
app.mount("/videos", StaticFiles(directory="data/videos"), name="videos")

# 导入路由
from app.api import video, plot, room
from app.ws import websocket

app.include_router(video.router, prefix="/api/video", tags=["视频"])
app.include_router(plot.router, prefix="/api/plot", tags=["剧情"])
app.include_router(room.router, prefix="/api/room", tags=["房间"])
app.include_router(websocket.router, prefix="/ws", tags=["WebSocket"])

@app.get("/")
async def root():
    return {
        "message": "Volitus API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
async def health():
    return {"status": "ok"}
