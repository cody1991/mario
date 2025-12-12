# Quickstart: 超级马里奥 Web 版 V1

**Date**: 2025-12-12  
**Branch**: `001-mario-game-v1`

## Prerequisites

- 现代浏览器（Chrome 80+、Firefox 75+、Safari 13+、Edge 80+）
- 本地 HTTP 服务器（用于加载资源，避免 CORS 问题）
- 文本编辑器（VS Code 推荐）

## Quick Start

### 1. 启动本地服务器

```bash
# 方式 1: Python (推荐)
cd /path/to/chaojimaliao
python3 -m http.server 8080

# 方式 2: Node.js
npx serve .

# 方式 3: VS Code Live Server 插件
# 右键 index.html → Open with Live Server
```

### 2. 打开游戏

浏览器访问: `http://localhost:8080`

### 3. 游戏控制

| 按键 | 动作 |
|------|------|
| ← / A | 向左移动 |
| → / D | 向右移动 |
| ↑ / W / Space | 跳跃 |
| P | 暂停/继续 |
| R | 重新开始 |

## Project Structure

```
chaojimaliao/
├── index.html          # 入口页面
├── style.css           # 基础样式
├── src/
│   ├── main.js         # 游戏入口
│   ├── game.js         # 游戏循环
│   ├── input.js        # 输入处理
│   ├── loader.js       # 资源加载
│   ├── entities/       # 游戏实体
│   ├── levels/         # 关卡数据
│   └── utils/          # 工具函数
└── assets/
    ├── sprites/        # 精灵图
    └── audio/          # 音效
```

## Development Workflow

### 修改游戏参数

编辑 `src/utils/constants.js`:

```javascript
// 调整马里奥跳跃高度
MARIO_JUMP_FORCE: -15,  // 更高的跳跃

// 调整游戏难度
GOOMBA_SPEED: 2,        // 更快的敌人
```

### 添加新敌人

1. 在 `src/entities/` 创建新文件
2. 继承 `Enemy` 基类
3. 在 `src/levels/level1.js` 添加实体

### 修改关卡

编辑 `src/levels/level1.js`:

```javascript
// 瓦片类型: 0=空, 1=地面, 2=砖块, 3=问号砖块
tiles: [
  [0,0,0,0,2,2,2,0,0,0],  // 添加砖块
  // ...
],

// 添加敌人
entities: [
  { type: 'goomba', x: 800, y: 384 },
  // ...
]
```

## Testing Checklist

### P1: 基础移动与跳跃
- [ ] 按左右键马里奥移动
- [ ] 按跳跃键马里奥跳起
- [ ] 空中可调整方向
- [ ] 落地有惯性

### P2: 关卡场景与平台
- [ ] 可以站在平台上
- [ ] 碰到砖块被阻挡
- [ ] 画面跟随滚动
- [ ] 左边界锁定

### P3: 敌人与碰撞
- [ ] 敌人自动移动
- [ ] 踩踏消灭敌人
- [ ] 侧面碰撞受伤
- [ ] 敌人遇障碍转向

### P4: 金币收集
- [ ] 接触金币消失
- [ ] 分数增加
- [ ] 分数显示更新

### P5: 游戏状态
- [ ] 游戏可以开始
- [ ] 死亡可以重新开始
- [ ] 到达终点显示胜利

## Troubleshooting

### 图片不显示
- 确保使用 HTTP 服务器运行（不是直接打开 HTML 文件）
- 检查浏览器控制台是否有 CORS 错误
- 确认图片路径正确

### 游戏卡顿
- 关闭其他占用 CPU 的程序
- 检查是否有无限循环
- 使用浏览器 Performance 工具分析

### 碰撞异常
- 检查实体的 width/height 是否正确
- 确认碰撞检测逻辑
- 使用 debug 模式绘制碰撞框

## Debug Mode

在 `src/main.js` 中启用:

```javascript
const DEBUG = true;  // 显示碰撞框、FPS、坐标
```

## Performance Tips

1. 使用 Sprite Sheet 减少图片加载
2. 只渲染可见区域的实体
3. 避免在游戏循环中创建新对象
4. 使用 `requestAnimationFrame` 而非 `setInterval`
