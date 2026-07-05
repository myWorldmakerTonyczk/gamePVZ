import { isAction } from '@input/Input.js';

/**
 * 玩家移动脚本
 *
 * update: 响应 WASD 键盘输入，控制玩家移动。
 */
export function createPlayerMoveScript() {
    return {
        stage: 'INPUT',

        enter(entity) {
            entity.speed = 200;
        },

        update(entity, dt) {
            if (isAction('left'))  entity.x -= entity.speed * dt;
            if (isAction('right')) entity.x += entity.speed * dt;
            if (isAction('up'))    entity.y -= entity.speed * dt;
            if (isAction('down'))  entity.y += entity.speed * dt;
        },

        exit() {},
    };
}
