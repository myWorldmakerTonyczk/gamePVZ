import { eventBus } from '@core/EventBus/EventBus.js';
import { EventTypes } from '@core/EventBus/EventTypes.js';

/**
 * 僵尸生命脚本
 *
 * 监听 DAMAGE 事件扣血，hp≤0 时切换 state 并发射 ENTITY_DIED。
 */
export function createZombieHealthScript() {
    let _entity = null;

    function onDamage({ entity, damage }) {
        if (entity !== _entity) return;

        entity.hp -= damage;

        if (entity.hp <= 0) {
            entity.hp = 0;
            entity.state = 'dead';
            eventBus.emit(EventTypes.ENTITY_DIED, { entity }, 'ZombieHealthScript');
        }
    }

    return {
        stage: 'LOGIC',

        enter(entity) {
            _entity = entity;
            eventBus.on(EventTypes.DAMAGE, onDamage);
        },

        update() {},

        exit() {
            eventBus.off(EventTypes.DAMAGE, onDamage);
        },
    };
}
