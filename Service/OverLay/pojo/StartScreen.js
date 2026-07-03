import { Overlay } from '../Overlay.js';

/** 开始界面 Overlay：覆盖全屏，点击/按空格开始 */
export class StartScreen extends Overlay {
    constructor(w, h) {
        super({ x: 0, y: 0, duration: 0 });
        this.w = w;
        this.h = h;
    }

    render(ctx) {
        // 半透明遮罩
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(0, 0, this.w, this.h);

        // 标题
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 48px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('植物大战僵尸', this.w / 2, this.h / 2 - 30);

        // 提示
        ctx.font = '20px sans-serif';
        ctx.fillStyle = '#aaa';
        ctx.fillText('点击画面 或 按空格 开始游戏', this.w / 2, this.h / 2 + 30);
    }
}
