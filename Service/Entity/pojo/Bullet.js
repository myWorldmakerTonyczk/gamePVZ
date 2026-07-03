import { Entity } from "../Entity.js";
import { EntityType } from "../EntityType.js";

export class Bullet extends Entity {
    id = crypto.randomUUID();
    speed = 50;
    type = EntityType.BULLET;
    x = 0;
    y = 0;
    w = 20;
    h = 20;
    angle = 0;

    update(dt){
         this.x += Math.cos(this.angle) * this.speed * dt;
         this.y += Math.sin(this.angle) * this.speed * dt;
    }
    render(ctx){
        ctx.fillStyle = "white";
        ctx.fillRect(this.x,this.y,this.w,this.h);
    }
    getBounds() {
        return { x: this.x, y: this.y, w: this.w, h: this.h };
    }
    //子弹射击方法
    shoot(angle){
        this.angle = angle;
    }
    
}
