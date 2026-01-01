from fastapi import APIRouter, HTTPException
import os
import json

from ..models.plot import PlotGenerateResponse, PlotGenerateRequest

router = APIRouter()

@router.get("/templates")
async def get_plot_templates():
    """获取所有剧情模板"""

    templates = []
    plot_dir = "data/plots"

    if not os.path.exists(plot_dir):
        return {"templates": []}

    for filename in os.listdir(plot_dir):
        if filename.endswith(".json") and filename.startswith("template_"):
            with open(os.path.join(plot_dir, filename), "r", encoding="utf-8") as f:
                template = json.load(f)
                templates.append({
                    "id": template["id"],
                    "name": template["name"],
                    "description": template["description"],
                    "thumbnail": template.get("thumbnail", "")
                })

    return {"templates": templates}

@router.get("/{template_id}")
async def get_plot_template(template_id: str):
    """获取剧情模板详情"""

    file_path = f"data/plots/{template_id}.json"

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="剧情模板不存在")

    with open(file_path, "r", encoding="utf-8") as f:
        template = json.load(f)

    return template

@router.post("/generate", response_model=PlotGenerateResponse)
async def generate_plot(request: PlotGenerateRequest):
    """生成新剧情（基于视频分析结果）"""

    # TODO: 实现剧情生成逻辑
    # 1. 读取插入点模板
    # 2. 替换变量（从 video_analysis 中）
    # 3. 调用图片生成 API
    # 4. 返回新剧情节点

    return PlotGenerateResponse(
        plot_id="plot_mock",
        node_id=f"{request.insert_point}_insert",
        image_url="/images/mock.jpg",
        text="这是一个 mock 剧情",
        next="next_node"
    )
