/**
 * Phaser 游戏配置常量
 * 从 V1 迁移并适配 Phaser 格式
 */

export const GAME_CONFIG = {
    CANVAS_WIDTH: 800,
    CANVAS_HEIGHT: 480,
    TILE_SIZE: 32,
    TARGET_FPS: 60,
};

export const PHYSICS = {
    GRAVITY: 800,           // Phaser 使用像素/秒²
    MAX_VELOCITY_Y: 600,
    GROUND_DRAG: 800,
    AIR_DRAG: 100,
};

export const PLAYER_CONFIG = {
    WIDTH: 32,
    HEIGHT: 32,
    WALK_SPEED: 200,
    ACCELERATION: 600,
    AIR_ACCELERATION: 400,
    JUMP_VELOCITY: -400,
    JUMP_HOLD_VELOCITY: -50,
    MAX_JUMP_TIME: 250,
    INVINCIBLE_DURATION: 2000,
    BOUNCE_VELOCITY: -300,
};

export const ENEMY_CONFIG = {
    GOOMBA_SPEED: 60,
    SQUISH_DURATION: 500,
};

export const COIN_CONFIG = {
    WIDTH: 24,
    HEIGHT: 24,
    VALUE: 100,
    ANIMATION_SPEED: 150,
};

export const SCORING = {
    COIN_VALUE: 100,
    ENEMY_STOMP: 200,
    GOAL_BONUS: 1000,
};

export const GAME_STATE = {
    LOADING: 'loading',
    READY: 'ready',
    PLAYING: 'playing',
    PAUSED: 'paused',
    WIN: 'win',
    LOSE: 'lose',
};

export const TILE_TYPES = {
    AIR: 0,
    GROUND: 1,
    BRICK: 2,
    QUESTION: 3,
    PIPE_TOP_LEFT: 4,
    PIPE_TOP_RIGHT: 5,
    PIPE_BODY_LEFT: 6,
    PIPE_BODY_RIGHT: 7,
    GOAL: 8,
};

// 可碰撞的瓦片类型
export const SOLID_TILES = [
    TILE_TYPES.GROUND,
    TILE_TYPES.BRICK,
    TILE_TYPES.QUESTION,
    TILE_TYPES.PIPE_TOP_LEFT,
    TILE_TYPES.PIPE_TOP_RIGHT,
    TILE_TYPES.PIPE_BODY_LEFT,
    TILE_TYPES.PIPE_BODY_RIGHT,
];

export const KEYS = {
    LEFT: ['ArrowLeft', 'KeyA'],
    RIGHT: ['ArrowRight', 'KeyD'],
    JUMP: ['Space', 'ArrowUp', 'KeyW'],
    PAUSE: ['KeyP'],
    RESTART: ['KeyR'],
};
