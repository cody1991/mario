/**
 * 玩家角色类
 * 继承 Phaser.Physics.Arcade.Sprite
 */

import { PLAYER_CONFIG, PHYSICS } from '../config/constants.js';

export default class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'mario');

        // 添加到场景
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // 配置物理体
        this.body.setSize(28, 30);  // 比精灵略小，避免边缘卡住
        this.body.setOffset(2, 2);
        this.setCollideWorldBounds(true);
        this.body.setMaxVelocity(PLAYER_CONFIG.WALK_SPEED, PHYSICS.MAX_VELOCITY_Y);

        // 状态属性
        this.state = 'idle';
        this.facingRight = true;
        this.isInvincible = false;
        this.invincibleTimer = 0;
        this.jumpTimer = 0;
        this.isJumping = false;
        this.wasOnFloor = true;

        // 播放待机动画
        this.anims.play('mario-idle');
    }

    update(cursors, wasd, spaceKey, delta) {
        // 更新无敌状态
        if (this.isInvincible) {
            this.invincibleTimer -= delta;
            // 闪烁效果
            this.setAlpha(Math.floor(this.invincibleTimer / 100) % 2 === 0 ? 0.5 : 1);
            
            if (this.invincibleTimer <= 0) {
                this.isInvincible = false;
                this.setAlpha(1);
            }
        }

        // 检测是否在地面
        const onFloor = this.body.onFloor();

        // 水平移动
        const leftPressed = cursors.left.isDown || wasd.left.isDown;
        const rightPressed = cursors.right.isDown || wasd.right.isDown;
        const jumpPressed = cursors.up.isDown || wasd.up.isDown || spaceKey.isDown;

        // 根据是否在地面调整加速度
        const acceleration = onFloor ? PLAYER_CONFIG.ACCELERATION : PLAYER_CONFIG.AIR_ACCELERATION;

        if (leftPressed) {
            this.setAccelerationX(-acceleration);
            this.facingRight = false;
            this.setFlipX(true);
        } else if (rightPressed) {
            this.setAccelerationX(acceleration);
            this.facingRight = true;
            this.setFlipX(false);
        } else {
            this.setAccelerationX(0);
            // 地面摩擦
            if (onFloor) {
                this.body.setDragX(PHYSICS.GROUND_DRAG);
            } else {
                this.body.setDragX(PHYSICS.AIR_DRAG);
            }
        }

        // 跳跃处理
        if (jumpPressed && onFloor && !this.isJumping) {
            // 起跳
            this.setVelocityY(PLAYER_CONFIG.JUMP_VELOCITY);
            this.isJumping = true;
            this.jumpTimer = 0;
            
            // 播放跳跃音效
            this.scene.sound.play('jump', { volume: 0.5 });
        }

        // 可变跳跃高度 - 长按跳得更高
        if (jumpPressed && this.isJumping && this.jumpTimer < PLAYER_CONFIG.MAX_JUMP_TIME) {
            this.setVelocityY(this.body.velocity.y + PLAYER_CONFIG.JUMP_HOLD_VELOCITY);
            this.jumpTimer += delta;
        }

        // 松开跳跃键
        if (!jumpPressed) {
            this.isJumping = false;
        }

        // 落地检测
        if (onFloor && !this.wasOnFloor) {
            this.isJumping = false;
        }
        this.wasOnFloor = onFloor;

        // 更新动画状态
        this.updateAnimation(onFloor);

        // 检测掉落死亡
        if (this.y > this.scene.physics.world.bounds.height) {
            this.die();
        }
    }

    updateAnimation(onFloor) {
        if (!onFloor) {
            // 空中
            if (this.body.velocity.y < 0) {
                this.state = 'jumping';
            } else {
                this.state = 'falling';
            }
            this.anims.play('mario-jump', true);
        } else if (Math.abs(this.body.velocity.x) > 10) {
            // 行走
            this.state = 'walking';
            this.anims.play('mario-walk', true);
        } else {
            // 静止
            this.state = 'idle';
            this.anims.play('mario-idle', true);
        }
    }

    takeDamage() {
        if (this.isInvincible || this.state === 'dead') {
            return;
        }

        this.isInvincible = true;
        this.invincibleTimer = PLAYER_CONFIG.INVINCIBLE_DURATION;
        
        // 击退效果
        const knockbackX = this.facingRight ? -100 : 100;
        this.setVelocity(knockbackX, -200);

        // 通知场景减少生命
        this.scene.loseLife();
    }

    die() {
        if (this.state === 'dead') {
            return;
        }

        this.state = 'dead';
        this.body.enable = false;
        
        // 死亡动画 - 向上弹起然后落下
        this.setVelocityY(-300);
        
        // 通知场景游戏结束
        this.scene.time.delayedCall(1000, () => {
            this.scene.loseLife();
        });
    }

    bounce() {
        // 踩踏敌人后弹跳
        this.setVelocityY(PLAYER_CONFIG.BOUNCE_VELOCITY);
    }

    reset(x, y) {
        this.setPosition(x, y);
        this.setVelocity(0, 0);
        this.state = 'idle';
        this.isInvincible = false;
        this.invincibleTimer = 0;
        this.isJumping = false;
        this.setAlpha(1);
        this.body.enable = true;
    }

    // TODO: 移动端触控支持扩展点
    // 实现方式：
    // 1. 在 GameScene 中创建虚拟摇杆和跳跃按钮
    // 2. 传入触控状态对象替代 cursors/wasd/spaceKey
    // 3. update() 方法已支持任意输入源，只需传入 { isDown: boolean } 格式的对象
}
