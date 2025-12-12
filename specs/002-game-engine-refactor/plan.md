# Implementation Plan: 游戏引擎重构 - 超级马里奥 V2

**Branch**: `002-game-engine-refactor` | **Date**: 2025-12-12 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-game-engine-refactor/spec.md`

## Summary

使用 Phaser.js 游戏引擎重构现有的原生 Canvas 超级马里奥游戏，重点改善碰撞检测准确性和角色操控手感。保留现有的美术资源、音效资源和关卡数据结构，确保重构后游戏功能与 V1 版本一致。

## Technical Context

**Language/Version**: JavaScript ES6+（纯前端，无需构建工具）  
**Primary Dependencies**: Phaser 3.x（通过 CDN 引入）  
**Storage**: N/A（纯前端游戏，无持久化需求）  
**Testing**: 手动游戏测试 + 浏览器开发者工具性能分析  
**Target Platform**: 现代浏览器（Chrome、Firefox、Safari、Edge）  
**Project Type**: Single（单页游戏应用）  
**Performance Goals**: 60 FPS 稳定帧率，加载时间 < 3 秒  
**Constraints**: 输入延迟 < 50ms，碰撞检测 100% 准确  
**Scale/Scope**: 单关卡游戏，约 15 个源文件

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| 原则 | 状态 | 说明 |
|------|------|------|
| I. Canvas-First Rendering | ✅ 通过 | Phaser.js 基于 Canvas/WebGL 渲染，符合要求 |
| II. Game Loop Architecture | ✅ 通过 | Phaser 内置标准游戏循环，支持固定时间步长 |
| III. Modular Game Objects | ✅ 通过 | Phaser Scene/Sprite 架构支持模块化设计 |
| IV. Responsive Input Handling | ✅ 通过 | Phaser 内置输入系统，支持键盘控制，可扩展触控 |
| V. Asset Management | ✅ 通过 | Phaser 内置资源预加载器，支持进度回调 |

**Constitution 检查结果**: 全部通过，无违规项。

### Post-Design Constitution Re-check

| 原则 | 状态 | 设计验证 |
|------|------|----------|
| I. Canvas-First Rendering | ✅ 通过 | Phaser 使用 Canvas/WebGL，data-model 中所有实体基于 Phaser.Sprite |
| II. Game Loop Architecture | ✅ 通过 | 使用 Phaser Scene 的 update() 方法，内置固定时间步长 |
| III. Modular Game Objects | ✅ 通过 | Player/Enemy/Coin 独立类，继承 Phaser.Sprite |
| IV. Responsive Input Handling | ✅ 通过 | 使用 Phaser cursors，预留触控扩展点 |
| V. Asset Management | ✅ 通过 | BootScene 预加载，支持进度回调 |

## Project Structure

### Documentation (this feature)

```text
specs/002-game-engine-refactor/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (by /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── main.js              # 游戏入口，Phaser 配置
├── scenes/              # Phaser 场景
│   ├── BootScene.js     # 启动场景（资源预加载）
│   ├── GameScene.js     # 主游戏场景
│   └── UIScene.js       # UI 覆盖层场景
├── entities/            # 游戏实体（Phaser Sprite 扩展）
│   ├── Player.js        # 玩家角色
│   ├── Enemy.js         # 敌人基类
│   ├── Goomba.js        # 栗子怪
│   └── Coin.js          # 金币
├── levels/              # 关卡数据
│   └── level1.js        # 关卡 1 数据（复用 V1 格式）
├── config/              # 配置常量
│   └── constants.js     # 游戏配置（复用 V1 参数）
└── utils/               # 工具函数
    └── helpers.js       # 辅助函数

assets/                  # 资源文件（复用 V1）
├── sprites/             # 精灵图
└── audio/               # 音效

index.html               # 入口页面（引入 Phaser CDN）
style.css                # 样式（复用 V1）
```

**Structure Decision**: 采用 Phaser 标准的 Scene 架构，将 V1 的 Game 类逻辑拆分为多个 Scene。实体类继承 Phaser.GameObjects.Sprite，利用 Arcade Physics 处理碰撞。

## Complexity Tracking

> 无违规项，无需记录。
