import { onUpdate } from '../../core/GameLoop.js';
import { GameState } from '../../core/State Machine.js';
import { isJustPressed } from '../../Input/Input.js';
import { KEY_MAP } from '../../Input/Input.js';
import { HookLabel } from '../HookLabel.js';
import { eventBus } from '../../core/EventBus/EventBus.js';
import { EventTypes } from '../../core/EventBus/EventTypes.js';
import { scene } from '../../Entity/Scene.js';
import { EntityType } from '../../Entity/EntityType.js';

let player = null;
scene.getEntities().forEach(e => {
    if(e.type === EntityType.PLAYER){
        player = e;
    }
});

function tick(dt) {
    if (!player || !isJustPressed(KEY_MAP.Space)) return;
    eventBus.emit(EventTypes.PLAYER_SHOOT, { x: player.x, y: player.y });
}

onUpdate(GameState.PLAYING, HookLabel.PLAYER_SYSTEM, tick);
