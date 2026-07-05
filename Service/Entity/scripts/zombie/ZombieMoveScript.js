import { eventBus } from '@core/EventBus/EventBus.js';
import { EventTypes } from '@core/EventBus/EventTypes.js';

/**
 * 僵尸移动脚本
 *
 * update: state==='walk' 时向左移动
 * 监听 ENTITY_STOP_MOVE → 暂停移动
 */
export function createZombieMoveScript() {
    let _entity = null;
    let _paused = false;

    function onStopMove({ entity }) {
        if (entity === _entity) _paused = true;
    }

    return {
        stage: 'LOGIC',

        enter(entity) {
            _entity = entity;
            entity.speed = 50;
            _paused = false;
            eventBus.on(EventTypes.ENTITY_STOP_MOVE, onStopMove);
        },

        update(entity, dt) {
            if (_paused) return;
            if (entity.state !== 'walk') return;
            entity.x -= entity.speed * dt;
        },

        exit() {
            eventBus.off(EventTypes.ENTITY_STOP_MOVE, onStopMove);
        },
    };
}
