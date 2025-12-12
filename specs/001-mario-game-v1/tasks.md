# Tasks: 超级马里奥 Web 版 V1

**Input**: Design documents from `/specs/001-mario-game-v1/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: 手动测试（无自动化测试要求）

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/` at repository root
- Assets in `assets/` directory

---

## Phase 1: Setup (Shared Infrastructure) ✅

**Purpose**: Project initialization, entry files, and core utilities

- [x] T001 Create project directory structure: `src/`, `src/entities/`, `src/levels/`, `src/utils/`, `assets/sprites/`, `assets/audio/`
- [x] T002 Create entry HTML file with canvas element in `index.html`
- [x] T003 [P] Create base CSS styles in `style.css`
- [x] T004 [P] Create game constants configuration in `src/utils/constants.js`
- [x] T005 [P] Create AABB collision detection utilities in `src/utils/collision.js`

---

## Phase 2: Foundational (Blocking Prerequisites) ✅

**Purpose**: Core game infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T006 Implement AssetLoader class with Promise-based preloading in `src/loader.js`
- [x] T007 Implement Sprite class for animation management in `src/sprite.js`
- [x] T008 Implement Entity base class with update/render methods in `src/entities/entity.js`
- [x] T009 Implement InputHandler class for keyboard state management in `src/input.js`
- [x] T010 Implement Camera class for viewport management in `src/camera.js`
- [x] T011 Implement Game class with game loop (requestAnimationFrame + fixed timestep) in `src/game.js`
- [x] T012 Create main entry point that initializes game in `src/main.js`
- [x] T013 [P] Download/create Mario sprite sheet and save to `assets/sprites/mario.png`
- [x] T014 [P] Download/create tiles sprite sheet and save to `assets/sprites/tiles.png`

**Checkpoint**: Foundation ready - game loop runs, assets load, empty canvas renders ✅

---

## Phase 3: User Story 1 - 基础移动与跳跃 (Priority: P1) 🎯 MVP ✅

**Goal**: 玩家可以使用键盘控制马里奥左右移动和跳跃

**Independent Test**: 在空白场景中自由移动马里奥，验证左右移动流畅、跳跃高度合理、落地自然

### Implementation for User Story 1

- [x] T015 [US1] Implement Mario class extending Entity with physics (gravity, velocity) in `src/entities/mario.js`
- [x] T016 [US1] Add keyboard input handling for Mario movement (left/right/jump) in `src/entities/mario.js`
- [x] T017 [US1] Implement Mario sprite animations (idle, walk, jump) in `src/entities/mario.js`
- [x] T018 [US1] Add ground collision detection for Mario (prevent falling through floor) in `src/entities/mario.js`
- [x] T019 [US1] Integrate Mario into Game class and render loop in `src/game.js`
- [x] T020 [US1] Add simple ground platform for testing movement in `src/game.js`

**Checkpoint**: Mario moves left/right with arrow keys, jumps with space, has gravity and lands on ground ✅

---

## Phase 4: User Story 2 - 关卡场景与平台 (Priority: P2) ✅

**Goal**: 玩家可以在包含地面、平台、砖块的关卡场景中游玩

**Independent Test**: 在包含多层平台的关卡中跳跃穿行，验证碰撞检测正确、平台可站立

### Implementation for User Story 2

- [x] T021 [US2] Implement Level class with tile map data structure in `src/levels/level.js`
- [x] T022 [US2] Create Level 1 tile map data (ground, platforms, bricks) in `src/levels/level1.js`
- [x] T023 [US2] Implement tile rendering from sprite sheet in `src/levels/level.js`
- [x] T024 [US2] Implement Mario-to-tile collision detection (all 4 directions) in `src/utils/collision.js`
- [x] T025 [US2] Update Mario to use tile-based collision instead of simple ground in `src/entities/mario.js`
- [x] T026 [US2] Implement Camera following Mario with left-boundary lock in `src/camera.js`
- [x] T027 [US2] Integrate Level and Camera into Game rendering in `src/game.js`

**Checkpoint**: Mario can navigate a level with platforms, camera follows, collisions work correctly ✅

---

## Phase 5: User Story 3 - 敌人与碰撞 (Priority: P3) ✅

**Goal**: 关卡中存在敌人，玩家需要躲避或踩踏消灭敌人

**Independent Test**: 在有敌人的场景中游玩，验证敌人移动正常、碰撞判定准确

### Implementation for User Story 3

- [x] T028 [P] [US3] Download/create enemy sprite sheet and save to `assets/sprites/enemies.png`
- [x] T029 [US3] Implement Enemy base class with patrol movement in `src/entities/enemy.js`
- [x] T030 [US3] Implement Goomba class extending Enemy with squish animation in `src/entities/goomba.js`
- [x] T031 [US3] Add enemy-to-tile collision (turn at edges/walls) in `src/entities/enemy.js`
- [x] T032 [US3] Implement Mario-to-Enemy collision detection (stomp vs side hit) in `src/utils/collision.js`
- [x] T033 [US3] Add Mario damage/death handling when hit by enemy in `src/entities/mario.js`
- [x] T034 [US3] Add enemy spawn points to Level 1 data in `src/levels/level1.js`
- [x] T035 [US3] Integrate enemies into Level and Game loop in `src/game.js`

**Checkpoint**: Enemies patrol, Mario can stomp them or get hurt, game handles Mario death ✅

---

## Phase 6: User Story 4 - 金币收集 (Priority: P4) ✅

**Goal**: 关卡中散布着金币，玩家可以收集金币获得分数

**Independent Test**: 在关卡中收集金币，验证金币消失、分数增加

### Implementation for User Story 4

- [x] T036 [P] [US4] Download/create items sprite sheet (coins) and save to `assets/sprites/items.png`
- [x] T037 [US4] Implement Coin class with spin animation in `src/entities/coin.js`
- [x] T038 [US4] Implement Mario-to-Coin collision (collect on touch) in `src/utils/collision.js`
- [x] T039 [US4] Add score tracking to Game class in `src/game.js`
- [x] T040 [US4] Implement HUD rendering (score display) in `src/game.js`
- [x] T041 [US4] Add coin spawn points to Level 1 data in `src/levels/level1.js`
- [x] T042 [US4] Integrate coins into Level and Game loop in `src/game.js`

**Checkpoint**: Coins appear in level, Mario collects them, score updates on screen ✅

---

## Phase 7: User Story 5 - 游戏状态管理 (Priority: P5) ✅

**Goal**: 游戏具有开始、进行中、胜利、失败等状态

**Independent Test**: 从开始界面进入游戏，死亡后可以重新开始，到达终点显示胜利

### Implementation for User Story 5

- [x] T043 [US5] Implement GameState enum and state machine in `src/game.js`
- [x] T044 [US5] Implement start screen UI (press any key to start) in `src/game.js`
- [x] T045 [US5] Implement game over screen with restart option in `src/game.js`
- [x] T046 [US5] Implement victory screen when reaching goal in `src/game.js`
- [x] T047 [US5] Add goal/flag entity to Level 1 in `src/levels/level1.js`
- [x] T048 [US5] Implement Mario-to-Goal collision (trigger win) in `src/utils/collision.js`
- [x] T049 [US5] Add pause functionality (P key) in `src/game.js`
- [x] T050 [US5] Add restart functionality (R key) in `src/game.js`
- [x] T051 [US5] Handle window blur event (auto-pause) in `src/game.js`

**Checkpoint**: Complete game loop - start, play, win/lose, restart all functional ✅

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T052 [P] Add jump sound effect in `assets/audio/jump.wav` and integrate
- [ ] T053 [P] Add coin collect sound effect in `assets/audio/coin.wav` and integrate
- [x] T054 Add death animation for Mario in `src/entities/mario.js`
- [x] T055 Add invincibility frames after Mario takes damage in `src/entities/mario.js`
- [x] T056 Fine-tune physics parameters (gravity, jump force, speed) in `src/utils/constants.js`
- [ ] T057 Add responsive canvas scaling for different screen sizes in `src/game.js`
- [ ] T058 Run quickstart.md validation checklist
- [ ] T059 Browser compatibility testing (Chrome, Firefox, Safari, Edge)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: ✅ Complete
- **Foundational (Phase 2)**: ✅ Complete
- **User Stories (Phase 3-7)**: ✅ All Complete
- **Polish (Phase 8)**: In Progress

### Summary

| Phase | Status | Tasks |
|-------|--------|-------|
| Phase 1: Setup | ✅ Complete | 5/5 |
| Phase 2: Foundational | ✅ Complete | 9/9 |
| Phase 3: US1 | ✅ Complete | 6/6 |
| Phase 4: US2 | ✅ Complete | 7/7 |
| Phase 5: US3 | ✅ Complete | 8/8 |
| Phase 6: US4 | ✅ Complete | 7/7 |
| Phase 7: US5 | ✅ Complete | 9/9 |
| Phase 8: Polish | 🔄 Partial | 3/8 |
| **Total** | **54/59** | **92%** |

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Assets can be downloaded from OpenGameArt.org, itch.io, or Kenney.nl
- 精灵图生成器: `assets/sprites/generate-sprites.html`
