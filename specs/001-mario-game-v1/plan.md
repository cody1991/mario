# Implementation Plan: 超级马里奥 Web 版 V1

**Branch**: `001-mario-game-v1` | **Date**: 2025-12-12 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-mario-game-v1/spec.md`

## Summary

开发一款复刻经典超级马里奥的 Web 版 2D 平台游戏。核心功能包括：马里奥的移动与跳跃控制、关卡场景与平台系统、敌人 AI 与碰撞检测、金币收集与计分、游戏状态管理。采用 HTML5 Canvas 2D 渲染，JavaScript ES6+ 开发，遵循标准游戏循环架构。

## Technical Context

**Language/Version**: JavaScript ES6+（纯 JS，无需构建工具）  
**Primary Dependencies**: 无外部依赖（原生 Canvas API）  
**Storage**: N/A（无持久化需求，关卡数据硬编码）  
**Testing**: 手动测试 + 浏览器 DevTools  
**Target Platform**: 现代浏览器（Chrome、Firefox、Safari、Edge）  
**Project Type**: Single（纯前端单页应用）  
**Performance Goals**: 60 FPS，首次加载 < 3 秒  
**Constraints**: 输入延迟 < 100ms，碰撞检测 100% 准确  
**Scale/Scope**: 1 个完整关卡，5 种游戏实体类型

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. Canvas-First Rendering | ✅ PASS | 使用 HTML5 Canvas 2D API 渲染所有游戏对象 |
| II. Game Loop Architecture | ✅ PASS | 使用 requestAnimationFrame，分离 Update/Render，固定时间步长 |
| III. Modular Game Objects | ✅ PASS | 每个实体（Mario、Enemy、Coin、Platform）独立模块，AABB 碰撞检测 |
| IV. Responsive Input Handling | ✅ PASS | 键盘控制（方向键/WASD + 空格），输入状态解耦 |
| V. Asset Management | ✅ PASS | 资源预加载，加载进度显示，使用 Sprite Sheet |

**Gate Result**: ✅ ALL PASS - 可进入 Phase 0

## Project Structure

### Documentation (this feature)

```text
specs/001-mario-game-v1/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (N/A for this project)
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── main.js              # 入口文件，游戏初始化
├── game.js              # 游戏循环核心
├── input.js             # 输入处理模块
├── loader.js            # 资源加载器
├── entities/
│   ├── mario.js         # 马里奥角色
│   ├── enemy.js         # 敌人基类
│   ├── goomba.js        # 栗子怪
│   ├── coin.js          # 金币
│   └── platform.js      # 平台/砖块
├── levels/
│   └── level1.js        # 第一关数据
├── utils/
│   ├── collision.js     # 碰撞检测
│   └── constants.js     # 游戏常量

assets/
├── sprites/
│   ├── mario.png        # 马里奥精灵图
│   ├── enemies.png      # 敌人精灵图
│   ├── tiles.png        # 地形瓦片
│   └── items.png        # 道具精灵图
├── audio/
│   ├── jump.wav         # 跳跃音效
│   ├── coin.wav         # 金币音效
│   └── bgm.mp3          # 背景音乐（可选）

index.html               # 入口页面
style.css                # 基础样式
```

**Structure Decision**: 采用单项目结构（Single），所有代码在 `src/` 目录下按功能模块组织。游戏为纯前端应用，无后端需求，因此不需要 contracts/ 目录。

## Complexity Tracking

> 无违规项，设计符合 Constitution 所有原则。
