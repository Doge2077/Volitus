from fastapi import APIRouter, HTTPException
from app.models.drama import (
    DramaLoadRequest, DramaLoadResponse,
    DramaProgressRequest, DramaProgressResponse,
    DramaState, DramaStory, Chapter,
    ChapterVoteRequest, ChapterVoteResponse,
    ChapterInsertRequest, ChapterInsertResponse,
    UserInteraction, ChapterVoteOption
)
from app.ws.websocket import manager
import os
import json
import uuid
from typing import Dict

router = APIRouter()

# 存储每个房间的剧本状态
drama_states: Dict[str, DramaState] = {}
# 存储每个房间的完整剧本
drama_stories: Dict[str, DramaStory] = {}
# 存储用户互动数据
user_interactions: Dict[str, list] = {}  # room_id -> [UserInteraction]

@router.post("/load", response_model=DramaLoadResponse)
async def load_drama(request: DramaLoadRequest):
    """加载剧本"""

    # 读取剧本文件
    if not os.path.exists(request.story_path):
        raise HTTPException(status_code=404, detail="剧本文件不存在")

    try:
        with open(request.story_path, "r", encoding="utf-8") as f:
            story_data = json.load(f)

        # 解析剧本
        story = DramaStory(**story_data)

        # 保存到内存
        drama_stories[request.room_id] = story

        # 初始化状态
        first_chapter = story.chapters[0]
        drama_states[request.room_id] = DramaState(
            room_id=request.room_id,
            current_chapter_id=first_chapter.id,
            current_dialogue_index=0,
            current_role_index=0,
            total_dialogues=sum(len(role.dialogues) for role in first_chapter.roles),
            is_playing=False,
            story_path=request.story_path
        )

        # 初始化互动数据收集
        user_interactions[request.room_id] = []

        return DramaLoadResponse(
            success=True,
            message="剧本加载成功",
            meta=story.meta,
            first_chapter=first_chapter
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"加载剧本失败: {str(e)}")

@router.post("/start")
async def start_drama(room_id: str):
    """开始游戏"""

    if room_id not in drama_states:
        raise HTTPException(status_code=404, detail="请先加载剧本")

    state = drama_states[room_id]
    state.is_playing = True

    # 获取第一个章节的第一句对话
    story = drama_stories[room_id]
    first_chapter = next(c for c in story.chapters if c.id == state.current_chapter_id)

    # 通过WebSocket同步到所有客户端
    await manager.send_to_room(room_id, {
        "type": "drama:start",
        "data": {
            "chapter_id": first_chapter.id,
            "background": first_chapter.background.dict(),
            "roles": [role.dict() for role in first_chapter.roles]
        }
    })

    return {"success": True, "message": "游戏已开始"}

@router.post("/next", response_model=DramaProgressResponse)
async def next_drama_step(request: DramaProgressRequest):
    """推进下一步剧情"""

    if request.room_id not in drama_states:
        raise HTTPException(status_code=404, detail="剧本未加载")

    state = drama_states[request.room_id]
    story = drama_stories[request.room_id]

    # 获取当前章节
    current_chapter = next(c for c in story.chapters if c.id == state.current_chapter_id)

    # 收集当前章节所有对话
    all_dialogues = []
    for role in current_chapter.roles:
        for dialogue in role.dialogues:
            all_dialogues.append({
                "role": role,
                "dialogue": dialogue,
                "time": dialogue.time
            })

    # 按时间排序
    all_dialogues.sort(key=lambda x: x["time"])

    # 当前对话索引
    current_index = state.current_dialogue_index

    # 是否需要触发投票（每5个互动触发一次）
    should_trigger_vote = False
    if request.room_id in user_interactions:
        interaction_count = len(user_interactions[request.room_id])
        should_trigger_vote = interaction_count >= 5 and interaction_count % 5 == 0

    # 如果已经到达当前章节末尾
    if current_index >= len(all_dialogues):
        # 检查是否还有下一章
        current_chapter_index = next(i for i, c in enumerate(story.chapters) if c.id == state.current_chapter_id)

        if current_chapter_index >= len(story.chapters) - 1:
            # 剧本结束
            state.is_playing = False

            # 通知客户端剧本结束
            await manager.send_to_room(request.room_id, {
                "type": "drama:end",
                "data": {"message": "剧本已完结"}
            })

            return DramaProgressResponse(
                chapter_id=state.current_chapter_id,
                dialogue_index=current_index,
                role_index=0,
                role=None,
                dialogue=None,
                background=current_chapter.background,
                is_chapter_end=True,
                is_story_end=True,
                should_trigger_vote=False
            )
        else:
            # 进入下一章
            next_chapter = story.chapters[current_chapter_index + 1]
            state.current_chapter_id = next_chapter.id
            state.current_dialogue_index = 0
            state.total_dialogues = sum(len(role.dialogues) for role in next_chapter.roles)

            # 重新收集下一章的对话
            all_dialogues = []
            for role in next_chapter.roles:
                for dialogue in role.dialogues:
                    all_dialogues.append({
                        "role": role,
                        "dialogue": dialogue,
                        "time": dialogue.time
                    })
            all_dialogues.sort(key=lambda x: x["time"])
            current_index = 0

            # 通知客户端新章节
            await manager.send_to_room(request.room_id, {
                "type": "drama:new_chapter",
                "data": {
                    "chapter_id": next_chapter.id,
                    "background": next_chapter.background.dict(),
                    "roles": [role.dict() for role in next_chapter.roles]
                }
            })

    # 获取当前对话
    current_dialogue_data = all_dialogues[current_index]
    current_role = current_dialogue_data["role"]
    current_dialogue = current_dialogue_data["dialogue"]

    # 更新状态
    state.current_dialogue_index = current_index + 1

    # 构建响应
    response = DramaProgressResponse(
        chapter_id=state.current_chapter_id,
        dialogue_index=current_index,
        role_index=0,  # 这里简化处理
        role=current_role,
        dialogue=current_dialogue,
        background=current_chapter.background,
        is_chapter_end=current_index >= len(all_dialogues) - 1,
        is_story_end=False,
        should_trigger_vote=should_trigger_vote
    )

    # 通过WebSocket同步到所有客户端
    await manager.send_to_room(request.room_id, {
        "type": "drama:progress",
        "data": response.dict()
    })

    return response

@router.get("/state/{room_id}")
async def get_drama_state(room_id: str):
    """获取当前剧本状态"""

    if room_id not in drama_states:
        raise HTTPException(status_code=404, detail="剧本未加载")

    state = drama_states[room_id]
    story = drama_stories[room_id]
    current_chapter = next(c for c in story.chapters if c.id == state.current_chapter_id)

    return {
        "state": state.dict(),
        "meta": story.meta.dict(),
        "current_chapter": current_chapter.dict()
    }

@router.post("/vote/trigger", response_model=ChapterVoteResponse)
async def trigger_chapter_vote(request: ChapterVoteRequest):
    """触发章节投票（收集5个用户互动后调用）"""

    if request.room_id not in drama_states:
        raise HTTPException(status_code=404, detail="剧本未加载")

    # TODO: 调用AI API生成3个新章节
    # 这里暂时返回mock数据
    vote_id = f"vote_{uuid.uuid4().hex[:8]}"

    # Mock 3个章节选项
    options = [
        ChapterVoteOption(
            id="A",
            chapter=Chapter(
                id=9999,  # 临时ID
                background={"id": "bg_mock_a", "image": "assets/backgrounds/mock_a.png"},
                roles=[
                    {
                        "id": "role_hero",
                        "name": "小林",
                        "avatar": "assets/roles/hero.png",
                        "dialogues": [
                            {"time": 0, "text": "选项A：神秘的声音引导我前行..."}
                        ]
                    }
                ]
            ),
            description="神秘声音"
        ),
        ChapterVoteOption(
            id="B",
            chapter=Chapter(
                id=9998,
                background={"id": "bg_mock_b", "image": "assets/backgrounds/mock_b.png"},
                roles=[
                    {
                        "id": "role_hero",
                        "name": "小林",
                        "avatar": "assets/roles/hero.png",
                        "dialogues": [
                            {"time": 0, "text": "选项B：突然出现了一道光芒..."}
                        ]
                    }
                ]
            ),
            description="神秘光芒"
        ),
        ChapterVoteOption(
            id="C",
            chapter=Chapter(
                id=9997,
                background={"id": "bg_mock_c", "image": "assets/backgrounds/mock_c.png"},
                roles=[
                    {
                        "id": "role_hero",
                        "name": "小林",
                        "avatar": "assets/roles/hero.png",
                        "dialogues": [
                            {"time": 0, "text": "选项C：地面开始震动..."}
                        ]
                    }
                ]
            ),
            description="地面震动"
        )
    ]

    # 通过WebSocket通知所有客户端开始投票
    await manager.send_to_room(request.room_id, {
        "type": "vote:trigger",
        "data": {
            "vote_id": vote_id,
            "options": [
                {"id": opt.id, "label": opt.description, "preview": opt.chapter.dict()}
                for opt in options
            ],
            "duration": 15
        }
    })

    return ChapterVoteResponse(
        vote_id=vote_id,
        options=options,
        duration=15
    )

@router.post("/chapter/insert", response_model=ChapterInsertResponse)
async def insert_chapter(request: ChapterInsertRequest):
    """插入新章节到剧本中"""

    if request.room_id not in drama_stories:
        raise HTTPException(status_code=404, detail="剧本未加载")

    story = drama_stories[request.room_id]

    # 找到插入位置
    insert_index = next(
        (i + 1 for i, c in enumerate(story.chapters) if c.id == request.insert_after_id),
        None
    )

    if insert_index is None:
        raise HTTPException(status_code=404, detail="未找到指定章节")

    # 生成新章节ID
    max_id = max(c.id for c in story.chapters)
    new_chapter = request.chapter
    new_chapter.id = max_id + 1

    # 插入章节
    story.chapters.insert(insert_index, new_chapter)

    # 保存更新后的剧本到文件
    state = drama_states[request.room_id]
    with open(state.story_path, "w", encoding="utf-8") as f:
        json.dump(story.dict(), f, ensure_ascii=False, indent=2)

    # 通知客户端章节已插入
    await manager.send_to_room(request.room_id, {
        "type": "drama:chapter_inserted",
        "data": {
            "chapter_id": new_chapter.id,
            "insert_after_id": request.insert_after_id
        }
    })

    return ChapterInsertResponse(
        success=True,
        message="章节插入成功",
        new_chapter_id=new_chapter.id
    )

@router.post("/interaction/add")
async def add_user_interaction(room_id: str, interaction: UserInteraction):
    """添加用户互动数据"""

    if room_id not in user_interactions:
        user_interactions[room_id] = []

    user_interactions[room_id].append(interaction)

    # 检查是否达到5个互动
    count = len(user_interactions[room_id])

    return {
        "success": True,
        "interaction_count": count,
        "should_trigger_vote": count >= 5 and count % 5 == 0
    }

@router.get("/interaction/{room_id}")
async def get_user_interactions(room_id: str):
    """获取用户互动数据"""

    interactions = user_interactions.get(room_id, [])

    return {
        "room_id": room_id,
        "interactions": [i.dict() for i in interactions],
        "count": len(interactions)
    }

@router.post("/interaction/clear/{room_id}")
async def clear_user_interactions(room_id: str):
    """清空用户互动数据（投票后调用）"""

    if room_id in user_interactions:
        user_interactions[room_id] = []

    return {"success": True, "message": "互动数据已清空"}
