/**
 * Phaser 游戏入口
 * 初始化 Phaser.Game 实例
 */

import BootScene from './scenes/BootScene.js';
import GameScene from './scenes/GameScene.js';
import UIScene from './scenes/UIScene.js';
import { GAME_CONFIG, PHYSICS } from './config/constants.js';

// Phaser 游戏配置
const config = {
    type: Phaser.AUTO,
    width: GAME_CONFIG.CANVAS_WIDTH,
    height: GAME_CONFIG.CANVAS_HEIGHT,
    parent: 'game-container',
    backgroundColor: '#5c94fc',
    scale: {
        mode: Phaser.Scale.FIT,           // 保持比例适配窗口
        autoCenter: Phaser.Scale.CENTER_BOTH,  // 居中显示
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: PHYSICS.GRAVITY },
            debug: false  // 开发时设为 true 查看碰撞体
        }
    },
    fps: {
        target: GAME_CONFIG.TARGET_FPS,
        forceSetTimeOut: false
    },
    scene: [BootScene, GameScene, UIScene],
    pixelArt: true,
    roundPixels: true,
};

// 等待 DOM 加载完成后创建游戏
window.addEventListener('DOMContentLoaded', () => {
    const game = new Phaser.Game(config);
    
    // 调试模式下暴露给控制台
    if (window.location.hostname === 'localhost') {
        window.game = game;
    }
});

// 阻止右键菜单
document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});
