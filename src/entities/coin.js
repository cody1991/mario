/**
 * 金币类
 */

import { Entity } from './entity.js';
import { Sprite } from '../sprite.js';
import { COIN_CONFIG } from '../utils/constants.js';

export class Coin extends Entity {
    /**
     * @param {number} x 
     * @param {number} y 
     * @param {AssetLoader} loader 
     */
    constructor(x, y, loader) {
        super(x, y, COIN_CONFIG.WIDTH, COIN_CONFIG.HEIGHT);
        
        this.loader = loader;
        
        // 状态
        this.collected = false;
        this.value = COIN_CONFIG.VALUE;
        
        // 收集动画
        this.collectTimer = 0;
        this.collectY = y;
        
        // 初始化精灵
        this.initSprite();
    }

    /**
     * 初始化精灵
     */
    initSprite() {
        const image = this.loader.getImage('items');
        if (image) {
            this.sprite = new Sprite(image, 32, 32, {
                spin: { frames: [0, 1, 2, 3], speed: COIN_CONFIG.ANIMATION_SPEED },
            });
            this.sprite.setAnimation('spin');
        }
    }

    /**
     * 更新金币
     * @param {number} deltaTime 
     */
    update(deltaTime) {
        if (this.collected) {
            // 收集动画：向上飘然后消失
            this.collectTimer += deltaTime;
            this.y = this.collectY - (this.collectTimer / 5);
            
            if (this.collectTimer >= 300) {
                this.active = false;
            }
            return;
        }
        
        // 更新旋转动画
        if (this.sprite) {
            this.sprite.update(deltaTime);
        }
    }

    /**
     * 收集金币
     */
    collect() {
        if (this.collected) return;
        
        this.collected = true;
        this.collectY = this.y;
        this.collectTimer = 0;
    }

    /**
     * 渲染金币
     * @param {CanvasRenderingContext2D} ctx 
     * @param {Camera} camera 
     */
    render(ctx, camera) {
        if (!this.active) return;
        
        const screenX = this.x - camera.x;
        const screenY = this.y - camera.y;
        
        // 视口裁剪
        if (screenX + this.width < 0 || screenX > camera.width ||
            screenY + this.height < 0 || screenY > camera.height) {
            return;
        }
        
        // 收集时的透明度
        if (this.collected) {
            ctx.globalAlpha = 1 - (this.collectTimer / 300);
        }
        
        if (this.sprite) {
            // 居中绘制（因为精灵是 32x32，但碰撞体是 24x24）
            this.sprite.draw(ctx, screenX - 4, screenY - 4);
        } else {
            // 占位圆形
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(screenX + this.width / 2, screenY + this.height / 2, this.width / 2, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = '#FFA500';
            ctx.beginPath();
            ctx.arc(screenX + this.width / 2, screenY + this.height / 2, this.width / 2 - 3, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // 恢复透明度
        ctx.globalAlpha = 1;
    }

    /**
     * 重置金币
     */
    reset() {
        this.collected = false;
        this.active = true;
        this.y = this.collectY || this.y;
    }
}
