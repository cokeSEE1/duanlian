# 玩法升级设计（D 路 · game 模块）

> 状态：设计定稿，实现落地于 `src/game/game.js`。本文件描述 2 把新武器 + 多阶段目标流程 + 武器掉落/拾取，并登记 `src/shared/` 契约变更（由主 session 单独出契约 PR）。

## 1. 目标

当前只有一把武器（PAC-9，`mi.name = "玄鲸九式突击步枪"`，30 发/150 备弹/720rpm/26 伤），敌人死亡直接消失，目标流程只有「切断三处中继 → 撤离」且没有显式的「潜入」阶段。

本次升级：

1. **2 把新武器**：霰弹枪（hound 掉落）+ 精确步枪（gull 掉落），加在 PAC-9 之外，形成 3 武器轮换。
2. **武器掉落/拾取**：敌人死亡按类型掷表掉落武器拾取物，走近自动拾取。
3. **多阶段目标流程**：`infiltrate（潜入）→ cut（断链）→ extract（撤离）` 显式状态机。

## 2. 现状锚点（已定位）

- 武器模型信息 `mi`：`src/game/game.js:7859`（name/muzzle/eject/sightY/window/magPos/boltTravel…）。
- 武器数值全局 `var gi…Gv…B_…O_…H_…V_…W_…G_…`：`src/game/game.js:9994-10007`（`Gv`=弹匣、`B_`=备弹、`O_`=rpm、`H_`=伤害、`V_`=射程、`W_`=战术换弹、`G_`=空仓换弹）。
- 武器构造 `async function dm(i)`：`src/game/game.js:10016`，返回 `ve`（`return _e(), ve` 在 `:10712`）。
- 武器运行态 `k`：`:10263`；调试态 `ce`：`:10304`；武器状态 `ve`：`:10305`（含 `ammo/magSize/reserve/state/ads/spread/damage/rpm/name/update: Xe/reset: _e/addAmmo/muzzleWorld/reloadNow/snap`）。
- 重置 `_e()`：`:10338`（`ve.ammo=Gv; ve.reserve=B_` + 复位 `k`）。
- 换弹 `Fe()`：`:10383`（用 `ve.magSize/ve.reserve/ve.ammo` + `G_/W_`）。
- 开火 `Be()`：`:10399`（单发：`ve.ammo--`、随机散布 `ve.spread`、`i.combat.playerShot(Ie, ze, {damage:H_, range:V_})`、曳光/抛壳/枪口焰/后坐）。
- 每帧 `Xe()`：`:10450`（开火循环 `for(; k.cooldown<=0 && ve.ammo>0 && Je<3;) Be(), k.cooldown+=60/O_` 在 `:10520`；散布公式硬编码 `bi(0.0125, 0.0012, k.adsE)+…` 在 `:10556`；换弹推进 `:10470-10513`）。
- 输入工厂 `v_`：`:6751`（返回 `f`，键位表 `h_` 在 `:6716`，`down/pressed/requestLock/setGameplay` 等；**当前无 `nextWeapon`/`prevWeapon`**）。
- 玩家对象 `C`（`x_`）：`:7234`。
- 战斗模块 `zv`：`:7563`（`player:hitEnemy`，`enemy:killed` 计数在 `:7566`）。
- 敌人死亡事件由 **AI 模块** emit：`src/ai/ai.js:924`（gull）与 `:1964`（hound），payload `{ enemy, pos, type }`。**game 模块不改 ai，改由 game 订阅 `enemy:killed` 掷表**。
- HUD 弹药/武器名：`hM` 的 `se()` 读 `ve = i.weapon`（`:11121`），显示 `magSize/ammo/reserve/name/spread/state`（`:11190-11224`）——切换武器后这些字段自动反映。
- 目标流程 `mM`：`:11680`（`c`=run 状态含 `relays/cut/allCut`，`D()` 目标文案 `:11918`，`ue()` 交互/撤离检测 `:12134`，`me()` 切断 `:12165`，`H()` 重置 `:11822`）。
- 调参 `Yi`：`:11647`；无线电台词 `_l`：`:11669`。
- 材质接口 `i.mats.emissive(color,intensity)`（MeshBasicMaterial，`:world.js:2193`）与 `i.mats.get(name)`（PBR）。拾取物用 `new Qe(new Na(0.35), i.mats.emissive(c,i))` 生成（`Qe`=Mesh、`Na`=OctahedronGeometry、`Nn`=MeshBasicMaterial、`un`=BoxGeometry，均来自三.js 同 IIFE 作用域）。

## 3. 武器数值

| id | name | mode | damage | rpm | magSize | reserve | spreadBase(rad) | range | pellets | reloadTactical | reloadEmpty |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `pac9` | PAC-9 冲锋枪 | auto | 26 | 720 | 30 | 150 | 0.0125 | 300 | 1 | 2.1 | 2.72 |
| `shotgun` | 玄鲸 M4 霰弹枪 | pump | 13×8 | 68 | 6 | 36 | 0.055 | 60 | 8 | 2.4 | 3.1 |
| `rifle` | 玄鲸 DMR 精确步枪 | semi | 95 | 150 | 5 | 30 | 0.004 | 600 | 1 | 2.3 | 2.9 |

敌人血量：gull=45、hound=140（`ai.js` 配置）。因此霰弹近身 1~2 发、精确步枪 1~2 发、PAC-9 2~6 发，形成差异化。

## 4. 多阶段目标流程（状态机）

`c.stage ∈ { infiltrate, cut, extract }`，替换/伴随现有 `c.allCut`：

- `infiltrate`：出生后，目标文案「潜入港区，接近中继区」。当玩家距任一未切断中继 `< Yi.infiltrateRange`（默认 16m）→ 进入 `cut`，播放无线电台词 `_l.infiltrated`。
- `cut`：现有切断三处中继逻辑（`ue()`/`me()` 不变）。`D()` 文案沿用「切断三处上行中继 / 剩余 N 处 / 最后一处」。
- `extract`：`c.cut >= relays.length` 时 `c.allCut = true` 且 `c.stage = 'extract'`，`D()` → 「前往撤离艇」，撤离判定沿用 `c.allCut`。

重置 `H()` 将 `c.stage = 'infiltrate'` 并复位。此改动对截图回归无渲染影响（相机不移动时停在 infiltrate，不改变任何绘制）。

## 5. 掉落 / 拾取实现

掉落表（可调常量 `DROP_TABLE`）：

| 敌人 | 武器 | 基础概率 | 首次击杀 |
|---|---|---|---|
| hound | shotgun | 40% | 必掉 |
| gull | rifle | 40% | 必掉 |

- 掷表在 game 模块 `dm()` 内订阅 `enemy:killed`（不改 `src/ai/`）：`rollDrop(type, pos)`。
- 首次击杀必掉：`loadoutState.droppedFirst[type]` 记录；之后用 `i.rng()` 掷 40%。
- 掉落物：`{ mesh, weaponId, kind:'weapon'|'ammo', ammo, pos, t }`。
  - 未持有该武器 → `weapon` 拾取物（octahedron，橙=霰弹 / 青=精确步枪），附 `ammoFirst`（霰弹 12 / 步枪 20）。
  - 已持有 → `ammo` 拾取物（box，黄白），`ammo = magSize × 2`。
- 拾取半径 2.0m，玩家进入自动拾取（每帧在武器 `Xe()` 内检测）。拾取后 `i.scene.remove(mesh)`，emit `weapon:pickup`。
- 持有：最多 2 槽（`owned`，当前 + 备用）。拾取新武器加入备用槽并自动切到新武器（emit `weapon:switch`）；第 3 把替换备用槽。
- 弹药：每武器独立弹药池 `pool[id] = { mag, reserve }`，上限 `magSize × 3`；切枪时保存当前弹匣/备弹入池、载入新武器池。

## 6. 改动点清单（`src/game/game.js`）

1. `:9994` 前新增 `WEAPON_DEFS`（3 把武器）、`DROP_TABLE`、`loadoutState`（`owned/current/pool/droppedFirst/pickups`）。
2. `:6716` 键位表 `h_` 新增 `Digit1: "wep1"`、`Digit2: "wep2"`。
3. `:6763` 输入对象 `f` 新增 `nextWeapon/prevWeapon` 方法（委托 `i.weapon`）；`:6854` 后新增滚轮监听。
4. `:10305` `ve` 对象新增字段 `mode/pellets/spreadBase/currentId`，并新增方法 `resetLoadout/equip/nextWeapon/prevWeapon/pickup/rollDrop/spawnPickup/updatePickups`（在 `dm` 作用域内、`_e` 之后定义，`reset` 指向 `resetLoadout`）。
5. `:10338` `_e()` 之前新增 `applyStats(id)`；`_e()` 保留为「当前武器满弹复位」。
6. `:10399` `Be()` 支持 `pellets`（多弹丸 raycast，视觉特效单次）。
7. `:10516` 开火循环支持 `semi/pump`（单发点射）与 `auto`（连发）。
8. `:10556` 散布公式的硬编码 `0.0125` 改为 `ve.spreadBase`。
9. `:11822` `H()` 增加 `c.stage` 复位；`c` 状态新增 `stage`。
10. `:11918` `D()` 按 `c.stage` 输出文案；`:12134` `ue()` 增加 infiltrate→cut 判定；`:12165` `me()` 增加 extract 阶段置位。
11. `:11647` `Yi` 新增 `infiltrateRange`；`:11669` `_l` 新增 `infiltrated` 台词。
12. `:12635` `tP()` 输入 stub 新增 `nextWeapon/prevWeapon` 空实现（契约一致性）。

## 7. 需要的 `src/shared/` 契约变更（照抄 `docs/weapon-drop.md` 第 3 节，由主 session 落地）

### 7.1 事件（`events.js` 新增 3 个 topic）

| 常量 | topic | payload | emit 方 |
|---|---|---|---|
| WEAPON_DROP | `weapon:drop` | `{ kind, pos, weapon }` | game（本实现由 game 掷表后 emit，替代 ai emit） |
| WEAPON_PICKUP | `weapon:pickup` | `{ kind, weapon }` | game |
| WEAPON_SWITCH | `weapon:switch` | `{ from, to }` | game |

> 说明：`docs/weapon-drop.md` 原计划 ai 掷表 emit `weapon:drop`；因本任务限制只改 `src/game/`，实际由 game 模块订阅 `enemy:killed` 掷表并 emit `weapon:drop`。契约 topic 不变。

### 7.2 实体（`schema.js`）

武器/弹药拾取物用现有 `prop` 实体 + `tags` 约定（`weapon:<id>` / `ammo:<id>`），无需新增 EntityKind。新增 `WeaponRecord` typedef（字段语义同 `docs/weapon-drop.md` §3.2，数值以引擎 `WEAPON_DEFS` 为准）。

### 7.3 服务注入（`contracts.js` GameContext 新增 `weapon` 服务）

```js
@property {object} weapon   // { equip(id), pickup(id), current, ammo, nextWeapon, prevWeapon }
```

`contracts.js` 的 `InputState` 已声明 `nextWeapon/prevWeapon`，本次在 `v_` 输入工厂补齐实现。

## 8. 验证步骤

1. `node --check src/game/game.js` —— 语法通过（本任务唯一允许的本地校验）。
2. 主 session：`npm run build`（pins 会因 game.js 改动而报 drift，需同次提交更新 `scripts/pins.json`）+ `npm test`。
3. 主 session：`node scripts/visual.mjs` 截图回归（无渲染改动，期望 diff 不超阈值）。
4. 主 session：`node scripts/bench.mjs` 帧时间基准（拾取物每帧少量 raycast/距离检测，期望退化可忽略）。
5. 手测：击杀首个 hound 必掉霰弹枪、首个 gull 必掉精确步枪，走近自动拾取，数字键 1/2 或滚轮切换，HUD 弹匣/备弹/武器名切换正确；潜入→断链→撤离文案随阶段推进。
