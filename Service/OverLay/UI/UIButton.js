export class UIButton {
    constructor(opts = {}) {
        this.text = opts.text ?? '';
        this.x = opts.x ?? 0;
        this.y = opts.y ?? 0;
        this.w = opts.w ?? 200;
        this.h = opts.h ?? 44;
        this.onClick = opts.onClick ?? (() => {});
        this.centerX = opts.centerX ?? false;
        this._hover = false;
        this._canvasW = 0;
    }

    getRenderX() { return this.centerX ? (this._canvasW - this.w) / 2 : this.x; }

    hitTest(mx, my) {
        const rx = this.getRenderX();
        return mx >= rx && mx <= rx + this.w && my >= this.y && my <= this.y + this.h;
    }
}
