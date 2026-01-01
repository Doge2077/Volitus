import httpx

from ..config import get_settings

settings = get_settings()

async def analyze_video(video_path: str) -> dict:
    """
    调用豆包 API 分析视频

    Args:
        video_path: 视频文件路径

    Returns:
        分析结果字典
    """

    # TODO: 实现豆包 API 调用
    # 1. 提取视频关键帧
    # 2. 调用豆包视频理解 API
    # 3. 解析返回结果

    # Mock 数据
    return {
        "characters": ["人物"],
        "action": "奔跑",
        "emotion": "搞笑",
        "style": "夸张",
        "keywords": ["跑", "摔倒"]
    }

async def call_doubao_api(prompt: str, images: list = None) -> dict:
    """
    调用豆包 API

    Args:
        prompt: 提示词
        images: 图片列表（base64 或 URL）

    Returns:
        API 响应
    """

    if not settings.doubao_api_key:
        raise ValueError("豆包 API Key 未配置")

    async with httpx.AsyncClient() as client:
        response = await client.post(
            settings.doubao_api_url,
            headers={
                "Authorization": f"Bearer {settings.doubao_api_key}",
                "Content-Type": "application/json"
            },
            json={
                "model": "doubao-vision",  # 根据实际模型名称调整
                "messages": [
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                "images": images or []
            },
            timeout=30.0
        )

        return response.json()
