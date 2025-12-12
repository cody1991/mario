/**
 * 栗子怪 Goomba
 */

import { Enemy } from './enemy.js';
import { Sprite } from '../sprite.js';
import { ENEMY_CONFIG } from '../utils/constants.js';

export class Goomba extends Enemy {
    /**
     * @param {number} x 
     * @param {number} y 
     * @param {AssetLoader} loader 
     */
    constructor(x, y, loader) {
        super(x, y, ENEMY_CONFIG.GOOMBA_WIDTH, ENEMY_CONFIG.GOOMBA_HEIGHT, loader);
        
        this.speed = ENEMY_CONFIG.GOOMBA_SPEED;
        
        // 被踩扁状态
        this.isSquished = false;
        this.squishTimer = 0;
        
        // 初始化精灵
        this.initSprite();
    }

    /**
     * 初始化精灵
     */
    initSprite() {
        const image = this.loader.getImage('enemies');
        if (image) {
            this.sprite = new Sprite(image, 32, 32, {
                walking: { frames: [0, 1], speed: 200 },
                squished: { frames: [2], speed: 100 },
            });
            this.sprite.setAnimation('walking');
        }
    }

    /**
     * 更新 Goomba
     * @param {number} deltaTime 
     */
    update(deltaTime) {
        if (this.isSquished) {
            this.squishTimer += deltaTime;
            if (this.squishTimer >= ENEMY_CONFIG.SQUISH_DURATION) {
                this.active = false;
            }
            return;
        }
        
        super.update(deltaTime);
    }

    /**
     * 被踩踏
     */
    stomp() {
        if (this.isDead) return;
        
        this.isDead = true;
        this.isSquished = true;
        this.squishTimer = 0;
        this.velocityX = 0;
        this.velocityY = 0;
        
        // 切换到被踩扁动画
        if (this.sprite) {
            this.sprite.setAnimation('squished');
        }
        
        // 调整高度表示被踩扁
        this.height = 16;
        this.y += 16;
    }

    /**
     * 渲染 Goomba
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
            if (this.isSquished) {
                // 被踩扁时只绘制下半部分
                this.sprite.draw(ctx, screenX, screenY, this.direction > 0);
            } else {
                this.sprite.draw(ctx, screenX, screenY, this.direction > 0);
            }
        } else {
            // 占位矩形
            ctx.fillStyle = this.isSquished ? '#5a3a1a' : '#8B4513';
            ctx.fillRect(screenX, screenY, this.width, this.isSquished ? 16 : this.height);
            
            // 眼睛
            if (!this.isSquished) {
                ctx.fillStyle = '#fff';
                ctx.fillRect(screenX + 6, screenY + 8, 6, 6);
                ctx.fillRect(screenX + 20, screenY + 8, 6, 6);
                ctx.fillStyle = '#000';
                ctx.fillRect(screenX + 8, screenY + 10, 3, 3);
                ctx.fillRect(screenX + 22, screenY + 10, 3, 3);
            }
        }
    }
}
