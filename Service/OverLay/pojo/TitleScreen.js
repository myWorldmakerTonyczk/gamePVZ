import { UIScreen, UIButton, UIText } from '@overlay/UI/index.js';

export function createTitleScreen({ onStart } = {}) {
    return new UIScreen([
        new UIText({ text: '植物大战僵尸', centerX: true, y: 180, fontSize: 48, color: '#4a8' }),
        new UIText({ text: 'Plants vs Zombies', centerX: true, y: 230, fontSize: 20, color: '#aaa' }),
        new UIButton({ text: '开始游戏', centerX: true, y: 330, w: 200, h: 50, onClick: onStart ?? (() => {}) }),
    ], { closeable: false });
}
