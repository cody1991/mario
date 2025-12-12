/**
 * UI 场景 - HUD 显示和状态界面
 */

import { GAME_CONFIG } from '../config/constants.js';

export default class UIScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UIScene' });
    }

    create() {
        // 分数显示
        this.scoreText = this.add.text(16, 16, 'SCORE: 0', {
            fontSize: '24px',
            fontFamily: 'Arial',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        });

        // 生命显示
        this.livesText = this.add.text(GAME_CONFIG.CANVAS_WIDTH - 16, 16, 'LIVES: 3', {
            fontSize: '24px',
            fontFamily: 'Arial',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(1, 0);

        // 开始提示
        this.startText = this.add.text(
            GAME_CONFIG.CANVAS_WIDTH / 2,
            GAME_CONFIG.CANVAS_HEIGHT / 2,
            '按任意键开始',
            {
                fontSize: '32px',
                fontFamily: 'Arial',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 6
            }
        ).setOrigin(0.5);

        // 暂停提示
        this.pauseText = this.add.text(
            GAME_CONFIG.CANVAS_WIDTH / 2,
            GAME_CONFIG.CANVAS_HEIGHT / 2,
            '游戏暂停\n按 P 继续',
            {
                fontSize: '32px',
                fontFamily: 'Arial',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 6,
                align: 'center'
            }
        ).setOrigin(0.5).setVisible(false);

        // 游戏结束提示
        this.gameOverText = this.add.text(
            GAME_CONFIG.CANVAS_WIDTH / 2,
            GAME_CONFIG.CANVAS_HEIGHT / 2,
            'GAME OVER\n按 R 重新开始',
            {
                fontSize: '32px',
                fontFamily: 'Arial',
                color: '#ff0000',
                stroke: '#000000',
                strokeThickness: 6,
                align: 'center'
            }
        ).setOrigin(0.5).setVisible(false);

        // 胜利提示
        this.winText = this.add.text(
            GAME_CONFIG.CANVAS_WIDTH / 2,
            GAME_CONFIG.CANVAS_HEIGHT / 2,
            '恭喜通关！\n按 R 重新开始',
            {
                fontSize: '32px',
                fontFamily: 'Arial',
                color: '#00ff00',
                stroke: '#000000',
                strokeThickness: 6,
                align: 'center'
            }
        ).setOrigin(0.5).setVisible(false);

        // 监听任意键开始游戏
        this.input.keyboard.once('keydown', () => {
            this.startText.setVisible(false);
            this.scene.get('GameScene').events.emit('startGame');
        });

        // 监听 GameScene 事件
        this.events.on('updateScore', this.updateScore, this);
        this.events.on('updateLives', this.updateLives, this);
        this.events.on('showPause', this.showPause, this);
        this.events.on('hidePause', this.hidePause, this);
        this.events.on('showGameOver', this.showGameOver, this);
        this.events.on('showWin', this.showWin, this);
    }

    updateScore(score) {
        this.scoreText.setText(`SCORE: ${score}`);
    }

    updateLives(lives) {
        this.livesText.setText(`LIVES: ${lives}`);
    }

    showPause() {
        this.pauseText.setVisible(true);
    }

    hidePause() {
        this.pauseText.setVisible(false);
    }

    showGameOver() {
        this.gameOverText.setVisible(true);
    }

    showWin() {
        this.winText.setVisible(true);
    }
}
