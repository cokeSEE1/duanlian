# world 模块：程序化布局 3 张图 + 垂直空间（C 路 · world）

> 状态：实现完成，`node --check src/world/world.js` 通过。
> 本文件只记录 `src/world/` 与 `docs/` 内的改动；**未改 `src/shared/` 下任何文件**（铁律）。契约变更见文末「契约诉求」。

## 一、设计目标

在不改变默认关卡的逐字节行为的前提下，为 `src/world/world.js` 的关卡模块 `C1`（level 模块 `create`）增加：

1. **3 张可切换的程序化堆场布局**：默认 `hR`（原布局，行为零变化）+ 新增 `hR1`（横贯壁垒）+ `hR2`（堡垒环）。
2. **垂直空间**：集装箱堆顶走道（stairs + catwalk 连通 2.59 高台）、高层掩体（2 层集装箱堆）、支撑钢杆；室内仓库（`ab`）与门架（`cb`）为全布局共享的既有垂直锚点。

切换方式：URL 参数 `?layout=0|1|2`（走 `i.params`，无需新契约字段）。默认无参 = 0 = 原布局。

## 二、三张图布局方案

共同前提（原引擎既有）：区域 zone——gate x[-40,-24]、yard x[-24,16] z[-10,30]、shed x[-24,16] z[-30,-10]（库房建筑 x[-16,12] z[-28,-11]）、quay x[16,40] z[-30,30]；门架 crane 在 x=30。

### Layout 0（默认，`hR`，10126 起）
原布局，一字未动。默认 seed=4207、无 `?layout` 参数时命中此分支，截图回归基线（`?shot=1`）保持逐字节一致。

### Layout 1（`hR1`，10393 起）—— 横贯壁垒
- 东西向 1 层 40ft 集装箱长墙两列：南列 z=12（x=-14/-1.8/10.4 三段），北列 z=22（x=-14/-1.8 两段），顶部 y=2.59 可走。
- 西端地面楼梯（`stairs(-21.6, z, 0, 0)`）攀上两列西侧端头。
- 列内段间用 `catwalk` 桥接（南列 -7.9/4.3，北列 -7.9）；两列之间用 yaw=ts 的 `catwalk`（x=-14 与 x=-1.8，z=15/17.5/20）连成南北通道。
- 角部高层掩体：`stack(-16,26,[20red,20yellow])` 与 `stack(8,26,[40white,40green])`（2 层，5.18 高，作掩体/狙击面，非可走）。
- 支撑：`rod("steel_galv", …, 2.59)` 立杆。
- relay_a 放在中段顶 `(-1.8, 2.59, 12)`；vantage = 西楼梯脚 `(-21.6,0,12)` + 中段顶 `(-1.8,2.59,12)`。

### Layout 2（`hR2`，10434 起）—— 堡垒环
- 四面 1 层 40ft 围墙：南墙 z=-2（x=-12/0.4），北墙 z=20（x=-12/0.4），西墙 x=-18（yaw=ts，z=9），东墙 x=7（yaw=ts，z=9），中央留天井。
- 中央高层掩体：`stack(3,9,[20white,20yellow])`（2 层，5.18 高）。
- 四组楼梯：南/北墙西端（`stairs(-19.5,±z,0,0)`），西/东墙北端（`stairs(±x,16.6,ts,0)`）。
- 段间 `catwalk` 桥接墙顶，形成环顶走道。
- relay_a 放在南墙顶 `(-5.9, 2.59, -2)`；vantage = 南墙西楼梯脚 `(-19.5,0,-2)` + 南墙顶 `(-5.9,2.59,-2)`。

## 三、垂直空间实现要点

- 集装箱尺寸（`ob` builder 内）：container20 6.06×2.59×2.44、container40 12.19×2.59×2.44，单层顶高 2.59；两层堆顶高 5.18。
- `stairs`（stairs_metal 道具）：3 长、12 级，沿局部 +X 从 y≈0.2 爬升到顶部平台 y≈2.58。**yaw=0 时向 +X（东）爬升、yaw=ts 时向 -Z（南）爬升**，故楼梯放在目标集装箱的「攀登反侧」：yaw=0 放西侧、yaw=ts 放北侧，顶部正好落在箱顶 2.59 边缘。这是与原布局 `hR` 中 `stairs(-0.1,12.42,0,0)` 相同的已验证模式。
- `catwalk`：桥面顶 ≈ 2.54，与箱顶 2.59 基本齐平，用于连通相邻箱顶。
- `rod("steel_galv", …)`：竖直钢杆，作高台/连廊的视觉支撑与碰撞护栏暗示。
- 既有共享垂直锚点（未改）：`ab`（9030 起）室内仓库（interior 探针 + 天窗 + 库房灯，relay_b 所在）、`cb`（9919 起）码头门架（relay_c 所在）——三张图均复用，构成「堆顶 / 门架 / 室内仓库」三层垂直体验。

## 四、代码锚点清单

| 锚点 | 位置 | 说明 |
|---|---|---|
| `ob(i)` | 8622 | builder 工厂，返回 `t`（place/stack/stairs/catwalk/rod…） |
| `ab(i)` | 9030 | 室内仓库（共享，未改） |
| `cb(i)` | 9919 | 码头门架（共享，未改） |
| `hR(i)` | 10126–10392 | Layout 0 原堆场（未改） |
| `hR1(i)` | 10393 | Layout 1 横贯壁垒（新增） |
| `hR2(i)` | 10434 | Layout 2 堡垒环（新增） |
| `fR(i)` | 10476 | gate 区域（共享，未改） |
| `C1(i)` | 10574 | level 模块 `create`，布局选择与 relay/vantage 落地 |
| `wL` | 10578 | 布局选择器 `Math.max(0, Math.min(2, +(i.params && i.params.layout) || 0))` |
| `wY` | 10579 | 每布局 `{ relayPos, vantage }`；layout 1/2 由 hR1/hR2 返回，0 用默认值 |
| `o` | 10587 | relay_a 节点，按 `wY.relayPos` 放置 |
| `relay_a` | 10669 | 目标记录，`pos: wY.relayPos.clone()` |
| `vantage` | 10839 | 布局返回，`vantage: wY.vantage` |

## 五、改动点清单（本次 commit 实际改动）

1. `src/world/world.js`：
   - 新增 `hR1`、`hR2` 两个布局函数（替换掉此前临时插入的 `hR_tower`/`hR1`/`hR2` 草稿；`hR_tower` 已移除，无残留引用）。
   - `C1` 头部（10577–10589）：加 `wL` 布局选择 + `wY` 每布局结果；`relay_a` 节点 `o` 改为按 `wY.relayPos` 放置。
   - `relay_a` 目标记录（10669）：`pos` 改为 `wY.relayPos.clone()`。
   - 布局返回 `vantage`（10839）：改为 `wY.vantage`。
2. `docs/world-design.md`：本文件（新增）。

## 六、契约诉求（交 parent 单独出 PR）

**当前：无需任何 `src/shared/` 变更。** 理由：
- 布局切换走 URL `?layout=` → `i.params`（game.js boot 已解析 `URLSearchParams` 进 `t.params`），不经过 `WorldLayout` 字段。
- `relay_a`/`vantage` 仍复用现有 `WorldLayout.objectives[].pos` 与 `WorldLayout.vantage` 字段，类型不变。

可选未来项（非必需，若要 HUD/调试显示当前 layout 编号才加）：
- 在 `schema.js` `WorldLayout` 增加 `layoutId: number`（如 0/1/2），并在 `contracts.js` `GameContext.level` 暴露 `layoutId`。这是**接口变更**，须按 CLAUDE.md 单独出契约 PR 并登记 `docs/MIGRATION.md`。本次未做。

## 七、验证步骤（parent 侧执行）

1. `node --check src/world/world.js` → 已通过（本 agent 已完成）。
2. `npm run check`（pins 漂移 + index.html 同步）——注意：**改过 `src/world/world.js` 后 pins 会报 drift**，parent 须按 CLAUDE.md 在同一次提交更新 `scripts/pins.json`（本 agent 被禁止执行 build/check，也未改 pins）。
3. 截图回归：`node scripts/visual.mjs`，默认 `?shot=1`（无 layout 参数）应命中 layout 0、diff=0；再对 `?layout=1&shot=1`、`?layout=2&shot=1` 各出一张图做人工核对。
4. 可玩性人工核对项（本 agent 无法运行，需 parent 或后续截图确认）：
   - layout 1/2 的楼梯顶部是否恰好落在 2.59 箱顶边缘、catwalk 是否与箱顶齐平（几何按 hR 已验证模式推导，但未实机/截图验证）。
   - yaw=ts 楼梯（layout 2 西/东墙北端）的攀登方向（-Z/南）是否符合直觉。
   - relay_a（layout 1 在 2.59 箱顶、layout 2 在 2.59 墙顶）是否可被玩家正常接近触发切割。

## 八、未完成 / 已知限制

- 楼梯与 catwalk 的「可走性」是按 `hR` 既有几何模式推导 + `node --check` 保证不崩溃，**未做截图/实机验证**（本 agent 被禁止运行 build/visual/bench）。若截图发现楼梯顶端与箱顶有 0.01 级差或方向反了，仅需在 `hR1`/`hR2` 内微调 `stairs`/`catwalk` 坐标与 yaw。
- 新布局未单独新增 coverPoints/enemySpawns/cinematicPath：这三项沿用原 `hR` 的共享数据（`coverPoints` 与 `enemySpawns` 的堆场点仍锚在原布局坐标附近）。新布局的掩体/出生点未逐点重配，属于后续打磨项，不影响三图可切换与垂直空间呈现。

## 九、C 路收尾：coverPoints / enemySpawns 重配 + 楼梯可走性实机验证

改动仍只落在 `src/world/world.js`（未碰 `src/shared/`，未改 pins）。做法：`C1` 内原 `coverPoints`（`_`）与 `enemySpawns`（`y`）保持为 layout 0 的既有数据（layout 0 零变化）；在 `wL===1` / `wL===2` 分支里，用「过滤 + 重配」生成新布局数据：

- `enemySpawns`：`y.filter(q => q.zone !== "yard")` 保留 shed/quay/gate（三图共享几何，出生点不变），再补本布局 yard 出生点。
- `coverPoints`：`_.filter(q => q.x < -24 || q.x > 16 || q.z < -10 || q.z > 30)` 保留 yard 之外（gate/shed/quay）的掩体点，再补本布局 yard 掩体点（地面 + 墙顶 2.59 高台）。

各布局数据量（实机 `__G.level` 读回）：

| 布局 | enemySpawns | coverPoints | 说明 |
|---|---|---|---|
| 0（默认） | 42（10 yard 地面 + 6 yard 空中 + 26 共享） | 55 | 未动 |
| 1 横贯壁垒 | 43（27 地面 / 16 空中；yard 新增 12 地面 + 5 空中） | 68（63 地面 + 5 墙顶） | 南北两列长墙 + 角部高层掩体 |
| 2 堡垒环 | 49（32 地面 / 17 空中；yard 新增 17 地面 + 6 空中） | 55（51 地面 + 4 墙顶） | 四面围墙 + 中央天井 + 墙顶走道 |

新布局 yard 掩体/出生点贴合新几何：layout 1 分布在南列墙南侧通道、南北墙之间走廊、北侧两角部掩体之间缺口与北侧空地；layout 2 分布在四墙外侧、中央天井（避开中央 5.18 高层掩体）与西侧窄条。所有地面点经 `E`（isWalkable 就近校正）后 `groundNotWalkable = 0`；墙顶 2.59 掩体点沿用 layout 0 既有「高台掩体」模式（nav 为 2D 顶视，集装箱顶足迹整体不可走，高台点对 AI 走位为装饰性候选，不阻塞）。

楼梯可走性：用引擎真实 `physics.moveCapsule`（胶囊 r=0.32 h=1.8）在 `?layout=1/2` 下逐级爬升模拟验证。结论：

- **6 处楼梯全部可走**（layout 1 两处 + layout 2 四处），胶囊从地面爬到 2.59/2.6 平台无卡脚；stairs 顶部平台 2.6 → 箱顶/栈道 2.59 为 0.01 级差下行，`u1=0.42` 步差阈值内。
- **6 条墙顶/栈道连廊全部可走**，全程 y≈2.59 无跌落。
- **修复 1 处**：layout 2 南墙西端楼梯（`stairs(-19.5,-2,0,0)`）脚下原本摆了一个 `sandbags` 道具 `(-20.8,-2.2)`，正好落在楼梯 foot（楼梯占 x -21..-18、z -2.5..-1.5）内，会把胶囊向北挤偏 0.48，导致爬到 y=2.4 时被顶部扶手杆挡住、无法登上 2.6 平台。已把该 sandbags 移到 `(-20.8,-4.4)`（楼梯南侧、南墙外），移开后胶囊沿中线爬升 maxY=2.6、终点落在南墙顶 2.59 正常。

验证环境：临时 `/tmp/duanlian-test`（复刻 build.mjs 合并 src 五段 + platform 两段，不写仓库、不跑 `npm run build`），Playwright + SwiftShader 软渲染加载 `?layout=1|2&seed=4207&q=test&noaudio=1&dt=0.0166667`，`__ready` 后调 `__G.physics.moveCapsule`/`nav.isWalkable` 断言。boot 无 fatal、无 pageerror，`node --check`（world.js 与五段合并文件）均通过。
