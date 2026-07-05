import { Zombie } from '@entity/pojo/Zombie.js';
import { Player } from '@entity/pojo/player.js';
import { scene } from '@entity/Scene.js';
import { setWorld, onEnter, onExit } from '@core/GameLoop.js';
import { GameState } from '@core/State Machine.js';
import { eventBus } from '@core/EventBus/EventBus.js';
import { EventTypes } from '@core/EventBus/EventTypes.js';
import { EntityType } from '@entity/EntityType.js';
import { overlayManager } from '@overlay/OverlayManager.js';
import { HealthBar } from '@overlay/pojo/HealthBar.js';
import { attachScripts } from '@system/systemPojo/ScriptSystem.js';
import { createZombieMoveScript } from '@entity/scripts/zombie/ZombieMoveScript.js';
import { createZombieHealthScript } from '@entity/scripts/zombie/ZombieHealthScript.js';
import { createZombieAttackScript } from '@entity/scripts/zombie/ZombieAttackScript.js';
import { createZombieDeathScript } from '@entity/scripts/zombie/ZombieDeathScript.js';
import { createPlayerShootScript } from '@entity/scripts/player/PlayerShootScript.js';
import { createPlayerMoveScript } from '@entity/scripts/player/PlayerMoveScript.js';
import { createPlayerHealthScript } from '@entity/scripts/player/PlayerHealthScript.js';
import { createPlayerDeathScript } from '@entity/scripts/player/PlayerDeathScript.js';

function spawnZombie(x, y) {
    const zombie = new Zombie();
    zombie.x = x;
    zombie.y = y;
    zombie.attack = 10;
    attachScripts(zombie,
        createZombieMoveScript(),
        createZombieHealthScript(),
        createZombieAttackScript(),
        createZombieDeathScript(),
    );
    scene.add(zombie);
    overlayManager.add(new HealthBar(zombie));
}

// ==== 关卡胜负条件 ====
let _rulesRegistered = false;

function _registerRules() {
    if (_rulesRegistered) return;
    _rulesRegistered = true;

    function onEntityDied({ entity }) {
        if (entity.type === EntityType.PLAYER) {
            eventBus.emit(EventTypes.LEVEL_LOSE, {}, 'Level1');
            return;
        }
        if (entity.type === EntityType.ENEMY) {
            const enemies = scene.getEntities().filter(e => e.type === EntityType.ENEMY);
            if (enemies.length === 0) {
                eventBus.emit(EventTypes.LEVEL_WIN, {}, 'Level1');
            }
        }
    }

    onEnter(GameState.PLAYING, 'Level1_Rules', () => {
        eventBus.on(EventTypes.ENTITY_DIED, onEntityDied);
    });

    onExit(GameState.PLAYING, 'Level1_Rules', () => {
        eventBus.off(EventTypes.ENTITY_DIED, onEntityDied);
    });
}

export function init() {
    _registerRules();

    spawnZombie(700, 200);
    spawnZombie(700, 100);
    spawnZombie(700, 50);
    spawnZombie(700, 0);

    const player = new Player();
    player.x = 100;
    player.y = 100;
    attachScripts(player,
        createPlayerMoveScript(),
        createPlayerShootScript(),
        createPlayerHealthScript(),
        createPlayerDeathScript(),
    );
    scene.add(player);
    overlayManager.add(new HealthBar(player));

    setWorld(scene);
}

init();
