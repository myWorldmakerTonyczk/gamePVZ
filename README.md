# Plants vs Zombies - Web Edition

> 基于 HTML5 Canvas + JavaScript 的植物大战僵尸网页游戏
> 5 人课程大作业项目

## 技术栈

- **HTML5 Canvas** — 游戏场景渲染
- **CSS3** — UI 样式与动画
- **JavaScript (ES6+)** — 游戏核心逻辑
- **SQL.js** — 浏览器端 SQLite 存档

## 项目结构

```
├── index.html              ← 游戏入口（Canvas）
├── main.js                 ← 组装入口（创建实体、注册系统、启动引擎）
├── Service/
│   ├── core/               ← 引擎核心
│   │   ├── State Machine.js ← 状态机（START/PLAYING/PAUSED/WIN/LOSE）
│   │   ├── GameLoop.js     ← 主循环（固定60fps + 钩子系统）
│   │   └── EventBus/       ← 事件总线
│   │       ├── EventBus.js  ← 发布-订阅机制（on/emit/off）
│   │       └── EventTypes.js← 事件名常量（统一管理）
│   ├── Entity/             ← 实体类
│   │   ├── Entity.js       ← 基类（x, y, w, h, speed, type, update, render, getBounds）
│   │   ├── EntityType.js   ← 实体类型枚举（PLAYER/ENEMY/BULLET）
│   │   ├── Scene.js        ← 场景容器（实体增删、遍历更新/渲染）
│   │   └── pojo/
│   │       ├── Box.js      ← 测试方块（type=ENEMY，自动右移）
│   │       └── player.js   ← 玩家方块（type=PLAYER，键盘操控）
│   ├── Input/
│   │   └── Input.js        ← 键盘输入（isAction / isJustPressed / KEY_MAP）
│   ├── Utils/
│   │   └── Collision.js    ← 碰撞工具（AABB检测 + 碰撞规则 + checkCollisions）
│   └── system/
│       ├── HookLabel.js    ← Hook 标签常量（统一管理）
│       └── systemPojo/
│           ├── PauseSystem.js  ← 暂停系统（P 键切换 + 碰撞测试）
│           └── CollisionSystem.js ← 碰撞系统（每帧检测所有实体对）
├── Data/                   ← 数据配置
├── UI/                     ← 样式与 UI 组件
├── assets/                 ← 图片/音效
├── docs/                   ← 文档
└── db/                     ← 数据库 schema
```

## 引擎架构

### 状态机（State Machine）

管理游戏全局状态，5 种状态：`START` / `PLAYING` / `PAUSED` / `WIN` / `LOSE`。

- `transition(newState)` — 唯一状态切换入口，不允许直接修改 `currentState`
- `onEnter(state, label, fn)` — 进入某状态时触发（用于初始化）
- `onExit(state, label, fn)` — 离开某状态时触发（用于清理）
- `onUpdate(state, label, fn)` — 在某状态下每帧触发（用于持续逻辑）

### 游戏主循环（GameLoop）

浏览器 `requestAnimationFrame` 驱动，**固定时间步长**（锁 60fps，约 16.67ms/帧）。

- **accumulator 模式** — 累计时间差，追赶掉帧，保证逻辑确定性
- **200ms cap** — 防止切后台后时间爆炸
- **update / render 分离** — update 可能追赶多次，render 每帧只画一次
- `setWorld(w)` — 设置当前世界，render 自动调用 `world.render(ctx)`
- `init(canvas)` — 注入画布，引擎自管清屏与渲染

### 事件总线（EventBus）

发布-订阅模式，模块间解耦通信。各模块只依赖 EventBus，不互相 import，避免循环依赖。

- `on(event, fn)` — 注册监听
- `emit(event, data)` — 触发事件
- `off(event, fn)` — 移除监听

### Entity / Scene

- **Entity** — 所有游戏对象的基类，提供 `x`/`y` 坐标、`update(dt)` 逻辑更新、`render(ctx)` 绘制
- **Scene** — 实体容器，管理 `entities[]` 增删，每帧遍历调用所有实体的 update/render。构造时自动注册到 `PLAYING` 状态的 onUpdate

### 键盘输入（Input）

全局键盘状态管理。

- `keyState` — 实时按键状态 Map
- `KEY_MAP` — 物理键码到动作名的映射（支持方向键 + WASD）
- `isAction(action)` — 持续检测，按住期间一直返回 true（适合移动）
- `isJustPressed(action)` — 防抖检测，只在按下的第一帧返回 true（适合暂停、开火）

### 实体类型（EntityType）

实体的类型标签，配合碰撞规则使用。

- `EntityType.PLAYER` — 玩家
- `EntityType.ENEMY` — 敌人
- `EntityType.BULLET` — 子弹
- `setEntityType(key, type)` — 动态注册新类型

### 碰撞系统（Collision + CollisionSystem）

规则驱动 + AABB 矩形检测 + EventBus 通信。

- **碰撞规则** — `collisionRules` Map，定义哪些类型之间会碰撞（如 PLAYER ↔ ENEMY）
- **AABB 检测** — `checkCollisionABB(a, b)` 矩形重叠判断
- **`checkCollisions(entities)`** — 双层循环遍历所有实体对，查规则 + 做 AABB，命中则 `emit(COLLISION)`
- **CollisionSystem** — 注册 `onUpdate(PLAYING)`，每帧自动调用 `checkCollisions`

### 钩子标签（HookLabel）

`onEnter`/`onExit`/`onUpdate` 的 label 参数统一管理，放在 `Service/system/HookLabel.js`。

### 暂停系统（PauseSystem）

监听 P 键，使用 `isJustPressed` 防抖，在 `PLAYING` ↔ `PAUSED` 之间切换。

## 运行方式

使用 Live Server 打开 `index.html`（ES Module 需要 HTTP 协议，不能直接 `file://` 打开）。

## 开发进度

- [x] 状态机 + GameLoop（固定时间步长 + 钩子系统）
- [x] Entity 基类 + Scene 容器
- [x] 键盘输入（isAction 持续检测 / isJustPressed 防抖）
- [x] 事件总线 EventBus + EventTypes
- [x] 暂停系统（P 键切换）
- [x] 碰撞检测系统（AABB + 碰撞规则 + CollisionSystem）
- [x] 实体类型 + 钩子标签常量管理
- [ ] 子弹实体（空格发射 + 碰撞后清除）
- [ ] 植物/僵尸实体
- [ ] 资源管理器

## 团队成员

| 角色 | 负责 |
|------|------|
| 组长 | 项目架构 + 核心引擎 |
| 成员 2 | HTML + UI |
| 成员 3 | CSS + 动画 |
| 成员 4 | 战斗逻辑 + 波次 |
| 成员 5 | 经济系统 + 存档 |
