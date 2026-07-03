import { scene } from '@entity/Scene.js';
import { onUpdate } from '@core/GameLoop.js';
import { GameState } from '@core/State Machine.js';
import { checkCollisions } from '@utils/Collision.js';
import { EventTypes } from '@core/EventBus/EventTypes.js';
import { HookLabel } from '@system/HookLabel.js';
import { eventBus } from '@core/EventBus/EventBus.js';
import { EntityType } from '@entity/EntityType.js';

onUpdate(GameState.PLAYING, HookLabel.COLLISION_SYSTEM, () => {
    checkCollisions(scene.entities);
});

// 碰撞处理：子弹 → 清除 + 扣血，子弹撞子弹忽略
eventBus.on(EventTypes.COLLISION, ({ a, b }) => {
    // 子弹命中敌人
    if (a.type === EntityType.BULLET && b.type === EntityType.ENEMY) {
        scene.del(a);
        b.hp -= 25;
        if (b.hp <= 0) scene.del(b);
    }
    if (b.type === EntityType.BULLET && a.type === EntityType.ENEMY) {
        scene.del(b);
        a.hp -= 25;
        if (a.hp <= 0) scene.del(a);
    }
    // 子弹撞到其他东西（墙、玩家）直接清除
    if (a.type === EntityType.BULLET) scene.del(a);
    if (b.type === EntityType.BULLET) scene.del(b);
});





