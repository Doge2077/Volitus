from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    # 豆包 API
    doubao_api_key: str = ""
    doubao_api_url: str = "https://ark.cn-beijing.volces.com/api/v3"

    # 图片生成 API
    image_gen_api_key: str = ""
    image_gen_api_url: str = "https://api.openai.com/v1/images/generations"

    # Agora
    agora_app_id: str = ""
    agora_app_certificate: str = ""

    # 服务器
    backend_host: str = "0.0.0.0"
    backend_port: int = 8000

    # 文件路径
    data_dir: str = "./data"
    upload_dir: str = "./data/videos"
    image_dir: str = "./data/images"
    plot_dir: str = "./data/plots"

    # 文件大小限制
    max_video_size: int = 104857600  # 100MB

    class Config:
        env_file = ".env"

@lru_cache()
def get_settings():
    return Settings()
