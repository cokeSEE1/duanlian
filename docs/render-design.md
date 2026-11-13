# 渲染模块升级设计（A 路 · src/render/）

本文件记录在 `src/render/render.js` 上实现的 **TAA（时序抗锯齿）+ 后期裁剪（减少全屏 pass 的无效采样）+ PMREM 烘焙降频** 的设计、代码锚点、改动清单、契约需求与验证步骤。实现遵循「不改 `src/shared/`、不在压缩代码上做大手术」的约束，全部改动集中在 `jy()`（后期链工厂）与 `Hg()`（渲染模块 create）两个已 prettify 的函数内，以及 `K()`（室内探针烘焙）内的节流逻辑。

---

## 1. 背景与约束

- `src/render/render.js` 已 prettify，但变量名仍是压缩单字母（`qy`/`Gy`/`H6`/`Vy`/`jy`/`Hg`）。它只是 esbuild IIFE 的一段，IIFE 开口在 `src/lib/three.js`，文件末尾**没有** `})();`（`})();` 在 `src/ai/ai.js` 尾部），因此可独立语法校验：
  ```bash
  node --check src/render/render.js
  ```
- 后期链是**手写非 EffectComposer** 链路：`depthcopy → depthhalf → SSAO → volumetric → composite → motion blur → bloom(down/up) → streak → adapt → grade → final(FXAA/grain/sharpen)`。
- 动态分辨率：渲染目标 `M.w×M.h` 可能小于画布 `i.domElement.width/height`，因此「后期裁剪」的主战场在 M 分辨率（渲染分辨率）与画布分辨率不一致时的最终 pass 重采样。
- 模块只通过 `src/shared/` 契约与外部通信；本实现**不新增/不修改任何 `src/shared/` 文件**。需要契约层配合的项全部列在第 6 节，由主 session 单独出契约 PR。

---

## 2. 代码锚点

| 符号 | 位置 | 含义 |
|---|---|---|
| `jy(i, e, {noiseTex:t})` | 约 L13606 | 后期链工厂：`i`=renderer，`e`=上下文（`.params/.quality/.level`），`t`=噪声纹理。返回 `y`（所有 RT）、材质与 `me()/Y()`（resize/dispose）等 |
| `g` | `jy` 顶部调参对象 | 后期调参：`bloom/grain/sharpen/motionBlur/…`（新增 `taaFeedback`） |
| `Js` | `jy` 顶部 | 全屏 pass 顶点着色器字符串（提供 `vUv`） |
| `a(i,e,t)` | `jy` 内部 | 生成全屏 pass 材质的辅助（`t` 为 uniform 表） |
| `p(c,h)` | `jy` 内部 | 生成 `WebGLRenderTarget`（`c`=options，`h`=采样数） |
| `l(i,e,t)` | `jy` 内部 | 用材质 `i` 往目标 `e` 绘制全屏三角（`t` 为深度纹理可选项） |
| `iA` | `jy` 内 | `final`（FXAA/grain/sharpen）材质对应的 uniform 表 |
| `K` | `jy` 内 | `final` 材质实例（`K = a("final", iA, {...})`） |
| `X` | `jy` 内 | 相机矩阵临时 `Matrix4`（TAA 复用其 `.copy().invert()` 求 `uInvViewProj`） |
| `F` | `jy` 内 | 上一帧 view-projection 矩阵（运动模糊/TAA 共用） |
| `ie` | `jy` 内 | 当前帧 view-projection 矩阵（`ie.multiplyMatrices(fe.projectionMatrix, fe.matrixWorldInverse)`） |
| `$` / `R` | `jy` 内 | `$`=首帧标志（false 直到完成首帧）、`R`=帧计数 |
| `ve` | `jy` 内 | 当前画质档对象（`.name === "test"/"low"/…`、`.motionBlur`） |
| `Ne` / `dt` | `jy` 内 | SSAO 启用标志 / volumetric 启用标志 |
| `U` / `u` / `h` | `jy` 内 | scene RT 链相关（composite 输出等） |
| `oe` / `fe` | `jy` 内 | M 分辨率场景 RT / M 分辨率深度纹理 |
| `M` | `jy` 内 | 渲染分辨率对象（`.w/.h`，动态缩放） |
| `Fe` | `jy` 内 | 主深度纹理（供 TAA 读 `tDepth`） |
| `Hg(i)` | 约 L14251 | 渲染模块 create：`e = i.params || {}`（URL 参数），`A`=渲染器封装，`a/l`=主相机/武器相机，`D/T`=时间/帧相关 |
| `j(ie)` | `Hg` 内 | 合成前绘制入口（`n.clear(!0,!0,!1)` 后立即加 TAA jitter 应用） |
| `A.run(...)` | `Hg` 内 | 主绘制入口，末尾以 statement 形式收尾 + `taaClearJitter()` |
| `n` | `Hg` 内 | `WebGLRenderer` |
| `K()` | `Hg` 内，暴露为 `N.captureInteriorProbe` | 室内反射探针烘焙（`CubeCamera` `z0`），新增位置键 + 500ms 冷却节流 |
| `Q` | `Hg` 内 | 探针缓存对象（`bake`/`…`，新增 `bakeKey/bakeAt`） |
| `Vy(i)` | 约 L13062 | 天空 + PMREM 烘焙（`fromScene`/`fromCubemap`，**仅初始化时烘焙一次，无周期性重烘焙**） |

**现有后期链与运动模糊（升级前底座）**：
- `ie.multiplyMatrices(fe.projectionMatrix, fe.matrixWorldInverse)` 每帧计算当前 VP；`F` 保存上一帧 VP（运动模糊重投影用）。
- 运动模糊 pass 已把 `be.tColor.value` 指向当前 HDR 颜色源（本次 TAA 插在它之前，故 TAA 输出成为运动模糊的新输入源）。

---

## 3. 三项改动设计

### 3.1 TAA（时序抗锯齿）

复用运动模糊已有的重投影向量（`ie`/`F`），在 composite 之后、motion blur 之前插入一个 TAA pass，对 HDR 颜色做历史混合。

- **子像素抖动（jitter）**：Halton(2,3) 序列对主相机 `a.projectionMatrix` 与武器相机 `l.projectionMatrix` 的 `elements[8]/elements[9]` 做 `±0.5 texel` 抖动（`taaApplyJitter()`），每帧累积位移（`taaJx/taaJy`），绘制后 `taaClearJitter()` 还原，保证投影矩阵在帧末回到无抖动状态（不影响其他用 `projectionMatrix` 的 pass）。
- **重投影**：fragment 内用 `uInvViewProj`（`X.copy(ie).invert()`）把当前像素反投影到世界坐标，再用 `uPrevViewProj`（`F`）投影回上一帧 UV `puv`。
- **历史钳制（AABB clamp）**：对当前帧 `tColor` 做 3×3 邻域 min/max，历史颜色 clamp 到该 AABB，抑制鬼影。
- **保护像素跳过**：`tDepth < 0.05`（武器/近处，view camera 用 `depthRange(0, 0.05)` 分离）与 `tDepth >= 0.9999`（天空，clear depth=1.0）直接输出当前帧，避免武器/天空重投影错位。
- **反馈混合**：ping-pong 历史 `y.taa[0]/y.taa[1]`，`uFeedback` 首帧为 0（`taaN === 0`），之后取 `g.taaFeedback`（0.12）。
- **开关**：`ve.name` 非 `test`/`low`、URL 未显式 `?taa=0`、且非首帧（`$ && R > 0`）才启用。

**实现锚点**：`jy` 内新增 `taaFrag`/`blitFrag` shader 字符串、`y.taa` ping-pong RT、`taaM`/`blitM` 材质、`taaN/ta` 状态；composite/motion 块替换为「选源 `xe` → TAA → 更新 motion 的 `be.tColor.value = xe`」；`Hg` 内新增 `taaHalton/taaApplyJitter/taaClearJitter` 与 `taaJx/taaJy/taaJActive`，在 `j(ie)` 的 `n.clear()` 后应用 jitter、在 `A.run` 末尾/异常路径清除。

### 3.2 后期裁剪（减少全屏 pass 无效采样）

两处裁剪：

1. **composite pass 短路**：当 SSAO 与 volumetric 都关闭（`Ne` 与 `dt` 均为假）时，跳过 composite 全屏 pass，直接以 scene RT `oe.texture` 作为 TAA/运动模糊的输入 `xe`。原逻辑无论如何都会过一次 composite 材质（即便只是直通采样）。
2. **final pass 降采样重采样消除**：`final`（FXAA/grain/sharpen）原本在画布分辨率下采样 M 分辨率结果（当 `M.w/h < 画布` 时产生一次非等比例放大 + FXAA 在错误分辨率上失效）。现在改为：M 分辨率与画布分辨率一致时直接 `l(K, null)`（写默认帧缓冲）；不一致时先 `l(K, y.final)` 在 M 分辨率完成 FXAA/grain/sharpen，再用 `blitM`（双线性）单 pass 放大到画布。

**实现锚点**：`jy` 内 composite/motion 块改写（`let xe; if (Ne || dt) { l(U, y.scene); xe = y.scene.texture; } else xe = oe.texture;`）；final 调用改写（`if (M.w === i.domElement.width && M.h === i.domElement.height) l(K, null); else { l(K, y.final); blitM.uniforms.tSrc.value = y.final.texture; l(blitM, null); }`）；`me()` resize 与 `Y()` dispose 增加 `y.final`。

### 3.3 PMREM 烘焙降频

调研结论：`src/render/render.js` **不存在周期性 PMREM 重烘焙**——天空 `Vy` 仅在初始化时 `fromScene` 一次；室内探针 `K()`（`captureInteriorProbe`）仅在关卡就绪时按需烘焙；three.js 的 `WebGLCubeUVMaps` 缓存已烘焙纹理。周期性卡顿来源最可能是 `K()` 被外部（world 层）反复调用。因此「降频」落地为 `K()` 的**位置键 + 500ms 冷却节流**：

- 计算探针位置键 `bk = X.toFixed(2) + "|" + re.toFixed(2) + "|" + ne.toFixed(2)`（位置坐标取 2 位小数）。
- 若 `Q.bakeKey === bk`（同位置已烘焙）或距上次烘焙不足 500ms（`Q.bakeAt && tm - Q.bakeAt < 500`），直接 `return` 跳过烘焙。
- 否则更新 `Q.bakeKey/bakeAt` 并继续原有烘焙。

**实现锚点**：`Hg` 内 `Q` 对象增加 `bakeKey:""/bakeAt:0`；`K()` 在探针位置计算完成后、烘焙开始前插入上述节流。

---

## 4. 改动点清单（`src/render/render.js`，均已实现）

1. `g`（后期调参）追加 `taaFeedback: 0.12`。
2. `jy` 内 `let y = {` 之前新增 `taaFrag`（TAA 重投影 + AABB clamp + 保护像素跳过）与 `blitFrag`（双线性直通）两个 shader 字符串。
3. `y` 对象增加 `taa: [p(c, h), p(c, h)]`（ping-pong 历史）与 `final: p(u, h)`（M 分辨率 final）。
4. `K = a("final", iA, {...})` 之后新增 `taaM`（uniform：`tColor/tHistory/tDepth/uInvViewProj/uPrevViewProj/uRes/uFeedback`）与 `blitM`（`tSrc`）；状态变量增加 `taaN = 0, ta = 0`。
5. `me()`（resize）增加 `y.taa[0]/y.taa[1]/y.final` 的 `setSize`。
6. `Y()`（dispose）增加 `...y.taa, y.final` 的释放。
7. composite/motion 块改写：`Ne || dt` 时才跑 composite，否则 `xe = oe.texture`；`ie.multiplyMatrices` 后，满足「非 test/low + `?taa` 未关 + 非首帧」时跑 TAA（`taaM` 绑定当前色源/历史/深度/`uInvViewProj`/`uPrevViewProj`/`uRes`/`uFeedback`，输出到 `y.taa[1-ta]`，翻转 `ta`，`taaN++`）；随后 motion blur 的 `be.tColor.value = xe`。
8. final 调用改写：M 分辨率 === 画布分辨率时 `l(K, null)`；否则 `l(K, y.final)` + `blitM` 放大到画布。
9. `Hg` 内 `D = 0,` 之后新增 `taaJx = 0, taaJy = 0, taaJActive = !1` 与 `taaHalton(base,index)/taaApplyJitter()/taaClearJitter()`。
10. `j(ie)` 内 `n.clear(!0,!0,!1)` 之后新增：`taaClearJitter()` +（非 test/low 且 `e.taa !== "0"`）`taaApplyJitter()`。
11. `A.run(...)` 末尾改为 statement 形式收尾，并加 `taaClearJitter(); n.setRenderTarget(null); if (o.post) throw …`。
12. `frame` 的 catch 分支加 `taaClearJitter()`（异常时还原投影矩阵）。
13. `Q` 对象增加 `bakeKey:""/bakeAt:0`；`K()` 在探针位置计算后插入位置键 + 500ms 冷却节流。

---

## 5. 需要的 `src/shared/` 契约变更（接口变更，本实现未动）

以下若要把 TAA/后期裁剪「转正」为可配置接口，需要单独契约 PR（本实现用 URL 参数 `?taa=0` 与画质档 `ve.name` 门控，不新增契约字段，因此可独立合并）：

1. **`contracts.js` `RenderContext.post`**：建议增加 `taa`（布尔/反馈强度）字段，替代当前「读 URL 参数 + 画质档名硬编码 test/low」的开关方式，让 game/platform 层可运行时切换 TAA。
2. **`contracts.js` `RenderContext.resolution`**：已有 `{width,height,scale}`，本次直接读内部 `M.w/M.h` 与 `i.domElement.width/height`，未要求新字段；但若希望外部感知「final 是否走降采样 + blit」的分支，可在 `resolution` 增加 `canvasWidth/canvasHeight` 或 `downscaled` 布尔。
3. **（可选）`schema.js` `QualityTier`**：若要让 low/medium 档显式声明 TAA 开关（而非 `ve.name !== "test"/"low"` 硬编码），可在质量档对象增加 `taa: boolean` 字段。
4. **（可选）`contracts.js` `RenderContext.captureInteriorProbe`**：其 JSDoc 已存在，节流为内部实现，不改变签名；无需契约变更。

---

## 6. 验证步骤

1. **语法**：
   ```bash
   node --check src/render/render.js   # 应输出 SYNTAX OK（文件无尾随 })();，可独立校验）
   ```
2. **构建/回归（主 session 统一跑，本 agent 不跑）**：`npm run check`、`npm test`、`node scripts/visual.mjs`、`node scripts/bench.mjs`。
3. **手动**：开根目录 `index.html`（或 `python3 -m http.server 8080`）：
   - 默认画质下缓慢转视角，观察边缘是否无闪烁、运动后是否有明显鬼影（TAA）；
   - `?q=low` 或 `?q=test` 下确认 TAA 被跳过、画面无重投影伪影；
   - `?taa=0` 下确认 TAA 被显式关闭；
   - 窗口缩小/动态分辨率触发时确认画面仍清晰（final 在 M 分辨率 + blit 放大）；
   - 反复进出室内区域确认室内探针烘焙不再频繁触发（`K()` 节流）。
4. **等价性**：`?shot=1` 固定种子截图应与改动前在「无 TAA（test/low 档）+ 无动态分辨率」条件下保持一致——TAA 默认关闭、composite 短路仅在 SSAO/volumetric 全关时发生（行为等价于原直通采样）、`K()` 同位置/短时间不重复烘焙。

---

## 7. 未完成 / 已知限制

- **TAA 未与 `?shot=1` 确定性截图完全对齐**：TAA 依赖历史帧与 Halton jitter 随帧序变化，固定 seed 下若开启 TAA，截图会随帧序不同；因此截图回归应在 `?q=test/low`（TAA 关闭）下进行，或后续把 jitter 序列纳入 seed 确定化。
- **历史缓冲在画质切换/resize 后不重置**：`taaN` 只增不减，画质切换或分辨率突变后首帧仍沿用旧历史，可能出现一帧重投影错位；后续可在 `setQuality`/resize 路径重置 `taaN=0`。
- **TAA 保护像素阈值依赖深度约定**：`0.05`（武器分离）与 `0.9999`（天空）是引擎现有约定（view camera `depthRange(0,0.05)`、天空 clear depth=1.0）；若后续改武器近裁或天空深度，需同步这两处常量（已内联为 `n1`/`0.9999`）。
- **PMREM 节流只覆盖 `K()`**：天空 `Vy` 与 three.js 的 cube UV 缓存本身无周期性重烘焙，本次未动；若后续发现其他路径触发周期性 PMREM（如 `fromCubemap` 重烘焙），需另行定位节流。
- **blit 放大为双线性**：final 从 M 分辨率放大到画布时损失 FXAA 已产生的锐化细节边缘；若需更高质量可改用双三次或保留 FXAA 在画布分辨率、仅把 grain/sharpen 降到 M（当前实现以「消除无效重采样」优先）。
