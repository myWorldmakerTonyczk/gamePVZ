import { eventBus } from '@core/EventBus/EventBus.js';
import { EventTypes } from '@core/EventBus/EventTypes.js';
import { scene } from '@entity/Scene.js';

/**
 * 死亡脚本 — 监听 ENTITY_DIED 事件，从 scene 移除实体。
 *
 * 不处理 hp 逻辑（那是 HealthScript 的事），只做最终的清理。
 *
 * stage: CLEANUP（在所有 LOGIC 之后执行）
 */
export function createDeathScript() {
    let _entity = null;

    function onEntityDied({ entity }) {
        if (entity !== _entity) return;
        scene.del(entity);
    }

    return {
        stage: 'CLEANUP',

        enter(entity) {
            _entity = entity;
            eventBus.on(EventTypes.ENTITY_DIED, onEntityDied);
        },

        update() {},

        exit() {
            eventBus.off(EventTypes.ENTITY_DIED, onEntityDied);
        },
    };
}
