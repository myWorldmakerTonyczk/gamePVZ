# 脚本系统（Script System）

> 组件化实体行为系统。实体纯数据，脚本定义行为，EventBus 通信。每个实体类型独立维护自己的脚本组合。

---

## 架构概览

```
Entity（纯数据 + _scripts[]）
     │
     ▼
ScriptSystem（机械调度：stage 分组 + enter/update/exit 生命周期）
     │
     ▼
脚本实例（行为逻辑，每个实体独立创建）
     │
     ├── 读写 entity.state ←→ 动画系统自动感知
     └── 收发 EventBus ←→ 脚本间通信
```

| 模块 | 文件 | 职责 |
|------|------|------|
| `ScriptSystem` | `Service/system/systemPojo/ScriptSystem.js` | 调度器：stage 分组执行 + enter/update/exit + 实体移除时 cleanup |
| `attachScripts` | 同上（export） | 挂载脚本到实体 |
| 脚本文件 | `Service/Entity/scripts/<实体类型>/` | 具体行为逻辑 |

---

## 脚本格式

每个脚本是一个工厂函数（`createXxxScript()`），返回 `{ stage, enter, update, exit }`：

```js
export function createZombieMoveScript() {
    let _entity = null;    // 闭包保存实体引用

    return {
        stage: 'LOGIC',    // 执行阶段

        enter(entity) {
            _entity = entity;
            // 初始化 + 注册 EventBus 监听
        },

        update(entity, dt) {
            // 每帧逻辑
        },

        exit() {
            // 清理 + 注销 EventBus 监听（⚠️ 必须）
        },
    };
}
```

### 约定

- **闭包保存 `_entity`**：在 enter 里赋值，update/exit 里使用。避免 this 绑定问题。
- **stage 选择**：`INPUT` / `LOGIC` / `EFFECT` / `CLEANUP`，不声明默认为 `LOGIC`。
- **exit 里必须 `eventBus.off`**：实体销毁时清理所有监听，防止悬空事件。
- **update 可以为空**：纯事件驱动的脚本不需要 update。

---

## 执行阶段

脚本按 stage 分组，按固定顺序执行：

| 阶段 | 用途 | 示例 |
|------|------|------|
| `INPUT` | 输入处理 | 键盘/鼠标检测 |
| `LOGIC` | 游戏逻辑 | 移动、碰撞响应、扣血 |
| `EFFECT` | 视觉反馈 | 特效触发 |
| `CLEANUP` | 清理 | 死亡移除实体 |

```js
// 输入类脚本放在 INPUT 阶段
return { stage: 'INPUT', update() { ... } };

// 死亡移除放在 CLEANUP，在逻辑之后
return { stage: 'CLEANUP', update() { ... } };
```

---

## 脚本间通信

两条通道，各司其职：

| 通道 | 用途 | 示例 |
|------|------|------|
| `entity.state` | 共享状态，脚本写，动画系统读 | AttackScript 写 `state='attack'` → 动画自动切 |
| EventBus | 跨脚本通知，事件链 | AttackScript emit `ENTITY_STOP_MOVE` → MoveScript 暂停 |

### 事件链示例

```
子弹命中僵尸:
  CollisionSystem → emit COLLISION
  CollisionSystem → emit DAMAGE({ entity: zombie, damage: 25 })
  HealthScript → hp -= 25 → hp≤0 → state='dead' → emit ENTITY_DIED
  DeathScript → scene.del()

僵尸碰到玩家:
  CollisionSystem → emit COLLISION
  AttackScript → state='attack' → emit ENTITY_STOP_MOVE
  MoveScript → 暂停移动
```

脚本之间不 import、不调用、不知道对方存在。只和 `entity.state` 和 `EventBus` 对话。

---

## 开发流程

### 第 1 步：创建实体类（纯数据）

```js
// Service/Entity/pojo/Zombie.js
export class Zombie extends Entity {
    type = EntityType.ENEMY;
    w = 60;
    h = 60;
    state = 'walk';
    // 无 update，无 render（由 AnimationSystem 接管），无业务逻辑
}
```

### 第 2 步：编写脚本

```js
// Service/Entity/scripts/zombie/ZombieMoveScript.js
import { eventBus } from '@core/EventBus/EventBus.js';
import { EventTypes } from '@core/EventBus/EventTypes.js';

export function createZombieMoveScript() {
    let _entity = null;
    let _paused = false;

    function onStopMove({ entity }) {
        if (entity === _entity) _paused = true;
    }

    return {
        stage: 'LOGIC',

        enter(entity) {
            _entity = entity;
            entity.speed = 50;
            _paused = false;
            eventBus.on(EventTypes.ENTITY_STOP_MOVE, onStopMove);
        },

        update(entity, dt) {
            if (_paused) return;
            if (entity.state !== 'walk') return;
            entity.x -= entity.speed * dt;
        },

        exit() {
            eventBus.off(EventTypes.ENTITY_STOP_MOVE, onStopMove);
        },
    };
}
```

### 第 3 步：在关卡中挂载

```js
// level/level1.js
import { attachScripts } from '@system/systemPojo/ScriptSystem.js';
import { createZombieMoveScript } from '@entity/scripts/zombie/ZombieMoveScript.js';
import { createZombieHealthScript } from '@entity/scripts/zombie/ZombieHealthScript.js';
import { createZombieAttackScript } from '@entity/scripts/zombie/ZombieAttackScript.js';
import { createZombieDeathScript } from '@entity/scripts/zombie/ZombieDeathScript.js';

function spawnZombie(x, y) {
    const zombie = new Zombie();
    zombie.x = x;
    zombie.y = y;
    attachScripts(zombie,
        createZombieMoveScript(),
        createZombieHealthScript(),
        createZombieAttackScript(),
        createZombieDeathScript(),
    );
    scene.add(zombie);
}
```

### 第 4 步：在 system/index.js 注册 ScriptSystem

```js
// Service/system/index.js
import './systemPojo/ScriptSystem.js';   // 只需一次
```

---

## 换脚本组合

同一种实体可以通过不同脚本组合产生不同行为：

```js
// 普通僵尸
attachScripts(zombie,
    createZombieMoveScript(),
    createZombieHealthScript(),
    createZombieAttackScript(),
    createZombieDeathScript(),
);

// 快速僵尸（覆盖 speed + 更快）
attachScripts(fastZombie,
    createFastZombieMoveScript(),       // ← 换了个移动脚本
    createZombieHealthScript(),
    createZombieAttackScript(),
    createZombieDeathScript(),
);

// 炸弹僵尸（碰到玩家自爆）
attachScripts(bombZombie,
    createZombieMoveScript(),
    createZombieHealthScript(),
    createBombAttackScript(),           // ← 换了攻击脚本
    createZombieDeathScript(),
);
```

---

## 脚本模板

### 纯 update 型（不需要事件）

```js
export function createXxxScript() {
    return {
        stage: 'LOGIC',

        enter(entity) {},
        update(entity, dt) {
            // 每帧逻辑
        },
        exit() {},
    };
}
```

### 事件驱动型（无 update）

```js
export function createXxxScript() {
    let _entity = null;

    function onEvent(data) {
        if (data.entity !== _entity) return;  // ⚠️ 必须过滤：只看自己的事件
        // 处理逻辑
    }

    return {
        stage: 'LOGIC',

        enter(entity) {
            _entity = entity;
            eventBus.on(EventTypes.SOME_EVENT, onEvent);
        },

        update() {},

        exit() {
            eventBus.off(EventTypes.SOME_EVENT, onEvent);  // ⚠️ 必须注销
        },
    };
}
```

### 混合型

```js
export function createXxxScript() {
    let _entity = null;

    function onExternalEvent(data) {
        if (data.entity !== _entity) return;
        // 响应外部事件
    }

    return {
        stage: 'LOGIC',

        enter(entity) {
            _entity = entity;
            eventBus.on(EventTypes.SOME_EVENT, onExternalEvent);
        },

        update(entity, dt) {
            // 每帧逻辑 + 检测条件后 emit
            if (entity.hp <= 0) {
                entity.state = 'dead';
                eventBus.emit(EventTypes.ENTITY_DIED, { entity }, 'XxxScript');
            }
        },

        exit() {
            eventBus.off(EventTypes.SOME_EVENT, onExternalEvent);
        },
    };
}
```

---

## 脚本写法总结

所有脚本同一种结构：**工厂函数 → 闭包 → `{ stage, enter, update, exit }`**。

### 关键约定

1. **工厂函数，不用 this** — `createXxxScript()` 创建独立实例，闭包隔离
2. **事件回调过滤** `if (entity !== _entity) return` — 同类实体共享事件，只看自己的
3. **防重复触发** `if (state === 'attack') return` — 事件每帧触发时守卫
4. **exit 注销监听** — `eventBus.off(事件名, 同一个函数引用)`
5. **攻击间隔用计时器** — `_attackTimer += dt`，不能依赖事件频率
6. **暂停/恢复成对** — STOP + RESUME 两个事件控制开关

---

## 添加新实体检查清单

1. **创建实体类** — `Entity/pojo/NewEntity.js`，只声明 `type`、`w`、`h`、初始 `state`
2. **创建脚本目录** — `Entity/scripts/newEntity/`
3. **编写各脚本** — 每个脚本一个文件，工厂函数 `createXxxScript()`
4. **在关卡中挂载** — `attachScripts(entity, ...)` 组合脚本
5. **如有新事件** — 在 `EventTypes.js` 添加事件常量

---

## 当前已有脚本

| 实体 | 脚本 | 职责 |
|------|------|------|
| Zombie | `ZombieMoveScript` | 向左走，监听 STOP/RESUME_MOVE |
| Zombie | `ZombieHealthScript` | 监听 DAMAGE 扣血，hp≤0 发 ENTITY_DIED |
| Zombie | `ZombieAttackScript` | 监听 COLLISION 切 attack + 每1秒攻击 + 距离判定 |
| Zombie | `ZombieDeathScript` | 监听 ENTITY_DIED 移除 + 全灭 emit LEVEL_WIN |
| Player | `PlayerMoveScript` | WASD 键盘移动 |
| Player | `PlayerShootScript` | 监听 PLAYER_SHOOT 生成子弹 + 挂载子弹脚本 |
| Player | `PlayerHealthScript` | 监听 DAMAGE 扣血，hp≤0 发 ENTITY_DIED |
| Player | `PlayerDeathScript` | 监听 ENTITY_DIED emit LEVEL_LOSE |
| Bullet | `BulletMoveScript` | angle 方向飞行 |
| Bullet | `BulletDeathScript` | 监听 ENTITY_DIED 移除 |

---

## 相关文件

| 文件 | 说明 |
|------|------|
| `Service/system/systemPojo/ScriptSystem.js` | 调度器 + `attachScripts()` |
| `Service/Entity/Entity.js` | 基类，`_scripts = []` |
| `Service/Entity/scripts/` | 脚本目录（按实体类型分） |
| `Service/core/EventBus/EventBus.js` | 事件总线，调试日志 |
| `Service/core/EventBus/EventTypes.js` | 事件常量 |
