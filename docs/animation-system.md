# 动画系统（Animation System）

> 数据驱动的精灵图动画系统，Entity 零感知，支持实体绑定和固定坐标两种模式。

---

## 架构概览

```
AnimationConfig（不可变配置）
     ↓ 存于 Registry
AnimationPlayer（可变状态，每个 animator 实例化一个）
     ↓ 由 AnimationSystem 调度
renderAnimators（遍历 animators 直接绘制）
```

| 模块 | 文件 | 职责 |
|------|------|------|
| `AnimationConfig` | `Service/Animation/AnimationConfig.js` | 帧列表 + 帧时长 + 是否循环，不可变，多实体共享 |
| `AnimationPlayer` | `Service/Animation/AnimationPlayer.js` | 帧索引 + 计时器 + 播放控制，每个 animator 独立 |
| `AnimationRegistry` | `Service/Animation/AnimationRegistry.js` | 双 Map：configMap（key→Config）+ stateMap（type+state→key） |
| `AnimationSystem` | `Service/system/systemPojo/AnimationSystem.js` | 调度中心：绑定 → 状态解析 → Player 更新 → 渲染 |

---

## 两个入口

动画系统提供两种使用方式：

| 入口 | 适用场景 | 绑定方式 | 动画切换 |
|------|----------|----------|----------|
| **实体动画** | 游戏对象（僵尸、植物、子弹） | 自动（懒绑定） | `entity.state` 驱动 |
| **坐标动画** | UI 特效、固定位置动画（爆炸、loading） | 手动 `bindPosition()` | `setAnimState()` 或 `unbind()` |

两者走同一条渲染管线（`renderAnimators`），共享 `AnimationConfig` / `AnimationPlayer` / `drawSprite`。

---

## 入口一：实体动画

> 实体只声明 `type` 和 `state`，动画系统自动跟踪、切换、渲染。实体完全不知道动画的存在。

### 第 1 步：注册动画

```js
// Service/Animation/pojo/zombie/walk/zombieAnimationWalk.js
import { registerAnimation } from '@animation/AnimationRegistry.js';
import { EntityType } from '@entity/EntityType.js';

registerAnimation({
    key: 'zombieWalk',
    entityType: EntityType.ENEMY,
    state: 'walk',
    config: {
        dir: 'assets/images/Entity/animation/zombie/walk',
        count: 20,           // 帧数
        frameTime: 0.20,     // 每帧持续时间（秒）
        loop: true,          // 是否循环
    },
});
```

`registerAnimation` 内部自动完成：
- 帧路径生成（`getPhotoPathAsc`）
- 资源注册（`setResource` → LoadSystem 预加载）
- `AnimationConfig` 创建 & 存储
- `(entityType, state) → animKey` 映射

**记得在 `Service/Animation/pojo/index.js` 中 import 新文件**：

```js
import './zombie/walk/zombieAnimationWalk.js';
import './zombie/attack/zombieAnimationAttack.js';  // 新增
```

### 第 2 步：实体设置 state

```js
// Service/Entity/pojo/Zombie.js
export class Zombie extends Entity {
    type = EntityType.ENEMY;
    state = 'walk';    // ← 动画系统读取这个字段

    update(dt) {
        this.x -= this.speed * dt;
        // 将来可以切状态：this.state = 'attack';
    }
}
```

实体不需要 `render()`、不需要 `drawSprite`、不需要知道动画的任何细节。`state` 变化时动画系统自动切换动画。

### 状态 → 动画映射

```
Entity.state = 'walk'
       ↓
AnimationSystem.resolveAnim()
  → getConfigByState(EntityType.ENEMY, 'walk')
  → Registry 内部: (ENEMY, walk) → 'zombieWalk' → AnimationConfig
  → new AnimationPlayer(config)
  → player.update(dt) 驱动帧
```

实体从 scene 移除时，对应 animator 自动清理。

---

## 入口二：坐标动画

> 不绑定实体，直接传入 `{ x, y, w, animKey }` 在指定位置播放动画。适用于爆炸特效、UI 提示、loading 图标等。

### 第 1 步：注册动画

```js
// Service/Animation/pojo/effect/explosionAnimation.js
import { registerAnimation } from '@animation/AnimationRegistry.js';

registerAnimation({
    key: 'explosionEffect',
    entityType: null,     // 不绑定实体类型
    state: null,
    config: {
        dir: 'assets/images/Effect/explosion',
        count: 12,
        frameTime: 0.08,
        loop: false,       // 非循环，播完自动清理
    },
});
```

**记得在 `Service/Animation/pojo/index.js` 中 import**：

```js
import './zombie/walk/zombieAnimationWalk.js';
import './effect/explosionAnimation.js';  // 新增
```

### 第 2 步：调用 bindPosition

```js
import { bindPosition, setAnimState, unbind } from '@system/systemPojo/AnimationSystem.js';
```

#### 非循环动画（爆炸、一次性特效）

```js
// 播完自动清理，不需要手动管理
eventBus.on(EventTypes.COLLISION, ({ a, b }) => {
    bindPosition({
        x: a.x, y: a.y, w: 80,
        animKey: 'explosionEffect',
    });
});
```

#### 循环动画 + 切状态（loading 图标）

```js
// 创建 → 循环播放
const id = bindPosition({
    x: 400, y: 300, w: 60,
    animKey: 'loadingSpinner',
});

// 加载完毕 → 切换到完成动画
setAnimState(id, 'loadingComplete');  // 非循环 → 播完自动清理
```

#### 循环动画 + 手动关闭

```js
const id = bindPosition({
    x: 100, y: 50, w: 40,
    animKey: 'someLoopingUI',
});

// 不需要时直接删
unbind(id);
```

---

## API 参考

### `bindPosition(opts)`

在指定坐标创建动画，返回 animator id。

| 参数 | 类型 | 说明 |
|------|------|------|
| `opts.x` | `number` | 画布 X 坐标 |
| `opts.y` | `number` | 画布 Y 坐标 |
| `opts.w` | `number` | 绘制宽度（高度自动按比例） |
| `opts.animKey` | `string` | 动画 key（需已注册） |

**返回**：`string` — animator id，用于 `setAnimState()` / `unbind()`。若 animKey 未注册则返回 `null`。

**生命周期**：
- 非循环动画（`loop: false`）：播放完毕自动清理
- 循环动画（`loop: true`）：需手动 `unbind(id)` 清理

---

### `setAnimState(id, animKey)`

切换指定 animator 的动画。底层 `new AnimationPlayer(config) + reset()`，从第 0 帧重新开始。

| 参数 | 类型 | 说明 |
|------|------|------|
| `id` | `string` | `bindPosition()` 返回的 animator id |
| `animKey` | `string` | 新动画 key |

---

### `unbind(id)`

手动解绑 animator，立即停止播放并从渲染管线移除。

| 参数 | 类型 | 说明 |
|------|------|------|
| `id` | `string` | animator id（`bindPosition` 返回值或 entity.id） |

---

## 内部数据流

### update 阶段

```
tickAnimators(dt)
  │
  ├─ 实体动画（managed，scene 生命周期管理）
  │   ├─ 遍历 scene.getEntities()
  │   ├─ 新实体 → bindEntity(e)      // 懒绑定，持有 entity 引用
  │   ├─ resolveAnim(e, dt)           // state → Config → Player → update
  │   └─ cleanupStale(alive)          // 实体移除 → 清理 animator
  │
  └─ 坐标动画（managed === false，独立生命周期）
      └─ tickPositionAnimators(dt)
          ├─ player.update(dt)
          └─ !player.playing → 自动删除
```

### render 阶段

```
Scene.render(ctx)
  ├─ entity.render(ctx)              // 实体自定义渲染（色块等）
  ├─ renderAnimators(ctx)            // ← 动画系统渲染（setAfterEntityRender 钩子）
  │   └─ 遍历 animators.values()
  │        └─ player.getCurrentFrame()
  │             └─ drawSprite(ctx, frame, entity.x, entity.y, entity.w)
  └─ overlayManager.render(ctx)     // UI 贴片（最上层）
```

---

## 添加新动画检查清单

1. **新建动画注册文件** — `Service/Animation/pojo/<类别>/xxxAnimation.js`
   ```js
   registerAnimation({ key, entityType, state, config: { dir, count, frameTime, loop } });
   ```
2. **在 `pojo/index.js` 中 import** — 触发注册
3. **如果是实体动画**：实体设 `type` + `state`
4. **如果是坐标动画**：调用 `bindPosition({ x, y, w, animKey })`

---

## 相关文件

| 文件 | 说明 |
|------|------|
| `Service/Animation/AnimationConfig.js` | 不可变动画配置 |
| `Service/Animation/AnimationPlayer.js` | 可变播放状态，每个 animator 独立 |
| `Service/Animation/AnimationRegistry.js` | 配置注册 + type/state 映射 |
| `Service/system/systemPojo/AnimationSystem.js` | 调度中心 |
| `Service/Animation/pojo/index.js` | 动画注册汇总入口 |
| `Service/Utils/getPhotoPathAsc.js` | 帧路径生成工具 |
