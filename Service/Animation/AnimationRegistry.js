import { AnimationConfig } from '@animation/AnimationConfig.js';
import { getPhotoPathAsc } from '@utils/getPhotoPathAsc.js';
import { setResource } from '@resource/ResourceList.js';

// ==================== 双 Map 存储 ====================

/**
 * configMap: animKey → AnimationConfig
 * 存储动画配置（帧列表、帧时长、是否循环），不可变，多实体共享。
 *
 * 示例：
 *   'zombieWalk' → AnimationConfig { frames: [...20条路径], frameTime: 0.2, loop: true }
 */
const configMap = new Map();

/**
 * stateMap: entityType → ( state → animKey )
 * 根据实体类型和行为状态快速查到动画 key。
 *
 * 结构：
 *   Map<entityType, Map<state, animKey>>
 *
 * 示例：
 *   'enemy' → { 'walk': 'zombieWalk', 'attack': 'zombieAttack' }
 *   'player' → { 'idle': 'playerIdle' }
 */
const stateMap = new Map();

// ==================== 统一注册入口 ====================

/**
 * 注册一个动画。
 *
 * 一次性完成：
 *   1. 生成帧图片路径（getPhotoPathAsc）
 *   2. 注册资源到全局资源清单（setResource），供 LoadSystem 预加载
 *   3. 创建 AnimationConfig 并存入 configMap
 *   4. 建立 (entityType, state) → animKey 映射
 *
 * @param {object} opts
 * @param {string} opts.key - 动画唯一标识（如 'zombieWalk'）
 * @param {string} opts.entityType - 实体类型（EntityType.ENEMY / PLAYER / BULLET）
 * @param {string} opts.state - 行为状态名（'walk' / 'attack' / 'idle' / 'dead'）
 * @param {object} opts.config - 动画参数
 * @param {string} opts.config.dir - 帧图片文件夹路径
 * @param {number} opts.config.count - 帧数
 * @param {string} [opts.config.ext='png'] - 图片拓展名
 * @param {number} [opts.config.start=1] - 起始序号
 * @param {number} [opts.config.frameTime=0.1] - 每帧持续秒数
 * @param {boolean} [opts.config.loop=true] - 是否循环播放
 *
 * 使用示例：
 *   registerAnimation({
 *       key: 'zombieWalk',
 *       entityType: EntityType.ENEMY,
 *       state: 'walk',
 *       config: {
 *           dir: 'assets/images/Entity/animation/zombie/walk',
 *           count: 20,
 *           frameTime: 0.20,
 *           loop: true,
 *       },
 *   });
 */
export function registerAnimation({ key, entityType, state, config }) {
    // 1. 生成帧路径
    const frames = getPhotoPathAsc(
        config.dir,
        config.count,
        config.ext ?? 'png',
        config.start ?? 1,
    );

    // 2. 注册资源（供 LoadSystem 预加载）
    frames.forEach(f => setResource(f));

    // 3. 存入 configMap
    configMap.set(key, new AnimationConfig({
        frames,
        frameTime: config.frameTime ?? 0.1,
        loop: config.loop ?? true,
    }));

    // 4. 建立 type+state → key 映射
    if (!stateMap.has(entityType)) {
        stateMap.set(entityType, new Map());
    }
    stateMap.get(entityType).set(state, key);
}

// ==================== 查询 ====================

/**
 * 根据 animKey 获取 AnimationConfig
 * @param {string} key
 * @returns {AnimationConfig|null}
 */
export function getConfig(key) {
    return configMap.get(key) ?? null;
}

/**
 * 根据实体类型 + 行为状态获取 AnimationConfig
 *
 * 这是 AnimationSystem 的主要查询入口：
 * 传入 entity.type 和 entity.state，直接拿到对应的动画配置，
 * 不再需要在 AnimationSystem 中维护 STATE_ANIM_MAP。
 *
 * @param {string} entityType
 * @param {string} state
 * @returns {AnimationConfig|null}
 */
export function getConfigByState(entityType, state) {
    const key = stateMap.get(entityType)?.get(state);
    if (!key) return null;
    return configMap.get(key) ?? null;
}
