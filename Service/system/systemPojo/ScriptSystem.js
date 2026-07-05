import { onUpdate } from '@core/GameLoop.js';
import { GameState } from '@core/State Machine.js';
import { scene } from '@entity/Scene.js';

// ==================== 注册到游戏循环 ====================

onUpdate(GameState.PLAYING, 'ScriptSystem', tickScripts);

// ==================== 执行阶段 ====================

/**
 * 脚本按 stage 分组执行，保证执行顺序确定。
 *
 * INPUT   → 输入处理
 * LOGIC   → 游戏逻辑（碰撞响应、移动、扣血）
 * EFFECT  → 视觉反馈（动画事件、特效触发）
 * CLEANUP → 清理（死亡后移除实体）
 */
const STAGES = ['INPUT', 'LOGIC', 'EFFECT', 'CLEANUP'];

/** 未声明 stage 的脚本默认放在 LOGIC */
const DEFAULT_STAGE = 'LOGIC';

// ==================== 生命周期追踪 ====================

/**
 * "entity.id:scriptIndex" → true
 * 记录已调用过 enter 的脚本，避免每帧重复调 enter
 */
const _entered = new Set();

/**
 * entityId → scripts[]
 * 保留脚本引用，用于实体移除时调 exit（此时 entity 已不在 scene 中）
 */
const _scriptStore = new Map();

// ==================== 每帧调度 ====================

function tickScripts(dt) {
    const entities = scene.getEntities();

    for (const entity of entities) {
        if (!entity._scripts) continue;

        // 首次见到 → 存入 store
        if (!_scriptStore.has(entity.id)) {
            _scriptStore.set(entity.id, entity._scripts);
        }

        // 按阶段分组执行
        for (const stage of STAGES) {
            for (let i = 0; i < entity._scripts.length; i++) {
                const script = entity._scripts[i];
                const scriptStage = script.stage || DEFAULT_STAGE;
                if (scriptStage !== stage) continue;

                const key = `${entity.id}:${i}`;

                // 首次执行 → enter
                if (!_entered.has(key)) {
                    script.enter?.(entity);
                    _entered.add(key);
                }

                // 每帧 → update
                script.update?.(entity, dt);
            }
        }
    }

    // entity 已从 scene 移除 → 调 exit + 清理记录
    cleanupRemoved(entities);
}

/**
 * 清理已移除实体的脚本
 */
function cleanupRemoved(aliveEntities) {
    const aliveIds = new Set(aliveEntities.map(e => e.id));

    for (const [entityId, scripts] of _scriptStore) {
        if (aliveIds.has(entityId)) continue;

        // 调所有脚本的 exit
        for (let i = 0; i < scripts.length; i++) {
            const key = `${entityId}:${i}`;
            if (_entered.has(key)) {
                scripts[i].exit?.();
                _entered.delete(key);
            }
        }

        _scriptStore.delete(entityId);
    }
}

/**
 * 附加脚本到实体。
 *
 * 实体不需要知道脚本的存在——这个函数是外部入口，
 * 在 level 配置或 spawner 中调用。
 *
 * @param {import('@entity/Entity.js').Entity} entity
 * @param {...object} scripts - createXxxScript() 返回的脚本对象
 *
 * 使用示例：
 *   attachScripts(zombie,
 *       createMoveScript(),
 *       createHealthScript(),
 *       createAttackScript(),
 *   );
 */
export function attachScripts(entity, ...scripts) {
    if (!entity._scripts) entity._scripts = [];
    entity._scripts.push(...scripts);
    _scriptStore.set(entity.id, entity._scripts);
}
