/**
 * 启动场景 - 资源预加载
 */

export default class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        // 获取进度条元素
        const progressBar = document.getElementById('loading-progress');
        const loadingScreen = document.getElementById('loading-screen');

        // 监听加载进度
        this.load.on('progress', (value) => {
            if (progressBar) {
                progressBar.style.width = `${value * 100}%`;
            }
        });

        // 加载完成
        this.load.on('complete', () => {
            if (loadingScreen) {
                loadingScreen.style.display = 'none';
            }
        });

        // 加载精灵图
        this.load.spritesheet('mario', 'assets/sprites/mario.png', {
            frameWidth: 32,
            frameHeight: 32
        });

        this.load.spritesheet('goomba', 'assets/sprites/enemies.png', {
            frameWidth: 32,
            frameHeight: 32
        });

        this.load.spritesheet('coin', 'assets/sprites/items.png', {
            frameWidth: 24,
            frameHeight: 24
        });

        this.load.spritesheet('tiles', 'assets/sprites/tiles.png', {
            frameWidth: 32,
            frameHeight: 32
        });

        // 加载音效
        this.load.audio('jump', 'assets/audio/jump.wav');
        this.load.audio('coin', 'assets/audio/coin.wav');
    }

    create() {
        // 创建马里奥动画
        this.anims.create({
            key: 'mario-idle',
            frames: [{ key: 'mario', frame: 0 }],
            frameRate: 1
        });

        this.anims.create({
            key: 'mario-walk',
            frames: this.anims.generateFrameNumbers('mario', { start: 1, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'mario-jump',
            frames: [{ key: 'mario', frame: 4 }],
            frameRate: 1
        });

        // 创建栗子怪动画
        this.anims.create({
            key: 'goomba-walk',
            frames: this.anims.generateFrameNumbers('goomba', { start: 0, end: 1 }),
            frameRate: 4,
            repeat: -1
        });

        this.anims.create({
            key: 'goomba-squish',
            frames: [{ key: 'goomba', frame: 2 }],
            frameRate: 1
        });

        // 创建金币动画
        this.anims.create({
            key: 'coin-spin',
            frames: this.anims.generateFrameNumbers('coin', { start: 0, end: 3 }),
            frameRate: 8,
            repeat: -1
        });

        // 切换到游戏场景
        this.scene.start('GameScene');
        this.scene.launch('UIScene');
    }
}
