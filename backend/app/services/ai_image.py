import httpx
from app.config import get_settings

settings = get_settings()

async def generate_image(prompt: str) -> str:
    """
    生成图片

    Args:
        prompt: 图片描述

    Returns:
        图片 URL
    """

    # TODO: 实现图片生成 API 调用
    # 可以使用 DALL-E 3 或 Stable Diffusion

    # Mock 返回
    return "/images/mock_generated.jpg"

async def call_dalle_api(prompt: str) -> dict:
    """
    调用 DALL-E API 生成图片

    Args:
        prompt: 图片描述

    Returns:
        API 响应
    """

    if not settings.image_gen_api_key:
        raise ValueError("图片生成 API Key 未配置")

    async with httpx.AsyncClient() as client:
        response = await client.post(
            settings.image_gen_api_url,
            headers={
                "Authorization": f"Bearer {settings.image_gen_api_key}",
                "Content-Type": "application/json"
            },
            json={
                "model": "dall-e-3",
                "prompt": prompt,
                "n": 1,
                "size": "1024x1024"
            },
            timeout=60.0
        )

        return response.json()
