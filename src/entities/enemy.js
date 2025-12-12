/**
 * 敌人基类
 * 继承 Phaser.Physics.Arcade.Sprite
 */

export default class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture) {
        super(scene, x, y, texture);

        // 添加到场景
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // 基础属性
        this.speed = 60;
        this.direction = -1;  // -1 向左，1 向右
        this.isAlive = true;
    }

    update(delta) {
        if (!this.isAlive) {
            return;
        }

        // 移动
        this.setVelocityX(this.speed * this.direction);

        // 翻转精灵
        this.setFlipX(this.direction > 0);
    }

    turnAround() {
        this.direction *= -1;
    }

    stomp() {
        // 子类重写
        this.isAlive = false;
        this.body.enable = false;
    }
}
