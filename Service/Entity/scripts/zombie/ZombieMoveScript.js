import { eventBus } from '@core/EventBus/EventBus.js';
import { EventTypes } from '@core/EventBus/EventTypes.js';

export function createZombieMoveScript() {
    let _entity = null;
    let _paused = false;

    function onStopMove({ entity }) {
        if (entity === _entity) _paused = true;
    }

    function onResumeMove({ entity }) {
        if (entity === _entity) _paused = false;
    }

    return {
        stage: 'LOGIC',

        enter(entity) {
            _entity = entity;
            entity.speed = 50;
            _paused = false;
            eventBus.on(EventTypes.ENTITY_STOP_MOVE, onStopMove);
            eventBus.on(EventTypes.ENTITY_RESUME_MOVE, onResumeMove);
        },

        update(entity, dt) {
            if (_paused) return;
            if (entity.state !== 'walk') return;
            entity.x -= entity.speed * dt;
        },

        exit() {
            eventBus.off(EventTypes.ENTITY_STOP_MOVE, onStopMove);
            eventBus.off(EventTypes.ENTITY_RESUME_MOVE, onResumeMove);
        },
    };
}
