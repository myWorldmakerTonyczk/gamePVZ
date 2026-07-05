import { eventBus } from '@core/EventBus/EventBus.js';
import { EventTypes } from '@core/EventBus/EventTypes.js';
import { scene } from '@entity/Scene.js';

/**
 * 子弹死亡脚本
 *
 * 监听 ENTITY_DIED 事件，从 scene 移除。
 * （当前子弹由 CollisionSystem 直接 scene.del，未来可改为发射 ENTITY_DIED）
 */
export function createBulletDeathScript() {
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
