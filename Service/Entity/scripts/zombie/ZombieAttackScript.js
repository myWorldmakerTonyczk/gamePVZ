import { eventBus } from '@core/EventBus/EventBus.js';
import { EventTypes } from '@core/EventBus/EventTypes.js';
import { EntityType } from '@entity/EntityType.js';

/**
 * 僵尸攻击脚本
 *
 * 监听 COLLISION 事件，碰到玩家时：
 *   1. 切 state 为 'attack'（→ 动画系统自动响应）
 *   2. 发 ENTITY_STOP_MOVE 通知移动脚本停步
 */
export function createZombieAttackScript() {
    let _entity = null;

    function onCollision({ a, b }) {
        if (a !== _entity && b !== _entity) return;
        const other = a === _entity ? b : a;
        if (other.type !== EntityType.PLAYER) return;

        _entity.state = 'attack';
        eventBus.emit(EventTypes.ENTITY_STOP_MOVE, { entity: _entity }, 'ZombieAttackScript');
    }

    return {
        stage: 'LOGIC',

        enter(entity) {
            _entity = entity;
            eventBus.on(EventTypes.COLLISION, onCollision);
        },

        update() {},

        exit() {
            eventBus.off(EventTypes.COLLISION, onCollision);
        },
    };
}
