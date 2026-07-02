import { Scene } from './Service/Entity/Scene.js';
import { Box } from './Service/Entity/pojo/Box.js';
import { start, onUpdate, transition, GameState } from './Service/core/GameLoop.js';

// 拿画布和画笔
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

// 创建场景 + 加实体
const scene = new Scene();
const box = new Box();
box.x = 50;
box.y = 200;
scene.add(box);

// 用 hook 注册 scene 的每帧更新 + 渲染
onUpdate('PLAYING', 'Scene', (dt) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    scene.update(dt);
    scene.render(ctx);
});

// 启动
transition(GameState.PLAYING);
start();
