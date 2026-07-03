export class Overlay {
    x = 0;           // 绝对坐标（无 target 时使用）
    y = 0;
    offsetX = 0;     // 相对 target 的偏移
    offsetY = 0;
    target = null;   // 绑定的实体
    duration = 0;    // 生命周期（秒），0 = 永久
    elapsed = 0;

    constructor(opts = {}) {
        Object.assign(this, opts);
    }

    /** 有 target 就跟随，没有就用绝对坐标 */
    getPos() {
        if (this.target) {
            return {
                x: this.target.x + this.offsetX,
                y: this.target.y + this.offsetY,
            };
        }
        return { x: this.x, y: this.y };
    }

    update(dt) {
        this.elapsed += dt;
    }

    /** 是否还活着（duration=0 永久存活） */
    isAlive() {
        return this.duration === 0 || this.elapsed < this.duration;
    }

    /** 子类覆写 */
    render(ctx) {}
}
