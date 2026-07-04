import { Entity } from '@entity/Entity.js';
import { EntityType } from '@entity/EntityType.js';

// 注册动画（副作用 import）
import '@animation/pojo/zombie/walk/zombieAnimationWalk.js';

export class Zombie extends Entity {
    type = EntityType.ENEMY;
    speed = 50;
    w = 60;
    h = 60;

    constructor() {
        super();
        this.playAnim('zombieWalk');
    }

    update(dt) {
        super.update(dt);
        this.x -= this.speed * dt;
    }

    render(ctx) {
        const frame = this.getCurrentFrame();
        if (frame && this.drawSprite(ctx, frame, this.x, this.y, this.w)) return;

        ctx.fillStyle = '#4a4';
        ctx.fillRect(this.x, this.y, this.w, this.h);
    }

    getBounds() {
        return { x: this.x, y: this.y, w: this.w, h: this.h };
    }
}
