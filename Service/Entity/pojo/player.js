import { Entity } from "../../Entity/Entity.js";
import { isAction } from "../../Input/Input.js";
 export class Player extends Entity {
    speed = 200;
    x = 0;
    y = 0;

    update(dt) {
        this.keyBoardMove(dt);
    }
    render(ctx){
         ctx.fillStyle = 'red';
         ctx.fillRect(this.x, this.y, 20, 20);
    }

    
    keyBoardMove(dt_) { 
        if(isAction("left")){
            this.x -= this.speed * dt_;
        }
        if(isAction("right")){
            this.x += this.speed * dt_;
        }
        if(isAction("up")){
            this.y -= this.speed * dt_;
        }
        if(isAction("down")){
            this.y += this.speed * dt_;
        }
    }

    
}
