import { UIScreen, UIButton, UIText } from '@overlay/UI/index.js';

export function createLevelSelect({ levels, onBack } = {}) {
    const children = [new UIText({ text: '选择关卡', centerX: true, y: 80, fontSize: 36 })];
    const cols = 3, btnW = 160, btnH = 80, gapX = 20, gapY = 16;
    const startX = (800 - (btnW * cols + gapX * (cols - 1))) / 2, startY = 150;

    for (let i = 0; i < (levels?.length || 0); i++) {
        const col = i % cols, row = Math.floor(i / cols);
        children.push(new UIButton({
            text: levels[i].title, x: startX + col * (btnW + gapX),
            y: startY + row * (btnH + gapY), w: btnW, h: btnH, onClick: levels[i].onClick,
        }));
    }

    if (onBack) children.push(new UIButton({ text: '返回', centerX: true, y: 530, w: 120, h: 40, onClick: onBack }));

    return new UIScreen(children, { closeable: false });
}
