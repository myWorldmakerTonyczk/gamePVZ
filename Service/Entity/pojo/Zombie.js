import { Entity } from '@entity/Entity.js';
import { EntityType } from '@entity/EntityType.js';
import { setResource } from '@resource/ResourceList.js';
import { get } from '@resource/ResourceManager.js';

// 僵尸需要的资源
setResource('assets/images/zombie.png');

export class Zombie extends Entity {
    type = EntityType.ENEMY;
    speed = 50;
    w = 40;
    h = 60;

    update(dt) {
        this.x -= this.speed * dt;  // 向左走，靠近玩家
    }

    render(ctx) {
        const img = get('assets/images/zombie.png');
        if (img) {
            ctx.drawImage(img, this.x, this.y, this.w, this.h);
        } else {
            // 图片还没加载好时用色块占位
            ctx.fillStyle = '#4a4';
            ctx.fillRect(this.x, this.y, this.w, this.h);
        }
    }

    getBounds() {
        return { x: this.x, y: this.y, w: this.w, h: this.h };
    }
}
