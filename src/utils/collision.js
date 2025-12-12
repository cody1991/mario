/**
 * AABB 碰撞检测工具
 */

/**
 * 检测两个矩形是否碰撞
 * @param {Object} a - 第一个矩形 {x, y, width, height}
 * @param {Object} b - 第二个矩形 {x, y, width, height}
 * @returns {boolean} 是否碰撞
 */
export function checkCollision(a, b) {
    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}

/**
 * 获取碰撞方向
 * @param {Object} a - 移动物体 {x, y, width, height}
 * @param {Object} b - 静止物体 {x, y, width, height}
 * @returns {string} 碰撞方向: 'top', 'bottom', 'left', 'right'
 */
export function getCollisionSide(a, b) {
    const overlapLeft = (a.x + a.width) - b.x;
    const overlapRight = (b.x + b.width) - a.x;
    const overlapTop = (a.y + a.height) - b.y;
    const overlapBottom = (b.y + b.height) - a.y;
    
    const minOverlapX = Math.min(overlapLeft, overlapRight);
    const minOverlapY = Math.min(overlapTop, overlapBottom);
    
    if (minOverlapX < minOverlapY) {
        return overlapLeft < overlapRight ? 'right' : 'left';
    } else {
        return overlapTop < overlapBottom ? 'bottom' : 'top';
    }
}

/**
 * 解决碰撞，返回修正后的位置
 * @param {Object} entity - 移动实体 {x, y, width, height, velocityX, velocityY}
 * @param {Object} obstacle - 障碍物 {x, y, width, height}
 * @returns {Object} 修正后的位置和速度
 */
export function resolveCollision(entity, obstacle) {
    const side = getCollisionSide(entity, obstacle);
    const result = {
        x: entity.x,
        y: entity.y,
        velocityX: entity.velocityX,
        velocityY: entity.velocityY,
        side: side,
        isGrounded: false,
    };
    
    switch (side) {
        case 'top':
            // 从上方碰撞（落地）
            result.y = obstacle.y - entity.height;
            result.velocityY = 0;
            result.isGrounded = true;
            break;
        case 'bottom':
            // 从下方碰撞（撞头）
            result.y = obstacle.y + obstacle.height;
            result.velocityY = 0;
            break;
        case 'left':
            // 从左侧碰撞
            result.x = obstacle.x - entity.width;
            result.velocityX = 0;
            break;
        case 'right':
            // 从右侧碰撞
            result.x = obstacle.x + obstacle.width;
            result.velocityX = 0;
            break;
    }
    
    return result;
}

/**
 * 检测是否从上方踩踏（用于踩敌人判定）
 * @param {Object} a - 攻击者 {y, height, velocityY}
 * @param {Object} b - 被攻击者 {y}
 * @returns {boolean} 是否为踩踏
 */
export function isStompingOn(a, b) {
    // 攻击者底部在被攻击者顶部附近，且正在下落
    const aBottom = a.y + a.height;
    const threshold = 10; // 容差值
    return a.velocityY > 0 && aBottom <= b.y + threshold;
}

/**
 * 获取实体的碰撞边界
 * @param {Object} entity - 实体对象
 * @returns {Object} 碰撞边界 {x, y, width, height}
 */
export function getBounds(entity) {
    return {
        x: entity.x,
        y: entity.y,
        width: entity.width,
        height: entity.height,
    };
}

/**
 * 处理实体与关卡瓦片的碰撞
 * @param {Object} entity - 实体 {x, y, width, height, velocityX, velocityY}
 * @param {Level} level - 关卡对象
 * @returns {Object} 碰撞结果 {isGrounded, hitCeiling, hitWall}
 */
export function handleTileCollision(entity, level) {
    const result = {
        isGrounded: false,
        hitCeiling: false,
        hitWall: false,
    };

    // 水平碰撞检测
    const horizontalBounds = {
        x: entity.x,
        y: entity.y + 2, // 稍微缩小垂直范围避免边缘问题
        width: entity.width,
        height: entity.height - 4,
    };
    
    const horizontalTiles = level.getCollidingTiles(horizontalBounds);
    for (const tile of horizontalTiles) {
        if (checkCollision(horizontalBounds, tile)) {
            const side = getCollisionSide(horizontalBounds, tile);
            if (side === 'left') {
                entity.x = tile.x - entity.width;
                entity.velocityX = 0;
                result.hitWall = true;
            } else if (side === 'right') {
                entity.x = tile.x + tile.width;
                entity.velocityX = 0;
                result.hitWall = true;
            }
        }
    }

    // 垂直碰撞检测
    const verticalBounds = {
        x: entity.x + 2, // 稍微缩小水平范围避免边缘问题
        y: entity.y,
        width: entity.width - 4,
        height: entity.height,
    };
    
    const verticalTiles = level.getCollidingTiles(verticalBounds);
    for (const tile of verticalTiles) {
        if (checkCollision(verticalBounds, tile)) {
            const side = getCollisionSide(verticalBounds, tile);
            if (side === 'top' && entity.velocityY >= 0) {
                entity.y = tile.y - entity.height;
                entity.velocityY = 0;
                result.isGrounded = true;
            } else if (side === 'bottom' && entity.velocityY < 0) {
                entity.y = tile.y + tile.height;
                entity.velocityY = 0;
                result.hitCeiling = true;
            }
        }
    }

    return result;
}
