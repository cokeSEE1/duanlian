# 武器掉落系统设计（D 路 · game 模块）

> 状态：方案草案（待实现）。carve 已完成（render/world/game/ai 四模块落位），本设计落地进 `src/game/`（武器系统）+ `src/ai/`（死亡掉落钩子）+ `src/shared/`（契约 PR 先行）。

## 1. 背景与目标

当前只有一把武器 PAC-9（冲锋枪），敌人死亡后直接消失，无掉落/拾取，玩家全程无武器成长。

目标：引入「杀怪掉武器」循环——敌人死亡按类型掉落武器拾取物，玩家走近自动拾取获得新武器，形成「战斗 → 掉装 → 换装」的正反馈，同时为多阶段流程（潜入→断链→撤离）提供武器多样性的基础。

## 2. 现状契约（v2）

- 事件（events.js）：已有 `weapon:dry` / `weapon:fire` / `weapon:reload`；`enemy:killed` 由 AI 模块在敌人死亡时 emit。
- 实体（schema.js）：`hound`（机械猎犬/近战地面）/ `gull`（机械飞鸥/四旋翼）/ `relay`（中继目标）/ `prop`（道具，具体变体由 `tags` 承载）。
- GameContext（contracts.js）：已有 `combat`（enemyShot/playerShot/explode）、`player`（只读快照含弹药）、`input`（已含 `nextWeapon`/`prevWeapon` 切换方法）。

## 3. 契约变更（需 schema/events PR，先合）

### 3.1 事件（events.js 新增 3 个 topic）

| 常量 | topic | payload | emit 方 |
|---|---|---|---|
| WEAPON_DROP | `weapon:drop` | `{ kind, pos, weapon }` | ai（敌人死亡掷表） |
| WEAPON_PICKUP | `weapon:pickup` | `{ kind, weapon }` | game（玩家拾取） |
| WEAPON_SWITCH | `weapon:switch` | `{ from, to }` | game（切换武器） |

### 3.2 实体（schema.js）

武器拾取物用现有 `prop` 实体承载，`tags` 走 `weapon:<id>` / `ammo:<id>` 约定（最小侵入，无需新增 EntityKind）：

- `weapon:shotgun` —— 霰弹枪拾取物
- `weapon:rifle` —— 精确步枪拾取物
- `ammo:pac9` / `ammo:shotgun` / `ammo:rifle` —— 弹药拾取物

新增 `WeaponRecord` typedef（只冻结字段语义，数值以引擎实现为准）：

```js
/**
 * @typedef {object} WeaponRecord
 * @property {string} id          武器 id（pac9/shotgun/rifle）
 * @property {string} name        显示名
 * @property {'auto'|'semi'|'pump'} mode  射击模式
 * @property {number} damage      单发伤害
 * @property {number} fireRate    射速（发/秒）
 * @property {number} magSize     弹匣容量
 * @property {number} spread      散布（度）
 * @property {number} range       有效射程（米）
 * @property {string} ammoId     弹药类型 id
 */
```

### 3.3 服务注入（contracts.js GameContext 新增 `weapon` 服务）

```js
@property {object} weapon   // 武器服务：{ equip(id), pickup(id), current, ammo }
```

## 4. 掉落表（DropTable）

| 敌人 | 掉落 | 基础概率 | 说明 |
|---|---|---|---|
| hound（猎犬/近战） | `weapon:shotgun` | 40% | 近战高风险，掉霰弹枪对冲 |
| gull（飞鸥/飞行） | `weapon:rifle` | 40% | 远程克制，掉精确步枪 |

补充规则（实现时写进引擎可调常量，后续难度系统统一管）：

- 每种敌人**首次击杀必掉**（保证玩家必能体验到新武器），之后按概率。
- 掉落武器时附带 1 个对应 `ammo:<id>`（建议霰弹 12 发 / 步枪 20 发）。
- 若该武器已持有，掉落改为纯 `ammo:<id>`（弹匣容量 ×2）。
- 掉率与画质档解耦。

## 5. 拾取 / 切换 / 弹药

- **拾取半径**：2.0m，玩家进入即自动拾取（无需按键，保持爽快）。
- **持有**：最多 2 把（当前 + 备用），第 3 把自动替换备用位。
- **切换**：数字键 1/2 或滚轮（复用 `input.nextWeapon`/`prevWeapon`），emit `weapon:switch`。
- **弹药**：每武器独立弹药池；拾取同种武器/弹药累加，上限 = 弹匣 ×3。

## 6. 落地分工（carve 已就位）

| 模块 | 改动 |
|---|---|
| `src/shared/` | events/schema/contracts 契约 PR（先合，独立不破行为） |
| `src/game/` | 武器定义表、拾取检测、切换/弹药逻辑、掉落物实体生成 |
| `src/ai/` | `enemy:killed` 处理器掷掉落表 → emit `weapon:drop` |

## 7. 验收

- `npm test` 通过（契约测试）。
- `node scripts/visual.mjs` —— 截图回归（掉落物场景 diff < 0.2%）。
- `node scripts/bench.mjs` —— 帧时间基准（median 退化 ≤20%）。

## 8. 依赖顺序

1. 先合契约 PR（events/schema/contracts，独立不破行为）。
2. 再实现 game 掉落/拾取 + ai 死亡钩子。
3. 最后接 HUD 显示与拾取提示。
