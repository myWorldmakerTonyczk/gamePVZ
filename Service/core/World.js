/**
 * World.js — 世界管理器（实体大管家）
 *
 * 职责：实体增删、每帧 update 调度、碰撞检测、渲染调度
 * 不关心：主循环细节（不知道 tick 的存在）
 *          具体实体行为（只调 entity.update()，不管里面干什么）
 */

// ==================== 实体池 ====================

const entities = {
    plants:      [],
    zombies:     [],
    projectiles: [],
};

// 待删除队列（遍历时不能直接删，攒起来下帧统一清理）
const deadQueue = {
    plants:      [],
    zombies:     [],
    projectiles: [],
};

// ==================== 实体管理（对外接口） ====================

export function addPlant(plant) {
    entities.plants.push(plant);
}

export function addZombie(zombie) {
    entities.zombies.push(zombie);
}

export function addProjectile(proj) {
    entities.projectiles.push(proj);
}

/**
 * 标记实体死亡——不会立刻删除，下一帧 cleanup 统一处理
 */
export function markDead(type, entity) {
    if (deadQueue[type]) {
        deadQueue[type].push(entity);
    }
}

// ==================== 每帧更新 ====================

export function update(dt) {
    // 更新所有活着的实体
    for (const pool of Object.values(entities)) {
        for (const entity of pool) {
            entity.update?.(dt);
        }
    }

    // 清理死亡实体
    cleanup();
}

function cleanup() {
    for (const [type, pool] of Object.entries(deadQueue)) {
        if (pool.length === 0) continue;
        const entityArr = entities[type];
        for (const dead of pool) {
            const idx = entityArr.indexOf(dead);
            if (idx !== -1) entityArr.splice(idx, 1);
        }
        deadQueue[type] = [];
    }
}

// ==================== 碰撞检测 ====================

export function checkCollisions() {
    // 子弹 vs 僵尸
    for (const bullet of entities.projectiles) {
        for (const zombie of entities.zombies) {
            if (isColliding(bullet, zombie)) {
                bullet.onHit?.(zombie);
                zombie.onHit?.(bullet);
            }
        }
    }

    // 僵尸到达植物 → 开始啃食
    for (const zombie of entities.zombies) {
        const targetPlant = entities.plants.find(p => isAdjacent(zombie, p));
        if (targetPlant) {
            zombie.startEating?.(targetPlant);
        }
    }
}

// ==================== 渲染 ====================

export function render() {
    // TODO: Canvas 绘制
    // 绘制顺序：格子 → 植物 → 僵尸 → 子弹 → UI 层
}

// ==================== 碰撞工具 ====================

function isColliding(a, b) {
    return (
        a.x < b.x + b.width  &&
        a.x + a.width > b.x  &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}

function isAdjacent(zombie, plant) {
    const range = 20; // px，啃食触发距离
    return Math.abs(zombie.x - plant.x) < range && zombie.row === plant.row;
}

// ==================== 查询接口 ====================

export function getEntities(type) {
    return entities[type] ?? [];
}

export function getAllEntities() {
    return entities;
}
