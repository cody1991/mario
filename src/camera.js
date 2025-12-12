/**
 * 摄像机/视口控制
 */

import { GAME_CONFIG } from './utils/constants.js';

export class Camera {
    /**
     * @param {number} width - 视口宽度
     * @param {number} height - 视口高度
     */
    constructor(width = GAME_CONFIG.CANVAS_WIDTH, height = GAME_CONFIG.CANVAS_HEIGHT) {
        this.x = 0;
        this.y = 0;
        this.width = width;
        this.height = height;
        
        // 跟随目标
        this.target = null;
        
        // 边界
        this.leftBound = 0;  // 左边界锁定
        this.rightBound = Infinity;
        this.topBound = 0;
        this.bottomBound = Infinity;
        
        // 跟随参数
        this.followOffsetX = width / 3;  // 目标在屏幕左侧 1/3 处
        this.smoothing = 0.1;  // 平滑跟随系数
    }

    /**
     * 设置跟随目标
     * @param {Entity} target 
     */
    setTarget(target) {
        this.target = target;
    }

    /**
     * 设置关卡边界
     * @param {number} levelWidth - 关卡宽度
     * @param {number} levelHeight - 关卡高度
     */
    setBounds(levelWidth, levelHeight) {
        this.rightBound = Math.max(0, levelWidth - this.width);
        this.bottomBound = Math.max(0, levelHeight - this.height);
    }

    /**
     * 更新摄像机位置
     * @param {number} deltaTime 
     */
    update(deltaTime) {
        if (!this.target) return;
        
        // 计算目标位置（让目标在屏幕中间偏左）
        const targetX = this.target.x - this.width / 2 + this.target.width / 2;
        
        // 平滑跟随（仅水平方向）
        this.x += (targetX - this.x) * this.smoothing;
        
        // 应用边界限制（移除左边界锁定，允许自由移动）
        this.x = Math.max(0, Math.min(this.x, this.rightBound));
        this.y = Math.max(0, Math.min(this.y, this.bottomBound));
    }

    /**
     * 重置摄像机
     */
    reset() {
        this.x = 0;
        this.y = 0;
        this.leftBound = 0;
    }

    /**
     * 立即跳转到目标位置
     */
    snapToTarget() {
        if (!this.target) return;
        this.x = this.target.x - this.followOffsetX;
        this.x = Math.max(0, Math.min(this.x, this.rightBound));
    }

    /**
     * 检查实体是否在视口内
     * @param {Object} entity - {x, y, width, height}
     * @returns {boolean}
     */
    isVisible(entity) {
        return (
            entity.x + entity.width > this.x &&
            entity.x < this.x + this.width &&
            entity.y + entity.height > this.y &&
            entity.y < this.y + this.height
        );
    }

    /**
     * 世界坐标转屏幕坐标
     * @param {number} worldX 
     * @param {number} worldY 
     * @returns {Object} {x, y}
     */
    worldToScreen(worldX, worldY) {
        return {
            x: worldX - this.x,
            y: worldY - this.y,
        };
    }
}
