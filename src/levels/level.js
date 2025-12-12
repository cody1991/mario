/**
 * 关卡类
 * 管理瓦片地图和关卡渲染
 */

import { GAME_CONFIG, TILE_TYPES } from '../utils/constants.js';

export class Level {
    /**
     * @param {Object} data - 关卡数据
     * @param {AssetLoader} loader - 资源加载器
     */
    constructor(data, loader) {
        this.loader = loader;
        
        // 关卡尺寸
        this.tileSize = data.tileSize || GAME_CONFIG.TILE_SIZE;
        this.widthInTiles = data.width;
        this.heightInTiles = data.height;
        this.width = this.widthInTiles * this.tileSize;
        this.height = this.heightInTiles * this.tileSize;
        
        // 瓦片地图
        this.tiles = data.tiles;
        
        // 实体数据
        this.entityData = data.entities || [];
        
        // 终点位置
        this.goal = data.goal || { x: this.width - 100, y: 0 };
        
        // 玩家起始位置
        this.spawnPoint = data.spawnPoint || { x: 100, y: this.height - 100 };
    }

    /**
     * 获取指定位置的瓦片类型
     * @param {number} tileX - 瓦片 X 坐标
     * @param {number} tileY - 瓦片 Y 坐标
     * @returns {number} 瓦片类型
     */
    getTile(tileX, tileY) {
        if (tileX < 0 || tileX >= this.widthInTiles || 
            tileY < 0 || tileY >= this.heightInTiles) {
            return TILE_TYPES.AIR;
        }
        return this.tiles[tileY]?.[tileX] ?? TILE_TYPES.AIR;
    }

    /**
     * 设置指定位置的瓦片
     * @param {number} tileX 
     * @param {number} tileY 
     * @param {number} type 
     */
    setTile(tileX, tileY, type) {
        if (tileX >= 0 && tileX < this.widthInTiles && 
            tileY >= 0 && tileY < this.heightInTiles) {
            if (this.tiles[tileY]) {
                this.tiles[tileY][tileX] = type;
            }
        }
    }

    /**
     * 世界坐标转瓦片坐标
     * @param {number} worldX 
     * @param {number} worldY 
     * @returns {Object} {tileX, tileY}
     */
    worldToTile(worldX, worldY) {
        return {
            tileX: Math.floor(worldX / this.tileSize),
            tileY: Math.floor(worldY / this.tileSize),
        };
    }

    /**
     * 瓦片坐标转世界坐标
     * @param {number} tileX 
     * @param {number} tileY 
     * @returns {Object} {x, y}
     */
    tileToWorld(tileX, tileY) {
        return {
            x: tileX * this.tileSize,
            y: tileY * this.tileSize,
        };
    }

    /**
     * 检查瓦片是否为实心（可碰撞）
     * @param {number} tileX 
     * @param {number} tileY 
     * @returns {boolean}
     */
    isSolid(tileX, tileY) {
        const tile = this.getTile(tileX, tileY);
        return tile !== TILE_TYPES.AIR;
    }

    /**
     * 获取与实体碰撞的瓦片列表
     * @param {Object} bounds - {x, y, width, height}
     * @returns {Array} 碰撞瓦片数组 [{tileX, tileY, x, y, width, height, type}]
     */
    getCollidingTiles(bounds) {
        const tiles = [];
        
        const startTileX = Math.floor(bounds.x / this.tileSize);
        const endTileX = Math.floor((bounds.x + bounds.width - 1) / this.tileSize);
        const startTileY = Math.floor(bounds.y / this.tileSize);
        const endTileY = Math.floor((bounds.y + bounds.height - 1) / this.tileSize);
        
        for (let tileY = startTileY; tileY <= endTileY; tileY++) {
            for (let tileX = startTileX; tileX <= endTileX; tileX++) {
                if (this.isSolid(tileX, tileY)) {
                    tiles.push({
                        tileX,
                        tileY,
                        x: tileX * this.tileSize,
                        y: tileY * this.tileSize,
                        width: this.tileSize,
                        height: this.tileSize,
                        type: this.getTile(tileX, tileY),
                    });
                }
            }
        }
        
        return tiles;
    }

    /**
     * 渲染关卡
     * @param {CanvasRenderingContext2D} ctx 
     * @param {Camera} camera 
     */
    render(ctx, camera) {
        const tilesImage = this.loader.getImage('tiles');
        
        // 计算可见范围
        const startTileX = Math.floor(camera.x / this.tileSize);
        const endTileX = Math.ceil((camera.x + camera.width) / this.tileSize);
        const startTileY = Math.floor(camera.y / this.tileSize);
        const endTileY = Math.ceil((camera.y + camera.height) / this.tileSize);
        
        for (let tileY = startTileY; tileY <= endTileY; tileY++) {
            for (let tileX = startTileX; tileX <= endTileX; tileX++) {
                const tile = this.getTile(tileX, tileY);
                
                if (tile === TILE_TYPES.AIR) continue;
                
                const screenX = tileX * this.tileSize - camera.x;
                const screenY = tileY * this.tileSize - camera.y;
                
                if (tilesImage) {
                    // 从精灵图绘制
                    const srcX = (tile - 1) * this.tileSize;
                    ctx.drawImage(
                        tilesImage,
                        srcX, 0, this.tileSize, this.tileSize,
                        screenX, screenY, this.tileSize, this.tileSize
                    );
                } else {
                    // 占位颜色
                    ctx.fillStyle = this.getTileColor(tile);
                    ctx.fillRect(screenX, screenY, this.tileSize, this.tileSize);
                }
            }
        }
    }

    /**
     * 获取瓦片占位颜色
     * @param {number} type 
     * @returns {string}
     */
    getTileColor(type) {
        switch (type) {
            case TILE_TYPES.GROUND:
                return '#8B4513';
            case TILE_TYPES.BRICK:
                return '#CD853F';
            case TILE_TYPES.QUESTION:
                return '#FFD700';
            case TILE_TYPES.PIPE_TOP_LEFT:
            case TILE_TYPES.PIPE_TOP_RIGHT:
            case TILE_TYPES.PIPE_BODY_LEFT:
            case TILE_TYPES.PIPE_BODY_RIGHT:
                return '#228B22';
            case TILE_TYPES.GOAL:
                return '#808080';
            default:
                return '#ff00ff';
        }
    }
}
