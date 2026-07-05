import { eventBus } from '@core/EventBus/EventBus.js';
import { EventTypes } from '@core/EventBus/EventTypes.js';
import { scene } from '@entity/Scene.js';
import { EntityType } from '@entity/EntityType.js';

export function createZombieDeathScript() {
    let _entity = null;

    function onEntityDied({ entity }) {
        if (entity !== _entity) return;
        scene.del(entity);

        const enemies = scene.getEntities().filter(e => e.type === EntityType.ENEMY);
        if (enemies.length === 0) {
            eventBus.emit(EventTypes.LEVEL_WIN, {}, 'ZombieDeathScript');
        }
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
