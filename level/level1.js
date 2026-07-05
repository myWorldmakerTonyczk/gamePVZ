import { Zombie } from '@entity/pojo/Zombie.js';
import { Player } from '@entity/pojo/player.js';
import { scene } from '@entity/Scene.js';
import { setWorld } from '@core/GameLoop.js';
import { overlayManager } from '@overlay/OverlayManager.js';
import { HealthBar } from '@overlay/pojo/HealthBar.js';
import { attachScripts } from '@system/systemPojo/ScriptSystem.js';
import { createMoveScript } from '@entity/scripts/MoveScript.js';
import { createHealthScript } from '@entity/scripts/HealthScript.js';
import { createAttackScript } from '@entity/scripts/AttackScript.js';
import { createDeathScript } from '@entity/scripts/DeathScript.js';

function spawnZombie(x, y) {
    const zombie = new Zombie();
    zombie.x = x;
    zombie.y = y;
    attachScripts(zombie,
        createMoveScript(),
        createHealthScript(),
        createAttackScript(),
        createDeathScript(),
    );
    scene.add(zombie);
    overlayManager.add(new HealthBar(zombie));
}

spawnZombie(700, 200);
spawnZombie(700, 100);
spawnZombie(700, 50);
spawnZombie(700, 0);

const player = new Player();
player.x = 100;
player.y = 100;
scene.add(player);

setWorld(scene);
