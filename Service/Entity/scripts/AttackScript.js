import { eventBus } from '@core/EventBus/EventBus.js';
import { EventTypes } from '@core/EventBus/EventTypes.js';
import { EntityType } from '@entity/EntityType.js';

/**
 * 攻击脚本 — 检测碰撞并触发攻击。
 *
 * 监听 COLLISION 事件，当自身与敌方碰撞时：
 *   1. 切换 state 为 'attack'（→ 动画系统自动切攻击动画）
 *   2. 发射 ENTITY_STOP_MOVE 通知 MoveScript 暂停移动
 *
 * 纯事件驱动，无 update。
 * stage: LOGIC
 */
export function createAttackScript() {
    let _entity = null;

    function onCollision({ a, b }) {
        if (a !== _entity && b !== _entity) return;
        const other = a === _entity ? b : a;

        // 只在碰到玩家时攻击
        if (other.type !== EntityType.PLAYER) return;

        _entity.state = 'attack';
        eventBus.emit(EventTypes.ENTITY_STOP_MOVE, { entity: _entity }, 'AttackScript');
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
