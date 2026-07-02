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
├── index.html              ← 游戏入口
├── src/
│   ├── core/               ← 游戏引擎核心
│   │   ├── engine.js       ← 主循环
│   │   ├── stateMachine.js ← 状态机
│   │   └── world.js        ← 世界管理
│   ├── entities/           ← 游戏实体
│   ├── systems/            ← 功能系统
│   ├── config/             ← 数据配置
│   └── utils/              ← 工具函数
├── ui/                     ← 样式与 UI 组件
├── assets/                 ← 图片/音效
├── docs/                   ← 文档
└── db/                     ← 数据库 schema
```

## 运行方式

直接在浏览器中打开 `index.html`，或使用 Live Server。

## 团队成员

| 角色 | 负责 |
|------|------|
| 组长 | 项目架构 + 核心引擎 |
| 成员 2 | HTML + UI |
| 成员 3 | CSS + 动画 |
| 成员 4 | 战斗逻辑 + 波次 |
| 成员 5 | 经济系统 + 存档 |
