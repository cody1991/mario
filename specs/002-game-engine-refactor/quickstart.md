# Quickstart: 游戏引擎重构 - 超级马里奥 V2

**Branch**: `002-game-engine-refactor` | **Date**: 2025-12-12

## 概述

本指南帮助开发者快速理解和启动 Phaser.js 重构版超级马里奥游戏的开发。

---

## 前置条件

- 现代浏览器（Chrome/Firefox/Safari/Edge）
- 本地 HTTP 服务器（用于开发调试）
- 基本的 JavaScript ES6+ 知识
- 了解 Phaser.js 基础概念（Scene、Sprite、Physics）

---

## 快速开始

### 1. 启动开发服务器

```bash
# 方式 1: Python
python3 -m http.server 8080

# 方式 2: Node.js
npx serve .

# 方式 3: VS Code Live Server 插件
```

### 2. 访问游戏

打开浏览器访问 `http://localhost:8080`

### 3. 游戏操作

| 按键 | 功能 |
|------|------|
| ← / A | 向左移动 |
| → / D | 向右移动 |
| 空格 / ↑ / W | 跳跃（长按跳更高） |
| P | 暂停/继续 |
| R | 重新开始（游戏结束时） |

---

## 项目结构

```
chaojimaliao/
├── index.html              # 入口页面
├── style.css               # 样式
├── src/
│   ├── main.js             # Phaser 配置和启动
│   ├── scenes/
│   │   ├── BootScene.js    # 资源预加载
│   │   ├── GameScene.js    # 主游戏逻辑
│   │   └── UIScene.js      # HUD 和界面
│   ├── entities/
│   │   ├── Player.js       # 玩家角色
│   │   ├── Enemy.js        # 敌人基类
│   │   ├── Goomba.js       # 栗子怪
│   │   └── Coin.js         # 金币
│   ├── levels/
│   │   └── level1.js       # 关卡数据（复用 V1）
│   └── config/
│       └── constants.js    # 游戏配置
└── assets/
    ├── sprites/            # 精灵图
    └── audio/              # 音效
```

---

## 核心代码示例

### Phaser 游戏配置 (main.js)

```javascript
import BootScene from './scenes/BootScene.js';
import GameScene from './scenes/GameScene.js';
import UIScene from './scenes/UIScene.js';

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 480,
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 800 },
            debug: false  // 开发时设为 true 查看碰撞体
        }
    },
    scene: [BootScene, GameScene, UIScene]
};

new Phaser.Game(config);
```

### 玩家控制 (Player.js)

```javascript
export default class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'mario');
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // 物理设置
        this.body.setSize(28, 30);
        this.body.setOffset(2, 2);
        this.setCollideWorldBounds(true);
        
        // 状态
        this.jumpTimer = 0;
        this.isJumping = false;
    }
    
    update(cursors, delta) {
        // 水平移动
        if (cursors.left.isDown) {
            this.setAccelerationX(-600);
            this.setFlipX(true);
        } else if (cursors.right.isDown) {
            this.setAccelerationX(600);
            this.setFlipX(false);
        } else {
            this.setAccelerationX(0);
        }
        
        // 跳跃
        if (cursors.up.isDown && this.body.onFloor()) {
            this.setVelocityY(-400);
            this.isJumping = true;
            this.jumpTimer = 0;
        }
        
        // 可变跳跃高度
        if (cursors.up.isDown && this.isJumping && this.jumpTimer < 250) {
            this.setVelocityY(this.body.velocity.y - 15);
            this.jumpTimer += delta;
        }
        
        if (cursors.up.isUp) {
            this.isJumping = false;
        }
    }
}
```

### 碰撞设置 (GameScene.js)

```javascript
create() {
    // 创建地图
    this.platforms = this.physics.add.staticGroup();
    this.createLevel();
    
    // 创建玩家
    this.player = new Player(this, 96, 384);
    
    // 创建敌人组
    this.enemies = this.physics.add.group();
    this.createEnemies();
    
    // 碰撞检测
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.enemies, this.platforms);
    
    // 玩家与敌人交互
    this.physics.add.overlap(this.player, this.enemies, this.handleEnemyCollision, null, this);
}

handleEnemyCollision(player, enemy) {
    if (player.body.velocity.y > 0 && player.y + player.height < enemy.y + 10) {
        // 踩踏
        enemy.stomp();
        player.setVelocityY(-300);
        this.score += 200;
    } else if (!player.isInvincible) {
        // 受伤
        player.takeDamage();
        this.lives--;
    }
}
```

---

## 开发调试

### 启用物理调试

```javascript
// main.js 中设置
physics: {
    arcade: {
        debug: true  // 显示碰撞体边界
    }
}
```

### 常用调试命令（浏览器控制台）

```javascript
// 获取游戏实例
const game = Phaser.Game.instances[0];

// 获取当前场景
const scene = game.scene.getScene('GameScene');

// 查看玩家状态
console.log(scene.player.body.velocity);

// 暂停/恢复游戏
scene.physics.pause();
scene.physics.resume();
```

---

## 常见问题

### Q: 资源加载失败
A: 确保使用 HTTP 服务器访问，不要直接打开 HTML 文件（file:// 协议有跨域限制）

### Q: 碰撞不准确
A: 检查 `body.setSize()` 和 `body.setOffset()` 设置，确保碰撞体与视觉匹配

### Q: 跳跃手感不好
A: 调整 `JUMP_VELOCITY`、`GRAVITY` 和 `MAX_JUMP_TIME` 参数

### Q: 帧率不稳定
A: 检查是否有内存泄漏（未销毁的 Sprite），使用 `sprite.destroy()` 清理

---

## 相关文档

- [Phaser 3 官方文档](https://photonstorm.github.io/phaser3-docs/)
- [Phaser 3 示例](https://phaser.io/examples)
- [Arcade Physics 指南](https://rexrainbow.github.io/phaser3-rex-notes/docs/site/arcade-world/)
- [spec.md](./spec.md) - 功能规格说明
- [data-model.md](./data-model.md) - 数据模型定义
- [research.md](./research.md) - 技术研究
