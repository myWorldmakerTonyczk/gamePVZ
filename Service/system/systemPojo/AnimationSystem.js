import { onUpdate } from '@core/GameLoop.js';
import { GameState } from '@core/State Machine.js';
import { scene, setAfterEntityRender } from '@entity/Scene.js';
import { getAnimation } from '@animation/AnimationRegistry.js';
import { EntityType } from '@entity/EntityType.js';

onUpdate(GameState.PLAYING, 'AnimationSystem', tickAnimators);


// 实体类型 → ( 行为状态 → 动画 key )
const STATE_ANIM_MAP = {
    [EntityType.ENEMY]: {
        walk: 'zombieWalk',
    },
    [EntityType.PLAYER]: {
        // 后续添加
    },
    [EntityType.BULLET]: {
        // 后续添加
    },
};

// {
//     anim: 当前动画对象,
//     animKey: 当前动画名字,
//     lastState: 上一次状态
// }
// entity.id → { anim, animKey, lastState }
const animators = new Map();

// 获取或创建动画器
function getOrCreateAnimator(entity) {
    let a = animators.get(entity.id);
    if (!a) {
        a = { anim: null, animKey: null, lastState: null };
        animators.set(entity.id, a);
    }
    return a;
}

// 实体移除时清理
function cleanupAnimator(entityId) {
    animators.delete(entityId);
}

// ==================== 每帧更新 ====================

function tickAnimators(dt) {
    const entities = scene.getEntities();
    const alive = new Set();

    for (const e of entities) {
        alive.add(e.id);
        resolveAnim(e, dt);
    }

    cleanupStale(alive);
}

// 解析动画
function resolveAnim(e, dt) {
    if (!e.state) return;

    const map = STATE_ANIM_MAP[e.type];
    if (!map?.[e.state]) return;

    const key = map[e.state];
    const a = getOrCreateAnimator(e);

    if (e.state !== a.lastState || a.animKey !== key) {
           // 找到对应动画
        a.anim = getAnimation(key);
         
        a.animKey = key;
       
        // 记录现在的状态
        a.lastState = e.state;

        // 动画从第一帧开始
        a.anim?.reset();
    }

    a.anim?.update(dt);
}

function cleanupStale(aliveIds) {
    for (const [id] of animators) {
        if (!aliveIds.has(id)) cleanupAnimator(id);
    }
}


// ==================== 渲染（Scene 每帧调用） ====================

function renderAnimators(ctx) {
    for (const e of scene.getEntities()) {
        const a = animators.get(e.id);
        if (!a?.anim) continue;
        const frame = a.anim.getCurrentFrame();
        if (frame) e.drawSprite(ctx, frame, e.x, e.y, e.w);
    }
}

setAfterEntityRender(renderAnimators);
