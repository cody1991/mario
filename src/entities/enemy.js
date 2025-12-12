/**
 * 敌人基类
 */

import { Entity } from './entity.js';
import { ENEMY_CONFIG, PHYSICS } from '../utils/constants.js';

export class Enemy extends Entity {
    /**
     * @param {number} x 
     * @param {number} y 
     * @param {number} width 
     * @param {number} height 
     * @param {AssetLoader} loader 
     */
    constructor(x, y, width, height, loader) {
        super(x, y, width, height);
        
        this.loader = loader;
        
        // 移动方向 (-1 = 左, 1 = 右)
        this.direction = -1;
        this.speed = 1;
        
        // 状态
        this.isDead = false;
        this.isGrounded = false;
        
        // 初始位置（用于重置）
        this.initialX = x;
        this.initialY = y;
    }

    /**
     * 更新敌人
     * @param {number} deltaTime 
     */
    update(deltaTime) {
        if (this.isDead) return;
        
        // 水平移动
        this.velocityX = this.direction * this.speed;
        
        // 重力
        this.velocityY += PHYSICS.GRAVITY;
        if (this.velocityY > PHYSICS.MAX_FALL_SPEED) {
            this.velocityY = PHYSICS.MAX_FALL_SPEED;
        }
        
        // 更新位置
        this.x += this.velocityX;
        this.y += this.velocityY;
        
        // 更新精灵动画
        if (this.sprite) {
            this.sprite.update(deltaTime);
        }
    }

    /**
     * 检查边缘并转向
     * @param {Level} level 
     */
    checkEdge(level) {
        if (this.isDead) return;
        
        // 检查前方是否有地面
        const checkX = this.direction > 0 
            ? this.x + this.width + 2 
            : this.x - 2;
        const checkY = this.y + this.height + 2;
        
        const { tileX, tileY } = level.worldToTile(checkX, checkY);
        
        if (!level.isSolid(tileX, tileY)) {
            // 前方没有地面，转向
            this.direction *= -1;
        }
    }

    /**
     * 被踩踏
     */
    stomp() {
        this.isDead = true;
    }

    /**
     * 转向
     */
    turnAround() {
        this.direction *= -1;
    }

    /**
     * 重置敌人
     */
    reset() {
        this.x = this.initialX;
        this.y = this.initialY;
        this.velocityX = 0;
        this.velocityY = 0;
        this.direction = -1;
        this.isDead = false;
        this.active = true;
    }

    /**
     * 渲染敌人
     * @param {CanvasRenderingContext2D} ctx 
     * @param {Camera} camera 
     */
    render(ctx, camera) {
        if (!this.active) return;
        
        const screenX = this.x - camera.x;
        const screenY = this.y - camera.y;
        
        // 视口裁剪
        if (screenX + this.width < 0 || screenX > camera.width) {
            return;
        }
        
        if (this.sprite) {
            this.sprite.draw(ctx, screenX, screenY, this.direction > 0);
        } else {
            // 占位矩形
            ctx.fillStyle = this.isDead ? '#666' : '#8B4513';
            ctx.fillRect(screenX, screenY, this.width, this.height);
        }
    }
}
