import { scene } from './Service/Entity/Scene.js';
import { Box } from './Service/Entity/pojo/Box.js';
import { start, onUpdate, transition, GameState,  } from './Service/core/GameLoop.js';


console.log("main loaded");
console.log(scene);

// 拿画布和画笔
export const canvas = document.getElementById('game');
export const ctx = canvas.getContext('2d');


// 创建场景 + 加实体
const box = new Box();
box.x = 50;
box.y = 200;
scene.add(box);

start(ctx, canvas);
