# Research: 超级马里奥 Web 版 V1

**Date**: 2025-12-12  
**Branch**: `001-mario-game-v1`

## 1. 游戏循环架构

**Decision**: 使用 requestAnimationFrame + 固定时间步长（Fixed Timestep）

**Rationale**:
- requestAnimationFrame 自动与显示器刷新率同步，节省 CPU/GPU 资源
- 固定时间步长（16.67ms = 60 FPS）确保物理计算在不同设备上一致
- 分离 update() 和 render() 便于调试和性能优化

**Alternatives Considered**:
- setInterval：不与屏幕刷新同步，可能导致画面撕裂
- 可变时间步长：物理行为在不同帧率下不一致

**Implementation Pattern**:
```javascript
const FIXED_TIMESTEP = 1000 / 60; // 16.67ms
let accumulator = 0;
let lastTime = 0;

function gameLoop(currentTime) {
  const deltaTime = currentTime - lastTime;
  lastTime = currentTime;
  accumulator += deltaTime;
  
  while (accumulator >= FIXED_TIMESTEP) {
    update(FIXED_TIMESTEP);
    accumulator -= FIXED_TIMESTEP;
  }
  
  render();
  requestAnimationFrame(gameLoop);
}
```

## 2. 碰撞检测算法

**Decision**: AABB（Axis-Aligned Bounding Box）碰撞检测

**Rationale**:
- 计算简单高效，适合矩形碰撞体
- 经典马里奥游戏的标准做法
- 易于实现方向判定（上下左右）

**Alternatives Considered**:
- 像素级碰撞：精度高但性能开销大，对于像素风格游戏过度设计
- 圆形碰撞：不适合矩形角色和平台

**Implementation Pattern**:
```javascript
function checkCollision(a, b) {
  return a.x < b.x + b.width &&
         a.x + a.width > b.x &&
         a.y < b.y + b.height &&
         a.y + a.height > b.y;
}

function getCollisionSide(mario, obstacle) {
  const overlapLeft = (mario.x + mario.width) - obstacle.x;
  const overlapRight = (obstacle.x + obstacle.width) - mario.x;
  const overlapTop = (mario.y + mario.height) - obstacle.y;
  const overlapBottom = (obstacle.y + obstacle.height) - mario.y;
  
  const minOverlapX = Math.min(overlapLeft, overlapRight);
  const minOverlapY = Math.min(overlapTop, overlapBottom);
  
  if (minOverlapX < minOverlapY) {
    return overlapLeft < overlapRight ? 'left' : 'right';
  } else {
    return overlapTop < overlapBottom ? 'top' : 'bottom';
  }
}
```

## 3. 精灵动画系统

**Decision**: Sprite Sheet + 帧序列配置

**Rationale**:
- 减少 HTTP 请求，所有帧合并为一张图
- 帧序列配置灵活，易于添加新动画
- 经典 2D 游戏的标准做法

**Implementation Pattern**:
```javascript
class Sprite {
  constructor(image, frameWidth, frameHeight, animations) {
    this.image = image;
    this.frameWidth = frameWidth;
    this.frameHeight = frameHeight;
    this.animations = animations; // { idle: [0], run: [1,2,3], jump: [4] }
    this.currentAnimation = 'idle';
    this.currentFrame = 0;
    this.frameTimer = 0;
    this.frameInterval = 100; // ms per frame
  }
  
  update(deltaTime) {
    this.frameTimer += deltaTime;
    if (this.frameTimer >= this.frameInterval) {
      const frames = this.animations[this.currentAnimation];
      this.currentFrame = (this.currentFrame + 1) % frames.length;
      this.frameTimer = 0;
    }
  }
  
  draw(ctx, x, y) {
    const frameIndex = this.animations[this.currentAnimation][this.currentFrame];
    const sx = (frameIndex % this.cols) * this.frameWidth;
    const sy = Math.floor(frameIndex / this.cols) * this.frameHeight;
    ctx.drawImage(this.image, sx, sy, this.frameWidth, this.frameHeight, x, y, this.frameWidth, this.frameHeight);
  }
}
```

## 4. 输入处理模式

**Decision**: 状态机模式，解耦输入与游戏逻辑

**Rationale**:
- 输入状态独立于游戏循环，避免事件丢失
- 便于支持多种输入方式（键盘、触屏）
- 可轻松实现按键组合和缓冲

**Implementation Pattern**:
```javascript
class InputHandler {
  constructor() {
    this.keys = {
      left: false,
      right: false,
      jump: false
    };
    
    window.addEventListener('keydown', (e) => this.handleKey(e, true));
    window.addEventListener('keyup', (e) => this.handleKey(e, false));
  }
  
  handleKey(e, isPressed) {
    switch(e.code) {
      case 'ArrowLeft':
      case 'KeyA':
        this.keys.left = isPressed;
        break;
      case 'ArrowRight':
      case 'KeyD':
        this.keys.right = isPressed;
        break;
      case 'Space':
      case 'ArrowUp':
      case 'KeyW':
        this.keys.jump = isPressed;
        break;
    }
  }
}
```

## 5. 资源加载策略

**Decision**: Promise-based 预加载 + 加载进度显示

**Rationale**:
- 确保所有资源就绪后再启动游戏
- 提供加载进度反馈，提升用户体验
- 使用 Promise.all 并行加载

**Implementation Pattern**:
```javascript
class AssetLoader {
  constructor() {
    this.images = {};
    this.audio = {};
  }
  
  loadImage(name, src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.images[name] = img;
        resolve(img);
      };
      img.onerror = reject;
      img.src = src;
    });
  }
  
  async loadAll(manifest, onProgress) {
    const total = manifest.length;
    let loaded = 0;
    
    const promises = manifest.map(async (item) => {
      await this.loadImage(item.name, item.src);
      loaded++;
      onProgress?.(loaded / total);
    });
    
    await Promise.all(promises);
  }
}
```

## 6. 关卡数据格式

**Decision**: 二维数组 + 实体列表

**Rationale**:
- 二维数组直观表示瓦片地图
- 实体列表存储敌人、金币等动态对象位置
- 易于手工编辑和扩展

**Implementation Pattern**:
```javascript
const level1 = {
  width: 200,  // tiles
  height: 15,  // tiles
  tileSize: 32,
  
  // 0=空, 1=地面, 2=砖块, 3=问号砖块
  tiles: [
    [0,0,0,0,0,0,0,0,0,0,...],
    [0,0,0,0,0,0,0,0,0,0,...],
    // ...
    [1,1,1,1,1,1,1,1,1,1,...],
  ],
  
  entities: [
    { type: 'mario', x: 64, y: 384 },
    { type: 'goomba', x: 640, y: 384 },
    { type: 'coin', x: 320, y: 256 },
    // ...
  ],
  
  goal: { x: 6200, y: 0 }  // 终点旗杆位置
};
```

## 7. 素材资源来源

**Decision**: 使用开源/免费像素素材

**Rationale**:
- 项目为学习/复刻目的，使用免费资源
- 经典马里奥风格素材广泛可用
- 可后续替换为原创素材

**Recommended Sources**:
- OpenGameArt.org - 免费游戏素材
- itch.io - 像素素材包
- Kenney.nl - 免费游戏资产
- The Spriters Resource - 参考用（注意版权）

**Asset Requirements**:
| 素材 | 尺寸 | 帧数 | 说明 |
|------|------|------|------|
| Mario | 16x16 或 32x32 | 6+ | idle, run(3), jump, die |
| Goomba | 16x16 | 3 | walk(2), squished |
| Tiles | 16x16 或 32x32 | 10+ | ground, brick, question, pipe |
| Coin | 16x16 | 4 | 旋转动画 |
| Flag | 16x16 | 1 | 终点旗杆 |

## 8. 马里奥物理参数

**Decision**: 基于经典 NES 版本的物理参数

**Rationale**:
- 复刻经典手感
- 经过验证的游戏体验

**Parameters** (基于 32px 瓦片):
```javascript
const PHYSICS = {
  GRAVITY: 0.5,           // 重力加速度
  MAX_FALL_SPEED: 10,     // 最大下落速度
  WALK_SPEED: 3,          // 行走速度
  RUN_SPEED: 5,           // 奔跑速度
  JUMP_FORCE: -12,        // 跳跃初速度
  FRICTION: 0.8,          // 地面摩擦
  AIR_RESISTANCE: 0.95    // 空气阻力
};
```

## Summary

所有技术决策已完成，无 NEEDS CLARIFICATION 项。技术栈简洁：
- 纯 JavaScript ES6+，无构建工具
- HTML5 Canvas 2D 渲染
- 标准游戏循环 + AABB 碰撞
- Sprite Sheet 动画系统
- Promise-based 资源加载

可进入 Phase 1 设计阶段。
