import { eventBus } from '@core/EventBus/EventBus.js';
import { EventTypes } from '@core/EventBus/EventTypes.js';
import { scene } from '@entity/Scene.js';

export function createPlayerDeathScript() {
    let _entity = null;

    function onEntityDied({ entity }) {
        if (entity !== _entity) return;
        scene.del(entity);
    }

    return {
        stage: 'CLEANUP',
        enter(entity) { _entity = entity; eventBus.on(EventTypes.ENTITY_DIED, onEntityDied); },
        update() {},
        exit() { eventBus.off(EventTypes.ENTITY_DIED, onEntityDied); },
    };
}
