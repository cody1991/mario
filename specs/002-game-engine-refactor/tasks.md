# Tasks: 游戏引擎重构 - 超级马里奥 V2

**Input**: Design documents from `/specs/002-game-engine-refactor/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: 手动游戏测试（无自动化测试要求）

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Project Type**: Single（单页游戏应用）
- **Source**: `src/` at repository root
- **Assets**: `assets/` (复用 V1)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: 项目初始化，引入 Phaser.js，创建基础目录结构

- [x] T001 更新 `index.html`，引入 Phaser 3.70.0 CDN 并调整 script 入口
- [x] T002 创建新的目录结构 `src/scenes/`、`src/config/`
- [x] T003 [P] 创建游戏配置常量文件 `src/config/constants.js`（迁移并适配 V1 参数为 Phaser 格式）
- [x] T004 [P] 创建 Phaser 游戏入口配置 `src/main.js`（Phaser.Game 初始化）

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: 核心场景框架，资源加载系统 - 所有 User Story 依赖此阶段

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 创建启动场景 `src/scenes/BootScene.js`（资源预加载、进度条）
- [x] T006 创建主游戏场景骨架 `src/scenes/GameScene.js`（create/update 方法、物理世界配置）
- [x] T007 [P] 创建 UI 场景 `src/scenes/UIScene.js`（HUD 显示、状态界面）
- [x] T008 实现关卡数据适配器，在 `src/scenes/GameScene.js` 中将 V1 关卡数据转换为 Phaser Tilemap
- [x] T009 验证资源加载和场景切换正常工作（BootScene → GameScene）

**Checkpoint**: 基础框架就绪 - 可以看到空的游戏场景和地图瓦片

---

## Phase 3: User Story 1 - 精准的碰撞检测体验 (Priority: P1) 🎯 MVP

**Goal**: 玩家角色与地形的碰撞检测准确无误，无穿墙、卡墙、悬空现象

**Independent Test**: 在关卡中自由移动马里奥，验证所有碰撞场景正确处理

### Implementation for User Story 1

- [x] T010 [US1] 创建 Player 基础类 `src/entities/Player.js`（继承 Phaser.Physics.Arcade.Sprite）
- [x] T011 [US1] 在 Player 中配置碰撞体大小和偏移 `body.setSize()` / `body.setOffset()`
- [x] T012 [US1] 在 `src/scenes/GameScene.js` 中创建地形碰撞组（StaticGroup）
- [x] T013 [US1] 实现 Player 与地形的碰撞检测 `this.physics.add.collider(player, platforms)`
- [x] T014 [US1] 处理边缘情况：快速移动防穿墙、头顶碰撞、平台边缘掉落
- [x] T015 [US1] 在 GameScene 中实例化 Player 并设置世界边界 `setCollideWorldBounds(true)`

**Checkpoint**: 马里奥可以在关卡中移动，与所有地形正确碰撞，无穿墙/卡墙现象

---

## Phase 4: User Story 2 - 流畅响应的操控手感 (Priority: P1)

**Goal**: 角色操控响应及时，移动和跳跃手感流畅自然

**Independent Test**: 反复测试移动和跳跃，验证响应及时、手感舒适

### Implementation for User Story 2

- [x] T016 [US2] 在 Player 中实现键盘输入处理（方向键/WASD）
- [x] T017 [US2] 实现水平移动：加速度、最大速度、地面摩擦 `setAccelerationX()` / `setDragX()`
- [x] T018 [US2] 实现基础跳跃：检测 `body.onFloor()` 后设置垂直速度
- [x] T019 [US2] 实现可变跳跃高度：长按跳跃键持续施加向上力（jumpTimer 控制）
- [x] T020 [US2] 实现空中控制：允许空中水平加速，但降低加速度
- [x] T021 [US2] 实现角色朝向和动画状态切换（idle/walking/jumping/falling）
- [x] T022 [US2] 在 Player 中添加 `// TODO: 移动端触控支持` 扩展点注释

**Checkpoint**: 马里奥操控流畅，跳跃高度可控，移动有适度惯性

---

## Phase 5: User Story 3 - 敌人交互的准确判定 (Priority: P2)

**Goal**: 踩踏敌人判定准确，侧面碰撞正确触发受伤

**Independent Test**: 反复测试踩踏和碰撞敌人，验证判定一致且符合直觉

### Implementation for User Story 3

- [x] T023 [P] [US3] 创建敌人基类 `src/entities/Enemy.js`（继承 Phaser.Physics.Arcade.Sprite）
- [x] T024 [P] [US3] 创建栗子怪类 `src/entities/Goomba.js`（继承 Enemy，实现 AI 行为）
- [x] T025 [US3] 在 Goomba 中实现自动移动和转向逻辑（碰墙/边缘转向）
- [x] T026 [US3] 在 GameScene 中创建敌人组并从关卡数据生成敌人
- [x] T027 [US3] 实现敌人与地形的碰撞检测
- [x] T028 [US3] 实现玩家与敌人的交互判定（踩踏 vs 受伤）基于速度和位置
- [x] T029 [US3] 实现踩踏成功：敌人播放压扁动画并销毁，玩家弹跳
- [x] T030 [US3] 实现受伤处理：玩家进入无敌状态，生命值减少
- [x] T031 [US3] 在 Player 中实现无敌状态闪烁效果

**Checkpoint**: 敌人正常巡逻，踩踏和受伤判定准确

---

## Phase 6: User Story 4 - 稳定流畅的游戏性能 (Priority: P2)

**Goal**: 游戏保持 60 FPS 稳定帧率，无内存泄漏

**Independent Test**: 长时间运行游戏，使用开发者工具监控帧率和内存

### Implementation for User Story 4

- [x] T032 [US4] 在 `src/main.js` 中配置 Phaser 性能选项（fps.target: 60）
- [x] T033 [US4] 优化敌人和金币的对象池管理（避免频繁创建/销毁）
- [x] T034 [US4] 确保所有 Sprite 销毁时正确清理（调用 destroy()）
- [x] T035 [US4] 在 GameScene 中实现摄像机跟随和视口裁剪（只渲染可见区域）

**Checkpoint**: 游戏在各浏览器中保持 60 FPS，长时间运行无性能下降

---

## Phase 7: User Story 5 - 保持原有游戏功能 (Priority: P3)

**Goal**: 重构后保留 V1 所有功能：金币收集、分数、生命、胜利/失败、暂停

**Independent Test**: 完整游玩一局，验证所有功能正常

### Implementation for User Story 5

- [x] T036 [P] [US5] 创建金币类 `src/entities/Coin.js`（动画、收集逻辑）
- [x] T037 [US5] 在 GameScene 中创建金币组并从关卡数据生成金币
- [x] T038 [US5] 实现金币收集：碰撞检测、播放音效、增加分数、销毁金币
- [x] T039 [US5] 在 UIScene 中实现分数和生命显示
- [x] T040 [US5] 实现游戏状态管理：ready → playing → paused/win/lose
- [x] T041 [US5] 实现开始界面（按任意键开始）
- [x] T042 [US5] 实现暂停功能（P 键暂停/继续）
- [x] T043 [US5] 实现胜利判定（到达终点旗杆）和胜利界面
- [x] T044 [US5] 实现死亡判定（掉落屏幕外/生命归零）和游戏结束界面
- [x] T045 [US5] 实现重新开始功能（R 键重置游戏）

**Checkpoint**: 所有 V1 功能正常工作，游戏流程完整

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: 代码清理、边缘情况处理、最终验证

- [x] T046 [P] 清理 V1 遗留代码（删除不再使用的旧文件）
- [x] T047 [P] 代码注释和文档完善
- [x] T048 处理边缘情况：窗口大小改变时画面适配（Phaser.Scale.FIT）
- [x] T049 处理边缘情况：同时接触多个敌人只触发一次伤害（recentlyHit 标志）
- [x] T050 处理边缘情况：极窄通道移动不卡住（碰撞体比精灵小 4px）
- [ ] T051 跨浏览器测试（Chrome、Firefox、Safari、Edge）
- [x] T052 运行 quickstart.md 验证流程

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
- **Polish (Phase 8)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: 碰撞检测 - 基础，无依赖
- **User Story 2 (P1)**: 操控手感 - 依赖 US1（需要 Player 和碰撞系统）
- **User Story 3 (P2)**: 敌人交互 - 依赖 US1+US2（需要完整的 Player）
- **User Story 4 (P2)**: 性能优化 - 可与 US3 并行，依赖基础框架
- **User Story 5 (P3)**: 完整功能 - 依赖 US1-US3（需要所有核心系统）

### Within Each User Story

- 实体类（Player/Enemy/Coin）优先
- 场景集成其次
- 交互逻辑最后
- 完成后验证独立可测试

### Parallel Opportunities

- T003, T004 可并行（不同文件）
- T007 可与 T005, T006 并行
- T023, T024 可并行（不同敌人类）
- T036 可与 US5 其他任务并行
- T046, T047 可并行

---

## Parallel Example: User Story 3

```bash
# 并行创建敌人类:
Task: "创建敌人基类 src/entities/Enemy.js"
Task: "创建栗子怪类 src/entities/Goomba.js"

# 然后顺序实现交互逻辑
```

---

## Implementation Strategy

### MVP First (User Story 1 + 2)

1. Complete Phase 1: Setup（引入 Phaser）
2. Complete Phase 2: Foundational（场景框架）
3. Complete Phase 3: User Story 1（碰撞检测）
4. Complete Phase 4: User Story 2（操控手感）
5. **STOP and VALIDATE**: 马里奥可以在关卡中流畅移动和跳跃
6. 此时已解决核心问题（碰撞 + 操控），可演示

### Incremental Delivery

1. Setup + Foundational → 基础框架就绪
2. Add US1 + US2 → 核心体验改善 → **MVP 可演示**
3. Add US3 → 敌人交互完整 → 可玩性提升
4. Add US4 → 性能优化 → 稳定性保障
5. Add US5 → 完整功能 → 与 V1 功能对等
6. Polish → 发布就绪

### Suggested Execution Order

由于 US1 和 US2 都是 P1 优先级且紧密相关，建议顺序执行：

```
Phase 1 → Phase 2 → Phase 3 (US1) → Phase 4 (US2) → [MVP 验证]
                                                        ↓
Phase 5 (US3) → Phase 6 (US4) → Phase 7 (US5) → Phase 8 (Polish)
```

---

## Notes

- [P] tasks = 不同文件，无依赖
- [Story] label 映射到具体用户故事
- 每个用户故事应独立可测试
- 完成每个 Checkpoint 后验证
- 保留 V1 资源文件（assets/），仅重构代码
- 关卡数据格式兼容 V1，通过适配层转换
