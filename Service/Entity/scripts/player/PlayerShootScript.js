import { eventBus } from '@core/EventBus/EventBus.js';
import { EventTypes } from '@core/EventBus/EventTypes.js';
import { Bullet } from '@entity/pojo/Bullet.js';
import { scene } from '@entity/Scene.js';
import { attachScripts } from '@system/systemPojo/ScriptSystem.js';
import { createBulletMoveScript } from '@entity/scripts/bullet/BulletMoveScript.js';

/**
 * 玩家射击脚本
 *
 * 监听 PLAYER_SHOOT 事件 → 创建子弹实体 → 挂载子弹脚本 → 加入 scene。
 * 子弹的具体行为（移动、碰撞、死亡）由子弹自己的脚本定义，
 * 换子弹类型只需替换挂载的脚本组合。
 */
export function createPlayerShootScript() {
    let _entity = null;

    function onPlayerShoot({ x, y, angle }) {
        const bullet = new Bullet();
        bullet.x = x;
        bullet.y = y;
        bullet.angle = angle;
        attachScripts(bullet,
            createBulletMoveScript(),
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
