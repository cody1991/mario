/**
 * 游戏入口
 * 初始化并启动游戏
 */

import { Game } from './game.js';

// 调试模式
const DEBUG = false;

// 等待 DOM 加载完成
window.addEventListener('DOMContentLoaded', async () => {
    // 获取画布元素
    const canvas = document.getElementById('game-canvas');
    
    if (!canvas) {
        console.error('Canvas element not found!');
        return;
    }

    // 创建游戏实例
    const game = new Game(canvas);

    try {
        // 初始化游戏
        await game.init();
        
        // 启动游戏循环
        game.start();
        
        if (DEBUG) {
            console.log('Game started successfully!');
            window.game = game; // 暴露给控制台调试
        }
    } catch (error) {
        console.error('Failed to initialize game:', error);
        
        // 显示错误信息
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.innerHTML = `
                <div class="loading-text" style="color: #e52521;">
                    加载失败: ${error.message}
                </div>
                <div class="loading-text" style="font-size: 16px; margin-top: 10px;">
                    请刷新页面重试
                </div>
            `;
        }
    }
});

// 处理窗口失去焦点
window.addEventListener('blur', () => {
    // 游戏会自动暂停（在 InputHandler 中处理）
});

// 阻止右键菜单
document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});
