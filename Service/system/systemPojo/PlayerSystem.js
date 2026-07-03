import { onUpdate } from '@core/GameLoop.js';
import { GameState } from '@core/State Machine.js';
import { isJustPressed } from '@input/Input.js';
import { KEY_MAP } from '@input/Input.js';
import { HookLabel } from '@system/HookLabel.js';
import { eventBus } from '@core/EventBus/EventBus.js';
import { EventTypes } from '@core/EventBus/EventTypes.js';
import { scene } from '@entity/Scene.js';
import { EntityType } from '@entity/EntityType.js';
import { isJustClicked, MouseMap, getMousePos } from '@input/Mouse.js';

let player = null;
scene.getEntities().forEach(e => {
    if(e.type === EntityType.PLAYER){
        player = e;
    }
});

function tick(dt) {
    if (!player) return;


    if (isJustClicked(MouseMap.LEFT)) {
        const canvas = document.getElementById('game');
        const { x: mx, y: my } = getMousePos(canvas);
        const angle = Math.atan2(my - player.y, mx - player.x);
        eventBus.emit(EventTypes.PLAYER_SHOOT, { x: player.x, y: player.y, angle });
    }
}

onUpdate(GameState.PLAYING, HookLabel.PLAYER_SYSTEM, tick);
