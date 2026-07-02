/**
 * stateMachine.js — 游戏状态机
 *
 * 职责：状态枚举、合法转换校验、进入/退出钩子
 * 不关心：主循环、渲染、实体逻辑
 */

// ==================== 状态枚举 ====================

export const State = Object.freeze({
    LOADING:   'LOADING',
    MENU:      'MENU',
    PLAYING:   'PLAYING',
    PAUSED:    'PAUSED',
    GAME_OVER: 'GAME_OVER',
    VICTORY:   'VICTORY',
});

// ==================== 合法转换表 ====================

const TRANSITIONS = {
    [State.LOADING]:   [State.MENU],
    [State.MENU]:      [State.PLAYING],
    [State.PLAYING]:   [State.PAUSED, State.GAME_OVER, State.VICTORY],
    [State.PAUSED]:    [State.PLAYING, State.MENU],
    [State.GAME_OVER]: [State.MENU],
    [State.VICTORY]:   [State.MENU],
};

// ==================== 内部状态 ====================

let current = State.LOADING;
const listeners = {
    onEnter: {},
    onExit:  {},
    onChange: [],
};

// ==================== 核心方法 ====================

/**
 * 尝试状态转换
 * @param {string} newState - 目标状态（使用 State 枚举）
 * @returns {boolean} 是否成功
 */
export function transition(newState) {
    const allowed = TRANSITIONS[current];
    if (!allowed || !allowed.includes(newState)) {
        console.warn(
            `[StateMachine] 非法转换: ${current} → ${newState}`
        );
        return false;
    }

    const oldState = current;

    // 触发离开钩子
    listeners.onExit[oldState]?.();

    current = newState;

    // 触发进入钩子
    listeners.onEnter[newState]?.();

    // 触发通用变更回调
    listeners.onChange.forEach(fn => fn(newState, oldState));

    console.log(`[StateMachine] ${oldState} → ${newState}`);
    return true;
}

/**
 * 获取当前状态
 */
export function getState() {
    return current;
}

// ==================== 钩子注册 ====================

/**
 * 注册进入某状态的钩子
 */
export function onEnter(state, fn) {
    listeners.onEnter[state] = fn;
}

/**
 * 注册离开某状态的钩子
 */
export function onExit(state, fn) {
    listeners.onExit[state] = fn;
}

/**
 * 注册任意状态变更的回调
 */
export function onChange(fn) {
    listeners.onChange.push(fn);
}
