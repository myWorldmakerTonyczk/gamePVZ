import { scene } from '@entity/Scene.js';
import { onUpdate } from '@core/GameLoop.js';
import { GameState } from '@core/State Machine.js';
import { checkCollisions } from '@utils/Collision.js';
import { EventTypes } from '@core/EventBus/EventTypes.js';
import { HookLabel } from '@system/HookLabel.js';

onUpdate(GameState.PLAYING, HookLabel.COLLISION_SYSTEM, () => {
    checkCollisions(scene.entities);
});
