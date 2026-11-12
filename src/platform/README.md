# platform/ — 平台接入（已拆出 ✅）

- `adep.js`：adep 模板接入层（消费 `window.__ADEP_ENV__`，观察 `.menu[data-screen]`，完成计数 `/api/count`）——已独立成文件，与引擎零耦合。
- `mobile.js`：移动端 UA/全屏/横屏引导辅助——已独立成文件。

后续：PWA Service Worker（manifest 已有）、手柄震动反馈、WebGPU 实验分支。