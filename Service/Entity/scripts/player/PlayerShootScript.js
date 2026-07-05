import { eventBus } from '@core/EventBus/EventBus.js';
import { EventTypes } from '@core/EventBus/EventTypes.js';
import { Bullet } from '@entity/pojo/Bullet.js';
import { scene } from '@entity/Scene.js';
import { attachScripts } from '@system/systemPojo/ScriptSystem.js';
import { createBulletMoveScript } from '@entity/scripts/bullet/BulletMoveScript.js';
import { createBulletDeathScript } from '@entity/scripts/bullet/BulletDeathScript.js';

export function createPlayerShootScript() {
    let _entity = null;

    function onPlayerShoot({ x, y, angle }) {
        const bullet = new Bullet();
        bullet.x = x;
        bullet.y = y;
        bullet.angle = angle;
        attachScripts(bullet,
            createBulletMoveScript(),
            createBulletDeathScript(),
        );
        scene.add(bullet);
    }

    return {
        stage: 'LOGIC',

        enter(entity) {
            _entity = entity;
            eventBus.on(EventTypes.PLAYER_SHOOT, onPlayerShoot);
        },

        update() {},

        exit() {
            eventBus.off(EventTypes.PLAYER_SHOOT, onPlayerShoot);
        },
    };
}
