# 武器第一人称枪模（viewmodel）切换

> 修复：切换武器时 HUD 正确、但 3D 枪模始终是 PAC-9 的问题。只改 `src/game/game.js`。

## 1. 根因

`equipWeapon(slot)` 原先只调用 `applyStats(id)` 换数值 + 更新 `ve.*` HUD 字段，从不替换 `ve.root`/`ve.update` 指向的 mesh。PAC-9 的 viewmodel 是 `dm()` 闭包里构造的 `e`（THREE.Group），在 10315 附近被 `i.camera.add(e)` 挂到相机，之后切枪时从未摘除/替换。

## 2. 方案

保留 `dm()` 内 PAC-9 的构造完全不动（回归基线），引入「当前武器视件」对象 `ACT`，把逐帧动画/开火/换弹里对 PAC-9 专属零件（`e/h/d/f/q/x/z/le/…`）的访问改成通过 `ACT` 间接访问。三把枪各有一个 view 对象：

```js
ACT = {
  id, root, flash, bolt, boltTravel, mag,
  muzzle, eject, finger,
  reloadVisual(Pt, Je), reloadDone(), resetVisual(),
}
```

- `ve.root`、`ve.update`、`ve.setVisible`、`ve.muzzleWorld` 等仍挂在单一 `ve` 上（弹药/HUD/事件状态不拆散），但 `root`/`update` 内部改用 `ACT.root`/`ACT.*`。
- 切枪时 `setActiveView(id)`：把旧 root 从父节点（相机或调试 scene）摘掉，新 root 挂回同一父节点，并同步 `ve.root = ACT.root`、继承可见性。

### 关键锚点（改后行号）

| 内容 | 位置 |
|---|---|
| `ACT`/`vmVisible`/`VIEWS` 声明 | 10088 附近 |
| PAC-9 的 `ACT` 对象 + `cloneHand/box/cyl/mStd` + 两把新枪 builder + `setActiveView` | 10315-10482 |
| `ve.root: ACT.root`、`setVisible` 走 `vmVisible`+`ACT.root` | 10557-10564 |
| `_e()` 视觉复位改为 `ACT.resetVisual()` | 10618 |
| `resetLoadout` 切回 pac9 | 10648 |
| `equipWeapon` 切换 `setActiveView(id)` | 10666 |
| `Pe/Re` 用 `ACT.root`/`ACT.muzzle` | 10773-10779 |
| `Be()` 开火视觉用 `ACT.flash`/`ACT.eject`/`ACT.mag` | 10831-10859 |
| `Xe()` 逐帧用 `ACT.*` + `reloadVisual/reloadDone` 钩子 | 10864-11122 |

## 3. 三把枪的视觉差异

全部用 three.js 原生几何（BoxGeometry/CylinderGeometry/SphereGeometry）+ 现有 `N_()` 枪口焰 + 复用左右手 mesh（`cloneHand` 克隆 `A`/`q` 的手部几何，材质复用 `glove_fabric`）。零外部资源。

| 枪 | 视觉特征 |
|---|---|
| **PAC-9 冲锋枪**（基线，不变） | 原程序化枪身：枪机、弹匣、红点窗、拉机柄、刻字、左右手 IK。 |
| **玄鲸 M4 霰弹枪** | 短粗枪管（粗圆柱）+ 下方管状弹仓（细圆柱）+ 木质泵动护木（可动）+ 木质枪托/握把 + 顶部珠形准星。泵动护木在开火/换弹时沿 Z 前后滑动。 |
| **玄鲸 DMR 精确步枪** | 细长枪管（细长圆柱）+ 顶部瞄准镜（镜筒 + 两镜座 + 深色镜片）+ 长枪托 + 护木 + 弹匣 + 侧面拉机柄（开火/空仓时后拉）。 |

三把枪长度、轮廓、材质色（霰弹枪木质暖色 / 步枪冷灰长枪管 + 镜 / PAC-9 原配色）差异明显，一眼可辨。

## 4. 切枪切换逻辑

`equipWeapon(slot)`：`saveCurrent()` 存当前弹药池 → `loadoutState.current = slot` → `applyStats(id)` 换全局数值 → `setActiveView(id)` 换 mesh → `_e()` 复位共享运行态 + 新枪 `resetVisual()` → 从 `loadoutState.pool[id]` 载入弹药 → 更新 `ve.name/mode/pellets/…` → `emit("weapon:switch")`。

`setActiveView(id)`：取 `VIEWS[id]`，若与当前 `ACT` 相同则直接返回；否则记录旧 root 的父节点（相机或调试 scene），移除旧 root，`ACT = view`，`ve.root = ACT.root`，按 `vmVisible` 设置可见性，把新 root `add` 回同一父节点。输入路径（数字键 1/2 在 `Xe` 内、滚轮 `nextWeapon/prevWeapon` 在输入模块）最终都汇聚到 `equipWeapon`。

## 5. 动画复用与简化

- **idle 摆动 / 后坐力 / 换弹下压**：完全复用 `Xe` 里对 `ACT.root.position/rotation` 的弹簧与 bob/sway 计算，三把枪通用（枪模不死的关键）。
- **开火后坐**：复用 `Be()` 里 `k.kZ/kP/…` 弹簧 + root 位移。
- **PAC-9**：拉机柄、弹匣、刻字、双手 IK、换弹手部 timeline 全部保留（原闭包 `reloadVisual/reloadDone/resetVisual`）。
- **霰弹枪**：`reloadVisual` 让泵动护木随换弹进度前后滑一次；无拉机柄/弹匣动画。
- **精确步枪**：复用 `ACT.bolt`（拉机柄）+ `ACT.boltTravel=0.05` 的通用 bolt 公式，开火/空仓后拉；弹匣空仓时隐藏（`ACT.mag`）；换弹视觉主要靠 root 下压。

## 6. 遗留风险

1. **拾取替换当前槽的边角**：`pickupWeapon` 里「第 3 把替换备用槽」写死 `loadoutState.owned[1] = weaponId`。若玩家当前手持 slot 1 时拾取第 3 把，会替换当前槽且 `equipWeapon(1)` 因 `slot === current` 提前返回，导致 `ACT`/HUD 仍是旧枪而 `owned[1]` 已是新枪。此为该功能既有逻辑，非本次引入，未改（本次只修 viewmodel 切换）。
2. **新枪手部位置为估算值**：左右手克隆后按枪型给定近似 grip/fore-end 坐标，未经逐像素截图校准；不影响「一眼辨枪」，但持枪手型可能略偏移。
3. **新枪换弹 timing 复用 PAC-9 常量**：`me/ee/B/P/V`（0.47/1.345/2.02/2.14/2.19s）仍为 PAC-9 调参，未按各枪 `reloadTactical/reloadEmpty` 缩放；基础换弹动作正常，但节奏略偏 PAC-9。
4. **新枪无刻字/红点窗**：按需求省略（要求「可简化」），不影响辨识度。
5. 未跑 `npm run build`/`npm test`/visual/bench（按约束留给主 session），仅 `node --check` 通过。
