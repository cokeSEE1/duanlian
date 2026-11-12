# 断链 · 3A大作（duanlian）

单文件 WebGL 第一人称射击：玄鲸港区，切断 3 处中继后撤离。桌面键鼠 + 手柄 + 移动端横屏。

**根目录 `index.html` 是构建产物**（1.43 MB，零外部资源，可直接静态托管）；源码在 `src/`，改完跑构建重新生成。

## 结构

```
index.html                  构建产物（单文件，唯一运行/部署入口）
manifest.webmanifest
src/
  index.template.html       构建输入（含 src 引用的页面骨架，禁止直接打开）
  lib/three.js              three.js r180（原样内联段，与 engine 同属一个 IIFE）
  game/engine.js            自写引擎：渲染管线 / 世界 / 玩法 / AI / 音频 / UI
  platform/adep.js          adep 模板接入层（已独立）
  platform/mobile.js        移动端全屏/横屏辅助（已独立）
  shared/events.js          事件总线（冻结接口 v1）
  shared/schema.js          世界数据 schema（冻结接口 v1）
  shared/contracts.js       模块生命周期契约（冻结接口 v1）
  render/ world/ ai/ audio/ ui/ game/ platform/   模块归属与扩容计划（见各 README）
scripts/
  build.mjs                 构建：template + src → index.html（逐字节等价校验）
  test.mjs                  契约/事件总线单元测试
  extract.mjs               一次性拆分记录（main@73623b28，留档）
  pins.json                 逐文件 sha256 指纹（防误改进 verbatim 区段）
docs/MIGRATION.md           拆分路线、模块所有权、多 agent 并行分工
```

## 使用

```bash
# 运行：直接开根目录 index.html，或任意静态服务器
python3 -m http.server 8080   # 然后访问 http://localhost:8080/

# 改动前：编辑 src/ 下的文件（不要直接改 index.html）

# 构建 + 校验
npm run build     # 重写根目录 index.html
npm run check     # 只校验：pins 未漂移 + index.html 与 src 同步（CI 同款）
npm test          # 契约单测 + check
```

## 纪律

- `src/lib/three.js` 与 `src/game/engine.js` 是**同一个 IIFE 闭包的两段**：构建时合并进同一个 `<script>`，单独引用会丢作用域。它们目前是压缩代码，改动一律走 docs/MIGRATION.md 的 carve 流程。
- 有意修改上述文件必须在同一次提交更新 `scripts/pins.json`（`npm run build` 会报 drift）。
- 模块之间只通过 `src/shared/` 的契约通信；改契约 = 接口变更，单独 PR。

## CI

`.gitlab-ci.yml`：`node --test scripts/test.mjs && node scripts/build.mjs --check` —— 契约单测 + pins 指纹 + index.html 同步校验，任何一项失败即拦截合并。