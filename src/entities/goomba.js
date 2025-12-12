/**
 * 栗子怪类
 * 继承 Enemy 基类
 */

import Enemy from "./Enemy.js";

export default class Goomba extends Enemy {
    constructor(scene, x, y) {
        super(scene, x, y, "goomba");
        this.body.setSize(28, 28);
        this.setCollideWorldBounds(true);
        this.speed = 50;
    }

    update(delta) {
        if (!this.isAlive) return;
        super.update(delta);
        this.checkEdge();
    }

    checkEdge() {
        const scene = this.scene;
        const tileSize = 32;
        const checkX = this.x + (this.direction * tileSize);
        const checkY = this.y + tileSize;

        if (scene.platforms) {
            let hasGround = false;
            scene.platforms.getChildren().forEach(p => {
                const b = p.getBounds();
                if (checkX >= b.left && checkX <= b.right && checkY >= b.top && checkY <= b.bottom) hasGround = true;
            });
            if (!hasGround) this.turnAround();
        }
    }

    stomp() {
        if (!this.isAlive) return;
        this.isAlive = false;
        this.body.enable = false;
        this.scene.addScore(200);
        this.scene.tweens.add({
            targets: this,
            scaleY: 0.2,
            duration: 200,
            ease: "Power2",
            onComplete: () => { this.scene.time.delayedCall(500, () => { this.destroy(); }); }
        });
    }
}
