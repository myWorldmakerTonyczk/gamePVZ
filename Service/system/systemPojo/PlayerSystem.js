import { onUpdate, transition } from '../../core/GameLoop.js';
import { GameState, getCurrentState } from '../../core/State Machine.js';
import { isJustPressed, isAction, } from '../../Input/Input.js';
import { KEY_MAP } from '../../Input/Input.js';
import { HookLabel } from '../HookLabel.js';
import { eventBus } from '../../core/EventBus/EventBus.js'
import { EventTypes } from '../../core/EventBus/EventTypes.js'
import { Player } from '../../Entity/pojo/player.js';
import { Bullet } from '../../Entity/pojo/Bullet.js';
import { scene } from '../../Entity/Scene.js';
import { EntityType } from '../../Entity/EntityType.js';

let player = null;
scene.getEntities().forEach(e => {
    if(e.type === EntityType.PLAYER){
        player = e;
    }
});
function toggle(dt){
    player.keyBoardMove(dt);
   if(isJustPressed(KEY_MAP.Space)){
    const bullet = new Bullet();
      bullet.x = player.x;
      bullet.y = player.y;
      bullet.speed = 500;
      bullet.shoot(player,1,bullet.speed);
      scene.add(bullet);
}
}

onUpdate(GameState.PLAYING, HookLabel.PLAYER_SYSTEM, (dt) => toggle(dt));