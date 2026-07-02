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

    del(e){
        this.entities = this.entities.filter(entity => entity !== e);
    }

    clear(){
        this.entities = [];
    }

    // 渲染场景
    render(ctx){
        for(const e of this.entities){
            e.render(ctx);
        }
    }
}

export const scene = new Scene(); 
