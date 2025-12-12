/**
 * 游戏常量配置
 * 所有游戏参数集中管理
 */

export const GAME_CONFIG = {
    // 画布尺寸
    CANVAS_WIDTH: 800,
    CANVAS_HEIGHT: 480,
    
    // 瓦片尺寸
    TILE_SIZE: 32,
    
    // 游戏循环
    TARGET_FPS: 60,
    FIXED_TIMESTEP: 1000 / 60, // 16.67ms
};

export const PHYSICS = {
    // 重力
    GRAVITY: 0.8,
    MAX_FALL_SPEED: 12,
    
    // 摩擦力
    GROUND_FRICTION: 0.85,
    AIR_RESISTANCE: 0.98,
};

export const MARIO_CONFIG = {
    // 尺寸
    WIDTH: 32,
    HEIGHT: 32,
    
    // 移动
    WALK_SPEED: 5,
    RUN_SPEED: 7,
    ACCELERATION: 0.8,
    DECELERATION: 0.3,
    
    // 跳跃
    JUMP_FORCE: -14,
    JUMP_HOLD_FORCE: -0.5,
    MAX_JUMP_TIME: 250, // ms
    
    // 动画
    ANIMATION_SPEED: 100, // ms per frame
    
    // 无敌时间
    INVINCIBLE_DURATION: 2000, // ms
};

export const ENEMY_CONFIG = {
    // Goomba
    GOOMBA_WIDTH: 32,
    GOOMBA_HEIGHT: 32,
    GOOMBA_SPEED: 1,
    SQUISH_DURATION: 500, // ms
};

export const COIN_CONFIG = {
    WIDTH: 24,
    HEIGHT: 24,
    VALUE: 100,
    ANIMATION_SPEED: 150, // ms per frame
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

export const KEYS = {
    LEFT: ['ArrowLeft', 'KeyA'],
    RIGHT: ['ArrowRight', 'KeyD'],
    JUMP: ['Space', 'ArrowUp', 'KeyW'],
    PAUSE: ['KeyP'],
    RESTART: ['KeyR'],
};
