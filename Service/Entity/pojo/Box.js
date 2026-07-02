import { Entity } from '../Entity.js';

export class Box extends Entity {
    update(dt){
        this.x += 50*dt;
    }
    render(ctx){
        ctx.fillRect(this.x,this.y,20,20);
    }
}