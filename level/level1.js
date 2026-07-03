import { Box } from "../Service/Entity/pojo/Box.js";
import { Player } from "../Service/Entity/pojo/player.js";
import { scene } from "../Service/Entity/Scene.js";
import { setWorld } from "../Service/core/GameLoop.js";

const box = new Box();
box.x = 50;
box.y = 200;
scene.add(box);

const player = new Player();
player.x = 100;
player.y = 100;
scene.add(player);

setWorld(scene);