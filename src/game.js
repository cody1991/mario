/**
 * 游戏主类
 * 管理游戏循环和状态
 */

import { GAME_CONFIG, GAME_STATE, PHYSICS, TILE_TYPES, SCORING } from './utils/constants.js';
import { AssetLoader } from './loader.js';
import { InputHandler } from './input.js';
import { Camera } from './camera.js';
import { Mario } from './entities/mario.js';
import { Level } from './levels/level.js';
import { level1Data } from './levels/level1.js';
import { Goomba } from './entities/goomba.js';
import { Coin } from './entities/coin.js';
import { checkCollision, isStompingOn, handleTileCollision } from './utils/collision.js';

export class Game {
    /**
     * @param {HTMLCanvasElement} canvas 
     */
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // 设置画布尺寸
        this.canvas.width = GAME_CONFIG.CANVAS_WIDTH;
        this.canvas.height = GAME_CONFIG.CANVAS_HEIGHT;
        
        // 游戏状态
        this.state = GAME_STATE.LOADING;
        this.score = 0;
        this.lives = 3;
        
        // 核心组件
        this.loader = new AssetLoader();
        this.input = new InputHandler();
        this.camera = new Camera();
        
        // 游戏实体
        this.mario = null;
        this.level = null;
        this.enemies = [];
        this.coins = [];
        
        // 游戏循环
        this.lastTime = 0;
        this.accumulator = 0;
        this.running = false;
    }

    /**
     * 初始化游戏
     */
    async init() {
        // 加载资源
        await this.loadAssets();
        
        // 创建关卡
        this.loadLevel(level1Data);
        
        // 设置状态
        this.state = GAME_STATE.READY;
        
        // 隐藏加载界面
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
        }
    }

    /**
     * 加载游戏资源
     */
    async loadAssets() {
        const manifest = [
            { type: 'image', name: 'mario', src: 'assets/sprites/mario.png' },
            { type: 'image', name: 'tiles', src: 'assets/sprites/tiles.png' },
            { type: 'image', name: 'enemies', src: 'assets/sprites/enemies.png' },
            { type: 'image', name: 'items', src: 'assets/sprites/items.png' },
            { type: 'audio', name: 'jump', src: 'assets/audio/jump.wav' },
            { type: 'audio', name: 'coin', src: 'assets/audio/coin.wav' },
        ];

        const progressBar = document.getElementById('loading-progress');
        
        await this.loader.loadAll(manifest, (progress) => {
            if (progressBar) {
                progressBar.style.width = `${progress * 100}%`;
            }
        });
    }

    /**
     * 加载关卡
     * @param {Object} levelData 
     */
    loadLevel(levelData) {
        // 创建关卡
        this.level = new Level(levelData, this.loader);
        
        // 创建马里奥
        const spawn = this.level.spawnPoint;
        this.mario = new Mario(spawn.x, spawn.y, this.loader);
        
        // 设置摄像机
        this.camera.setTarget(this.mario);
        this.camera.setBounds(this.level.width, this.level.height);
        this.camera.reset();
        
        // 创建实体
        this.enemies = [];
        this.coins = [];
        
        for (const entityData of levelData.entities) {
            if (entityData.type === 'goomba') {
                const goomba = new Goomba(entityData.x, entityData.y, this.loader);
                this.enemies.push(goomba);
            } else if (entityData.type === 'coin') {
                const coin = new Coin(entityData.x, entityData.y, this.loader);
                this.coins.push(coin);
            }
        }
    }

    /**
     * 开始游戏循环
     */
    start() {
        if (this.running) return;
        this.running = true;
        this.lastTime = performance.now();
        requestAnimationFrame((time) => this.gameLoop(time));
    }

    /**
     * 游戏主循环
     * @param {number} currentTime 
     */
    gameLoop(currentTime) {
        if (!this.running) return;

        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        // 防止帧间隔过大（如切换标签页后）
        const clampedDelta = Math.min(deltaTime, 100);
        this.accumulator += clampedDelta;

        // 更新输入状态
        this.input.update();

        // 固定时间步长更新
        while (this.accumulator >= GAME_CONFIG.FIXED_TIMESTEP) {
            this.update(GAME_CONFIG.FIXED_TIMESTEP);
            this.accumulator -= GAME_CONFIG.FIXED_TIMESTEP;
        }

        // 渲染
        this.render();

        // 继续循环
        requestAnimationFrame((time) => this.gameLoop(time));
    }

    /**
     * 游戏逻辑更新
     * @param {number} deltaTime 
     */
    update(deltaTime) {
        switch (this.state) {
            case GAME_STATE.READY:
                this.updateReady();
                break;
            case GAME_STATE.PLAYING:
                this.updatePlaying(deltaTime);
                break;
            case GAME_STATE.PAUSED:
                this.updatePaused();
                break;
            case GAME_STATE.WIN:
            case GAME_STATE.LOSE:
                this.updateGameOver();
                break;
        }
    }

    /**
     * 准备状态更新
     */
    updateReady() {
        if (this.input.isAnyKeyPressed()) {
            this.state = GAME_STATE.PLAYING;
        }
    }

    /**
     * 游戏进行中更新
     * @param {number} deltaTime 
     */
    updatePlaying(deltaTime) {
        // 暂停检测
        if (this.input.justPressed.pause) {
            this.state = GAME_STATE.PAUSED;
            return;
        }

        // 更新马里奥
        if (this.mario && !this.mario.isDead) {
            this.mario.update(deltaTime, this.input);
            
            // 瓦片碰撞
            if (this.level) {
                const collision = handleTileCollision(this.mario, this.level);
                this.mario.isGrounded = collision.isGrounded;
            }
            
            // 边界检查
            if (this.mario.x < 0) {
                this.mario.x = 0;
            }
            
            // 检查死亡（掉落屏幕外）
            if (this.mario.y > this.level.height + 100) {
                this.mario.die();
            }
            
            // 检查胜利（到达终点）
            if (this.level && this.mario.x >= this.level.goal.x) {
                this.state = GAME_STATE.WIN;
                this.score += SCORING.GOAL_BONUS;
            }
        } else if (this.mario && this.mario.isDead) {
            this.mario.update(deltaTime, this.input);
            if (this.mario.y > this.level.height + 200) {
                this.handleMarioDeath();
            }
        }

        // 更新摄像机
        this.camera.update(deltaTime);

        // 更新敌人
        for (const enemy of this.enemies) {
            if (enemy.active && !enemy.isDead) {
                enemy.update(deltaTime);
                
                // 敌人瓦片碰撞
                if (this.level) {
                    const collision = handleTileCollision(enemy, this.level);
                    enemy.isGrounded = collision.isGrounded;
                    
                    // 碰到墙壁转向
                    if (collision.hitWall) {
                        enemy.turnAround();
                    }
                    
                    // 检查边缘（只在地面时）
                    if (enemy.isGrounded) {
                        enemy.checkEdge(this.level);
                    }
                }
                
                // 马里奥与敌人碰撞
                if (this.mario && !this.mario.isDead && !this.mario.isInvincible) {
                    if (checkCollision(this.mario.getBounds(), enemy.getBounds())) {
                        if (isStompingOn(this.mario, enemy)) {
                            // 踩踏敌人
                            enemy.stomp();
                            this.mario.bounce();
                            this.score += SCORING.ENEMY_STOMP;
                        } else {
                            // 被敌人碰到
                            if (this.mario.takeDamage()) {
                                this.lives--;
                                if (this.lives <= 0) {
                                    this.mario.die();
                                }
                            }
                        }
                    }
                }
            }
        }

        // 更新金币
        for (const coin of this.coins) {
            if (coin.active) {
                coin.update(deltaTime);
                
                // 马里奥收集金币
                if (this.mario && !this.mario.isDead) {
                    if (checkCollision(this.mario.getBounds(), coin.getBounds())) {
                        coin.collect();
                        this.score += SCORING.COIN_VALUE;
                        this.loader.playSound('coin');
                    }
                }
            }
        }
    }

    /**
     * 暂停状态更新
     */
    updatePaused() {
        if (this.input.justPressed.pause) {
            this.state = GAME_STATE.PLAYING;
        }
    }

    /**
     * 游戏结束状态更新
     */
    updateGameOver() {
        if (this.input.justPressed.restart) {
            this.restart();
        }
    }

    /**
     * 处理马里奥死亡
     */
    handleMarioDeath() {
        this.lives--;
        if (this.lives <= 0) {
            this.state = GAME_STATE.LOSE;
        } else {
            this.respawnMario();
        }
    }

    /**
     * 重生马里奥
     */
    respawnMario() {
        const spawn = this.level ? this.level.spawnPoint : { x: 100, y: 384 };
        this.mario.reset(spawn.x, spawn.y);
        this.camera.reset();
    }

    /**
     * 重新开始游戏
     */
    restart() {
        this.score = 0;
        this.lives = 3;
        
        // 重新加载关卡
        this.loadLevel(level1Data);
        
        this.state = GAME_STATE.PLAYING;
    }

    /**
     * 增加分数
     * @param {number} points 
     */
    addScore(points) {
        this.score += points;
    }

    /**
     * 渲染游戏画面
     */
    render() {
        // 清空画布
        this.ctx.fillStyle = '#5c94fc';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        switch (this.state) {
            case GAME_STATE.READY:
                this.renderGame();
                this.renderStartScreen();
                break;
            case GAME_STATE.PLAYING:
                this.renderGame();
                this.renderHUD();
                break;
            case GAME_STATE.PAUSED:
                this.renderGame();
                this.renderHUD();
                this.renderPauseScreen();
                break;
            case GAME_STATE.WIN:
                this.renderGame();
                this.renderWinScreen();
                break;
            case GAME_STATE.LOSE:
                this.renderGame();
                this.renderGameOverScreen();
                break;
        }
    }

    /**
     * 渲染游戏场景
     */
    renderGame() {
        // 渲染关卡
        if (this.level) {
            this.level.render(this.ctx, this.camera);
        }

        // 渲染金币
        for (const coin of this.coins) {
            if (coin.active) {
                coin.render(this.ctx, this.camera);
            }
        }

        // 渲染敌人
        for (const enemy of this.enemies) {
            if (enemy.active) {
                enemy.render(this.ctx, this.camera);
            }
        }

        // 渲染马里奥
        if (this.mario) {
            this.mario.render(this.ctx, this.camera);
        }
    }

    /**
     * 渲染 HUD
     */
    renderHUD() {
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '20px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`分数: ${this.score}`, 20, 30);
        this.ctx.fillText(`生命: ${this.lives}`, 20, 55);
    }

    /**
     * 渲染开始界面
     */
    renderStartScreen() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('超级马里奥', this.canvas.width / 2, this.canvas.height / 2 - 40);
        
        this.ctx.font = '24px Arial';
        this.ctx.fillText('按任意键开始', this.canvas.width / 2, this.canvas.height / 2 + 20);
        
        this.ctx.font = '16px Arial';
        this.ctx.fillText('← → 移动  |  空格 跳跃  |  P 暂停', this.canvas.width / 2, this.canvas.height / 2 + 60);
    }

    /**
     * 渲染暂停界面
     */
    renderPauseScreen() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('暂停', this.canvas.width / 2, this.canvas.height / 2);
        
        this.ctx.font = '24px Arial';
        this.ctx.fillText('按 P 继续', this.canvas.width / 2, this.canvas.height / 2 + 50);
    }

    /**
     * 渲染胜利界面
     */
    renderWinScreen() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#FFD700';
        this.ctx.font = '48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('恭喜通关！', this.canvas.width / 2, this.canvas.height / 2 - 40);
        
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '24px Arial';
        this.ctx.fillText(`最终分数: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 20);
        this.ctx.fillText('按 R 重新开始', this.canvas.width / 2, this.canvas.height / 2 + 60);
    }

    /**
     * 渲染游戏结束界面
     */
    renderGameOverScreen() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#e52521';
        this.ctx.font = '48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('游戏结束', this.canvas.width / 2, this.canvas.height / 2 - 40);
        
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '24px Arial';
        this.ctx.fillText(`分数: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 20);
        this.ctx.fillText('按 R 重新开始', this.canvas.width / 2, this.canvas.height / 2 + 60);
    }

    /**
     * 停止游戏循环
     */
    stop() {
        this.running = false;
    }
}
