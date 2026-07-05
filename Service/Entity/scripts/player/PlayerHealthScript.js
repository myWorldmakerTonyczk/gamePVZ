import { eventBus } from '@core/EventBus/EventBus.js';
import { EventTypes } from '@core/EventBus/EventTypes.js';

export function createPlayerHealthScript() {
    let _entity = null;

    function onDamage({ entity, damage }) {
        if (entity !== _entity) return;
        entity.hp -= damage;
        if (entity.hp <= 0) {
            entity.hp = 0;
            entity.state = 'dead';
            eventBus.emit(EventTypes.ENTITY_DIED, { entity }, 'PlayerHealthScript');
        }
    }

    return {
        stage: 'LOGIC',
        enter(entity) { _entity = entity; eventBus.on(EventTypes.DAMAGE, onDamage); },
        update() {},
        exit() { eventBus.off(EventTypes.DAMAGE, onDamage); },
    };
}
