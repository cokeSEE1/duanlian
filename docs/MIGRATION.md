# 拆分与并行开发路线（第 0 步产物）

基线：main@73623b28，单文件 index.html 1.43 MB，其中 three.js r180 约 379 KB、自写引擎约 1014 KB，两者同属一个 esbuild IIFE 闭包；adep 接入层与移动端辅助各为独立 script 块。

## 现状（本次已完成）

- 引擎按原字节拆为 `src/lib/three.js` + `src/game/engine.js`（构建时合并回同一 `<script>`），`src/platform/adep.js`、`src/platform/mobile.js` 独立。
- 根目录 `index.html` 保持原文件不变（= 构建产物），`npm run build` 从 template 重放后**逐字节一致**（sha256 07e3cbbc…），行为零变化。
- 冻结接口 v1 落地：`src/shared/events.js`（事件总线 + topic 表）、`schema.js`（WorldLayout/EntityRecord/ObjectiveRecord/QualityTier 字段）、`contracts.js`（create/update/dispose + RenderContext/GameContext）。
- 冻结接口 v2 对齐（2026-11-13）：v1 的 topic 名/实体枚举/接口与引擎实际失同步，已对齐——`events.js` Topics 改为引擎真实冒号 topic 全集（32 emit，订阅为其子集）；`schema.js` EntityKind 收紧为 `hound/gull/relay/prop`、ObjectiveRecord.state 改 `live/cutting/cut`、EntityRecord/QualityTier/WorldLayout 字段回填；`contracts.js` EntityKinds 改 4 值、GameContext 补注入服务（physics/nav/combat/level/player/rng）、RenderContext 补公开面。
- 冻结接口 v2.1（P2 四路契约补齐，2026-11-14）：对齐 A/B/D 三路真实实现——`events.js` 补 D 路武器三事件 `weapon:drop`/`weapon:pickup`/`weapon:switch`（emit 全集 32→35）；`schema.js` EntityRecord 补 `variant`（`standard|suppressor|elite|env`）+ 新增 `WeaponRecord` typedef；`contracts.js` GameContext 补 `weapon` 服务、RenderContext.post 标注 TAA（档名门控 + `?taa=0` 覆盖）。⚠️ 未超前登记：`enemy:shield`/`enemy:shieldBreak`（引擎未实际 emit）、`level.hazards`（引擎无此服务，hazard 仅是贴花材质名）、`QualityTier.taa`（TAA 非档位字段，由档名派生）。
- 冻结接口 v2.2（D 路第二波契约，2026-11-14）：为「加特林 + 火箭弹 + 关底 boss」预置跨模块接口——`events.js` 补 `boss:spawn`/`boss:phase`/`boss:killed`（emit 全集 35→38，ai 模块 emit）；`schema.js`/`contracts.js` EntityKind 扩 `sentinel`（重装四足机甲 boss）；`contracts.js` GameContext.combat 补 `spawnProjectile`（追踪弹道，玩家火箭弹与 boss 肩部导弹共用，命中走 `explode` AOE）。武器数值/字段（gatling/rocket 的 damage/rpm/radius/speed 等）留待实现后再对齐，不在本次契约预设。
- 回归防线：`scripts/pins.json` 逐文件 sha256 + CI `build --check`（pins 漂移 / index.html 失同步均失败）。

## carve 顺序（每步一个分支 + 一个 MR）

1. **prettify**：把 engine.js 全量 prettier（不动语义），之后文中「行号锚点」失效，一律改用符号名检索。这一步先把 `pins.json` 更新为格式化后指纹并人工核对 diff 仅格式变化。
2. **platform**（已完成）
3. **render**：PCSS/阴影拟合、天空+PMREM、平面反射、后期链（锚点：`qy`/`Gy`/`H6`/`Vy`）
4. **world**：场景生成、材质、室内探针
5. **game**：玩家/武器/目标流程（剩余主体）
6. **ai**：感知与状态机 → squad 协同
7. **audio** / **ui**

carve 纪律：每次只迁一个模块、构建仍单文件、除本模块外 `pins.json` 其他条目不得变化（CI 拦截）；玩法等价性靠固定机位截图回归 + 帧时间基准（待接 headless runner，见下）。

## 多 agent 并行分工

| Agent | 所有权 | 首批任务 |
|---|---|---|
| A | src/render/ | TAA（复用运动模糊重投影）、后期裁剪、PMREM 烘焙降频 |
| B | src/ai/ | squad 协同 + 三类新敌人（远程压制/护盾精英/环境联动） |
| C | src/world/ | 程序化布局 3 张图 + 垂直空间（集装箱堆顶/门架/室内仓库） |
| D | src/game/ | 2 把新武器（霰弹/精确步枪）+ 多阶段目标流程（潜入→断链→撤离） |

集成纪律：一人一分支一 MR，只改自己目录；每 2 天集成一轮；合并门槛 = `npm test` 通过 + 截图回归差异低于阈值 + 帧时间基准不退化。

## 待补的验收基础设施

- 固定机位截图回归（headless Chromium + 固定 seed/时间步），产物与基线图逐像素 diff。
- 各画质档帧时间基准（同样 headless，跑 60s 采样 median/p99），性能类改动必须附数字。
- 两者都依赖 CI runner 具备 headless 浏览器环境，当前先以 pins + 构建等价作为最小防线。

## 可选：依赖化与瘦身（非前置）

three.js 改为 npm 依赖 + tree-shaking，用 vite-plugin-singlefile 构建回单文件，预计首包 1.43 MB → 600–800 KB（gzip 200–300 KB）。在 carve 出 render/world 之后再动，避免压缩代码上做大手术。