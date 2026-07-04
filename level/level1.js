import { Zombie } from '@entity/pojo/Zombie.js';
import { Player } from '@entity/pojo/player.js';
import { scene } from '@entity/Scene.js';
import { setWorld } from '@core/GameLoop.js';
import { overlayManager } from '@overlay/OverlayManager.js';
import { HealthBar } from '@overlay/pojo/HealthBar.js';

const zombie = new Zombie();
zombie.x = 700;
zombie.y = 200;
scene.add(zombie);
overlayManager.add(new HealthBar(zombie));


const zombie2 = new Zombie();
zombie2.x = 700;
zombie2.y = 100;
scene.add(zombie2);
overlayManager.add(new HealthBar(zombie2));


const player = new Player();
player.x = 100;
player.y = 100;
scene.add(player);

setWorld(scene);
