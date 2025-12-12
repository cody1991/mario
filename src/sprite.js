/**
 * 精灵动画类
 * 管理 Sprite Sheet 动画
 */

export class Sprite {
    /**
     * @param {HTMLImageElement} image - 精灵图
     * @param {number} frameWidth - 单帧宽度
     * @param {number} frameHeight - 单帧高度
     * @param {Object} animations - 动画配置 { name: { frames: [0,1,2], speed: 100 } }
     */
    constructor(image, frameWidth, frameHeight, animations = {}) {
        this.image = image;
        this.frameWidth = frameWidth;
        this.frameHeight = frameHeight;
        this.animations = animations;
        
        // 计算精灵图的列数
        this.cols = Math.floor(image.width / frameWidth) || 1;
        
        // 当前动画状态
        this.currentAnimation = Object.keys(animations)[0] || 'default';
        this.currentFrameIndex = 0;
        this.frameTimer = 0;
        
        // 默认动画配置
        if (Object.keys(animations).length === 0) {
            this.animations = {
                default: { frames: [0], speed: 100 }
            };
        }
    }

    /**
     * 设置当前动画
     * @param {string} name - 动画名称
     */
    setAnimation(name) {
        if (this.animations[name] && this.currentAnimation !== name) {
            this.currentAnimation = name;
            this.currentFrameIndex = 0;
            this.frameTimer = 0;
        }
    }

    /**
     * 更新动画帧
     * @param {number} deltaTime - 时间增量 (ms)
     */
    update(deltaTime) {
        const anim = this.animations[this.currentAnimation];
        if (!anim || anim.frames.length <= 1) return;

        this.frameTimer += deltaTime;
        if (this.frameTimer >= anim.speed) {
            this.currentFrameIndex = (this.currentFrameIndex + 1) % anim.frames.length;
            this.frameTimer = 0;
        }
    }

    /**
     * 绘制当前帧
     * @param {CanvasRenderingContext2D} ctx - 画布上下文
     * @param {number} x - 绘制 X 坐标
     * @param {number} y - 绘制 Y 坐标
     * @param {boolean} flipX - 是否水平翻转
     * @param {number} scale - 缩放比例
     */
    draw(ctx, x, y, flipX = false, scale = 1) {
        const anim = this.animations[this.currentAnimation];
        if (!anim) return;

        const frameIndex = anim.frames[this.currentFrameIndex];
        const sx = (frameIndex % this.cols) * this.frameWidth;
        const sy = Math.floor(frameIndex / this.cols) * this.frameHeight;
        
        const drawWidth = this.frameWidth * scale;
        const drawHeight = this.frameHeight * scale;

        ctx.save();
        
        if (flipX) {
            ctx.translate(x + drawWidth, y);
            ctx.scale(-1, 1);
            ctx.drawImage(
                this.image,
                sx, sy, this.frameWidth, this.frameHeight,
                0, 0, drawWidth, drawHeight
            );
        } else {
            ctx.drawImage(
                this.image,
                sx, sy, this.frameWidth, this.frameHeight,
                x, y, drawWidth, drawHeight
            );
        }
        
        ctx.restore();
    }

    /**
     * 获取当前帧索引
     * @returns {number}
     */
    getCurrentFrame() {
        const anim = this.animations[this.currentAnimation];
        if (!anim) return 0;
        return anim.frames[this.currentFrameIndex];
    }
}
