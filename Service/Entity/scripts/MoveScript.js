import { eventBus } from '@core/EventBus/EventBus.js';
import { EventTypes } from '@core/EventBus/EventTypes.js';

/**
 * 移动脚本 — 只负责移动。
 *
 * 监听 ENTITY_STOP_MOVE 事件来暂停移动，
 * update 里根据 entity.state 决定是否移动。
 *
 * stage: LOGIC
 */
export function createMoveScript() {
    let _entity = null;
    let _paused = false;

    function onStopMove({ entity }) {
        if (entity === _entity) _paused = true;
    }

    return {
        stage: 'LOGIC',

        enter(entity) {
            _entity = entity;
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
