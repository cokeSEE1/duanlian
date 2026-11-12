# render/ — 渲染管线（待 carve）

职责：渲染器初始化、阴影、天空与环境、平面反射、后期链。唯一投影光源是太阳，其余光走 emissive/点光池。

将迁入（bundle 内锚点，行号对应根目录 index.html 的 main@73623b28 版本）：

- `Hg` 渲染器初始化：HDR half-float 目标、`NoToneMapping`、sRGB 输出、shadowMap 手动触发（约 L4753）
- `Gy` 阴影相机按关卡包围盒拟合 + `qy` 自写 PCSS（Vogel blocker 搜索 + 斜率 bias，约 L4305）
- `H6` 全解析天空 shader（约 L4215）、`Vy` 用 PMREMGenerator 现场烘焙 environment
- 湿地平面反射（斜裁剪镜像相机）与海面（约 L5670 / L5737）
- 后期链：SSAO → 体积光 → 运动模糊 → bloom → 自适应曝光 → grade → final（10+ pass，非 EffectComposer）

消费：`src/shared/contracts.js` 的 RenderContext；对外发 `frame.stats`、`quality.change` 事件。