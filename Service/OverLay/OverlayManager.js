export class OverlayManager {
    overlays = [];

    add(overlay) {
        this.overlays.push(overlay);
    }

    remove(overlay) {
        this.overlays = this.overlays.filter(o => o !== overlay);
    }

    update(dt) {
        for (const o of this.overlays) {
            o.update(dt);
        }
        // 自动清理生命周期已结束的
        this.overlays = this.overlays.filter(o => o.isAlive());
    }

    render(ctx) {
        for (const o of this.overlays) {
            o.render(ctx);
        }
    }

    /** 移除 target 实体的所有 overlay（实体死亡时调用） */
    removeByTarget(target) {
        this.overlays = this.overlays.filter(o => o.target !== target);
    }
}

export const overlayManager = new OverlayManager();
