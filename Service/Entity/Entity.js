export class Entity {
    x = 0;
    y = 0;
    width = 0;
    height = 0;

    update(dt) {

    }
    render(ctx){
        
    }

    getBounds() {
        return { x: this.x, y: this.y, w: this.width, h: this.height };
    }
}