export class UIText {
    constructor(opts = {}) {
        this.text = opts.text ?? '';
        this.x = opts.x ?? 0;
        this.y = opts.y ?? 0;
        this.fontSize = opts.fontSize ?? 20;
        this.color = opts.color ?? '#fff';
        this.align = opts.align ?? 'center';
        this.centerX = opts.centerX ?? false;
    }
}
