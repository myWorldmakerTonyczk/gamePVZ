# 关卡设计（Level Design）

> 关卡文件负责：创建实体 + 组装脚本 + 定义胜负条件。每种关卡类型可以有完全不同的规则。

---

## 架构概览

```
关卡文件 (level/level1.js)
    │
    ├── 创建实体 → attachScripts() → scene.add()
    ├── 注册胜负规则 → 监听 EventBus / onUpdate 轮询
    │
    ▼
LevelFlowSystem（固定桥梁，不改）
    │  监听 LEVEL_WIN / LEVEL_LOSE
    │  → transition(WIN / LOSE)
    ▼
UISystem（固定桥梁，不改）
    │  onEnter(WIN/LOSE) → 显示结算界面
```

胜负条件从实体脚本中**剥离**，放在关卡文件里，每个关卡可以自由定义：

- 第 1 关：消灭所有僵尸 = 胜利，玩家死亡 = 失败
- 第 2 关：存活 30 秒 = 胜利，基地被摧毁 = 失败
- 第 3 关：消灭 Boss = 胜利，时间耗尽 = 失败

---

## 关卡文件结构

```js
// level/levelX.js

import { scene } from '@entity/Scene.js';
import { setWorld, onEnter, onExit, onUpdate } from '@core/GameLoop.js';
import { GameState } from '@core/State Machine.js';
import { eventBus } from '@core/EventBus/EventBus.js';
import { EventTypes } from '@core/EventBus/EventTypes.js';
import { EntityType } from '@entity/EntityType.js';

// 1. 创建实体
// 2. 定义胜负规则
// 3. init() 入口
```

---

## 创建实体

实体 = `new Entity子类()` + `attachScripts()` + `scene.add()`：

```js
import { Zombie } from '@entity/pojo/Zombie.js';
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

> 💡 **同一个实体换不同脚本组合 = 不同行为**。详见 [`docs/script-system.md`](script-system.md)。

---

## 定义胜负规则

胜负规则通过 `onEnter`/`onExit` 管理生命周期，具体判断逻辑可以写在：

| 方式 | 适用场景 | 示例 |
|------|----------|------|
| `eventBus.on(ENTITY_DIED, ...)` | 实体死亡触发的条件 | "玩家死亡 = 失败"、"所有敌人死亡 = 胜利" |
| `onUpdate(GameState.PLAYING, ...)` | 持续轮询的条件 | 计时器、血量检测、距离判断 |
| `eventBus.on(自定义事件, ...)` | 自定义触发条件 | "Boss死亡事件"、"基地被摧毁事件" |

### 基本模板

```js
let _rulesRegistered = false;

function _registerRules() {
    if (_rulesRegistered) return;   // 防止模块缓存导致重复注册
    _rulesRegistered = true;

    function onEntityDied({ entity }) {
        // 判断条件 → eventBus.emit(LEVEL_WIN) 或 eventBus.emit(LEVEL_LOSE)
    }

    onEnter(GameState.PLAYING, 'LevelX_Rules', () => {
        eventBus.on(EventTypes.ENTITY_DIED, onEntityDied);
    });

    onExit(GameState.PLAYING, 'LevelX_Rules', () => {
        eventBus.off(EventTypes.ENTITY_DIED, onEntityDied);
    });
}
```

### 示例 1：消灭所有敌人（第 1 关）

```js
function onEntityDied({ entity }) {
    if (entity.type === EntityType.PLAYER) {
        eventBus.emit(EventTypes.LEVEL_LOSE, {}, 'Level1');
        return;
    }
    if (entity.type === EntityType.ENEMY) {
        const enemies = scene.getEntities().filter(e => e.type === EntityType.ENEMY);
        if (enemies.length === 0) {
            eventBus.emit(EventTypes.LEVEL_WIN, {}, 'Level1');
        }
    }
}
```

### 示例 2：生存 N 秒（第 2 关）

```js
const SURVIVE_TIME = 30;
let _timer = 0;

function _registerRules() {
    // 失败：玩家死亡
    function onEntityDied({ entity }) {
        if (entity.type === EntityType.PLAYER) {
            eventBus.emit(EventTypes.LEVEL_LOSE, {}, 'Level2');
        }
    }

    onEnter(GameState.PLAYING, 'Level2_Rules', () => {
        _timer = 0;
        eventBus.on(EventTypes.ENTITY_DIED, onEntityDied);
    });

    onExit(GameState.PLAYING, 'Level2_Rules', () => {
        eventBus.off(EventTypes.ENTITY_DIED, onEntityDied);
    });

    // 胜利：坚持 30 秒
    onUpdate(GameState.PLAYING, 'Level2_Timer', (dt) => {
        _timer += dt;
        if (_timer >= SURVIVE_TIME) {
            eventBus.emit(EventTypes.LEVEL_WIN, {}, 'Level2');
        }
    });
}
```

### 示例 3：Boss 关卡（第 3 关）

```js
function _registerRules() {
    function onEntityDied({ entity }) {
        if (entity.type === EntityType.PLAYER) {
            eventBus.emit(EventTypes.LEVEL_LOSE, {}, 'Level3');
            return;
        }
        // 只打 Boss：判断特定实体
        if (entity._isBoss) {
            eventBus.emit(EventTypes.LEVEL_WIN, {}, 'Level3');
        }
    }

    onEnter(GameState.PLAYING, 'Level3_Rules', () => {
        eventBus.on(EventTypes.ENTITY_DIED, onEntityDied);
    });

    onExit(GameState.PLAYING, 'Level3_Rules', () => {
        eventBus.off(EventTypes.ENTITY_DIED, onEntityDied);
    });
}
```

### `_rulesRegistered` 的作用

ES Module 第一次 `import()` 后即被缓存。关卡重新进入时 `init()` 会再次执行，但 `_registerRules()` 只注册一次钩子，避免 `onEnter`/`onExit` 重复堆积。

---

## init() 入口

```js
export function init() {
    _registerRules();     // ← 先注册胜负规则

    // 创建实体
    spawnZombie(700, 200);
    spawnZombie(700, 100);

    const player = new Player();
    player.x = 100;
    player.y = 100;
    attachScripts(player,
        createPlayerMoveScript(),
        createPlayerShootScript(),
        createPlayerHealthScript(),
        createPlayerDeathScript(),
    );
    scene.add(player);

    setWorld(scene);      // ← 注入引擎
}
```

> ⚠️ `setWorld(scene)` 必须在最后调用，确保 Scene 已包含所有实体。

---

## 注册关卡

在 `level/index.js` 的 `levelLoaders` 中添加：

```js
const levelLoaders = {
    1: () => import('./level1.js').then(m => m.init()),
    2: () => import('./level2.js').then(m => m.init()),   // ← 新增
    3: () => import('./level3.js').then(m => m.init()),   // ← 新增
};
```

同时在 `UISystem.js` 的 `LEVELS` 数组中添加条目：

```js
const LEVELS = [
    { id: 1, title: '第 1 关' },
    { id: 2, title: '第 2 关 — 生存挑战' },   // ← 新增
    { id: 3, title: '第 3 关 — Boss 战' },    // ← 新增
];
```

---

## 完整生命周期

```
LOADING
  └─ LoadSystem: 预加载资源 → transition(START)

START
  └─ UISystem: showTitle() → 点击"开始游戏" → showLevelSelect()
       └─ 用户选择关卡 → loadLevel(id)
            ├─ scene.clear()          ← 清空旧实体
            ├─ overlayManager.overlays = []
            └─ levelX.init()
                 ├─ _registerRules()  ← 注册胜负条件
                 ├─ 创建实体
                 └─ setWorld(scene)
            → transition(PLAYING)

PLAYING
  ├─ Scene.update(dt)      ← 实体更新
  ├─ ScriptSystem          ← 脚本调度
  ├─ CollisionSystem       ← 碰撞检测
  ├─ AnimationSystem       ← 动画渲染
  └─ 关卡胜负规则           ← 检查条件
       ├─ 满足 → emit(LEVEL_WIN)  → LevelFlowSystem → transition(WIN)
       └─ 满足 → emit(LEVEL_LOSE) → LevelFlowSystem → transition(LOSE)

WIN / LOSE
  └─ UISystem: 显示结算界面
       ├─ "下一关" → loadLevel(currentLevel + 1)
       ├─ "重新开始" → loadLevel(currentLevel)
       └─ "返回菜单" → transition(START)
```

---

## 注意事项

1. **胜负 emit 放在关卡里，不要放脚本里** — 脚本只管实体自身行为（移动、扣血、死亡移除），不管游戏输赢
2. **`_registerRules()` 必须防重复** — ES Module 缓存会让模块代码只执行一次，但 `init()` 每次进入关卡都会调用
3. **事件监听要在 `onExit` 中清理** — 离开 PLAYING 状态时必须 `off`，否则菜单界面会残留上一关的监听器
4. **`LEVEL_WIN` 和 `LEVEL_LOSE` 是关卡 → LevelFlowSystem 的专用通道** — 不要在其他地方 emit 这两个事件
5. **`EntityType` 枚举用于判断实体类型** — 不要用 `instanceof`，脚本和关卡统一用 `entity.type` 判断
