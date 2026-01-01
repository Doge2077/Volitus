from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class Dialogue(BaseModel):
    """对话模型"""
    time: int  # 显示时间(毫秒)
    text: str  # 对话内容

class Role(BaseModel):
    """角色模型"""
    id: str
    name: str
    avatar: str
    dialogues: List[Dialogue]

class Background(BaseModel):
    """背景模型"""
    id: str
    image: str

class Chapter(BaseModel):
    """章节模型"""
    id: int
    background: Background
    roles: List[Role]

class DramaMeta(BaseModel):
    """剧本元信息"""
    title: str
    version: str
    author: str
    description: str

class DramaStory(BaseModel):
    """完整剧本"""
    meta: DramaMeta
    chapters: List[Chapter]

class DramaState(BaseModel):
    """剧本游戏状态"""
    room_id: str
    current_chapter_id: int  # 当前章节ID
    current_dialogue_index: int  # 当前对话索引
    current_role_index: int  # 当前角色索引
    total_dialogues: int  # 当前章节总对话数
    is_playing: bool  # 是否正在播放
    story_path: str  # 剧本文件路径

class DramaProgressRequest(BaseModel):
    """推进剧情请求"""
    room_id: str

class DramaProgressResponse(BaseModel):
    """推进剧情响应"""
    chapter_id: int
    dialogue_index: int
    role_index: int
    role: Optional[Role]
    dialogue: Optional[Dialogue]
    background: Background
    is_chapter_end: bool  # 是否章节结束
    is_story_end: bool  # 是否剧本结束
    should_trigger_vote: bool  # 是否触发投票

class DramaLoadRequest(BaseModel):
    """加载剧本请求"""
    room_id: str
    story_path: str  # 剧本文件路径，如 "drama/story.json"

class DramaLoadResponse(BaseModel):
    """加载剧本响应"""
    success: bool
    message: str
    meta: Optional[DramaMeta]
    first_chapter: Optional[Chapter]

class UserInteraction(BaseModel):
    """用户互动数据"""
    user_id: str
    type: str  # "video" | "text"
    content: str  # 视频URL或文字内容
    timestamp: int

class GeneratedChapter(BaseModel):
    """生成的章节"""
    chapter: Chapter
    description: str  # 章节描述

class ChapterVoteOption(BaseModel):
    """章节投票选项"""
    id: str  # "A" | "B" | "C"
    chapter: Chapter
    description: str

class ChapterVoteRequest(BaseModel):
    """章节投票请求"""
    room_id: str
    interactions: List[UserInteraction]  # 用户互动数据

class ChapterVoteResponse(BaseModel):
    """章节投票响应"""
    vote_id: str
    options: List[ChapterVoteOption]
    duration: int  # 投票时长(秒)

class ChapterInsertRequest(BaseModel):
    """插入章节请求"""
    room_id: str
    chapter: Chapter
    insert_after_id: int  # 在哪个章节ID后插入

class ChapterInsertResponse(BaseModel):
    """插入章节响应"""
    success: bool
    message: str
    new_chapter_id: int
