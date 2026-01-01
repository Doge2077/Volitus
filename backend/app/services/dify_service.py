import httpx
import os
from typing import Dict, Any

class DifyService:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://api.dify.ai/v1"

    async def process_video(self, video_path: str, room_id: str = None) -> Dict[str, Any]:
        """调用 Dify 工作流处理视频"""
        # 强制禁用代理
        os.environ.pop('HTTP_PROXY', None)
        os.environ.pop('HTTPS_PROXY', None)
        os.environ.pop('http_proxy', None)
        os.environ.pop('https_proxy', None)

        async with httpx.AsyncClient(
            verify=False,
            trust_env=False,
            timeout=300.0,
            proxies={}
        ) as client:
            # 第一步：上传文件
            with open(video_path, 'rb') as f:
                upload_response = await client.post(
                    f"{self.base_url}/files/upload",
                    headers={"Authorization": f"Bearer {self.api_key}"},
                    files={'file': (video_path.split('/')[-1], f, 'video/mp4')},
                    data={'user': "user-" + (room_id or "default")}
                )

            if upload_response.status_code not in [200, 201]:
                print(f"文件上传失败 ({upload_response.status_code}): {upload_response.text}")
                raise Exception(f"文件上传失败: {upload_response.text}")

            file_data = upload_response.json()

            # 第二步：调用工作流
            response = await client.post(
                f"{self.base_url}/workflows/run",
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "inputs": {
                        "text": f"视频文件: {video_path}",
                        "multifiles": [file_data]
                    },
                    "response_mode": "blocking",
                    "user": "user-" + (room_id or "default")
                }
            )
            if response.status_code != 200:
                error_text = response.text
                print(f"Dify API错误 ({response.status_code}): {error_text}")
                raise Exception(f"Dify API返回错误: {error_text}")
            return response.json()
