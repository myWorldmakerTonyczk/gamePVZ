/**
 * 子弹移动脚本
 *
 * 沿 angle 方向以 speed 速度飞行。
 * stage: LOGIC
 */
export function createBulletMoveScript() {
    return {
        stage: 'LOGIC',

        enter(entity) {
            entity.speed = entity.speed || 500;
        },

        update(entity, dt) {
            entity.x += Math.cos(entity.angle) * entity.speed * dt;
            entity.y += Math.sin(entity.angle) * entity.speed * dt;
        },

        exit() {},
    };
}
