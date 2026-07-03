export class Entity {
    id = crypto.randomUUID();
    x = 0;
    y = 0;
    w = 0;
    h = 0;
    speed = 0;
    type = null;

    update(dt) {

    }
    render(ctx){
        
    }

    getBounds() {
        return { x: this.x, y: this.y, w: this.w, h: this.h };
    }

}