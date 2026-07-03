import { eventBus } from '@core/EventBus/EventBus.js';
import { EventTypes } from '@core/EventBus/EventTypes.js';
import { Bullet } from '@entity/pojo/Bullet.js';
import { scene } from '@entity/Scene.js';

eventBus.on(EventTypes.PLAYER_SHOOT, ({ x, y }) => {
    const bullet = new Bullet();
    bullet.x = x;
    bullet.y = y;
    bullet.speed = 500;
    bullet.shoot(1);
    scene.add(bullet);
});
