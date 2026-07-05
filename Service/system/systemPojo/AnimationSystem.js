import { onUpdate } from '@core/GameLoop.js';
import { GameState } from '@core/State Machine.js';
import { scene, setAfterEntityRender } from '@entity/Scene.js';
import { getConfig, getConfigByState } from '@animation/AnimationRegistry.js';
import { AnimationPlayer } from '@animation/AnimationPlayer.js';
import { get } from '@resource/ResourceManager.js';

// ==================== 注册到游戏循环 ====================

onUpdate(GameState.PLAYING, 'AnimationSystem', tickAnimators);

// ==================== 图片比例缓存 ====================

/**
 * key（图片路径）→ ratio（height / width）
 * 避免每帧重复计算 naturalHeight / naturalWidth
 */
const _ratioCache = new Map();

// ==================== Animator 管理 ====================

/**
 * animators: entity.id → { entity, player, lastState }
 *
 * - entity:     持有实体引用，渲染时直接读 x, y, w
 *               （实体完全不知道动画系统的存在）
 * - player:     AnimationPlayer 实例，每个实体独立的播放状态
 * - lastState:  上一次的 entity.state，用于检测状态变化
 */
const animators = new Map();

/**
 * 绑定实体 —— 实体"被动"被动画系统跟踪。
 *
 * 实体只需提供 type、state、x、y、w 属性，
 * 不持有任何动画/渲染逻辑。
 * 动画系统单向读取实体数据，实体零感知。
 */
function bindEntity(entity) {
    animators.set(entity.id, {
        entity,
        player: null,
        lastState: null,
    });
}

/** 实体从 scene 移除时，清理对应 animator */
function unbindEntity(entityId) {
    animators.delete(entityId);
}

/**
 * 绑定固定坐标动画（不关联实体，用于 UI 特效/爆炸/提示等）。
 *
 * 和 bindEntity 走同一条渲染管线（renderAnimators），
 * 但不受 scene 生命周期管理——有自己的 update 和自动清理。
 *
 * @param {object} opts
 * @param {number} opts.x - 画布 x 坐标
 * @param {number} opts.y - 画布 y 坐标
 * @param {number} opts.w - 绘制宽度
 * @param {string} opts.animKey - 动画 key（如 'explosionEffect'）
 * @returns {string} animator id，可用于手动 unbind
 *
 * 使用示例：
 *   // 非循环动画（如爆炸效果）——播放完毕自动清理
 *   bindPosition({ x: 400, y: 300, w: 80, animKey: 'explosionEffect' });
 *
 *   // 循环动画（如 UI 旋转图标）——需手动解绑
 *   const id = bindPosition({ x: 100, y: 50, w: 40, animKey: 'loadingSpinner' });
 *   // ... 之后调用 unbind(id) 清理
 */
function bindPosition({ x, y, w, animKey }) {
    const config = getConfig(animKey);
    if (!config) return null;

    const id = crypto.randomUUID();
    const player = new AnimationPlayer(config);
    player.reset();

    animators.set(id, {
        entity: { id, x, y, w },   // 假实体，只提供坐标，满足 renderAnimators 的读取
        player,
        lastState: null,
        managed: false,             // 标记：不受 scene 管理，不会在 cleanupStale 中被误删
    });

    return id;
}

/** 手动解绑（entity 或 position 动画通用） */
function unbind(id) {
    animators.delete(id);
}

/**
 * 切换指定 animator 的动画（entity 或 position 通用）。
 *
 * 底层的 entity.state 驱动动画对 position 动画不适用（假实体没有 state），
 * 这个函数提供直接切换 animKey 的能力。
 *
 * @param {string} id - animator id（bindPosition 返回值）
 * @param {string} animKey - 新动画 key
 *
 * 使用示例：
 *   const id = bindPosition({ x: 100, y: 50, w: 40, animKey: 'loadingSpinner' });
 *   // ... 加载完毕 ...
 *   setAnimState(id, 'loadingComplete');  // 切到完成动画（非循环 → 播完自动清理）
 */
function setAnimState(id, animKey) {
    const a = animators.get(id);
    if (!a) return;

    const config = getConfig(animKey);
    if (!config) return;

    a.player = new AnimationPlayer(config);
    a.player.reset();
}

// ==================== 每帧 update ====================

function tickAnimators(dt) {
    const entities = scene.getEntities();
    const alive = new Set();

    for (const e of entities) {
        alive.add(e.id);

        // 首次见到 → 自动绑定（懒绑定）
        if (!animators.has(e.id)) {
            bindEntity(e);
        }

        resolveAnim(e, dt);
    }

    // entity 已不在 scene 中 → 解绑（仅清理 scene 管理的）
    cleanupStale(alive);

    // 固定坐标动画：独立更新 + 非循环的播放完自动清理
    tickPositionAnimators(dt);
}

/**
 * 解析 entity.state → AnimationConfig → AnimationPlayer
 *
 * 每帧调用：
 * - state 变化 → 从 Registry 取新 config → new AnimationPlayer → reset 从头播
 * - state 不变 → 当前 player.update(dt) 继续推进
 *
 * 每次 state 变化都 new 一个 AnimationPlayer，
 * 保证切换动画时播放状态完全独立，不会残留上一动画的 #index/#timer。
 */
function resolveAnim(e, dt) {
    if (!e.state) return;

    // Registry 一步查表：type + state → AnimationConfig
    const config = getConfigByState(e.type, e.state);
    if (!config) return;

    const a = animators.get(e.id);
    if (!a) return;

    // 状态变化 → 创建新 player，从第 0 帧重新开始
    if (e.state !== a.lastState) {
        a.player = new AnimationPlayer(config);
        a.player.reset();
        a.lastState = e.state;
    }

    a.player?.update(dt);
}

/** 清理：entity 不在 scene 中 → 删除 animator（只清理 scene 管理的） */
function cleanupStale(aliveIds) {
    for (const [id, a] of animators) {
        // managed === false 的是 bindPosition 创建的，不参与 scene 生命周期
        if (a.managed === false) continue;
        if (!aliveIds.has(id)) unbindEntity(id);
    }
}

/**
 * 更新固定坐标动画（managed === false）
 *
 * 这些 animator 没有关联实体，由 bindPosition 创建：
 * - 逐帧 update
 * - 非循环动画播放完毕后自动清理（playing 变为 false）
 */
function tickPositionAnimators(dt) {
    for (const [id, a] of animators) {
        if (a.managed !== false) continue;

        a.player?.update(dt);

        // 非循环动画播完 → 自动清理
        if (a.player && !a.player.playing) {
            animators.delete(id);
        }
    }
}

// ==================== 每帧 render ====================

/**
 * 渲染入口（注册到 Scene._afterEntityRender 钩子）
 *
 * 遍历 animators 直接绘制，不经过 entity。
 * 实体完全不知道"被画"这件事——
 * 动画系统是独立的视觉层，单向依赖实体的 x, y, w 数据。
 */
function renderAnimators(ctx) {
    for (const a of animators.values()) {
        const frame = a.player?.getCurrentFrame();
        if (!frame) continue;
        // 坐标直接从持有的实体引用读取
        drawSprite(ctx, frame, a.entity.x, a.entity.y, a.entity.w);
    }
}

/**
 * 按宽度绘制图片，高度按原始比例自动计算。
 *
 * 原本在 Entity 上的渲染逻辑迁移至此，
 * 动画系统完全拥有渲染职责，Entity 不参与绘制。
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} key - 图片资源路径
 * @param {number} x
 * @param {number} y
 * @param {number} w - 绘制宽度
 * @returns {boolean} 是否成功绘制
 */
function drawSprite(ctx, key, x, y, w) {
    const img = get(key);
    if (!img) return false;

    if (!_ratioCache.has(key)) {
        _ratioCache.set(key, img.naturalHeight / img.naturalWidth);
    }
    const h = w * _ratioCache.get(key);

    ctx.drawImage(img, x, y, w, h);
    return true;
}

// 注册渲染钩子
setAfterEntityRender(renderAnimators);

// 对外暴露：固定坐标动画的绑定/解绑
export { bindPosition, setAnimState, unbind };
