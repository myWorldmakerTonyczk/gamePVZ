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
│   ├── Entity/                 ← 实体层（游戏对象）
│   │   ├── Entity.js           ← 实体基类（x, y, w, h, hp, maxHp, speed, type）
│   │   ├── EntityType.js       ← 实体类型枚举（PLAYER / ENEMY / BULLET）
│   │   ├── Scene.js            ← 场景容器（遍历 update/render + Overlay 渲染）
│   │   └── pojo/               ← 实体实现
│   │       ├── Box.js          ← 敌人方块（旧，已被 Zombie 替代）
│   │       ├── Zombie.js       ← 僵尸（state='walk'，由 AnimationSystem 驱动动画）
│   │       ├── player.js       ← 玩家（WASD 移动 + 方向显示）
│   │       └── Bullet.js       ← 子弹（角度飞行 + 碰撞清除）
│   │
│   ├── Animation/              ← 动画系统
│   │   ├── Animation.js        ← 帧数组 + 时间驱动切帧 + loop/play/stop
│   │   ├── AnimationRegistry.js← key → Animation 映射
│   │   └── pojo/               ← 动画定义（按实体分类）
│   │
│   ├── Resource/              ← 资源管理
│   │   ├── ResourceManager.js ← 加载/缓存/获取（双 Map + Promise + 日志/错误检测）
│   │   └── ResourceList.js    ← 资源清单（Set 去重，各模块注册路径）
│   │
│   ├── OverLay/                ← 贴片系统（血条 / 伤害数字等 UI 层元素）
│   │   ├── Overlay.js          ← 贴片基类（跟随实体 / 生命周期）
│   │   ├── OverlayManager.js   ← 贴片容器（add / update / render / 自动清理）
│   │   └── pojo/
│   │       ├── HealthBar.js    ← 血条（跟随实体 + 绿→黄→红变色）
│   │       └── StartScreen.js  ← 开始界面（标题 + 提示文字）
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
│           ├── AnimationSystem.js  ← 动画系统（读 entity.state → 驱动帧 → 渲染）
│           ├── LoadSystem.js       ← LOADING 阶段资源预加载
│           ├── StartSystem.js      ← START 状态（界面 + 输入检测）
│           ├── PauseSystem.js      ← 暂停切换（Esc）
│           ├── CollisionSystem.js  ← 碰撞系统（检测 + 扣血 + 死亡清除）
│           ├── CollisionTest.js    ← 碰撞测试（碰撞 → 暂停，调试用）
│           ├── PlayerSystem.js     ← 玩家系统（方向 + 射击事件）
│           ├── BulletSpawner.js    ← 子弹生成器（监听 PLAYER_SHOOT）
│           └── OverlaySystem.js    ← Overlay 驱动（每帧更新贴片）
│
├── Data/                       ← 数据配置（数值 / 关卡数据）
├── UI/                         ← UI 样式与组件
├── assets/                     ← 静态资源（图片 / 音效）
├── docs/                       ← 项目文档
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
                               ├──→ WIN
                               └──→ LOSE
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
| `PLAYER_SHOOT` | PlayerSystem | BulletSpawner | `{ x, y }` |
| `COLLISION` | CollisionSystem | 各实体/系统 | `{ a, b }` |

### 4. Entity / Scene

**Entity（实体基类）**：所有游戏对象的祖先

```js
class Entity {
  x, y, w, h       // 位置和尺寸
  hp, maxHp        // 生命值
  speed            // 速度
  type             // 类型（EntityType 枚举）

  update(dt)       // 每帧逻辑（子类覆写）
  render(ctx)      // 渲染（子类覆写）
  getBounds()      // 返回碰撞矩形 { x, y, w, h }
  takeDamage(n)    // 扣血，hp ≤ 0 返回 true（表示死亡）
}
```

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
// 3. 调用 overlayManager.render(ctx)  ← Overlay 最后渲染，保证在最上层
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

Entity 只持有 `state`（行为状态），完全不涉及动画代码。AnimationSystem 统一读取、翻译、驱动、渲染。

```
Entity.state = 'walk'
       ↓
AnimationSystem.onUpdate (每帧)
  ├─ 读 entity.type + entity.state
  ├─ STATE_ANIM_MAP 翻译 → 动画 key ('zombieWalk')
  ├─ AnimationRegistry.get(key) → Animation 实例
  ├─ anim.update(dt) 驱动帧计时
  └─ anim.getCurrentFrame() → 当前帧图片路径
       ↓
AnimationSystem.render (Scene 每帧调用)
  └─ entity.drawSprite(ctx, frame, x, y, w)
```

**三模块协作**：

| 模块 | 职责 |
|------|------|
| `Animation` | 帧数组 + 时间驱动切帧 + `loop/play/stop/pause/reset` |
| `AnimationRegistry` | key → Animation 映射，实体按名取 |
| `AnimationSystem` | 读 entity.state → 选动画 → 驱动 → 渲染（`setAfterEntityRender` 钩子） |

**渲染顺序**：`entity.render()` → `AnimationSystem.render()` → `Overlay.render()`，保证动画在实体之上、贴片之下。

**添加新动画**：

```js
// 1. Animation/pojo/ 下新建文件
const frames = getPhotoPathAsc('assets/xxx', 8, 'png');
frames.forEach(f => setResource(f));
registerAnimation('myWalk', new Animation({ frames, frameTime: 0.1, loop: true }));

// 2. AnimationSystem.js STATE_ANIM_MAP 加映射
[EntityType.ENEMY]: { walk: 'myWalk' },

// 3. 实体设置 state
this.state = 'walk';
```

**getPhotoPathAsc**：

```js
// 命名规范：文件夹名_序号.拓展名
getPhotoPathAsc('assets/zombie/walk', 20, 'png', 1);
// → walk_1.png ~ walk_20.png
// 传 count → 同步返回；不传 count → Promise 自动检测
```

---

## 📊 数据流

```
main.js
  │
  ├─ import level/level1.js  ──→ 实体调用 setResource() + 创建实体 → scene.add()
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
      ├─ AnimationSystem    ← 读 entity.state → 驱动动画帧
      ├─ PlayerSystem       ← 方向 + 射击事件
      ├─ CollisionSystem    ← 碰撞检测 + 扣血
      ├─ CollisionTest      ← 碰撞 → 暂停（调试）
      ├─ BulletSpawner      ← 监听事件 → 创建子弹
      ├─ PauseSystem        ← 暂停/恢复
      ├─ StartSystem        ← 开始界面逻辑
      ├─ OverlaySystem      ← 贴片更新
      └─ Scene.update()     ← 实体 update(dt)

  render():
    world.render(ctx)        ← Scene.render()
      ├─ entities → render(ctx)
      └─ overlayManager.render(ctx)
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
- [x] **动画系统** — Animation + Registry + AnimationSystem（Entity.state 驱动，完全解耦）
- [x] **FrameLoader** — getPhotoPathAsc（命名规范拼帧路径，同步/自动检测双模式）

### 进行中 🚧

- [ ] 雪碧图打包（散图 → 运行时拼接，减少请求）
- [ ] 敌方波次系统
- [ ] 植物实体（贴图 + 放置逻辑）
- [ ] WIN / LOSE 结算界面
- [ ] 音效集成（BGM + 射击 + 碰撞）

### 计划中 📝

- [ ] 植物放置系统（阳光 + CD + 网格）
- [ ] 经济系统（阳光收集 + 消耗）
- [ ] 多关卡支持 + 关卡选择
- [ ] SQL.js 存档系统
- [ ] 完整美术资源替换
- [ ] UI 界面（阳光计数、植物卡片栏）

---

## 📝 开发指南

### 添加新实体

```js
// 1. Service/Entity/pojo/Zombie.js
import { Entity } from '@entity/Entity.js';
import { EntityType } from '@entity/EntityType.js';
import { setResource } from '@resource/ResourceList.js';
import { get } from '@resource/ResourceManager.js';

setResource('assets/images/zombie.png');  // 声明依赖

export class Zombie extends Entity {
  type = EntityType.ENEMY;

  update(dt) {
    this.x -= this.speed * dt;  // 向左移动
  }

  render(ctx) {
    const img = get('assets/images/zombie.png');
    if (img) {
      ctx.drawImage(img, this.x, this.y, this.w, this.h);
    } else {
      ctx.fillStyle = '#4a4';
      ctx.fillRect(this.x, this.y, this.w, this.h);
    }
  }

  getBounds() {
    return { x: this.x, y: this.y, w: this.w, h: this.h };
  }
}

// 2. 在关卡中使用
import { Zombie } from '@entity/pojo/Zombie.js';
const z = new Zombie();
z.x = 800; z.y = 200;
scene.add(z);
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
// level/level2.js
import { Zombie } from '@entity/pojo/Zombie.js';
import { Player } from '@entity/pojo/player.js';
import { scene } from '@entity/Scene.js';
import { setWorld } from '@core/GameLoop.js';

// 创建多个僵尸
for (let i = 0; i < 5; i++) {
  const zombie = new Zombie();
  zombie.x = 700 + i * 80;
  zombie.y = 100 + Math.random() * 300;
  scene.add(zombie);
}

const player = new Player();
player.x = 100;
player.y = 300;
scene.add(player);

setWorld(scene);
```

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
