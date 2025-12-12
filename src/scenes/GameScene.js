/**
 * 主游戏场景
 */

import { GAME_CONFIG, GAME_STATE, TILE_TYPES, SOLID_TILES, PHYSICS } from '../config/constants.js';
import { level1Data } from '../levels/level1.js';
import Player from '../entities/Player.js';
import Goomba from '../entities/Goomba.js';
import Coin from '../entities/Coin.js';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    init() {
        // 游戏状态
        this.gameState = GAME_STATE.READY;
        this.score = 0;
        this.lives = 3;
        this.recentlyHit = false;  // 防止同时接触多个敌人
    }

    create() {
        // 设置世界边界
        const worldWidth = level1Data.width * GAME_CONFIG.TILE_SIZE;
        const worldHeight = level1Data.height * GAME_CONFIG.TILE_SIZE;
        this.physics.world.setBounds(0, 0, worldWidth, worldHeight);

        // 创建地形碰撞组
        this.platforms = this.physics.add.staticGroup();
        
        // 从关卡数据创建地形
        this.createLevel();

        // 创建敌人组
        this.enemies = this.physics.add.group();

        // 创建金币组
        this.coins = this.physics.add.group();

        // 从关卡数据创建敌人和金币
        this.createEntities();

        // 创建玩家
        const { spawnPoint } = level1Data;
        this.player = new Player(this, spawnPoint.x, spawnPoint.y);

        // 玩家与地形碰撞
        this.physics.add.collider(this.player, this.platforms);

        // 敌人与地形碰撞
        this.physics.add.collider(this.enemies, this.platforms);

        // 玩家与敌人交互
        this.physics.add.overlap(this.player, this.enemies, this.handleEnemyCollision, null, this);

        // 玩家与金币交互
        this.physics.add.overlap(this.player, this.coins, this.handleCoinCollision, null, this);

        // 设置摄像机跟随玩家
        this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
        this.cameras.main.setDeadzone(100, 50);

        // 存储终点位置
        this.goalX = level1Data.goal.x;

        // 输入处理
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D
        });
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.pauseKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
        this.restartKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);

        // 监听 UI 事件
        this.events.on('startGame', this.startGame, this);
    }

    createLevel() {
        const { tiles, tileSize } = level1Data;

        for (let row = 0; row < tiles.length; row++) {
            for (let col = 0; col < tiles[row].length; col++) {
                const tileType = tiles[row][col];
                
                if (SOLID_TILES.includes(tileType)) {
                    // 计算瓦片位置（Phaser 使用中心点）
                    const x = col * tileSize + tileSize / 2;
                    const y = row * tileSize + tileSize / 2;
                    
                    // 获取瓦片帧索引
                    const frameIndex = this.getTileFrame(tileType);
                    
                    // 创建静态瓦片
                    const tile = this.platforms.create(x, y, 'tiles', frameIndex);
                    tile.setImmovable(true);
                    tile.refreshBody();
                }
            }
        }
    }

    createEntities() {
        const { entities } = level1Data;

        entities.forEach(entity => {
            if (entity.type === 'goomba') {
                const goomba = new Goomba(this, entity.x, entity.y);
                this.enemies.add(goomba);
            } else if (entity.type === 'coin') {
                const coin = new Coin(this, entity.x, entity.y);
                this.coins.add(coin);
            }
        });
    }

    getTileFrame(tileType) {
        // 根据瓦片类型返回精灵帧索引
        const frameMap = {
            [TILE_TYPES.GROUND]: 0,
            [TILE_TYPES.BRICK]: 1,
            [TILE_TYPES.QUESTION]: 2,
            [TILE_TYPES.PIPE_TOP_LEFT]: 3,
            [TILE_TYPES.PIPE_TOP_RIGHT]: 4,
            [TILE_TYPES.PIPE_BODY_LEFT]: 5,
            [TILE_TYPES.PIPE_BODY_RIGHT]: 6,
        };
        return frameMap[tileType] || 0;
    }

    handleEnemyCollision(player, enemy) {
        // 敌人已死亡则忽略
        if (!enemy.isAlive) {
            return;
        }

        // 玩家无敌状态则忽略
        if (player.isInvincible) {
            return;
        }

        // 判定踩踏：玩家正在下落且位于敌人上方
        const playerBottom = player.y + player.height / 2;
        const enemyTop = enemy.y - enemy.height / 2;
        const isAbove = playerBottom < enemyTop + enemy.height * 0.4;
        const isFalling = player.body.velocity.y > 0;

        if (isFalling && isAbove) {
            // 踩踏成功
            enemy.stomp();
            player.bounce();
        } else {
            // 受伤 - 防止同时接触多个敌人只触发一次
            if (!this.recentlyHit) {
                this.recentlyHit = true;
                player.takeDamage();
                
                // 短暂冷却
                this.time.delayedCall(100, () => {
                    this.recentlyHit = false;
                });
            }
        }
    }

    handleCoinCollision(player, coin) {
        coin.collect();
    }

    startGame() {
        if (this.gameState === GAME_STATE.READY) {
            this.gameState = GAME_STATE.PLAYING;
        }
    }

    update(time, delta) {
        // 暂停处理
        if (Phaser.Input.Keyboard.JustDown(this.pauseKey)) {
            if (this.gameState === GAME_STATE.PLAYING) {
                this.gameState = GAME_STATE.PAUSED;
                this.physics.pause();
                this.scene.get('UIScene').events.emit('showPause');
            } else if (this.gameState === GAME_STATE.PAUSED) {
                this.gameState = GAME_STATE.PLAYING;
                this.physics.resume();
                this.scene.get('UIScene').events.emit('hidePause');
            }
        }

        // 重新开始处理（任何状态下都可以按 R 重新开始）
        if (Phaser.Input.Keyboard.JustDown(this.restartKey)) {
            if (this.gameState === GAME_STATE.WIN || this.gameState === GAME_STATE.LOSE) {
                this.scene.restart();
                this.scene.get('UIScene').scene.restart();
            }
        }

        // 游戏进行中才更新
        if (this.gameState === GAME_STATE.PLAYING) {
            // 更新玩家
            if (this.player) {
                this.player.update(this.cursors, this.wasd, this.spaceKey, delta);

                // 检测是否到达终点
                if (this.player.x >= this.goalX) {
                    this.win();
                }
            }

            // 更新敌人
            this.enemies.getChildren().forEach(enemy => {
                if (enemy.update) {
                    enemy.update(delta);
                }
            });
        }
    }

    addScore(points) {
        this.score += points;
        this.scene.get('UIScene').events.emit('updateScore', this.score);
    }

    loseLife() {
        this.lives--;
        this.scene.get('UIScene').events.emit('updateLives', this.lives);
        
        if (this.lives <= 0) {
            this.gameOver();
        }
    }

    gameOver() {
        this.gameState = GAME_STATE.LOSE;
        this.physics.pause();
        this.scene.get('UIScene').events.emit('showGameOver');
    }

    win() {
        this.gameState = GAME_STATE.WIN;
        this.addScore(1000); // 终点奖励
        this.physics.pause();
        this.scene.get('UIScene').events.emit('showWin');
    }
}
