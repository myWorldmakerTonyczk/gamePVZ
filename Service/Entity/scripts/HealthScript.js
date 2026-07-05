import { eventBus } from '@core/EventBus/EventBus.js';
import { EventTypes } from '@core/EventBus/EventTypes.js';

/**
 * 生命脚本 — 管理 hp 变化和死亡。
 *
 * 监听 DAMAGE 事件扣血，hp≤0 时改变 state 并发射 ENTITY_DIED 事件。
 * 不负责移除实体（由 DeathScript 或其他系统处理）。
 *
 * stage: LOGIC
 */
export function createHealthScript() {
    let _entity = null;

    function onDamage({ entity, damage }) {
        if (entity !== _entity) return;

        entity.hp -= damage;

        if (entity.hp <= 0) {
            entity.hp = 0;
            entity.state = 'dead';
            eventBus.emit(EventTypes.ENTITY_DIED, { entity }, 'HealthScript');
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
