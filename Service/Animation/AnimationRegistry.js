const _map = new Map();

/**
 * 注册动画
 * @param {string} key - 动画名（如 'zombieWalk'）
 * @param {Animation} animation
 */
export function registerAnimation(key, animation) {
    _map.set(key, animation);
}

/**
 * @param {string} key
 * @returns {Animation|null}
 */
export function getAnimation(key) {
    return _map.get(key) ?? null;
}
