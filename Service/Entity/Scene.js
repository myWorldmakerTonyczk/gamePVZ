import { onUpdate } from '@core/GameLoop.js';
import { GameState } from '@core/State Machine.js';
import { overlayManager } from '@overlay/OverlayManager.js';

// 渲染钩子：AnimationSystem 等外部模块注册
let _afterEntityRender = null;

export function setAfterEntityRender(fn) {
    _afterEntityRender = fn;
}

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
        overlayManager.removeByTarget(e);
    }

    clear(){
        this.entities = [];
    }

    getEntities(){
        return this.entities;
    }

    render(ctx){
        for(const e of this.entities){
            e.render(ctx);
        }
        _afterEntityRender?.(ctx);      // 动画系统渲染入口
        overlayManager.render(ctx);
    }
}

export const scene = new Scene();

onUpdate(GameState.PLAYING, 'Scene', (dt) => {
    scene.update(dt);
});
