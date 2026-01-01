## 一、总体结构设计说明

### 顶层结构

* 整个 JSON 表示一个完整的剧情数据包
* 包含元信息（可选）和章节数组 `chapters`

```json
{
  "meta": { ... },
  "chapters": [ ... ]
}
```

---

### Chapter（幻灯片 / 剧情页）

* 每一个 `chapter` 对应一张幻灯片
* 按顺序播放
* 核心元素：

  * `id`：章节唯一标识
  * `background`：背景资源
  * `roles`：角色集合
  * `duration`（可选）：本章总时长（毫秒）

```json
{
  "id": "chapter_1",
  "background": { ... },
  "roles": [ ... ]
}
```

---

### Background（背景）

* 背景本身也是一个 object，便于后续加入动画、过渡等

```json
{
  "id": "bg_room_day",
  "image": "assets/backgrounds/room_day.png"
}
```

---

### Role（角色）

* 每个角色是一个 object
* 包含角色信息和对话数组

```json
{
  "id": "hero",
  "name": "主角",
  "avatar": "assets/roles/hero.png",
  "dialogues": [ ... ]
}
```

---

### Dialogue（对话）

* 每条对话带有**时间戳**
* 时间戳表示对话在本 chapter 中出现的时间（毫秒）

```json
{
  "time": 1000,
  "text": "你好，今天的天气不错。"
}
```

---

## 二、完整 JSON 示例

```json
{
  "meta": {
    "title": "示例剧情游戏",
    "version": "1.0.0",
    "author": "Game Designer",
    "description": "一个用于幻灯片剧情游戏的示例数据结构"
  },
  "chapters": [
    {
      "id": "chapter_1",
      "background": {
        "id": "bg_classroom_morning",
        "image": "assets/backgrounds/classroom_morning.png"
      },
      "roles": [
        {
          "id": "role_hero",
          "name": "主角",
          "avatar": "assets/roles/hero.png",
          "dialogues": [
            {
              "time": 0,
              "text": "这里是哪里？"
            },
            {
              "time": 3000,
              "text": "好像是学校的教室。"
            }
          ]
        },
        {
          "id": "role_friend",
          "name": "朋友",
          "avatar": "assets/roles/friend.png",
          "dialogues": [
            {
              "time": 1500,
              "text": "你终于醒了。"
            },
            {
              "time": 4500,
              "text": "今天可是很重要的一天。"
            }
          ]
        }
      ]
    },
    {
      "id": "chapter_2",
      "background": {
        "id": "bg_street_evening",
        "image": "assets/backgrounds/street_evening.png"
      },
      "roles": [
        {
          "id": "role_hero",
          "name": "主角",
          "avatar": "assets/roles/hero.png",
          "dialogues": [
            {
              "time": 1000,
              "text": "天已经黑了。"
            }
          ]
        }
      ]
    }
  ]
}
```