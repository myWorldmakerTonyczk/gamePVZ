# Plants vs Zombies — Web Edition

> 🌱 HTML5 Canvas + JavaScript 原生实现的植物大战僵尸网页游戏
>
> 🎓 5 人课程大作业项目 | 从零手写游戏引擎

---

## 📖 目录

- [快速开始](#-快速开始)
- [技术栈](#-技术栈)
- [项目结构](#-项目结构)
- [路径别名](#-路径别名)
- [引擎架构](#-引擎架构)
  - [状态机](#1-状态机-state-machine)
  - [游戏主循环](#2-游戏主循环-gameloop)
  - [事件总线](#3-事件总线-eventbus)
  - [Entity / Scene](#4-entity--scene)
  - [Overlay 贴片系统](#5-overlay-贴片系统)
  - [输入系统](#6-输入系统)
  - [碰撞系统](#7-碰撞系统)
  - [资源管理器](#8-资源管理器-resourcemanager)
  - [UI 系统](#10-ui-系统)
  - [关卡设计](#11-关卡设计)
- [数据流](#-数据流)
- [开发进度](#-开发进度)
- [开发指南](#-开发指南)
  - [添加新实体](#添加新实体)
  - [添加新系统](#添加新系统)
  - [添加新关卡](#添加新关卡)
  - [添加新事件](#添加新事件)
  - [使用资源管理器](#使用资源管理器)
- [Git 协作规范](#-git-协作规范)
- [团队成员](#-团队成员)
- [常见问题](#-常见问题)

---

## 🚀 快速开始

### 环境要求

- 现代浏览器（Chrome / Edge / Firefox，支持 ES Module）
- 推荐 VS Code + Live Server 插件

### 运行

```bash
# 方式一：VS Code Live Server
# 右键 index.html → "Open with Live Server"

# 方式二：任意 HTTP 服务器
npx serve .
# 或
python -m http.server 8080
```

> ⚠️ **不能直接用 `file://` 打开**：项目使用 ES Module (`import`/`export`)，浏览器安全策略要求必须通过 HTTP 加载。

### 操作方式

| 按键 | 功能 |
|------|------|
| `W` `A` `S` `D` | 移动玩家 |
| `↑` `↓` `←` `→` | 切换射击方向 |
| `Space` | 发射子弹 |
| `Esc` | 暂停 / 继续 |

---

## 🛠 技术栈

| 技术 | 用途 |
|------|------|
| **HTML5 Canvas** | 游戏场景渲染 |
| **CSS3** | 页面布局与 UI 样式 |
| **JavaScript ES6+** | 游戏核心逻辑（纯原生，无框架） |
| **ES Module** | 模块化与代码组织 |
| **Import Map** | 路径别名（`@core/`、`@entity/` 等） |
| **SQL.js** | 浏览器端 SQLite 存档（计划中） |

---

## 📁 项目结构

```
gamePVZ/
├── index.html                  ← 游戏入口（Canvas + importmap + 样式）
├── main.js                     ← 组装入口（import 系统 + 关卡 + 启动引擎）
├── jsconfig.json               ← VS Code 路径别名（Ctrl+点击可跳转）
│
├── level/                      ← 关卡配置
│   ├── index.js                ← 关卡片区统一入口
│   └── level1.js               ← 第 1 关（创建实体 + 注入 Scene + 绑定 Overlay）
│
├── Service/
│   ├── core/                   ← 引擎核心
│   │   ├── State Machine.js    ← 状态机（5 状态 + transition 唯一入口）
│   │   ├── GameLoop.js         ← 主循环（固定 60fps + accumulator + 钩子系统）
│   │   └── EventBus/           ← 事件总线
│   │       ├── EventBus.js     ← 发布-订阅核心（on/emit/off）
│   │       └── EventTypes.js   ← 事件名常量（COLLISION / PLAYER_SHOOT）
│   │
│   ├── Entity/                 ← 实体层（纯数据 + 脚本组合）
│   │   ├── Entity.js           ← 实体基类（x, y, w, h, hp, maxHp, speed, type, _scripts）
│   │   ├── EntityType.js       ← 实体类型枚举（PLAYER / ENEMY / BULLET）
│   │   ├── Scene.js            ← 场景容器（遍历 update/render + _afterEntityRender 钩子）
│   │   ├── pojo/               ← 实体实现（纯数据，无行为逻辑）
│   │   │   ├── Box.js          ← 敌人方块（旧，已被 Zombie 替代）
│   │   │   ├── Zombie.js       ← 僵尸（纯数据：type/w/h/state）
│   │   │   ├── player.js       ← 玩家（纯数据：type/w/h）
│   │   │   └── Bullet.js       ← 子弹（纯数据：type/w/h/angle）
│   │   └── scripts/            ← 外置行为脚本（按实体类型分目录）
│   │       ├── zombie/         ← 僵尸脚本：Move / Health / Attack / Death
│   │       ├── player/         ← 玩家脚本：Move / Shoot
│   │       └── bullet/         ← 子弹脚本：Move / Death
│   │
│   ├── Animation/              ← 动画系统
│   │   ├── AnimationConfig.js  ← 不可变配置（帧列表 + 帧时长 + 循环）
│   │   ├── AnimationPlayer.js  ← 可变播放状态（每个 animator 独立实例）
│   │   ├── AnimationRegistry.js← 配置注册 + type/state 映射 + 资源注册
│   │   └── pojo/               ← 动画定义（按实体分类）
│   │
│   ├── Resource/              ← 资源管理
│   │   ├── ResourceManager.js ← 加载/缓存/获取（双 Map + Promise + 日志/错误检测）
│   │   └── ResourceList.js    ← 资源清单（Set 去重，各模块注册路径）
│   │
│   ├── OverLay/                ← 贴片系统（血条 / UI 界面等 Canvas 上层元素）
│   │   ├── Overlay.js          ← 贴片基类（跟随实体 / 生命周期）
│   │   ├── OverlayManager.js   ← 贴片容器（add / update / render / 自动清理）
│   │   ├── UI/                 ← UI 组件（UIScreen / UIButton / UIText）
│   │   │   ├── index.js        ← 统一导出
│   │   │   ├── UIScreen.js     ← UI 画面（半透明遮罩 + 按钮 + 文字 + 事件绑定）
│   │   │   ├── UIButton.js     ← 可点击按钮（hover + hitTest + onClick）
│   │   │   └── UIText.js       ← 文字渲染元素
│   │   └── pojo/
│   │       ├── HealthBar.js    ← 血条（跟随实体 + 绿→黄→红变色）
│   │       ├── TitleScreen.js  ← 标题界面工厂
│   │       ├── LevelSelect.js  ← 关卡选择界面工厂
│   │       ├── WinScreen.js    ← 胜利结算界面工厂
│   │       └── LoseScreen.js   ← 失败结算界面工厂
│   │
│   ├── Input/                  ← 输入系统
│   │   ├── Input.js            ← 键盘输入（isAction / isJustPressed / keydown/keyup）
│   │   └── Mouse.js            ← 鼠标输入（isMouseAction / isJustClicked / getMousePos）
│   │
│   ├── Utils/
│   │   ├── Collision.js        ← 碰撞工具（AABB 检测 + 碰撞规则 + checkCollisions）
│   │   └── getPhotoPathAsc.js  ← 帧路径拼接（命名规范 + 自动检测）
│   │
│   └── system/                 ← 系统层（游戏逻辑）
│       ├── HookLabel.js        ← Hook 标签常量（调试追踪用）
│       ├── index.js            ← 系统统一入口（副作用 import）
│       └── systemPojo/
│           ├── AnimationSystem.js  ← 动画系统（读 entity.state → 驱动帧 → 渲染 + bindPosition）
│           ├── ScriptSystem.js     ← 脚本调度器（stage 分组 + enter/update/exit 生命周期）
│           ├── LoadSystem.js       ← LOADING 阶段资源预加载
│           ├── StartSystem.js      ← START 状态（界面 + 输入检测）
│           ├── PauseSystem.js      ← 暂停切换（Esc）
│           ├── CollisionSystem.js  ← 碰撞系统（检测 + emit DAMAGE 事件）
│           ├── CollisionTest.js    ← 碰撞测试（碰撞 → 暂停，调试用）
│           ├── PlayerSystem.js     ← 玩家射击输入检测（emit PLAYER_SHOOT）
│           ├── OverlaySystem.js    ← Overlay 驱动（每帧更新贴片）
│           ├── UISystem.js         ← UI 界面调度（状态钩子 → 创建/销毁界面）
│           └── LevelFlowSystem.js  ← 关卡流程控制（监听胜负事件 → transition）
│
├── Data/                       ← 数据配置（数值 / 关卡数据）
├── UI/                         ← UI 样式与组件
├── assets/                     ← 静态资源（图片 / 音效）
├── docs/                       ← 项目文档
│   ├── animation-system.md     ← 动画系统设计文档
│   ├── script-system.md        ← 脚本系统设计文档
│   └── level-design.md         ← 关卡设计开发指南
└── db/                         ← 数据库 schema
```

---

## 🔗 路径别名（Import Map）

通过 `index.html` 中的 `<script type="importmap">` 和 `jsconfig.json` 配置了路径别名，**无论文件在哪一层，路径始终一致**：

```js
// 核心引擎
import { onUpdate, transition, start, setWorld, hooks }
  from '@core/GameLoop.js';
import { GameState } from '@core/State Machine.js';

// 实体
import { Entity }    from '@entity/Entity.js';
import { scene }     from '@entity/Scene.js';
import { Player }    from '@entity/pojo/player.js';

// 系统
import { HookLabel } from '@system/HookLabel.js';

// 输入
import { isJustPressed, KEY_MAP } from '@input/Input.js';
import { MouseMap, getMousePos }  from '@input/Mouse.js';

// 工具
import { checkCollisions } from '@utils/Collision.js';

// 资源
import { load, preload, get } from '@resource/ResourceManager.js';
import { setResource } from '@resource/ResourceList.js';

// 事件
import { eventBus }    from '@core/EventBus/EventBus.js';
import { EventTypes }  from '@core/EventBus/EventTypes.js';

// Overlay
import { overlayManager } from '@overlay/OverlayManager.js';
import { HealthBar }      from '@overlay/pojo/HealthBar.js';
```

VS Code 中按住 `Ctrl` + 点击路径可直接跳转到源文件。

---

## 🏗 引擎架构

> 核心设计理念：**状态驱动 + 事件解耦 + 固定帧率**
>
> 不是一个一次性搬上来的庞然大物，而是从"画个方块"一步步演进成完整引擎。详见 `docs/` 中的设计决策与开发记录。

### 1. 状态机（State Machine）

游戏有 6 种状态，`transition()` 是**唯一的状态切换入口**：

```
LOADING ──→ START ──→ PLAYING ──→ PAUSED ──→ PLAYING
                               ├──→ WIN ───→ START（返回菜单）
                               │     └──→ PLAYING（下一关）
                               └──→ LOSE ──→ START（返回菜单）
                                     └──→ PLAYING（重新开始）
```

```js
// 状态枚举
export const GameState = {
  LOADING: 'loading',
  START:   'start',
  PLAYING: 'playing',
  PAUSED:  'paused',
  WIN:     'win',
  LOSE:    'lose',
};

// 唯一入口
transition(GameState.PLAYING);
```

**钩子接口**：

```js
onEnter(state, label, fn)   // 进入某状态时触发
onExit(state, label, fn)    // 离开某状态时触发
onUpdate(state, label, fn)  // 某状态下每帧触发
```

每次状态切换，控制台会输出完整的状态流转日志：
```
[SM] start → playing  |  StartSystem
[SM] start → playing  |  PlayerSystem
```

### 2. 游戏主循环（GameLoop）

**固定时间步长 60fps**，采用经典的 **accumulator 模式**，即使显示器刷新率波动，游戏逻辑始终以 1/60 秒为粒度更新：

```
每一帧:
  dt = now - lastTime
  accumulator += clamp(dt, 0, 200)    ← 防切后台时间爆炸

  while (accumulator >= 16.67ms):
      update(1/60)                    ← 固定步长逻辑更新
      accumulator -= 16.67ms

  render()                            ← 渲染（不依赖状态，有 world 就画）
```

关键设计：
- **update 与 render 严格分离** — 渲染只读，不修改逻辑状态
- **防螺旋保护** — 单帧 dt 最大 200ms，切后台回来不会瞬间跑几十帧
- **`setWorld(w)` 注入** — 引擎不关心 world 是什么，只要它有 `render(ctx)` 方法

### 3. 事件总线（EventBus）

松耦合通信机制，模块间不直接调用，而是通过事件传递：

```
PlayerSystem                    BulletSpawner
    │                                │
    │  emit(PLAYER_SHOOT, {x,y})     │
    └────────────┬───────────────────┘
                 │
            EventBus                  CollisionSystem
                 │                        │
                 │  emit(COLLISION, {...})│
                 └────────────────────────┘
```

```js
// 发布
eventBus.emit(EventTypes.PLAYER_SHOOT, { x, y });

// 订阅
eventBus.on(EventTypes.COLLISION, ({ a, b }) => { ... });

// 取消订阅
eventBus.off(EventTypes.COLLISION, handler);
```

**当前事件**：

| 事件 | 触发方 | 监听方 | 载荷 |
|------|--------|--------|------|
| `PLAYER_SHOOT` | PlayerSystem | BulletShootScript | `{ x, y }` |
| `COLLISION` | CollisionSystem | AttackScript | `{ a, b }` |
| `DAMAGE` | CollisionSystem / AttackScript | HealthScript | `{ entity, amount }` |
| `ENTITY_DIED` | HealthScript | DeathScript + 关卡胜负规则 | `{ entity }` |
| `LEVEL_WIN` | 关卡胜负规则 | LevelFlowSystem | `{}` |
| `LEVEL_LOSE` | 关卡胜负规则 | LevelFlowSystem | `{}` |

### 4. Entity / Scene / Script

**Entity（实体基类）**：纯数据 + 纯方法，不包含任何行为逻辑和渲染代码。

```js
class Entity {
  x, y, w, h       // 位置和尺寸
  hp, maxHp        // 生命值
  speed            // 速度
  type             // 类型（EntityType 枚举）
  state            // 行为状态（动画系统和脚本系统读取）
  _scripts = []    // 外置脚本列表

  update(dt)       // 可被子类覆写（非脚本逻辑）
  render(ctx)      // 色块兜底渲染（由 AnimationSystem 覆盖）
  getBounds()      // 返回碰撞矩形 { x, y, w, h }
}
```

**Script（组件化行为）**：实体行为由外置脚本定义，通过 `attachScripts` 挂载。脚本是 `{ stage, enter, update, exit }` 三件套，每个实体类型独立维护自己的脚本目录。

```js
// 关卡中挂载脚本
attachScripts(zombie,
    createZombieMoveScript(),
    createZombieHealthScript(),
    createZombieAttackScript(),
    createZombieDeathScript(),
);
```

脚本间通过 `entity.state` 和 `EventBus` 通信，彼此不 import、不调用、不知道对方存在。

**Scene（场景容器）**：管理所有实体的生命周期

```js
// 关卡中创建并注入
import { scene } from '@entity/Scene.js';
const player = new Player();
scene.add(player);
setWorld(scene);  // 引擎接管 Scene 的渲染

// Scene 内部每帧自动：
// 1. 遍历 entities → update(dt)
// 2. 遍历 entities → render(ctx)
// 3. 调用 _afterEntityRender(ctx)  ← 动画系统渲染钩子
// 4. 调用 overlayManager.render(ctx)  ← Overlay 最后渲染
```

### 5. Overlay 贴片系统

独立于实体的 **UI 贴片层**，比 Entity 渲染晚一帧，保证始终显示在最上层：

```
Scene.render():
  for each entity → entity.render(ctx)     ← 先画实体
  overlayManager.render(ctx)                ← 再画贴片（覆盖在上面）
```

```js
class Overlay {
  target      // 跟随的实体（可选，null 表示独立定位）
  duration    // 生命周期（秒），过期自动移除
  x, y        // 位置（有 target 时自动跟随目标坐标）

  update(dt)  // 每帧更新（倒计时 + 跟随目标）
  render(ctx) // 渲染
}

// 创建血条贴片（自动跟随实体）
const bar = new HealthBar(box);   // box 扣血时血条自动变色
overlayManager.add(bar);
```

OverlayManager 每帧自动清理过期贴片（`duration ≤ 0`），无需手动管理。

### 6. 输入系统

支持键盘和鼠标，统一封装"持续按住"和"单次按下"两种语义：

```js
// 键盘
isAction(KEY_MAP.Space)         // 按住 Space 持续触发
isJustPressed(KEY_MAP.Space)    // 仅按下那一帧触发
isJustPressed(KEY_MAP.Escape)   // 暂停

// 鼠标
isMouseAction(MouseMap.LEFT)         // 按住左键持续触发
isJustClicked(MouseMap.LEFT)         // 仅点击那一帧触发
getMousePos(canvas)                 // 返回 { x, y } Canvas 坐标
```

### 7. 碰撞系统

**流程**：双层循环检测 → 规则过滤 → AABB → 发事件 → 扣血/清除

```
每帧:
  for i in entities:
    for j in (i+1..end):
      if (!canCollide(a.type, b.type)) continue    ← 规则过滤
      if (!AABB检测(a, b))             continue    ← 矩形重叠
      eventBus.emit(COLLISION, { a, b })           ← 发事件
```

**碰撞规则**（`Collision.js` 中的 `RULES` 表）：

| 组合 | 结果 |
|------|------|
| BULLET × ENEMY | ✅ 检测 |
| PLAYER × ENEMY | ✅ 检测 |
| PLAYER × BULLET | ❌ 忽略 |
| ENEMY × ENEMY | ❌ 忽略 |

碰撞发生后，`CollisionSystem` 监听事件自动扣血并清除死亡实体。

### 8. 资源管理系统

三模块协作：`ResourceList`（声明依赖）→ `LoadSystem`（调度加载）→ `ResourceManager`（执行加载/缓存/获取）。

#### ResourceList — 资源清单

各模块在 import 时调用 `setResource()` 声明自己需要的资源，Set 自动去重：

```js
import { setResource } from '@resource/ResourceList.js';
setResource('assets/images/zombie.png', 'assets/images/bullet.png');
```

#### ResourceManager — 加载/缓存/获取

基于 **双 Map + Promise 架构**，解决异步加载的缓存复用和并发去重：

```
cache:   Map<string, Image|Audio|JSON>   ← 加载完成的资源
loaders: Map<string, Promise>             ← 正在加载中的 Promise
```

```js
import { load, preload, get, isCached } from '@resource/ResourceManager.js';

// 预加载（LoadSystem 在 LOADING 阶段调用）
await preload(resourceList);

// 单个加载（自动去重）
const img = await load('assets/bullet.png');

// 同步获取（前提是已预加载）
const img = get('assets/images/zombie.png');

// 检查缓存
if (!isCached('assets/boss.png')) { await load('assets/boss.png'); }
```

**按文件后缀自动分发加载器**：

| 后缀 | 加载方式 |
|------|----------|
| `.png` `.jpg` `.gif` | `new Image()` |
| `.mp3` `.wav` `.ogg` | `new Audio()` |
| `.json` | `fetch()` |

**防重复加载**：同一资源并发请求时复用 `loaders` 中已有的 Promise，不发起第二次网络请求。

**日志与错误检测**：加载时控制台输出 `[ResourceManager]` 前缀日志；路径以 `@` 开头时发出警告（可能误用了 importmap 别名）。

#### LoadSystem — 加载调度

LOADING 状态进入时，读取 ResourceList 并调用 preload，完成后切换到 START：

```js
onEnter(GameState.LOADING, 'LoadSystem', async () => {
    await preload(getList());
    transition(GameState.START);
});
```

---

### 9. 动画系统

数据驱动的精灵图动画系统，Entity 零感知。分两种使用方式：

**实体动画**：Entity 声明 `type` 和 `state`，AnimationSystem 自动跟踪、切换、渲染。

```js
// 注册（仅此一次）
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

// 实体只需设 state，动画自动响应
this.type = EntityType.ENEMY;
this.state = 'walk';   // ← AnimationSystem 自动读取 → 播放 zombieWalk 动画
```

**坐标动画**：不绑定实体，传入 `{ x, y, w, animKey }` 在指定位置播放。适用于爆炸特效、UI 提示等。

```js
bindPosition({ x: 400, y: 300, w: 80, animKey: 'explosionEffect' });
// 非循环动画播完自动清理；循环动画用 unbind(id) 手动停止
```

**核心模块**：

| 模块 | 职责 |
|------|------|
| `AnimationConfig` | 不可变配置（帧列表 + 帧时长 + 是否循环），多实体共享 |
| `AnimationPlayer` | 可变播放状态（帧索引 + 计时器），每个 animator 独立 new |
| `AnimationRegistry` | 配置注册 + type/state 映射 + 帧路径生成 + 资源注册 |
| `AnimationSystem` | 调度中心：绑定 → 状态解析 → Player 更新 → 渲染 |

**渲染顺序**：`entity.render()` → `AnimationSystem.render()` → `Overlay.render()`，保证动画在实体色块之上、贴片之下。

详见 [`docs/animation-system.md`](docs/animation-system.md)。

---

### 10. 脚本系统

组件化实体行为系统。实体纯数据，行为由外置脚本定义，脚本间通过 EventBus 通信。

```
Entity（纯数据）
  ├── _scripts = [MoveScript, HealthScript, AttackScript, DeathScript]
  └── ScriptSystem 机械调度（stage 分组: INPUT → LOGIC → EFFECT → CLEANUP）
```

**脚本格式**：工厂函数返回 `{ stage, enter, update, exit }`，每个实体类型独立维护自己的脚本目录。

```js
// Entity/scripts/zombie/ZombieMoveScript.js
export function createZombieMoveScript() {
    return {
        stage: 'LOGIC',
        enter(entity) { entity.speed = 50; },
        update(entity, dt) { entity.x -= entity.speed * dt; },
        exit() {},
    };
}

// 关卡中组合
attachScripts(zombie,
    createZombieMoveScript(),
    createZombieHealthScript(),
    createZombieAttackScript(),
    createZombieDeathScript(),
);
```

**通信方式**：脚本间通过 `entity.state`（共享数据）和 `EventBus`（事件链）通信，彼此不 import。胜负条件由关卡文件负责，脚本不管输赢。

```
CollisionSystem → emit DAMAGE
  → HealthScript: hp -= 25 → hp≤0 → emit ENTITY_DIED
    → DeathScript: scene.del()                    ← 脚本层：只移除实体
    → 关卡胜负规则: emit(LEVEL_WIN / LEVEL_LOSE)   ← 关卡层：判断输赢
    → AnimationSystem: 自动切死亡动画
```

**同一个实体换不同脚本组合** = 不同行为：
- 普通僵尸：`ZombieMove + ZombieHealth + ZombieAttack + ZombieDeath`
- 快速僵尸：`FastZombieMove + ZombieHealth + ZombieAttack + ZombieDeath`
- 炸弹僵尸：`ZombieMove + ZombieHealth + BombAttack + ZombieDeath`

详见 [`docs/script-system.md`](docs/script-system.md)。

---

### 10. UI 系统

基于状态机驱动的 UI 界面系统，全部用 Canvas 2D 原生绘制，零 DOM 依赖。

**组件分层**：

| 组件 | 职责 |
|------|------|
| `UIScreen` | 画面容器：半透明遮罩 + 子组件渲染 + click/mousemove 事件委托 |
| `UIButton` | 按钮：hover 高亮 + hitTest 碰撞检测 + onClick 回调 |
| `UIText` | 文字：颜色、字号、对齐 + 居中渲染 |

**触发流程**：全部由状态机驱动

```
transition(WIN/LOSE) → UISystem.onEnter → 创建 UIScreen → overlayManager.add()
  → 渲染链: Scene.render() → overlayManager.render(ctx) → UIScreen.render()
    → 用户点击按钮 → onClick 回调 → screen.close() → transition(下一个状态)
```

**已有界面**：

| 工厂函数 | 关联状态 | 按钮 / 功能 |
|----------|----------|-------------|
| `createTitleScreen` | START | "开始游戏" → 关卡选择 |
| `createLevelSelect` | START | 关卡列表 + "返回" |
| `createWinScreen` | WIN | "下一关" / "返回菜单" |
| `createLoseScreen` | LOSE | "重新开始" / "返回菜单" |

### 11. 关卡设计

胜负条件由**关卡文件定义**，不硬编码在实体脚本中。每个关卡可以有完全不同的规则。

```
关卡文件 (level/levelX.js)
    ├── 创建实体 + attachScripts() + scene.add()
    ├── _registerRules() → 定义胜负条件
    │     ├── eventBus.on(ENTITY_DIED, ...)  ← 死亡触发
    │     └── onUpdate(GameState.PLAYING, ...) ← 轮询触发
    └── emit(LEVEL_WIN / LEVEL_LOSE)
          → LevelFlowSystem → transition(WIN / LOSE)
            → UISystem → 显示结算界面
```

| 关卡 | 胜利条件 | 失败条件 |
|------|----------|----------|
| 第 1 关 | 消灭所有僵尸 | 玩家死亡 |
| 第 2 关（可扩展）| 生存 30 秒 | 玩家死亡 |
| 第 3 关（可扩展）| 击败 Boss | 玩家死亡 |

> 💡 添加新关卡只需 3 步：写关卡文件 → 注册到 `level/index.js` → 注册到 `UISystem.js` 的 LEVELS 列表。详见 [`docs/level-design.md`](docs/level-design.md)。

---

## 📊 数据流

```
main.js
  │
  ├─ import level/level1.js  ──→ 实体调用 setResource() + 创建实体 + attachScripts() + scene.add()
  ├─ import Service/system/   ──→ 各系统注册 hooks（副作用 import）
  │
  └─ start(ctx, canvas)
     └─ transition(LOADING)   ──→ LoadSystem: preload → transition(START)
            └─ transition(START) ──→ StartSystem: 显示开始界面
                   └─ 按空格 → transition(PLAYING)

════════════════════════════════════════════

每帧 tick():

  update(dt):
    hooks.onUpdate[currentState] → 逐个执行
      ├─ AnimationSystem    ← 读 entity.state → 驱动动画帧 + renderAnimators
      ├─ ScriptSystem       ← 按 stage 分组执行各实体脚本的 enter/update/exit
      ├─ PlayerSystem       ← 射击输入检测 → emit PLAYER_SHOOT
      ├─ CollisionSystem    ← 碰撞检测 → emit DAMAGE 事件
      ├─ CollisionTest      ← 碰撞 → 暂停（调试）
      ├─ PauseSystem        ← 暂停/恢复
      ├─ StartSystem        ← 开始界面逻辑
      ├─ OverlaySystem      ← 贴片更新
      ├─ 关卡胜负规则        ← 监听 ENTITY_DIED / onUpdate 轮询 → emit LEVEL_WIN/LEVEL_LOSE
      └─ Scene.update()     ← 实体 update(dt)

  render():
    world.render(ctx)        ← Scene.render()
      ├─ entities → render(ctx)
      ├─ _afterEntityRender  ← 动画系统渲染
      └─ overlayManager.render(ctx)  ← UI 贴片（最上层）
```

---

## 📋 开发进度

### 已完成 ✅

- [x] **引擎核心**
  - 状态机（5 状态 + `transition` 唯一入口 + `onEnter/onExit/onUpdate` 钩子）
  - GameLoop（固定 60fps + accumulator 防掉帧 + update/render 分离）
  - EventBus（发布-订阅 + `on/emit/off` + 类型常量）
- [x] **实体系统** — Entity 基类 + Scene 容器 + EntityType 枚举
- [x] **输入系统** — 键盘（持续 / 单次）+ 鼠标（持续 / 单次 / 坐标）
- [x] **碰撞系统** — AABB 矩形检测 + 碰撞规则表 + 扣血 + 死亡清除
- [x] **Overlay 贴片** — 基类 + Manager + 血条（跟随 + 变色）+ START 界面
- [x] **子弹系统** — 角度飞行 + 碰撞消失 + EventBus 事件驱动生成
- [x] **暂停系统** — Esc 切换 + onEnter/onExit 生命周期
- [x] **资源管理系统** — ResourceList（Set 注册）+ LoadSystem（调度）+ ResourceManager（双 Map + Promise 去重 + 日志/错误检测）
- [x] **路径别名** — importmap + jsconfig.json（Ctrl+点击跳转，含 @resource）
- [x] **关卡分层** — `level/` 目录，创建实体与系统解耦
- [x] **僵尸实体** — Zombie 类（state='walk'，由 AnimationSystem 驱动动画）
- [x] **动画系统** — Config/Player 拆分 + Registry 收敛 + Entity 去渲染化 + bindPosition 坐标动画
- [x] **FrameLoader** — getPhotoPathAsc（命名规范拼帧路径，同步/自动检测双模式）
- [x] **脚本系统** — ScriptSystem（stage 分组 + enter/update/exit 生命周期）+ 各实体独立脚本
- [x] **EventBus 调试** — emit 日志 + source 追踪 + DEBUG 开关
- [x] **UI 系统** — UIScreen + UIButton + UIText + 状态驱动界面调度
- [x] **胜负结算** — WIN / LOSE 界面 + 关卡选择 + 胜负条件关卡化
- [x] **多关卡支持** — 关卡动态加载 + 关卡选择界面 + 关卡间切换

### 进行中 🚧

- [ ] 植物实体（贴图 + 放置逻辑 + 阳光生产）
- [ ] 敌方波次系统（定时批量生成，难度递增）
- [ ] 音效集成（BGM + 射击 + 碰撞）

### 计划中 📝

- [ ] 植物放置系统（阳光 + CD + 网格）
- [ ] 经济系统（阳光收集 + 消耗）
- [ ] SQL.js 存档系统
- [ ] 完整美术资源替换
- [ ] UI 界面（阳光计数、植物卡片栏）

---

## 📝 开发指南

### 添加新实体

```js
// 1. Service/Entity/pojo/NewEnemy.js — 实体类（纯数据）
export class NewEnemy extends Entity {
  type = EntityType.ENEMY;
  w = 60; h = 60;
  state = 'idle';
}

// 2. Service/Entity/scripts/newEnemy/NewEnemyMoveScript.js — 脚本
export function createNewEnemyMoveScript() {
  return {
    stage: 'LOGIC',
    enter(entity) { entity.speed = 80; },
    update(entity, dt) {
      if (entity.state !== 'walk') return;
      entity.x -= entity.speed * dt;
    },
    exit() {},
  };
}

// 3. 在关卡中挂载
attachScripts(enemy,
  createNewEnemyMoveScript(),
  createNewEnemyHealthScript(),
);
scene.add(enemy);
```

### 添加新系统

```js
// Service/system/systemPojo/ZombieSpawner.js
import { onUpdate } from '@core/GameLoop.js';
import { GameState } from '@core/State Machine.js';
import { HookLabel } from '@system/HookLabel.js';
import { scene } from '@entity/Scene.js';
import { Zombie } from '@entity/pojo/Zombie.js';

let timer = 0;
onUpdate(GameState.PLAYING, 'ZombieSpawner', (dt) => {
  timer += dt;
  if (timer > 3) {  // 每 3 秒生成一只
    timer = 0;
    const z = new Zombie();
    z.x = 800;
    z.y = 100 + Math.random() * 400;
    scene.add(z);
  }
});

// 3. 在 system/index.js 中注册
import './systemPojo/ZombieSpawner.js';
```

### 添加新关卡

```js
// 1. level/level2.js — 关卡文件
import { scene } from '@entity/Scene.js';
import { setWorld, onEnter, onExit } from '@core/GameLoop.js';
import { GameState } from '@core/State Machine.js';
import { eventBus } from '@core/EventBus/EventBus.js';
import { EventTypes } from '@core/EventBus/EventTypes.js';
import { EntityType } from '@entity/EntityType.js';
import { Zombie } from '@entity/pojo/Zombie.js';
import { Player } from '@entity/pojo/player.js';
import { attachScripts } from '@system/systemPojo/ScriptSystem.js';
// ... 导入所需脚本

// —— 胜负条件 ——
let _rulesRegistered = false;

function _registerRules() {
    if (_rulesRegistered) return;
    _rulesRegistered = true;

    function onEntityDied({ entity }) {
        if (entity.type === EntityType.PLAYER) {
            eventBus.emit(EventTypes.LEVEL_LOSE, {}, 'Level2');
            return;
        }
        if (entity.type === EntityType.ENEMY) {
            const enemies = scene.getEntities().filter(e => e.type === EntityType.ENEMY);
            if (enemies.length === 0) {
                eventBus.emit(EventTypes.LEVEL_WIN, {}, 'Level2');
            }
        }
    }

    onEnter(GameState.PLAYING, 'Level2_Rules', () => {
        eventBus.on(EventTypes.ENTITY_DIED, onEntityDied);
    });
    onExit(GameState.PLAYING, 'Level2_Rules', () => {
        eventBus.off(EventTypes.ENTITY_DIED, onEntityDied);
    });
}

// —— 入口 ——
export function init() {
    _registerRules();

    // 创建实体 + 挂载脚本
    for (let i = 0; i < 5; i++) {
        const zombie = new Zombie();
        zombie.x = 700 + i * 80;
        zombie.y = 100 + Math.random() * 300;
        attachScripts(zombie,
            createZombieMoveScript(),
            createZombieHealthScript(),
            createZombieAttackScript(),
            createZombieDeathScript(),
        );
        scene.add(zombie);
    }

    const player = new Player();
    player.x = 100; player.y = 300;
    attachScripts(player,
        createPlayerMoveScript(),
        createPlayerShootScript(),
        createPlayerHealthScript(),
        createPlayerDeathScript(),
    );
    scene.add(player);

    setWorld(scene);
}

// 2. level/index.js 中注册
const levelLoaders = {
    1: () => import('./level1.js').then(m => m.init()),
    2: () => import('./level2.js').then(m => m.init()),   // ← 新增
};

// 3. UISystem.js 的 LEVELS 数组中添加
const LEVELS = [
    { id: 1, title: '第 1 关' },
    { id: 2, title: '第 2 关' },   // ← 新增
];
```

> 💡 胜负条件由关卡文件定义，不同关卡可以完全不同（消灭全部敌人 / 生存 N 秒 / 击败 Boss）。详见 [`docs/level-design.md`](docs/level-design.md)。

### 添加新事件

```js
// 1. EventTypes.js 中新增
export const EventTypes = {
  COLLISION:     'collision',
  PLAYER_SHOOT:  'player:shoot',
  ENEMY_DEATH:   'enemy:death',     // ← 新增
};

// 2. 触发方 emit
eventBus.emit(EventTypes.ENEMY_DEATH, { enemy });

// 3. 监听方 on
eventBus.on(EventTypes.ENEMY_DEATH, ({ enemy }) => {
  score += 10;
});
```

### 使用资源管理系统

```js
// 1. 各模块声明依赖（在 import 时自动注册）
import { setResource } from '@resource/ResourceList.js';
setResource('assets/images/zombie.png', 'assets/sounds/bgm.mp3');

// 2. LoadSystem 在 LOADING 阶段自动预加载，无需手动调用 preload

// 3. 实体中使用（同步获取，前提是已预加载）
import { get } from '@resource/ResourceManager.js';

render(ctx) {
  const img = get('assets/images/zombie.png');
  if (img) {
    ctx.drawImage(img, this.x, this.y, this.w, this.h);
  } else {
    // 图片未就绪时用色块兜底
    ctx.fillStyle = '#4a4';
    ctx.fillRect(this.x, this.y, this.w, this.h);
  }
}
```

> ⚠️ 资源路径不能使用 `@` 别名（如 `@assets/...`），importmap 只对 JS import 生效。图片/音频/fetch 加载必须用真实路径。

---

## 🔄 Git 协作规范

### 分支策略

```
master                  ← 稳定版本，只通过 PR 合入
  └── feature            ← 开发集成分支
       └── czk / userX   ← 个人功能分支
```

### 工作流程

```bash
# 1. 从 feature 切出个人分支
git checkout feature
git checkout -b your-branch

# 2. 开发 + 提交
git add .
git commit -m "feat: 添加僵尸实体"

# 3. 合并到 feature（本地）
git checkout feature
git merge your-branch

# 4. 推送到远端
git push origin feature

# 5. 在 GitHub 开 PR：feature → master
#    队友 review 后合并
```

### 提交规范

```
feat:     新功能
fix:      Bug 修复
docs:     文档更新
refactor: 重构（不改变功能）
chore:    杂项（构建、配置等）
```

---

## ❓ 常见问题

### Q: 为什么双击 index.html 不行？

ES Module 需要 HTTP 协议加载，`file://` 协议下浏览器会拦截。用 Live Server 或 `npx serve .` 即可。

### Q: import 路径为什么是 `@core/` 开头？

通过 importmap 配置的路径别名，避免 `../../../Service/core/GameLoop.js` 这种深层相对路径。详见 `index.html` 中的 `<script type="importmap">`。

### Q: 为什么不用 TypeScript？

课设项目优先降低认知门槛，让所有成员都能快速上手。纯 JS + JSDoc 注释已经足够。

### Q: 如何调试？

- 控制台有 `[SM]` 前缀的状态转换日志
- `CollisionTest.js` 会在碰撞时自动暂停，便于观察
- VS Code 中 `Ctrl+点击 import 路径` 可跳转到源文件

### Q: 资源管理器什么时候用 `load`、什么时候用 `get`？

- **`load`** — 异步加载，返回 Promise。资源未缓存时使用
- **`get`** — 同步取缓存，返回资源本身。**前提是已经 `preload` 过**
- 游戏启动时用 `preload` 批量加载，游戏中使用 `get` 同步取

---

> 📌 项目仍在活跃开发中。有问题或建议请开 Issue 或直接找组长。
