/**
 * 游戏实体基类
 * 所有游戏对象的父类
 */

export class Entity {
    /**
     * @param {number} x - X 坐标
     * @param {number} y - Y 坐标
     * @param {number} width - 宽度
     * @param {number} height - 高度
     */
    constructor(x, y, width, height) {
        // 位置
        this.x = x;
        this.y = y;
        
        // 尺寸
        this.width = width;
        this.height = height;
        
        // 速度
        this.velocityX = 0;
        this.velocityY = 0;
        
        // 精灵
        this.sprite = null;
        
        // 状态
        this.active = true;
    }

    /**
     * 更新逻辑（子类重写）
     * @param {number} deltaTime - 时间增量 (ms)
     * @param {Object} input - 输入状态
     */
    update(deltaTime, input) {
        // 更新精灵动画
        if (this.sprite) {
            this.sprite.update(deltaTime);
        }
    }

    /**
     * 渲染（子类重写）
     * @param {CanvasRenderingContext2D} ctx - 画布上下文
     * @param {Object} camera - 摄像机
     */
    render(ctx, camera) {
        if (!this.active) return;
        
        // 计算屏幕坐标
        const screenX = this.x - camera.x;
        const screenY = this.y - camera.y;
        
        // 视口裁剪
        if (screenX + this.width < 0 || screenX > camera.width ||
            screenY + this.height < 0 || screenY > camera.height) {
            return;
        }
        
        // 绘制精灵或占位矩形
        if (this.sprite) {
            this.sprite.draw(ctx, screenX, screenY, this.facingRight === false);
        } else {
            ctx.fillStyle = '#ff00ff';
            ctx.fillRect(screenX, screenY, this.width, this.height);
        }
    }

    /**
     * 获取碰撞边界
     * @returns {Object} {x, y, width, height}
     */
    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
        };
    }

    /**
     * 获取中心点
     * @returns {Object} {x, y}
     */
    getCenter() {
        return {
            x: this.x + this.width / 2,
            y: this.y + this.height / 2,
        };
    }

    /**
     * 销毁实体
     */
    destroy() {
        this.active = false;
    }
}
