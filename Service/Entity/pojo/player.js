import { Entity } from '@entity/Entity.js';
import { EntityType } from '@entity/EntityType.js';

/**
 * 玩家实体 —— 纯数据 + 配置。
 *
 * 移动 → PlayerMoveScript
 * 射击 → PlayerShootScript + PlayerSystem（输入检测）
 * 渲染 → render() 色块兜底（后续由 AnimationSystem 接管）
 */
export class Player extends Entity {
    id = crypto.randomUUID();
    x = 0;
    y = 0;
    w = 20;
    h = 20;
    type = EntityType.PLAYER;

    update(dt) {}

    render(ctx) {
        ctx.fillStyle = 'red';
        ctx.fillRect(this.x, this.y, 20, 20);
    }
}
