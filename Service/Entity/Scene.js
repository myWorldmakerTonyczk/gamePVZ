export class Scene {
    entities = [];
    
    add(e){
        this.entities.push(e);
    }

    update(dt){
        for(const e of this.entities){
            e.update(dt);
        }
    }

    render(ctx){
        for(const e of this.entities){
            e.render(ctx);
        }
    }
}