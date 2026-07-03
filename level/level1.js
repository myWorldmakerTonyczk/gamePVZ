import { Box } from '@entity/pojo/Box.js';
import { Player } from '@entity/pojo/player.js';
import { scene } from '@entity/Scene.js';
import { setWorld } from '@core/GameLoop.js';

const box = new Box();
box.x = 50;
box.y = 200;
scene.add(box);

const player = new Player();
player.x = 100;
player.y = 100;
scene.add(player);

setWorld(scene);
