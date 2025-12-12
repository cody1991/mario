# Data Model: 超级马里奥 Web 版 V1

**Date**: 2025-12-12  
**Branch**: `001-mario-game-v1`

## Entity Overview

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    Game     │────▶│    Level    │────▶│   Entity    │
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │                   ▲
       │                   │                   │
       ▼                   ▼            ┌──────┴──────┐
┌─────────────┐     ┌─────────────┐     │             │
│ InputHandler│     │  TileMap    │  ┌──┴──┐  ┌───┴───┐
└─────────────┘     └─────────────┘  │Mario│  │Enemy  │
                                     └─────┘  └───────┘
                                        │         │
                                        │    ┌────┴────┐
                                        │    │ Goomba  │
                                        │    └─────────┘
                                     ┌──┴──┐
                                     │Coin │
                                     └─────┘
```

## Core Entities

### Game

游戏主控制器，管理游戏状态和主循环。

| Field | Type | Description |
|-------|------|-------------|
| state | GameState | 当前游戏状态 |
| level | Level | 当前关卡 |
| score | number | 玩家分数 |
| lives | number | 剩余生命 |
| canvas | HTMLCanvasElement | 渲染画布 |
| ctx | CanvasRenderingContext2D | 2D 上下文 |
| input | InputHandler | 输入处理器 |
| loader | AssetLoader | 资源加载器 |
| camera | Camera | 摄像机（视口） |

**State Transitions**:
```
LOADING → READY → PLAYING → (WIN | LOSE) → READY
                     ↑                        │
                     └────────────────────────┘
```

### GameState (Enum)

| Value | Description |
|-------|-------------|
| LOADING | 资源加载中 |
| READY | 等待开始 |
| PLAYING | 游戏进行中 |
| PAUSED | 游戏暂停 |
| WIN | 通关胜利 |
| LOSE | 游戏失败 |

### Level

关卡数据和实体容器。

| Field | Type | Description |
|-------|------|-------------|
| width | number | 关卡宽度（像素） |
| height | number | 关卡高度（像素） |
| tileSize | number | 瓦片尺寸（像素） |
| tiles | number[][] | 瓦片地图二维数组 |
| entities | Entity[] | 关卡中的所有实体 |
| mario | Mario | 玩家角色引用 |
| goal | {x, y} | 终点位置 |

**Tile Types**:
| Value | Type | Collision |
|-------|------|-----------|
| 0 | 空气 | 无 |
| 1 | 地面 | 实心 |
| 2 | 砖块 | 实心 |
| 3 | 问号砖块 | 实心 |
| 4 | 管道 | 实心 |

### Entity (Base)

所有游戏对象的基类。

| Field | Type | Description |
|-------|------|-------------|
| x | number | X 坐标 |
| y | number | Y 坐标 |
| width | number | 碰撞体宽度 |
| height | number | 碰撞体高度 |
| velocityX | number | X 方向速度 |
| velocityY | number | Y 方向速度 |
| sprite | Sprite | 精灵动画 |
| active | boolean | 是否激活 |

**Methods**:
- `update(deltaTime)` - 更新逻辑
- `render(ctx, camera)` - 渲染到画布
- `getBounds()` - 获取碰撞边界

### Mario (extends Entity)

玩家控制的角色。

| Field | Type | Description |
|-------|------|-------------|
| state | MarioState | 角色状态 |
| isGrounded | boolean | 是否着地 |
| facingRight | boolean | 面朝方向 |
| isInvincible | boolean | 无敌状态 |
| invincibleTimer | number | 无敌计时器 |

**MarioState (Enum)**:
| Value | Description |
|-------|-------------|
| IDLE | 静止 |
| WALKING | 行走 |
| JUMPING | 跳跃 |
| FALLING | 下落 |
| DYING | 死亡 |

**Validation Rules**:
- x >= 0（不能超出左边界）
- y < level.height + 100（掉落判定死亡）
- velocityY <= MAX_FALL_SPEED

### Enemy (extends Entity)

敌人基类。

| Field | Type | Description |
|-------|------|-------------|
| type | string | 敌人类型 |
| direction | number | 移动方向（-1 或 1） |
| speed | number | 移动速度 |
| isDead | boolean | 是否已死亡 |

### Goomba (extends Enemy)

栗子怪敌人。

| Field | Type | Description |
|-------|------|-------------|
| squishTimer | number | 被踩扁后的消失计时 |

**Behavior**:
- 沿地面水平移动
- 遇到障碍物或边缘转向
- 被踩踏后播放扁平动画并消失

### Coin (extends Entity)

可收集的金币。

| Field | Type | Description |
|-------|------|-------------|
| collected | boolean | 是否已收集 |
| value | number | 分值（默认 100） |
| animationFrame | number | 当前动画帧 |

### Camera

视口/摄像机控制。

| Field | Type | Description |
|-------|------|-------------|
| x | number | 视口 X 偏移 |
| y | number | 视口 Y 偏移 |
| width | number | 视口宽度 |
| height | number | 视口高度 |
| target | Entity | 跟随目标（Mario） |
| leftBound | number | 左边界锁定 |

**Behavior**:
- 跟随 Mario 水平移动
- 左边界锁定（不能向左滚动超过已探索区域）
- 垂直方向固定

### InputHandler

输入状态管理。

| Field | Type | Description |
|-------|------|-------------|
| keys.left | boolean | 左移按下 |
| keys.right | boolean | 右移按下 |
| keys.jump | boolean | 跳跃按下 |
| keys.jumpPressed | boolean | 跳跃刚按下（单次触发） |

### Sprite

精灵动画管理。

| Field | Type | Description |
|-------|------|-------------|
| image | HTMLImageElement | 精灵图 |
| frameWidth | number | 单帧宽度 |
| frameHeight | number | 单帧高度 |
| animations | object | 动画帧序列映射 |
| currentAnimation | string | 当前动画名 |
| currentFrame | number | 当前帧索引 |
| frameTimer | number | 帧计时器 |
| frameInterval | number | 帧间隔（ms） |

### AssetLoader

资源加载器。

| Field | Type | Description |
|-------|------|-------------|
| images | object | 已加载图片映射 |
| audio | object | 已加载音频映射 |
| loadedCount | number | 已加载数量 |
| totalCount | number | 总资源数量 |

## Relationships

| From | To | Relationship | Description |
|------|----|--------------|-------------|
| Game | Level | 1:1 | 游戏持有当前关卡 |
| Game | InputHandler | 1:1 | 游戏持有输入处理器 |
| Game | Camera | 1:1 | 游戏持有摄像机 |
| Level | Entity | 1:N | 关卡包含多个实体 |
| Level | Mario | 1:1 | 关卡持有玩家引用 |
| Camera | Mario | 1:1 | 摄像机跟随玩家 |
| Entity | Sprite | 1:1 | 实体拥有精灵动画 |

## Collision Matrix

| A ↓ / B → | Platform | Goomba | Coin | Goal |
|-----------|----------|--------|------|------|
| Mario | 阻挡/站立 | 踩杀/受伤 | 收集 | 胜利 |
| Goomba | 阻挡/转向 | - | - | - |
| Coin | - | - | - | - |

## Constants

```javascript
const GAME_CONFIG = {
  CANVAS_WIDTH: 800,
  CANVAS_HEIGHT: 480,
  TILE_SIZE: 32,
  
  // Physics
  GRAVITY: 0.5,
  MAX_FALL_SPEED: 10,
  
  // Mario
  MARIO_WALK_SPEED: 3,
  MARIO_JUMP_FORCE: -12,
  MARIO_WIDTH: 32,
  MARIO_HEIGHT: 32,
  
  // Enemy
  GOOMBA_SPEED: 1,
  GOOMBA_WIDTH: 32,
  GOOMBA_HEIGHT: 32,
  
  // Scoring
  COIN_VALUE: 100,
  ENEMY_KILL_VALUE: 200,
  
  // Timing
  INVINCIBLE_DURATION: 2000,
  DEATH_ANIMATION_DURATION: 1000
};
```
