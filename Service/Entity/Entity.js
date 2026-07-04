import { get } from '@resource/ResourceManager.js';

// 碰撞箱大小由 w 和 h 确定，图片以 w 为基准，h = w * ratio 防止变形
export class Entity {
    maxHp = 100;
    hp = 100;
    id = crypto.randomUUID();
    x = 0;
    y = 0;
    w = 0;
    h = 0;
    ratio = null;
    speed = 0;
    type = null;
    state = null;             // 行为状态（'walk' / 'attack' / 'idle' / 'dead'）

    _ratios = {};             // 图片比例缓存

    update(dt) {}
    render(ctx) {}

    /**
     * 按宽度画图，高度自动保持原始比例
     * @returns {boolean} 图片是否就绪并成功绘制
     */
    drawSprite(ctx, key, x, y, w) {
        const img = get(key);
        if (!img) return false;

        if (!this._ratios[key]) {
            this._ratios[key] = img.naturalHeight / img.naturalWidth;
        }
        const h = w * this._ratios[key];
        ctx.drawImage(img, x, y, w, h);
        return true;
    }

    getBounds() {
        return { x: this.x, y: this.y, w: this.w, h: this.h };
    }
}
