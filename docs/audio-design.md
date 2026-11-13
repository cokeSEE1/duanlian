# 敌人发现音效丰富化设计（audio 模块）

> 状态：方案一 + 方案三已确认，待实现。
> 背景：用户反馈「敌人发现声音有点单一」。

## 1. 现状（代码锚点，已确认）

音频系统是**程序化合成**（零外部资源），当前全部在 `src/game/game.js`（`src/audio/` 仍是空目录，未 carve）。

| 锚点 | 位置 | 说明 |
|---|---|---|
| `C8` 生成器 | `game.js:4513` | `alert` 音效合成函数。第 3 参 `t` 决定音高：`t=1`→622Hz 低频（猎犬嚎叫）、`t=0`→1320Hz 高频（飞鸥尖啸） |
| `alert` 音效定义 | `game.js:5424` | `{ gen: C8, n: 2, sr: Xn, peak: 0.5, bus: "world", max: 3, pri: 6, ref: 8, roll: 0.5 }`（`n:2` = 2 变体） |
| `enemy:alert` 订阅 | `game.js:6347` | 播放 `ze("alert", { variant: type==="hound"?1:0, gain: 0.9 })`，**0.12s 节流** |
| `ze()` 播放函数 | `game.js:5861` | `variant %= pe.n`，缓存键 `音效名#变体号`，`p(te, ge)` 合成 |
| 音效名映射 | `game.js:5479` | `enemy_alert: "alert"` |

「单一」的根因：只有 2 个变体（hound/gull 音高），B 路新加的精英/压制敌人没有专属发现音；且 0.12s 节流把「群体同时发现」压成单声。

## 2. 方案一：按敌人类型扩专属发现音

目标变体映射（4 变体）：

| 敌人 | variant 判定 | 变体号 | 音色 |
|---|---|---|---|
| 飞鸥 gull（普通） | `type==="gull"` 且无 variant | 0 | 高频尖啸 1320Hz（现有） |
| 猎犬 hound（普通） | `type==="hound"` 且无 variant | 1 | 低频嚎叫 622Hz（现有） |
| 护盾精英 elite | `variant==="elite"` | 2 | **新增**：更重更低战吼（~450Hz + 更长的尾音/回声） |
| 远程压制 suppressor | `variant==="suppressor"` | 3 | **新增**：电子/无线电警报音（非嚎叫，蜂鸣式） |
| 环境联动 env | `variant==="env"` | 复用 0 | 复用 gull 高频尖啸 |

实现要点：
- `C8(i, e, t)` 的第 3 参 `t` 从布尔改为整数 `0..3`，各变体走不同基础频率/音色（`t?622:1320` 那行改成查表或 switch）。
- `alert` 定义 `n: 2` → `n: 4`。
- `enemy:alert` 订阅处（`game.js:6355`）的变体选择改为：读 `pe.variant`（elite/suppressor）映射到变体号，无 variant 用 `pe.type` 兜底。

## 3. 方案三：群警报优化

- 现状 `game.js:6350` `if (he - ve < 0.12) return;` 把 0.12s 内多个敌人同时发现压成一声。
- 改为：**0.12s 内允许叠最多 3 个 alert**（不同音高，靠 `roll` 自然错开），超过 3 个才节流。
- 效果：一群敌人同时发现你 → 「警报群响」，压迫感拉满。

## 4. 契约影响（诚实标注）

方案一依赖 `enemy.variant` 字段——这是 B 路在 `ai.js` 内部加的字段，**尚未进 `schema.js` 的 `EntityRecord` 契约**。当前 `enemy:alert` payload 是 `{ enemy, pos }`，读 `pe.variant` 等于 game 模块依赖 ai 模块的内部字段，违反「模块间只走 shared/ 契约」。

**因此方案一需契约 PR 落地**：`schema.js` `EntityRecord` 增加 `variant?: 'elite'|'suppressor'|'env'`（B 路契约需求里已列出，合并进同一个契约 PR）。

方案三无契约影响（纯 game.js 内部节流逻辑）。

## 5. audio 模块职责与锚点（为 carve 做准备）

未来把音频从 `game.js` carve 到 `src/audio/` 时的职责与锚点：
- 合成生成器群：`C8`(alert)、`P8`(telegraph)、`I8`(explosion)、`z8`(relay_cut) 等（`game.js:~4513` 起）。
- 音效定义表：`game.js:~5424` 起（每音效 `gen/n/sr/peak/bus/max/pri/ref/roll`）。
- 播放函数 `ze(name, opts)`：`game.js:5861` 起（变体选择 + 缓存 + 空间化）。
- 事件订阅（`ln("enemy:alert"/"weapon:fire"/"player:step"...`）：`game.js:~6340` 起。

## 6. 验收

- `node --check src/game/game.js`（语法）。
- 主 session：`npm run build` + 更新 `pins.json` + `npm test` + `visual.mjs` + `bench.mjs`（音频改动不引入性能退化）。
- 主观：不同敌人（普通/精英/压制）发现时音色可辨；群体同时发现有「群响」感。
