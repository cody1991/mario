<!--
  ============================================================================
  Sync Impact Report
  ============================================================================
  Version change: N/A → 1.0.0 (Initial ratification)
  
  Modified principles: N/A (initial version)
  
  Added sections:
    - Core Principles (5 principles)
    - Technical Standards
    - Development Workflow
    - Governance
  
  Removed sections: N/A
  
  Templates requiring updates:
    - .specify/templates/plan-template.md: ✅ No update needed (generic Constitution Check)
    - .specify/templates/spec-template.md: ✅ No update needed (generic structure)
    - .specify/templates/tasks-template.md: ✅ No update needed (generic phases)
    - .specify/templates/checklist-template.md: ✅ No update needed (generic structure)
  
  Follow-up TODOs: None
  ============================================================================
-->

# Super Mario Web Constitution

## Core Principles

### I. Canvas-First Rendering

游戏渲染 MUST 基于 HTML5 Canvas 2D API 实现。所有游戏画面、精灵、动画 MUST 通过 Canvas 绑定的 2D 上下文进行绘制。禁止使用 DOM 元素进行游戏对象渲染（UI 层除外）。

**理由**: Canvas 提供高性能的像素级控制，适合 2D 平台游戏的帧动画和碰撞检测需求。

### II. Game Loop Architecture

游戏 MUST 实现标准的游戏循环架构：
- 使用 `requestAnimationFrame` 驱动主循环
- 分离更新逻辑（Update）与渲染逻辑（Render）
- 实现固定时间步长（Fixed Timestep）以保证物理一致性
- 目标帧率 MUST 达到 60 FPS

**理由**: 标准游戏循环确保跨设备的一致游戏体验和可预测的物理行为。

### III. Modular Game Objects

所有游戏实体（玩家、敌人、道具、地形）MUST 遵循组件化设计：
- 每个实体 MUST 具有独立的更新和渲染方法
- 碰撞检测 MUST 使用 AABB（轴对齐包围盒）算法
- 精灵动画 MUST 支持帧序列配置

**理由**: 模块化设计便于扩展新角色、敌人和道具，降低代码耦合度。

### IV. Responsive Input Handling

输入处理 MUST 支持多种控制方式：
- 键盘控制（方向键/WASD + 跳跃键）
- 触屏控制（移动端虚拟按键）
- 输入状态 MUST 与游戏逻辑解耦

**理由**: 确保游戏在桌面和移动设备上均可流畅操作。

### V. Asset Management

游戏资源 MUST 统一管理：
- 图片、音频资源 MUST 预加载后再启动游戏
- 提供加载进度反馈
- 精灵图（Sprite Sheet）MUST 用于批量图像资源

**理由**: 预加载避免游戏中资源加载卡顿，提升用户体验。

## Technical Standards

**语言/版本**: JavaScript ES6+ 或 TypeScript 4.x+
**渲染技术**: HTML5 Canvas 2D
**音频**: Web Audio API
**构建工具**: 可选（Vite/Webpack/无构建）
**目标平台**: 现代浏览器（Chrome、Firefox、Safari、Edge）
**性能目标**: 60 FPS，首次加载 < 3 秒
**分辨率**: 支持响应式缩放，基准分辨率 256x240（NES 原版）或 512x480

## Development Workflow

**代码组织**:
- `src/` - 游戏源代码
- `assets/` - 图片、音频、关卡数据
- `index.html` - 入口页面

**开发流程**:
1. 功能分支开发
2. 本地测试通过后合并
3. 每个功能 SHOULD 有对应的测试关卡验证

**代码规范**:
- 使用 ESLint 或 TypeScript 严格模式
- 游戏常量 MUST 集中配置（重力、速度、尺寸等）

## Governance

本 Constitution 是项目的最高开发准则。所有代码提交 MUST 符合上述原则。

**修订流程**:
1. 提出修订提案并说明理由
2. 评估对现有代码的影响
3. 更新 Constitution 并同步相关模板
4. 版本号遵循语义化版本（MAJOR.MINOR.PATCH）

**合规检查**:
- 每次 PR MUST 验证是否符合 Core Principles
- 复杂度增加 MUST 在 Complexity Tracking 中记录并说明理由

**Version**: 1.0.0 | **Ratified**: 2025-12-12 | **Last Amended**: 2025-12-12
