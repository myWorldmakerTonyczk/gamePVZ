import { eventBus } from '@core/EventBus/EventBus.js';
import { EventTypes } from '@core/EventBus/EventTypes.js';
import { EntityType } from '@entity/EntityType.js';

export function createPlayerDeathScript() {
    let _entity = null;

    function onEntityDied({ entity }) {
        if (entity !== _entity) return;
        if (entity.type !== EntityType.PLAYER) return;
        eventBus.emit(EventTypes.LEVEL_LOSE, {}, 'PlayerDeathScript');
    }

    return {
        stage: 'CLEANUP',
        enter(entity) { _entity = entity; eventBus.on(EventTypes.ENTITY_DIED, onEntityDied); },
        update() {},
        exit() { eventBus.off(EventTypes.ENTITY_DIED, onEntityDied); },
    };
}
