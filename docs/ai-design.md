# AI 模块升级设计（B 路 · src/ai/）

本文件记录在 `src/ai/ai.js` 上实现的 **squad 协同 + 三类新敌人** 的设计、代码锚点、改动清单、契约需求与验证步骤。实现遵循「不破坏既有 hound/gull 行为、不改 `src/shared/`」的约束，新敌人以既有 rig（机械猎犬 / 机械飞鸥）上的 **variant（变体）** 承载，避免触碰 `EntityKind` 枚举。

---

## 1. 背景与约束

- `src/ai/ai.js` 已 prettify，但变量名仍是压缩单字母；它只是 esbuild IIFE 的一段（文件以 `})();` 收尾，IIFE 开口在 `src/lib/three.js`）。**语法校验不能直接 `node --check`**（会在结尾 `})();` 报错），应把文件去掉结尾 `})();` 后作为函数体编译：
  ```bash
  node -e "const fs=require('fs');const s=fs.readFileSync('src/ai/ai.js','utf8').replace(/\}\)\(\);\s*$/,'');new Function(s);console.log('ok')"
  ```
- 模块只通过 `src/shared/` 契约与外部通信；本实现**不新增/不修改任何 `src/shared/` 文件**。需要契约层配合的项全部列在第 6 节，由主 session 单独出契约 PR。

---

## 2. 现有敌人与状态机（代码锚点）

| 符号 | 位置（函数） | 含义 |
|---|---|---|
| `Zv` / `Pn` | `Q_` 上方，`var Zv = {...}` | gull（机械飞鸥）调参表：hp/bolt/burst/telegraph/cooldown/range/alt/速度/爆炸等 |
| `Kv` / `Gt` | `iM` 上方，`var Kv = {...}` | hound（机械猎犬）调参表：hp/shot/burst/lunge/runSpeed/replan 等 |
| `Q_(i,e,t,n)` | 返回 gull 实体 `d`（`type:"gull"`） | 飞鸥：感知 `think`、悬停 orbit、`atk` 状态机 idle→tele→burst、死亡坠落 `g` |
| `iM(i,e,t,n)` | 返回 hound 实体 `m`（`type:"hound"`） | 猎犬：四足 IK、`es` 状态机 move/aim/cool/tele/burst/wind/lunge/recover、`w()` 选掩体射击位 |
| `Em(i)` | 返回敌人管理器 | `h` 上下文（`think/rally/provoke/requestToken/releaseToken/fireBolt/addWreck/retire/squadAssign`）+ 公共 API `U`（`spawn/update/alert/raycast/aliveCount/clear`） |
| `VC(i)` | 调试展示 | `?eshow=` 分支，`n === "fight"/"squad"/…` 决定 spawn 组合 |
| `sM` / `nM` / `HC` | 文件尾部 | 球/胶囊/线段相交辅助 |
| `Ui` | `Em` 内 | 全局 AI 调参：sightRange/sightCone/maxTokens/maxTokensCrowd/tokenGap/poolGulls/poolHounds 等 |

**可用的注入服务（`GameContext`，实参即 `i`，实体内部写作 `s`）**：
- `s.player`：`.pos/.eye/.vel/.yaw/.alive/.crouching/.damage()`
- `s.physics`：`.raycast/.lineOfSight/.groundHeight/.nav.findPath/.nav.randomPoint/.nav.isWalkable`
- `s.combat`：`.enemyShot/.explode`
- `s.level`：`.coverPoints/.vantage/.skylights/.shedLights/.interiorBoxes/…`
- `s.props`：`.names()/.has()/.build()`（道具注册表，非已放置清单）
- `s.scene`：THREE.Scene（可 `traverse` 拿到已放置道具的 `userData.prop`）
- `s.events` / `s.fx` / `s.render.lightPool`

**现有 squad 相关逻辑（升级前就有的底座）**：
- `h.rally(pos, r, target, self)`：一名敌人发现玩家时，把范围内其他敌人拉入 `investigate`。
- `h.provoke(enemy)`：受击时把附近敌人拉入 `investigate`。
- token 系统（`requestToken/releaseToken`，`Ui.maxTokens=2`、crowd=3、`lastType` 交替 gull/hound）：**已有「轮流压制」语义**——同时开火者被限制为 2~3 人并轮流放行。
- hound `w()`：选射击位时对「离其他 engage 猎犬太近」「无 LOS」的候选点加惩罚，**已有初步散开**。

---

## 3. 三类新敌人（variant 设计）

不新增 `EntityKind`。`type` 仍是 `hound`/`gull`，新增内部字段 `variant`（`"standard"` 为默认），由 `spawn(type, pos, {variant})` 传入、`_activate` 落地。这样 `raycast`、`spawn` 的 pool 复用、`w()` 中 `type === "hound"` 判断等全部原样生效。

### 3.1 suppressor（远程压制型，gull variant）
- **定位**：空中长程压制，不近战、不冲锋，靠火力密度 + 大散布把玩家钉在掩体后。
- **行为**：
  - 交战 orbit 半径从 `Pn.rangeMin..rangeMax`（12..25）拉到 `Pn.suppRangeMin..suppRangeMax`（26..46），始终保持在远距离。
  - 失联 ≤2s（`noSeeT < 2`）仍可开火（盲射压制），不再要求 `d.los`；开火允许角度放宽到 0.9 rad。
  - 单轮弹数 `Pn.burst`→`Pn.suppBurst`（6），散布固定为 `Pn.suppSpread`（0.14，远大于近距 0.018）；单发伤害降到 `Pn.suppDamage`（4）。
- **实现锚点**：`Q_` 内 `x()` 的 orbit 半径 `bl(...)` 分支、idle→tele 触发条件、tele→burst 的 `shots`、burst 的 `Y` 散布；`fireBolt` 记录每发 `dmg`、`_()` 读 `j.dmg`。

### 3.2 elite（护盾精英型，hound variant）
- **定位**：地面重装，护盾两阶段（`ePhase: "shield" → "rage"`）。
- **行为**：
  - `shield` 独立于 hp（`Gt.shieldMax=90`），护盾存在时 `damage()` 只扣盾、不掉血、无硬直，emit `enemy:hit`（`part:"shield"`）+ 火花 + lens 闪光；盾碎时 `ePhase="rage"` + 火花 + `enemy:telegraph`（`elite:true`）。
  - 盾在时 lens 呈青色（`le=[3,9,14]`），视觉上可辨识。
  - 盾碎进入 rage：追击速度 `Gt.runSpeed * Gt.rageSpeedMul`（1.45），射击冷却 `* Gt.rageCooldownMul`（0.65），更凶。
- **实现锚点**：`iM` 内 `damage()` 盾分支、`_activate()` 重置、`S()` 中 move 速度与 burst 冷却、`S()` 中 `le` 颜色。

### 3.3 env（环境联动型，gull variant）
- **定位**：利用场景机关（爆炸物道具）做区域杀伤，把掩体后的玩家逼出来。
- **行为**：
  - 交战时每 0.6s 扫一次 `s.scene.traverse`，找玩家 `Pn.envScanRange`（26m）内最近的爆炸物 prop（`barrel`/`jerry_can`/`gas_cylinders`，`userData.prop`）。
  - 找到则飞行目标改为该 hazard 上方（`envHover=6`），进入 `envTriggerRange`（9m）后 `s.combat.explode`（半径 4.5、伤害 26）+ `s.fx.explosion` 引爆，冷却 `envCooldown=3s`。
  - 找不到 hazard 时回退为普通 gull orbit。
- **实现锚点**：`Q_` 内新增 `HZ()`（场景扫描）、`x()` 中 env 分支（重写 `E/S/w` 目标 + 引爆）。

---

## 4. squad 协同算法

升级重点：在既有 `rally` + token 轮流压制底座上，增加**两侧包抄**。

- **新增字段**：每实体 `flank`（-1 左 / 0 自由 / +1 右）、`role`（`flanker/anchor/suppressor/free`，供后续扩展读取）。
- **`h.squadAssign()`（每帧，`U.update` 中调用）**：
  1. 收集 `alive && !passive && mode==="engage"` 的敌人。
  2. 用 `s.player.yaw` 得玩家前向 `(fx,fz)=(sin,cos)`。
  3. 对每个敌人算 `side = fz*dx - fx*dz`（前向×偏移 的 y 分量），`side>2 → flank=1`（右），`side<-2 → flank=-1`（左），否则沿用旧值（防抖）。
  4. 若所有 engage 敌人挤在同一侧（`neg`/`pos` 之一为 0），则按环形序交替强制分配左右（保证至少一个包抄点）。
- **`hound w()`（选射击位）**：随机采样玩家周围的候选角 `K = N + m.flank*0.85 + (o()-0.5)*1.7`，使左翼猎犬偏向更左、右翼偏向更右；结合既有「离队友太近/无 LOS 加罚」形成交叉火力与包抄。
- **轮流压制**：沿用既有 token 系统（2 人开火 + `lastType` 交替）；suppressor 天然申请 token 后保持远距长点射，其余人推进/换位。

> 说明：完整「掩护推进」状态机（advance 者压制者互锁）较大，本版先落「两侧包抄 + 轮流压制」，掩护推进作为下一步（见第 7 节）。

---

## 5. 改动点清单（`src/ai/ai.js`，均已实现）

1. `Zv`（gull 调参）追加 `suppRangeMin/suppRangeMax/suppBurst/suppSpread/suppDamage/envScanRange/envTriggerRange/envHover/envCooldown/envExplodeRadius/envExplodeDamage`。
2. `Kv`（hound 调参）追加 `shieldMax/rageSpeedMul/rageCooldownMul`。
3. `Q_` 内 gull 实体 `d` 增加字段 `variant/flank/role/envT/envCd/envHaz`；`_activate` 重置这些字段。
4. `Q_` 内新增 `HZ()`（扫 `s.scene` 找爆炸物 prop）。
5. `Q_` 内 `x()`：
   - suppressor 的 orbit 半径上下限分支；
   - env 分支（重写目标点 + 引爆，`s.combat` 已加守卫）；
   - idle→tele 触发放宽（suppressor 可盲射、角度/距离放宽）；
   - tele→burst 的 `shots` 按 variant 取；
   - burst 的散布 `Y` 按 variant 取。
6. `iM` 内 hound 实体 `m` 增加字段 `variant/flank/role/shield/shieldMax/ePhase/shieldT`；`_activate` 重置。
7. `iM` 内 `damage()` 增加 elite 盾分支（扣盾、盾碎转 rage、火花/telegraph）。
8. `iM` 内 `w()` 的候选角加 `m.flank` 偏置。
9. `iM` 内 `S()`：move 速度与 burst 冷却按 elite rage 缩放；elite 盾在时 lens 青色。
10. `Em` 内 `h` 新增 `squadAssign()`；`U.update` 每帧调用。
11. `Em` 内 `fireBolt` 记录 `G.dmg`（suppressor 减伤）；`_()` 读 `j.dmg ?? Ui.gull.boltDamage`。
12. `VC` 新增 `?eshow=squad` 分支：1 标准 hound + 1 elite hound + 1 suppressor gull + 1 env gull，便于手动验收。

---

## 6. 需要的 `src/shared/` 契约变更（接口变更，本实现未动）

以下若要把新敌人「转正」为一等公民，需要单独契约 PR（本实现**刻意规避**，用内部 `variant` + `s.scene` 遍历替代，因此可独立合并）：

1. **`schema.js` `EntityKind`**：`hound|gull|relay|prop` → 增加 `suppressor|elite|env`（或改为 `EntityRecord` 增加 `variant` 字段）。`contracts.js` 的 `EntityKinds` 同步扩。
2. **`schema.js` `EntityRecord`**：增加可选 `variant: 'standard'|'suppressor'|'elite'|'env'`、`shield: number`（精英盾量）、`role: string`（squad 角色）。
3. **`contracts.js` `GameContext.level`**：增加 `hazards`（爆炸物道具实时列表：`{pos, prop, radius}`），替代 env 敌人在 `s.scene` 上的 `traverse`（后者在运行时反复遍历场景，性能与职责边界都更差）。
4. **`events.js`**：新增 topic `enemy:shield`（盾受击）、`enemy:shieldBreak`（盾碎转 rage），供 UI/音频订阅；`enemy:telegraph` 的 payload 增加 `elite: true` 标记（当前已 emit，但 topic 契约未登记该字段）。
5. （可选）`enemy:fire` payload 增加 `variant`，便于音频/UI 区分压制/精英/环境火力。

---

## 7. 验证步骤

1. **语法**：
   ```bash
   node -e "const fs=require('fs');const s=fs.readFileSync('src/ai/ai.js','utf8').replace(/\}\)\(\);\s*$/,'');new Function(s);console.log('ok')"
   ```
2. **构建/回归（主 session 统一跑，本 agent 不跑）**：`npm run check`、`npm test`、`node scripts/visual.mjs`、`node scripts/bench.mjs`。
3. **手动**：开根目录 `index.html`（或 `python3 -m http.server 8080`），带 `?eshow=squad` 进入展示场景，观察：
   - 4 个敌人是否从不同方向包抄（左/右猎犬、空中压制/环境 gull）；
   - elite 猎犬护盾受击冒火花、lens 青色，盾碎后明显提速；
   - suppressor gull 保持在远距离长点射、散布大；
   - env gull 飞向玩家附近的桶/油桶/气瓶并引爆。
4. **等价性**：`?eshow=fight`（原分支）与默认 hound/gull 行为应与改动前一致——`variant` 默认 `"standard"`、`shield=0`、`flank=0`，所有新逻辑都被 variant 守卫短路。

---

## 8. 未完成 / 已知限制

- ~~**掩护推进**~~ ✅ 已补齐（见第 9 节）：`flank → advance → hold` 循环，掩体点推进 + 边打边推进。
- **env 引爆不销毁道具**：`s.combat.explode` 只做区域伤害与 FX，不真正移除 `barrel` 等 prop；同一 hazard 会在 `envCooldown` 后被重复引爆。需 world/game 层提供「道具销毁 + hazard 列表」契约才能真正闭环（见第 6 节第 3 条）。（本次明确排除，不做。）
- ~~**suppressor 盲射**~~ ✅ 已补齐（见第 9 节）：看不见玩家时朝 `d.lastKnown` 散布，不再直瞄玩家真实坐标。
- **`role` 字段目前仍只写不读**：掩护推进按 `m.flank`（左右翼）驱动，`role` 仍为后续「anchor/suppressor/flanker」行为分层预留。

---

## 9. B 路收尾改动（掩护推进 + suppressor 盲射）

仅改 `src/ai/ai.js`，不碰 `src/shared/`、其他模块、`index.html`、`scripts/`。语法校验：`cat src/lib/three.js src/render/render.js src/world/world.js src/game/game.js src/ai/ai.js > /tmp/merged.js && node --check /tmp/merged.js` 通过。

### 9.1 掩护推进完整状态机（hound）

新增高层战术状态字段 `m.tac`（`"flank"` 包抄 / `"advance"` 推进 / `"hold"` 掩体火力）与计时 `m.tacT`，叠加在既有低层 `es`（move/aim/cool/tele/burst/…）之上。

- **字段**：`src/ai/ai.js:1347-1348`（`tac`/`tacT` 声明）、`1503-1504`（`_activate` 重置）。
- **进入 engage**：`1733` —— 设 `tac="flank"`、`tacT=1+o()*1.2`，然后走原有 `w()` 选宽包抄射击位（`w()` 里 `m.flank` 偏置继续生效）。
- **每帧驱动 `ta(T)`**：`1710-1720`，在 engage 分支顶部调用（`1763`）。只在 `es` 处于 `aim`/`cool`（两次开火之间的安全点）时推进，避免打断 tele/burst、也不会泄漏 token。
- **`taCover()`**：`1657-1693` —— 在 `s.level.coverPoints` + 玩家前方随机点里挑「比当前离玩家更近（至少近 1.5m）、且 ≥ `rangeMin`（8m）不冲进肉搏、可走、保持本翼 `flank` 侧、有 LOS」的下一掩体点。
- **`taStart()`**：`1694-1709` —— 开始一次推进：把选中的掩体点写入 `m.firePos` 并 `es="move"`；若已进入突击距离（< `rangeMin+1`）或找不到更近掩体，则回退 `hold`。
- **到达掩体**：`1787` —— `move` 到达/超时转 `aim` 时，若 `tac==="advance"` 则置 `tac="hold"`、`tacT=1.1+o()*1.8`（开始掩体驻留开火）。
- **换掩体循环**：`1836-1838` —— `hold` 状态下打完一轮 burst 不再 `w()` 乱跑，而是回 `cool` 原地续射；`tacT` 到期后 `ta()` 再切 `advance` → `taStart()` 选下一个更近掩体。

整体闭环：**包抄（flank，w() 宽侧翼）→ 推进（advance，选更近掩体并移动）→ 掩体开火（hold，原地 aim/tele/burst/cool）→ 再推进换掩体 → … → 距离 < 9m 转入突击/肉搏**。token 系统（2~3 人轮流开火）继续保证「有人压制、有人推进」。

### 9.2 suppressor 盲射打 lastKnown

- **射程门**：`1195-1196` —— suppressor 盲射（`!d.los`）时按 `d.lastKnown` 判距，玩家离开射程也不立刻停火。
- **瞄准点**：`1218-1224` —— burst 时若 `variant==="suppressor" && !d.los`，瞄准 `d.lastKnown`（+1.05 高度）而非玩家真实 `b.pos`；仍复用 `Pn.suppSpread=0.14` 的散布，形成对最后已知位置的压制性盲射。非 suppressor / 可见时走原 `b.pos` + 提前量逻辑，行为不变。
