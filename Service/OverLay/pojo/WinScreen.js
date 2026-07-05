import { UIScreen, UIButton, UIText } from '@overlay/UI/index.js';

export function createWinScreen({ onNext, onMenu } = {}) {
    return new UIScreen([
        new UIText({ text: '胜利！', centerX: true, y: 180, fontSize: 48, color: '#ffd700' }),
        new UIText({ text: '敌人已被消灭', centerX: true, y: 230, fontSize: 20, color: '#ccc' }),
        new UIButton({ text: '下一关', centerX: true, y: 310, onClick: onNext ?? (() => {}) }),
        new UIButton({ text: '返回菜单', centerX: true, y: 370, onClick: onMenu ?? (() => {}) }),
    ], { closeable: false });
}
