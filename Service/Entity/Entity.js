/**
 * 实体基类 —— 纯数据 + 纯逻辑。
 *
 * 实体不包含任何渲染代码。渲染由 AnimationSystem 等外部视觉层负责，
 * 单向读取实体的 x, y, w, type, state 属性。
 *
 * 实体完全不知道"被画"这件事。
 */
export class Entity {
    maxHp = 100;
    hp = 100;
    id = crypto.randomUUID();
    x = 0;
    y = 0;
    w = 0;
    h = 0;
    speed = 0;
    attack = 0;               // 攻击力（脚本读取）
    type = null;
    state = null;             // 行为状态（'walk' / 'attack' / 'idle' / 'dead'）

    _scripts = [];            // 外置脚本列表，由 ScriptSystem.attachScripts() 填充

    update(dt) {}
    render(ctx) {}

    getBounds() {
        return { x: this.x, y: this.y, w: this.w, h: this.h };
    }
}
