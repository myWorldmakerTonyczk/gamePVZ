import { GameState, currentState } from './State Machine.js';
import { scene } from '../Entity/Scene.js';
export { GameState };
// ==================== 帧率控制 ====================

let lastTime = 0;
const FIXED_DT = 1000 / 60; // 16.67ms，锁60帧
let accumulator = 0;
let ctx = null;
let canvas = null;


// 启动入口
export function start(_ctx, _canvas) {
    ctx = _ctx;
    canvas = _canvas;
    lastTime = performance.now();
    requestAnimationFrame(tick);
    //开始时设定状态
    transition(GameState.START);
}

function tick(timestamp) {
    const dt = timestamp - lastTime;
    lastTime = timestamp;
    accumulator += Math.min(dt, 200); // 防切后台时间爆炸

    while (accumulator >= FIXED_DT) {
        update(FIXED_DT / 1000);
        accumulator -= FIXED_DT;
    }

    render();
    requestAnimationFrame(tick);
}

// ==================== 每帧逻辑更新 ====================

export function update(dt) {
    // 各模块注册的每帧钩子
    hooks.onUpdate[currentState]?.forEach(h => h.fn(dt));
    scene.update(dt);
}




function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    scene.render(ctx);
}

// ==================== 钩子系统 ====================

export const hooks = {
    onEnter: {},
    onExit: {},
    onUpdate: {},
};

/**
 * 注册进入某状态时的回调
 * @param {string} state  - 状态名（用 GameState 枚举）
 * @param {string} label  - 标签（调试用）
 * @param {Function} fn   - 回调函数
 */
export function onEnter(state, label, fn) {
    if (!hooks.onEnter[state]) {
        hooks.onEnter[state] = [];
    }
    hooks.onEnter[state].push({ label, fn });
}

export function onExit(state, label, fn) {
    if (!hooks.onExit[state]) {
        hooks.onExit[state] = [];
    }
    hooks.onExit[state].push({ label, fn });
}

export function onUpdate(state, label, fn) {
    if (!hooks.onUpdate[state]) {
        hooks.onUpdate[state] = [];
    }
    hooks.onUpdate[state].push({ label, fn });
}

// ==================== 状态转换 ====================

/**
 * 状态切换（唯一入口，不允许直接改 currentState）
 * @param {string} newState - 目标状态
 */
export function transition(newState) {
    // 离开旧状态
    hooks.onExit[currentState]?.forEach(h => h.fn());

    const oldState = currentState;
    currentState = newState;

    // 进入新状态
    hooks.onEnter[newState]?.forEach(h => {
        console.log(`[SM] ${oldState} → ${newState}  |  ${h.label}`);
        h.fn();
    });
}