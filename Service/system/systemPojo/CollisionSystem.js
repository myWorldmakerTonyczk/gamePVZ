import { scene } from '@entity/Scene.js';
import { onEnter, onExit, onUpdate } from '@core/GameLoop.js';
import { GameState } from '@core/State Machine.js';
import { checkCollisions } from '@utils/Collision.js';
import { EventTypes } from '@core/EventBus/EventTypes.js';
import { HookLabel } from '@system/HookLabel.js';
import { eventBus } from '@core/EventBus/EventBus.js';
import { EntityType } from '@entity/EntityType.js';

onUpdate(GameState.PLAYING, HookLabel.COLLISION_SYSTEM, () => {
    checkCollisions(scene.entities);
});

function onCollision({ a, b }) {
    if (a.type === EntityType.BULLET && b.type === EntityType.ENEMY) {
        eventBus.emit(EventTypes.ENTITY_DIED, { entity: a }, 'CollisionSystem');
        eventBus.emit(EventTypes.DAMAGE, { entity: b, damage: 25 }, 'CollisionSystem');
        return;
    }
    if (b.type === EntityType.BULLET && a.type === EntityType.ENEMY) {
        eventBus.emit(EventTypes.ENTITY_DIED, { entity: b }, 'CollisionSystem');
        eventBus.emit(EventTypes.DAMAGE, { entity: a, damage: 25 }, 'CollisionSystem');
        return;
    }
    if (a.type === EntityType.BULLET) eventBus.emit(EventTypes.ENTITY_DIED, { entity: a }, 'CollisionSystem');
    if (b.type === EntityType.BULLET) eventBus.emit(EventTypes.ENTITY_DIED, { entity: b }, 'CollisionSystem');
}

onEnter(GameState.PLAYING, HookLabel.COLLISION_SYSTEM, () => {
    eventBus.on(EventTypes.COLLISION, onCollision);
});

onExit(GameState.PLAYING, HookLabel.COLLISION_SYSTEM, () => {
    eventBus.off(EventTypes.COLLISION, onCollision);
});
