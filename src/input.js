/**
 * 输入处理器
 * 管理键盘输入状态
 */

import { KEYS } from './utils/constants.js';

export class InputHandler {
    constructor() {
        // 按键状态
        this.keys = {
            left: false,
            right: false,
            jump: false,
        };
        
        // 单次触发状态（用于跳跃等需要按一次触发的操作）
        this.justPressed = {
            jump: false,
            pause: false,
            restart: false,
        };
        
        // 上一帧的按键状态
        this._previousKeys = {
            jump: false,
            pause: false,
            restart: false,
        };
        
        // 绑定事件
        this._bindEvents();
    }

    /**
     * 绑定键盘事件
     */
    _bindEvents() {
        window.addEventListener('keydown', (e) => this._handleKeyDown(e));
        window.addEventListener('keyup', (e) => this._handleKeyUp(e));
        
        // 窗口失去焦点时重置所有按键
        window.addEventListener('blur', () => this._resetAllKeys());
    }

    /**
     * 处理按键按下
     * @param {KeyboardEvent} e 
     */
    _handleKeyDown(e) {
        // 阻止方向键滚动页面
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
            e.preventDefault();
        }
        
        if (KEYS.LEFT.includes(e.code)) {
            this.keys.left = true;
        }
        if (KEYS.RIGHT.includes(e.code)) {
            this.keys.right = true;
        }
        if (KEYS.JUMP.includes(e.code)) {
            this.keys.jump = true;
        }
        if (KEYS.PAUSE.includes(e.code)) {
            this.keys.pause = true;
        }
        if (KEYS.RESTART.includes(e.code)) {
            this.keys.restart = true;
        }
    }

    /**
     * 处理按键释放
     * @param {KeyboardEvent} e 
     */
    _handleKeyUp(e) {
        if (KEYS.LEFT.includes(e.code)) {
            this.keys.left = false;
        }
        if (KEYS.RIGHT.includes(e.code)) {
            this.keys.right = false;
        }
        if (KEYS.JUMP.includes(e.code)) {
            this.keys.jump = false;
        }
        if (KEYS.PAUSE.includes(e.code)) {
            this.keys.pause = false;
        }
        if (KEYS.RESTART.includes(e.code)) {
            this.keys.restart = false;
        }
    }

    /**
     * 重置所有按键状态
     */
    _resetAllKeys() {
        this.keys.left = false;
        this.keys.right = false;
        this.keys.jump = false;
        this.keys.pause = false;
        this.keys.restart = false;
    }

    /**
     * 更新单次触发状态（每帧调用一次）
     */
    update() {
        // 检测刚按下的按键
        this.justPressed.jump = this.keys.jump && !this._previousKeys.jump;
        this.justPressed.pause = this.keys.pause && !this._previousKeys.pause;
        this.justPressed.restart = this.keys.restart && !this._previousKeys.restart;
        
        // 保存当前状态
        this._previousKeys.jump = this.keys.jump;
        this._previousKeys.pause = this.keys.pause;
        this._previousKeys.restart = this.keys.restart;
    }

    /**
     * 检查是否有任意键按下
     * @returns {boolean}
     */
    isAnyKeyPressed() {
        return this.keys.left || this.keys.right || this.keys.jump || 
               this.keys.pause || this.keys.restart;
    }
}
