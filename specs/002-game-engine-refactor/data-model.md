# Data Model: 游戏引擎重构 - 超级马里奥 V2

**Branch**: `002-game-engine-refactor` | **Date**: 2025-12-12

## Overview

本文档定义游戏实体的数据结构。由于这是纯前端游戏，无持久化需求，数据模型主要描述运行时对象结构。

---

## 1. Player（玩家角色）

**继承**: `Phaser.Physics.Arcade.Sprite`

| 属性 | 类型 | 说明 | 默认值 |
|------|------|------|--------|
| x | number | X 坐标（像素） | 从关卡 spawnPoint 获取 |
| y | number | Y 坐标（像素） | 从关卡 spawnPoint 获取 |
| velocityX | number | 水平速度 | 0 |
| velocityY | number | 垂直速度 | 0 |
| state | string | 状态枚举 | 'idle' |
| facingRight | boolean | 朝向 | true |
| isInvincible | boolean | 无敌状态 | false |
| invincibleTimer | number | 无敌剩余时间（ms） | 0 |
| jumpTimer | number | 跳跃持续时间（ms） | 0 |
| isJumping | boolean | 是否在跳跃中 | false |

**状态枚举 (state)**:
- `idle` - 静止
- `walking` - 行走
- `jumping` - 跳跃上升
- `falling` - 下落
- `hurt` - 受伤
- `dead` - 死亡

**方法**:
- `update(cursors, delta)` - 每帧更新
- `takeDamage()` - 受伤处理
- `die()` - 死亡处理
- `bounce()` - 踩踏弹跳
- `reset(x, y)` - 重置位置和状态

---

## 2. Enemy（敌人基类）

**继承**: `Phaser.Physics.Arcade.Sprite`

| 属性 | 类型 | 说明 | 默认值 |
|------|------|------|--------|
| x | number | X 坐标 | 构造参数 |
| y | number | Y 坐标 | 构造参数 |
| speed | number | 移动速度 | 子类定义 |
| direction | number | 移动方向（-1 或 1） | -1 |
| isAlive | boolean | 存活状态 | true |

**方法**:
- `update(delta)` - 每帧更新（AI 行为）
- `stomp()` - 被踩踏
- `turnAround()` - 转向

---

## 3. Goomba（栗子怪）

**继承**: `Enemy`

| 属性 | 类型 | 说明 | 默认值 |
|------|------|------|--------|
| speed | number | 移动速度 | 60 |
| squishTimer | number | 压扁动画计时 | 0 |

**行为规则**:
- 自动向左移动
- 碰到墙壁或边缘转向
- 被踩踏后播放压扁动画，500ms 后销毁

---

## 4. Coin（金币）

**继承**: `Phaser.Physics.Arcade.Sprite`

| 属性 | 类型 | 说明 | 默认值 |
|------|------|------|--------|
| x | number | X 坐标 | 构造参数 |
| y | number | Y 坐标 | 构造参数 |
| value | number | 分值 | 100 |
| collected | boolean | 是否已收集 | false |

**方法**:
- `collect()` - 收集处理（播放动画和音效，销毁）

---

## 5. Level（关卡数据）

**类型**: Plain Object（复用 V1 格式）

| 属性 | 类型 | 说明 |
|------|------|------|
| width | number | 关卡宽度（瓦片数） |
| height | number | 关卡高度（瓦片数） |
| tileSize | number | 瓦片尺寸（像素） |
| spawnPoint | {x, y} | 玩家出生点 |
| goal | {x, y} | 终点位置 |
| tiles | number[][] | 瓦片地图（二维数组） |
| entities | EntityData[] | 实体数据数组 |

**EntityData 结构**:
```javascript
{
    type: 'goomba' | 'coin',
    x: number,
    y: number
}
```

---

## 6. GameState（游戏状态）

**管理位置**: GameScene 属性

| 属性 | 类型 | 说明 | 默认值 |
|------|------|------|--------|
| state | string | 游戏状态枚举 | 'ready' |
| score | number | 当前分数 | 0 |
| lives | number | 剩余生命 | 3 |

**状态枚举 (state)**:
- `loading` - 加载中
- `ready` - 准备开始
- `playing` - 游戏中
- `paused` - 暂停
- `win` - 胜利
- `lose` - 失败

---

## 7. TileType（瓦片类型）

**类型**: Enum（常量对象）

| 值 | 名称 | 碰撞属性 |
|----|------|----------|
| 0 | AIR | 无碰撞 |
| 1 | GROUND | 实心碰撞 |
| 2 | BRICK | 实心碰撞 |
| 3 | QUESTION | 实心碰撞 |
| 4 | PIPE_TOP_LEFT | 实心碰撞 |
| 5 | PIPE_TOP_RIGHT | 实心碰撞 |
| 6 | PIPE_BODY_LEFT | 实心碰撞 |
| 7 | PIPE_BODY_RIGHT | 实心碰撞 |
| 8 | GOAL | 无碰撞（触发胜利） |

---

## 8. 配置常量

**文件**: `src/config/constants.js`

```javascript
export const GAME_CONFIG = {
    CANVAS_WIDTH: 800,
    CANVAS_HEIGHT: 480,
    TILE_SIZE: 32,
    TARGET_FPS: 60,
};

export const PHYSICS = {
    GRAVITY: 800,           // Phaser 使用像素/秒²
    MAX_VELOCITY_Y: 600,
    GROUND_DRAG: 800,
    AIR_DRAG: 100,
};

export const PLAYER_CONFIG = {
    WIDTH: 32,
    HEIGHT: 32,
    WALK_SPEED: 200,
    ACCELERATION: 600,
    JUMP_VELOCITY: -400,
    JUMP_HOLD_VELOCITY: -50,
    MAX_JUMP_TIME: 250,
    INVINCIBLE_DURATION: 2000,
};

export const ENEMY_CONFIG = {
    GOOMBA_SPEED: 60,
    SQUISH_DURATION: 500,
};

export const SCORING = {
    COIN_VALUE: 100,
    ENEMY_STOMP: 200,
    GOAL_BONUS: 1000,
};
```

---

## Entity Relationships

```
GameScene
├── Player (1)
├── Enemies (Group)
│   └── Goomba (N)
├── Coins (Group)
│   └── Coin (N)
├── Platforms (StaticGroup)
│   └── Tile (N)
└── GameState
```

---

## State Transitions

### Player State Machine

```
idle ──(move)──> walking
  │                 │
  └──(jump)──> jumping
                    │
                    v
               falling ──(land)──> idle/walking
                    │
                    └──(hit enemy)──> hurt ──> idle (if lives > 0)
                                        │
                                        └──> dead (if lives = 0)
```

### Game State Machine

```
loading ──(assets loaded)──> ready
                               │
                               └──(any key)──> playing
                                                  │
                    ┌──────────────────────────────┼──────────────────────────────┐
                    │                              │                              │
                    v                              v                              v
                 paused ──(P key)──> playing   win ──(R key)──> ready   lose ──(R key)──> ready
                    │                              
                    └──(P key)──────────────────────┘
```
