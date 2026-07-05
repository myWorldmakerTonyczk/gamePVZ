import { UIScreen, UIButton, UIText } from '@overlay/UI/index.js';

export function createLoseScreen({ onRetry, onMenu } = {}) {
    return new UIScreen([
        new UIText({ text: '失败', centerX: true, y: 180, fontSize: 48, color: '#e55' }),
        new UIText({ text: '你的防线被突破了', centerX: true, y: 230, fontSize: 20, color: '#ccc' }),
        new UIButton({ text: '重新开始', centerX: true, y: 310, onClick: onRetry ?? (() => {}) }),
        new UIButton({ text: '返回菜单', centerX: true, y: 370, onClick: onMenu ?? (() => {}) }),
    ], { closeable: false });
}
