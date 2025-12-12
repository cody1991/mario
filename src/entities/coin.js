/**
 * 金币类
 */
export default class Coin extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, "coin");
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.body.setAllowGravity(false);
        this.body.setImmovable(true);
        this.collected = false;
        this.anims.play("coin-spin", true);
    }

    collect() {
        if (this.collected) return false;
        this.collected = true;
        this.scene.addScore(100);
        this.scene.sound.play("coin", { volume: 0.5 });
        this.scene.tweens.add({
            targets: this, y: this.y - 50, alpha: 0, duration: 300, ease: "Power2",
            onComplete: () => { this.destroy(); }
        });
        return true;
    }
}
