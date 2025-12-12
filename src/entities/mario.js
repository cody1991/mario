/**
 * 马里奥角色类
 */

import { Entity } from './entity.js';
import { Sprite } from '../sprite.js';
import { MARIO_CONFIG, PHYSICS, GAME_CONFIG } from '../utils/constants.js';

export class Mario extends Entity {
    /**
     * @param {number} x - 初始 X 坐标
     * @param {number} y - 初始 Y 坐标
     * @param {AssetLoader} loader - 资源加载器
     */
    constructor(x, y, loader) {
        super(x, y, MARIO_CONFIG.WIDTH, MARIO_CONFIG.HEIGHT);
        
        this.loader = loader;
        
        // 物理状态
        this.isGrounded = false;
        this.isJumping = false;
        this.jumpTimer = 0;
        
        // 方向
        this.facingRight = true;
        
        // 动画状态
        this.state = 'idle'; // idle, walking, jumping, falling, dying
        
        // 无敌状态
        this.isInvincible = false;
        this.invincibleTimer = 0;
        this.blinkTimer = 0;
        this.visible = true;
        
        // 死亡状态
        this.isDead = false;
        this.deathTimer = 0;
        
        // 初始化精灵
        this.initSprite();
    }

    /**
     * 初始化精灵动画
     */
    initSprite() {
        const image = this.loader.getImage('mario');
        if (image) {
            this.sprite = new Sprite(image, 32, 32, {
                idle: { frames: [0], speed: 100 },
                walking: { frames: [1, 2, 3], speed: MARIO_CONFIG.ANIMATION_SPEED },
                jumping: { frames: [4], speed: 100 },
                falling: { frames: [4], speed: 100 },
                dying: { frames: [5], speed: 100 },
            });
        }
    }

    /**
     * 更新马里奥状态
     * @param {number} deltaTime 
     * @param {InputHandler} input 
     */
    update(deltaTime, input) {
        if (this.isDead) {
            this.updateDeath(deltaTime);
            return;
        }

        // 处理输入
        this.handleInput(input, deltaTime);
        
        // 应用物理
        this.applyPhysics(deltaTime);
        
        // 更新动画状态
        this.updateAnimationState();
        
        // 更新无敌状态
        this.updateInvincibility(deltaTime);
        
        // 更新精灵动画
        if (this.sprite) {
            this.sprite.update(deltaTime);
        }
    }

    /**
     * 处理输入
     * @param {InputHandler} input 
     * @param {number} deltaTime 
     */
    handleInput(input, deltaTime) {
        // 水平移动
        if (input.keys.left) {
            this.velocityX -= MARIO_CONFIG.ACCELERATION;
            this.facingRight = false;
        } else if (input.keys.right) {
            this.velocityX += MARIO_CONFIG.ACCELERATION;
            this.facingRight = true;
        } else {
            // 减速
            if (this.isGrounded) {
                this.velocityX *= PHYSICS.GROUND_FRICTION;
            } else {
                this.velocityX *= PHYSICS.AIR_RESISTANCE;
            }
        }

        // 限制水平速度
        const maxSpeed = MARIO_CONFIG.WALK_SPEED;
        this.velocityX = Math.max(-maxSpeed, Math.min(maxSpeed, this.velocityX));

        // 跳跃
        if (input.justPressed.jump && this.isGrounded) {
            this.velocityY = MARIO_CONFIG.JUMP_FORCE;
            this.isGrounded = false;
            this.isJumping = true;
            this.jumpTimer = 0;
            
            // 播放跳跃音效
            this.loader.playSound('jump');
        }

        // 持续按住跳跃键可以跳得更高
        if (input.keys.jump && this.isJumping && this.jumpTimer < MARIO_CONFIG.MAX_JUMP_TIME) {
            this.velocityY += MARIO_CONFIG.JUMP_HOLD_FORCE;
            this.jumpTimer += deltaTime;
        }

        // 松开跳跃键结束跳跃加成
        if (!input.keys.jump) {
            this.isJumping = false;
        }
    }

    /**
     * 应用物理
     * @param {number} deltaTime 
     */
    applyPhysics(deltaTime) {
        // 重力
        this.velocityY += PHYSICS.GRAVITY;
        
        // 限制下落速度
        if (this.velocityY > PHYSICS.MAX_FALL_SPEED) {
            this.velocityY = PHYSICS.MAX_FALL_SPEED;
        }

        // 更新位置
        this.x += this.velocityX;
        this.y += this.velocityY;

        // 左边界限制
        if (this.x < 0) {
            this.x = 0;
            this.velocityX = 0;
        }

        // 假设不在地面上（由碰撞检测设置）
        this.isGrounded = false;
    }

    /**
     * 更新动画状态
     */
    updateAnimationState() {
        let newState = 'idle';

        if (this.isDead) {
            newState = 'dying';
        } else if (!this.isGrounded) {
            newState = this.velocityY < 0 ? 'jumping' : 'falling';
        } else if (Math.abs(this.velocityX) > 0.5) {
            newState = 'walking';
        }

        if (this.state !== newState) {
            this.state = newState;
            if (this.sprite) {
                this.sprite.setAnimation(newState);
            }
        }
    }

    /**
     * 更新无敌状态
     * @param {number} deltaTime 
     */
    updateInvincibility(deltaTime) {
        if (this.isInvincible) {
            this.invincibleTimer -= deltaTime;
            
            // 闪烁效果
            this.blinkTimer += deltaTime;
            if (this.blinkTimer >= 100) {
                this.visible = !this.visible;
                this.blinkTimer = 0;
            }
            
            if (this.invincibleTimer <= 0) {
                this.isInvincible = false;
                this.visible = true;
            }
        }
    }

    /**
     * 更新死亡状态
     * @param {number} deltaTime 
     */
    updateDeath(deltaTime) {
        this.deathTimer += deltaTime;
        
        // 死亡动画：先跳起再落下
        if (this.deathTimer < 500) {
            this.velocityY = -5;
        } else {
            this.velocityY += PHYSICS.GRAVITY;
        }
        
        this.y += this.velocityY;
    }

    /**
     * 马里奥受伤
     */
    takeDamage() {
        if (this.isInvincible || this.isDead) return false;
        
        // 进入无敌状态
        this.isInvincible = true;
        this.invincibleTimer = MARIO_CONFIG.INVINCIBLE_DURATION;
        
        // 击退效果
        this.velocityY = -6;
        this.velocityX = this.facingRight ? -3 : 3;
        
        return true;
    }

    /**
     * 马里奥死亡
     */
    die() {
        if (this.isDead) return;
        
        this.isDead = true;
        this.deathTimer = 0;
        this.velocityX = 0;
        this.velocityY = MARIO_CONFIG.JUMP_FORCE;
        
        if (this.sprite) {
            this.sprite.setAnimation('dying');
        }
    }

    /**
     * 踩踏弹跳
     */
    bounce() {
        this.velocityY = MARIO_CONFIG.JUMP_FORCE * 0.6;
        this.isGrounded = false;
    }

    /**
     * 重置马里奥状态
     * @param {number} x 
     * @param {number} y 
     */
    reset(x, y) {
        this.x = x;
        this.y = y;
        this.velocityX = 0;
        this.velocityY = 0;
        this.isGrounded = false;
        this.isJumping = false;
        this.isDead = false;
        this.isInvincible = false;
        this.visible = true;
        this.facingRight = true;
        this.state = 'idle';
        
        if (this.sprite) {
            this.sprite.setAnimation('idle');
        }
    }

    /**
     * 渲染马里奥
     * @param {CanvasRenderingContext2D} ctx 
     * @param {Camera} camera 
     */
    render(ctx, camera) {
        if (!this.visible) return;
        
        const screenX = this.x - camera.x;
        const screenY = this.y - camera.y;
        
        if (this.sprite) {
            this.sprite.draw(ctx, screenX, screenY, !this.facingRight);
        } else {
            // 占位矩形
            ctx.fillStyle = this.isInvincible ? '#ff0' : '#e52521';
            ctx.fillRect(screenX, screenY, this.width, this.height);
        }
    }
}
