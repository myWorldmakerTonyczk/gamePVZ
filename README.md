# Plants vs Zombies - Web Edition

> 基于 HTML5 Canvas + JavaScript 的植物大战僵尸网页游戏
> 5 人课程大作业项目

## 技术栈

- **HTML5 Canvas** — 游戏场景渲染
- **CSS3** — UI 样式与动画
- **JavaScript (ES6+)** — 游戏核心逻辑
- **SQL.js** — 浏览器端 SQLite 存档

## 运行方式

```bash
# Live Server 打开 index.html（ES Module 需要 HTTP，不能 file://）
```

## 项目结构

```
├── index.html              ← 游戏入口（Canvas + importmap）
├── main.js                 ← 组装入口（import 系统 + 关卡 + 启动引擎）
├── jsconfig.json           ← VS Code 路径别名（Ctrl+点击跳转）
├── level/                  ← 关卡配置
│   └── level1.js           ← 第1关（创建实体 + 注入 Scene）
├── Service/
│   ├── core/               ← 引擎核心
│   │   ├── State Machine.js ← 状态机（START/PLAYING/PAUSED/WIN/LOSE）
│   │   ├── GameLoop.js     ← 主循环（固定60fps + 钩子系统）
│   │   └── EventBus/       ← 事件总线
│   │       ├── EventBus.js  ← 发布-订阅机制（on/emit/off）
│   │       └── EventTypes.js← 事件名常量
│   ├── Entity/             ← 实体层（游戏对象）
│   │   ├── Entity.js       ← 基类（x,y,w,h,hp,maxHp,speed,type）
│   │   ├── EntityType.js   ← 实体类型枚举（PLAYER/ENEMY/BULLET）
│   │   ├── Scene.js        ← 场景容器 + overlay 渲染
│   │   └── pojo/
│   │       ├── Box.js      ← 敌人方块（自动右移，100hp）
│   │       ├── player.js   ← 玩家方块（WASD 移动）
│   │       └── Bullet.js   ← 子弹（角度飞行 + shoot 方法）
│   ├── OverLay/            ← 贴片系统（血条/伤害数字等）
│   │   ├── Overlay.js      ← 基类（跟随实体/生命周期）
│   │   ├── OverlayManager.js ← 容器（add/update/render/remove）
│   │   └── pojo/
│   │       └── HealthBar.js ← 血条（自动跟随 + 绿→黄→红变色）
│   ├── Input/              ← 输入系统
│   │   ├── Input.js        ← 键盘（isAction / isJustPressed）
│   │   └── Mouse.js        ← 鼠标（isMouseAction / isJustClicked / getMousePos）
│   ├── Utils/
│   │   └── Collision.js    ← 碰撞工具（AABB + 碰撞规则 + checkCollisions）
│   └── system/             ← 系统层（游戏逻辑）
│       ├── HookLabel.js    ← Hook 标签常量
│       ├── index.js        ← 统一入口
│       └── systemPojo/
│           ├── PauseSystem.js  ← 暂停系统
│           ├── CollisionSystem.js ← 碰撞系统（检测 + 扣血 + 清除）
│           ├── CollisionTest.js  ← 碰撞测试（碰撞→暂停）
│           ├── PlayerSystem.js   ← 玩家系统（射击方向 + 发射）
│           ├── BulletSpawner.js  ← 子弹生成器（监听 PLAYER_SHOOT）
│           └── OverlaySystem.js  ← Overlay 驱动
├── Data/                   ← 数据配置
├── UI/                     ← 样式与 UI 组件
├── assets/                 ← 图片/音效
├── docs/                   ← 文档
└── db/                     ← 数据库 schema
```

## 路径别名（importmap）

所有 import 使用 `@` 前缀别名，无论文件在哪层，路径始终一致：

```js
import { onUpdate } from '@core/GameLoop.js';
import { scene }     from '@entity/Scene.js';
import { isJustPressed } from '@input/Input.js';
import { checkCollisions } from '@utils/Collision.js';
import { overlayManager }  from '@overlay/OverlayManager.js';
import { HookLabel } from '@system/HookLabel.js';
```

## 引擎架构

### 状态机（State Machine）

- `transition(newState)` — 唯一状态切换入口
- `onEnter(state, label, fn)` — 进入某状态时触发
- `onExit(state, label, fn)` — 离开某状态时触发
- `onUpdate(state, label, fn)` — 某状态下每帧触发

### 游戏主循环（GameLoop）

固定时间步长 60fps，accumulator 模式防掉帧，update / render 分离。
`setWorld(w)` 注入世界对象，render 调用 `world.render(ctx)`。

### 事件总线（EventBus）

- `COLLISION` — 碰撞事件，CollisionSystem emit，各模块 on
- `PLAYER_SHOOT` — 射击事件，PlayerSystem emit，BulletSpawner on

### Entity / Scene / Overlay

- **Entity** — 游戏对象基类，`update(dt)` / `render(ctx)` / `getBounds()`
- **Scene** — 实体容器，遍历更新/渲染，末尾调用 `overlayManager.render(ctx)`
- **Overlay** — 贴片基类，可跟随实体（`target`）或独立定位，支持生命周期（`duration`）
- **OverlayManager** — 贴片容器，自动清理过期 overlay

### 输入系统

| 键盘 | 鼠标 | 用途 |
|------|------|------|
| `isAction('left')` | `isMouseAction(MouseMap.LEFT)` | 按住持续 |
| `isJustPressed('pause')` | `isJustClicked(MouseMap.LEFT)` | 单次触发 |
| — | `getMousePos(canvas)` | 返回 Canvas 坐标 |

### 碰撞系统

双层循环检测所有实体对 → `canCollide` 查规则 → AABB 矩形检测 → emit COLLISION → 监听方扣血/清除。

## 数据流

```
main.js → import level1.js  → 实体注入 Scene
        → import system/    → 系统注册 hooks
        → transition + start → GameLoop 启动
        ↓
每帧 tick:
  update(dt) → hooks.onUpdate → Scene/PlayerSystem/CollisionSystem...
  render()   → world.render(ctx) → Scene.render → entities + overlayManager
```

## 开发进度

- [x] 状态机 + GameLoop（固定时间步长 + 钩子系统）
- [x] Entity 基类 + Scene 容器
- [x] 键盘输入 + 鼠标输入
- [x] 事件总线 EventBus + EventTypes
- [x] 暂停系统
- [x] 碰撞检测系统（AABB + 规则 + 扣血）
- [x] 子弹实体（角度飞行 + 碰撞清除）
- [x] Overlay 贴片系统（血条跟随 + 生命周期）
- [x] importmap 路径别名 + jsconfig.json
- [x] 关卡分层（level/*.js）
- [ ] 资源管理器（图片/音效加载）
- [ ] 植物/僵尸实体
- [ ] START/WIN/LOSE 界面

## 团队成员

| 角色 | 负责 |
|------|------|
| 组长 | 项目架构 + 核心引擎 |
| 成员 2 | HTML + UI |
| 成员 3 | CSS + 动画 |
| 成员 4 | 战斗逻辑 + 波次 |
| 成员 5 | 经济系统 + 存档 |
