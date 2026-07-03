import { onEnter, onExit } from '@core/GameLoop.js';
import { GameState } from '@core/State Machine.js';
import { HookLabel } from '@system/HookLabel.js';
import { eventBus } from '@core/EventBus/EventBus.js';
import { EventTypes } from '@core/EventBus/EventTypes.js';
import { Bullet } from '@entity/pojo/Bullet.js';
import { scene } from '@entity/Scene.js';

onEnter(GameState.PLAYING, HookLabel.BULLET_SPAWNER, () => {
    eventBus.on(EventTypes.PLAYER_SHOOT, spawnBullet);
});

onExit(GameState.PLAYING, HookLabel.BULLET_SPAWNER, () => {
    eventBus.off(EventTypes.PLAYER_SHOOT, spawnBullet);
});

function spawnBullet({ x, y, angle }) {
    const bullet = new Bullet();
    bullet.x = x;
    bullet.y = y;
    bullet.speed = 500;
    bullet.shoot(angle);
    scene.add(bullet);
}
