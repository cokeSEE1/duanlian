# CLAUDE.md

「断链·3A大作」—— 单文件 WebGL 第一人称射击游戏（玄鲸港区，切断 3 处中继后撤离）。桌面键鼠 + 手柄 + 移动端横屏。构建产物保持单文件、零外部资源。

## 铁律（违反会破坏构建/等价性）

- **根目录 `index.html` 是构建产物**，唯一运行/部署入口，禁止直接编辑；源码在 `src/`，改完 `npm run build` 重新生成。
- `src/lib/three.js` 与 `src/game/engine.js` 是**同一个 esbuild IIFE 闭包的两段**，构建时合并进同一个 `<script>`，单独引用会丢作用域。
- 这两文件目前是**压缩（minified）代码**，功能改动一律走 `docs/MIGRATION.md` 的 carve 流程，禁止直接在大块压缩代码上做手术。
- 有意改这两文件必须在同一次提交更新 `scripts/pins.json`（`npm run build` 会报 drift 拦截）。
- 模块之间只通过 `src/shared/` 契约通信；**改契约 = 接口变更**，单独出 PR 并在 `docs/MIGRATION.md` 登记版本。

## 结构

```
index.html              构建产物（单文件，唯一运行/部署入口）
src/
  index.template.html   构建输入（含页面骨架，禁止直接打开）
  lib/three.js          three.js r180（与 engine 同属一个 IIFE，压缩）
  game/engine.js        自写引擎（渲染/世界/玩法/AI/音频/UI，压缩）
  platform/             adep 接入层 + 移动端辅助（已拆出 ✅）
  shared/               契约 v2（events/schema/contracts，见下）
  render/ world/ ai/ audio/ ui/ game/   待 carve 的空目录（README 描述职责与锚点）
scripts/
  build.mjs             构建：template + src → index.html（逐字节等价校验）
  test.mjs              契约/事件总线单元测试
  visual.mjs            固定机位截图回归（P1，依赖 ?shot/?cam 钩子）
  pins.json             逐文件 sha256 指纹（防误改 verbatim 区段）
docs/MIGRATION.md       拆分路线、模块所有权、多 agent 并行分工
```

## 命令

```bash
npm run build    # 重写根目录 index.html
npm run check    # 只校验：pins 未漂移 + index.html 与 src 同步（CI 同款）
npm test         # 契约单测 + check
node scripts/visual.mjs            # 截图回归（对比基线）
node scripts/visual.mjs --update   # 重新生成截图基线
# 运行：直接开根目录 index.html，或 python3 -m http.server 8080
```

## 契约 v2（`src/shared/`，已对齐引擎实际，勿回退到 v1 语义）

- `events.js`：EventBus + `Topics` 表，对齐引擎真实冒号 topic（32 个 emit，如 `enemy:spawn`/`weapon:fire`/`objective:progress`/`player:hit`）。`ENTITY_DAMAGE`/`ENTITY_KILLED` 是 test.mjs 依赖的兼容别名。
- `schema.js`：`EntityKind = hound|gull|relay|prop`（引擎真实敌人只有 hound 机械猎犬 + gull 机械飞鸥；turret/guard/drone 是骨骼/道具/音频名，非敌人）。`ObjectiveRecord.state = live|cutting|cut`。
- `contracts.js`：模块生命周期 `create/update/dispose`；`GameContext` 含注入服务 `physics/nav/combat/level/player/rng`（AI 每帧同步调用，不走事件）；`RenderContext` 含 viewCamera/post/exposure 等公开面。

## 拆分路线（详见 docs/MIGRATION.md）

carve 顺序：prettify → platform(✅) → render → world → game → ai → audio/ui。一人一分支一 MR，只改自己目录，合并门槛 = `npm test` 通过 + 截图回归不超阈值 + 帧时间基准不退化。

当前进度：**P0 契约对齐 ✅（已提交）** → **P1 验收基础设施 ✅（已提交）**：截图回归（`scripts/visual.mjs`）+ 帧时间基准（`scripts/bench.mjs`）均跑通，headless SwiftShader 下确定性 diff=0 → P2 模块并行 → P3 依赖化瘦身。

## 调试钩子（引擎内置，写回归/基准必用）

URL 参数：`?seed=`（默认 4207）`?shot=1`（确定性截图，自动 skipIntro 进入 gameplay）`?bench=1`（飞越基准，等价 hash `#bench`）`?cam=x,y,z,lx,ly,lz`（固定相机）`?dt=`（固定时间步）`?q=`（画质档 test/low/medium/high/ultra）`?autostart=1` `?fov=` `?exposure=`。⚠️ `shot`/`bench`/`autostart` 是布尔开关，必须带 `=1`（空值 `?shot` 会被 `!!` 判假、不生效）。
全局：`window.__G`（THREE/params/events/rng/time/quality/renderer/scene/camera）、`window.__ready`、`window.__stats()`、`window.__setShot()`。

⚠️ 已知：headless 截图走 SwiftShader 软渲染，帧时间只能当相对退化闸门；引擎内约 36 处未播种 `Math.random` 是截图确定性的隐患（固定 seed 前先处理）。
