# Research: 游戏引擎重构 - 超级马里奥 V2

**Branch**: `002-game-engine-refactor` | **Date**: 2025-12-12

## 1. Phaser.js 游戏引擎

### Decision
使用 Phaser 3.x 作为游戏引擎，通过 CDN 引入（无需构建工具）。

### Rationale
- **成熟稳定**: Phaser 是最流行的 HTML5 2D 游戏框架，10+ 年历史，社区活跃
- **内置物理引擎**: Arcade Physics 专为平台游戏优化，碰撞检测可靠
- **零配置**: 支持 CDN 直接引入，无需 npm/webpack 等构建工具
- **完善文档**: 官方示例丰富，平台跳跃游戏模板众多
- **性能优秀**: WebGL 优先渲染，自动降级到 Canvas

### Alternatives Considered
| 引擎 | 优点 | 缺点 | 排除原因 |
|------|------|------|----------|
| PixiJS + Matter.js | 渲染性能极强 | 需要单独集成物理引擎 | 增加复杂度 |
| Kaboom.js | 极简 API，学习曲线低 | 社区较小，功能有限 | 长期维护风险 |
| 原生 Canvas 优化 | 无依赖 | 需要重写碰撞系统 | 工作量大，效果不确定 |

---

## 2. Phaser Arcade Physics 碰撞系统

### Decision
使用 Phaser Arcade Physics 替代 V1 的手动 AABB 碰撞检测。

### Rationale
- **自动碰撞解析**: 内置 `collide()` 和 `overlap()` 方法，自动处理碰撞响应
- **物理体分离**: 支持 `body.setSize()` 自定义碰撞体大小，解决视觉与碰撞不一致问题
- **隧道效应防护**: 内置高速物体碰撞检测，防止穿墙
- **分组碰撞**: 支持 Group 批量碰撞检测，性能优秀
- **单向平台**: 内置 `checkCollision.up = false` 实现单向平台

### Key APIs
```javascript
// 碰撞检测
this.physics.add.collider(player, platforms);
this.physics.add.overlap(player, coins, collectCoin);

// 自定义碰撞体
player.body.setSize(28, 30);  // 比精灵略小
player.body.setOffset(2, 2);

// 单向平台
platform.body.checkCollision.down = false;
platform.body.checkCollision.left = false;
platform.body.checkCollision.right = false;
```

---

## 3. 平台跳跃操控手感

### Decision
采用经典马里奥物理参数，结合 Phaser 的 `setDrag()` 和 `setAcceleration()` 实现。

### Rationale
- **可变跳跃高度**: 通过检测跳跃键持续时间调整垂直速度
- **空中控制**: 允许空中水平加速，但降低加速度
- **地面摩擦**: 使用 `setDragX()` 实现平滑减速
- **即时响应**: 直接设置速度而非加速度，确保响应及时

### Implementation Pattern
```javascript
// 可变跳跃
if (cursors.up.isDown && player.body.onFloor()) {
    player.setVelocityY(-400);
    this.jumpTimer = 0;
}
if (cursors.up.isDown && this.jumpTimer < 250) {
    player.setVelocityY(player.body.velocity.y - 15);
    this.jumpTimer += delta;
}

// 水平移动（地面 vs 空中）
const accel = player.body.onFloor() ? 600 : 400;
if (cursors.left.isDown) {
    player.setAccelerationX(-accel);
} else if (cursors.right.isDown) {
    player.setAccelerationX(accel);
} else {
    player.setAccelerationX(0);
}
```

---

## 4. 踩踏敌人判定

### Decision
基于玩家垂直速度和碰撞位置判定踩踏。

### Rationale
- **速度判定**: 玩家 `velocity.y > 0`（下落中）时才可能踩踏
- **位置判定**: 玩家底部在敌人顶部 1/3 区域内
- **碰撞回调**: 使用 `process` 回调在碰撞前判定

### Implementation Pattern
```javascript
this.physics.add.overlap(player, enemies, (player, enemy) => {
    if (player.body.velocity.y > 0 && player.y + player.height < enemy.y + enemy.height * 0.4) {
        // 踩踏成功
        enemy.stomp();
        player.setVelocityY(-300); // 弹跳
    } else {
        // 受伤
        player.takeDamage();
    }
});
```

---

## 5. 关卡数据迁移

### Decision
复用 V1 关卡数据格式，通过适配层转换为 Phaser Tilemap。

### Rationale
- **数据兼容**: V1 的 `tiles` 二维数组可直接转换为 Phaser Tilemap
- **实体复用**: V1 的 `entities` 数组格式可直接遍历创建 Phaser Sprite
- **最小改动**: 无需重新设计关卡，降低重构风险

### Migration Pattern
```javascript
// 从 V1 数据创建 Tilemap
const map = this.make.tilemap({
    data: level1Data.tiles,
    tileWidth: 32,
    tileHeight: 32
});

// 创建实体
level1Data.entities.forEach(entity => {
    if (entity.type === 'goomba') {
        this.enemies.add(new Goomba(this, entity.x, entity.y));
    }
});
```

---

## 6. 资源加载策略

### Decision
使用 Phaser 内置的 Loader 在 BootScene 中预加载所有资源。

### Rationale
- **进度反馈**: Phaser Loader 支持 `progress` 事件
- **资源缓存**: 加载后自动缓存，Scene 间共享
- **错误处理**: 内置加载失败回调

### Implementation Pattern
```javascript
class BootScene extends Phaser.Scene {
    preload() {
        // 进度条
        this.load.on('progress', (value) => {
            progressBar.style.width = `${value * 100}%`;
        });
        
        // 加载资源
        this.load.spritesheet('mario', 'assets/sprites/mario.png', { frameWidth: 32, frameHeight: 32 });
        this.load.image('tiles', 'assets/sprites/tiles.png');
        this.load.audio('jump', 'assets/audio/jump.wav');
    }
    
    create() {
        this.scene.start('GameScene');
    }
}
```

---

## 7. Phaser CDN 引入方式

### Decision
通过 `<script>` 标签从 CDN 引入 Phaser，保持无构建工具的开发方式。

### Rationale
- **简单直接**: 与 V1 开发方式一致
- **快速加载**: CDN 有缓存优势
- **版本锁定**: 指定版本号确保稳定

### Implementation
```html
<!-- index.html -->
<script src="https://cdn.jsdelivr.net/npm/phaser@3.70.0/dist/phaser.min.js"></script>
<script type="module" src="src/main.js"></script>
```

---

## Summary

所有技术决策已明确，无需进一步澄清：

| 领域 | 决策 |
|------|------|
| 游戏引擎 | Phaser 3.70.0 via CDN |
| 物理系统 | Arcade Physics |
| 碰撞检测 | Phaser 内置 collide/overlap |
| 操控手感 | 可变跳跃 + 地面/空中差异化加速 |
| 踩踏判定 | 速度 + 位置双重判定 |
| 关卡数据 | 复用 V1 格式，适配层转换 |
| 资源加载 | Phaser Loader + 进度回调 |
