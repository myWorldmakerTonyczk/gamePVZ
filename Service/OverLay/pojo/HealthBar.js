import { Overlay } from '../Overlay.js';

/** 绑定实体的血条，自动跟随 */
export class HealthBar extends Overlay {
    constructor(target) {
        super({
            target,
            offsetX: 0,
            offsetY: -8,  // 实体头顶上方
        });
    }

    render(ctx) {
        const t = this.target;
        if (!t || t.hp === undefined || t.hp === t.maxHp) return;  // 满血不画

        const { x, y } = this.getPos();
        const w = t.w || 20;
        const h = 4;
        const ratio = t.hp / t.maxHp;

        // 底色
        ctx.fillStyle = '#333';
        ctx.fillRect(x, y, w, h);

        // 血量（绿→黄→红）
        ctx.fillStyle = ratio > 0.5 ? '#4f4' : ratio > 0.25 ? '#ff0' : '#f44';
        ctx.fillRect(x, y, w * ratio, h);
    }
}
