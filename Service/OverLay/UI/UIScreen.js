import { Overlay } from '@overlay/Overlay.js';
import { overlayManager } from '@overlay/OverlayManager.js';
import { UIButton } from './UIButton.js';
import { UIText } from './UIText.js';

export class UIScreen extends Overlay {
    children = [];
    #w = 800;
    #h = 600;

    constructor(children = [], opts = {}) {
        super({ duration: 0 });
        this.children = children;
        this.closeable = opts.closeable ?? true;

        const canvas = document.getElementById('game');
        if (canvas) { this.#w = canvas.width; this.#h = canvas.height; }

        this._onClick = this._onClick.bind(this);
        this._onMouseMove = this._onMouseMove.bind(this);

        for (const c of children) {
            if (c instanceof UIButton) c._canvasW = this.#w;
        }
    }

    _bind() {
        if (this._bound) return;
        this._bound = true;
        const canvas = document.getElementById('game');
        if (canvas) {
            canvas.addEventListener('click', this._onClick);
            canvas.addEventListener('mousemove', this._onMouseMove);
        }
    }

    _unbind() {
        const canvas = document.getElementById('game');
        if (canvas) {
            canvas.removeEventListener('click', this._onClick);
            canvas.removeEventListener('mousemove', this._onMouseMove);
        }
        this._bound = false;
    }

    _onClick(e) {
        const canvas = document.getElementById('game');
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;

        for (const c of this.children) {
            if (c instanceof UIButton && c.hitTest(mx, my)) { c.onClick(); return; }
        }

        if (this.closeable) this.close();
    }

    _onMouseMove(e) {
        const canvas = document.getElementById('game');
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;

        for (const c of this.children) {
            if (c instanceof UIButton) c._hover = c.hitTest(mx, my);
        }
    }

    close() { this._unbind(); overlayManager.remove(this); }

    update(dt) { super.update(dt); this._bind(); }

    render(ctx) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(0, 0, this.#w, this.#h);

        for (const c of this.children) {
            if (c instanceof UIText) this._renderText(ctx, c);
            else if (c instanceof UIButton) this._renderButton(ctx, c);
        }
    }

    _renderText(ctx, t) {
        ctx.fillStyle = t.color;
        ctx.font = `${t.fontSize}px sans-serif`;
        ctx.textAlign = t.align;
        ctx.fillText(t.text, t.centerX ? this.#w / 2 : t.x, t.y);
    }

    _renderButton(ctx, btn) {
        const rx = btn.getRenderX();
        ctx.fillStyle = btn._hover ? '#555' : '#444';
        ctx.fillRect(rx, btn.y, btn.w, btn.h);
        ctx.strokeStyle = '#888';
        ctx.lineWidth = 1;
        ctx.strokeRect(rx, btn.y, btn.w, btn.h);
        ctx.fillStyle = '#fff';
        ctx.font = '18px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(btn.text, rx + btn.w / 2, btn.y + btn.h / 2);
    }
}
