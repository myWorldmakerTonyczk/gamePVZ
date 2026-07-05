import { Entity } from '@entity/Entity.js';
import { EntityType } from '@entity/EntityType.js';

/**
 * 僵尸实体 —— 纯数据 + 纯配置，行为全部由外置脚本驱动。
 *
 * 脚本组合（在 level 中通过 attachScripts 挂载）：
 *   - MoveScript  → 走路逻辑
 *   - HealthScript → 扣血 + 死亡
 *   - AttackScript → 碰撞检测 → 切换攻击
 */
export class Zombie extends Entity {
    type = EntityType.ENEMY;
    w = 60;
    h = 60;
    state = 'walk';
}
