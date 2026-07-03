import { Entity } from '@entity/Entity.js';
import { EntityType } from '@entity/EntityType.js';

export class Box extends Entity {
    id = crypto.randomUUID();
    speed = 50;
    type = EntityType.ENEMY;
    x = 0;
    y = 0;
    w = 20;
    h = 20;

    update(dt){
        this.x += this.speed*dt;
    }
    render(ctx){
        ctx.fillRect(this.x,this.y,this.w,this.h);
    }
    getBounds() {
        return { x: this.x, y: this.y, w: this.w, h: this.h };
    }
}
