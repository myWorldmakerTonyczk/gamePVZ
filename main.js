import { scene } from './Service/Entity/Scene.js';
import { Box } from './Service/Entity/pojo/Box.js';
import { Player } from './Service/Entity/pojo/player.js';
import { start, setWorld, transition, GameState } from './Service/core/GameLoop.js';
import { initPauseSystem } from './Service/system/PauseSystem.js';

console.log("main loaded");

// 拿画布和画笔
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

// 创建场景 + 加实体
const box = new Box();
box.x = 50;
box.y = 200;
scene.add(box);

const player = new Player();
player.x = 100;
player.y = 100;
scene.add(player);

// 告诉引擎当前世界
setWorld(scene);

// 初始化系统
initPauseSystem();

// 启动
transition(GameState.PLAYING);
start(ctx, canvas);