/**
 * engine.js — 游戏主循环（心跳）
 *
 * 职责：requestAnimationFrame 循环、deltaTime 计算、状态分发
 * 不关心：实体更新细节、碰撞检测、渲染细节
 */

import { stateMachine } from './stateMachine.js';
import { world } from './world.js';

let lastTime = 0;
let running = false;
let rafId = null;

// ==================== 主循环 ====================

function tick(timestamp) {
    if (!running) return;

    // deltaTime（秒），上限 50ms 防止跳帧导致物理穿模
    const dt = Math.min((timestamp - lastTime) / 1000, 0.05);
    lastTime = timestamp;

    const state = stateMachine.getState();

    switch (state) {
        case 'PLAYING':
            world.update(dt);
            world.checkCollisions();
            break;
        case 'PAUSED':
        case 'MENU':
        case 'GAME_OVER':
        case 'VICTORY':
            // 不更新逻辑，但仍渲染
            break;
    }

    world.render();

    rafId = requestAnimationFrame(tick);
}

// ==================== 对外接口 ====================

/**
 * 启动游戏循环
 */
export function start() {
    if (running) return;
    running = true;
    lastTime = performance.now();
    rafId = requestAnimationFrame(tick);
}

/**
 * 停止游戏循环（完全终止，不同于暂停）
 */
export function stop() {
    running = false;
    if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
    }
}

/**
 * 获取当前是否在运行
 */
export function isRunning() {
    return running;
}
