import { registerAnimation } from '@animation/AnimationRegistry.js';
import { EntityType } from '@entity/EntityType.js';

/**
 * 僵尸走路动画
 *
 * 只需声明 key + entityType + state + 帧参数，
 * registerAnimation 内部统一处理：
 *   - 帧路径生成（getPhotoPathAsc）
 *   - 资源注册（setResource → LoadSystem 预加载）
 *   - AnimationConfig 创建 & 存储
 *   - (entityType, state) → key 映射建立
 */
registerAnimation({
    key: 'zombieWalk',
    entityType: EntityType.ENEMY,
    state: 'walk',
    config: {
        dir: 'assets/images/Entity/animation/zombie/walk',
        count: 20,
        frameTime: 0.20,
        loop: true,
    },
});
