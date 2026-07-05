import { Entity } from '@entity/Entity.js';
import { EntityType } from '@entity/EntityType.js';

/**
 * 子弹实体 —— 纯数据。
 *
 * 移动 → BulletMoveScript
 * 碰撞清除 → CollisionSystem
 * 渲染 → render() 色块兜底（后续由 AnimationSystem 接管）
 */
export class Bullet extends Entity {
    type = EntityType.BULLET;
    x = 0;
    y = 0;
    w = 20;
    h = 20;
    angle = 0;      // 飞行方向（弧度），PlayerShootScript 设置

    update(dt) {}

    render(ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(this.x, this.y, this.w, this.h);
    }
}
