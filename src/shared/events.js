// 事件总线（冻结接口 v2）：模块间通信的唯一通道。
// 规则：模块之间不直接 import 对方的内部符号；跨模块通知一律走 Topics。
// v2 已对齐引擎真实 topic（冒号命名，emit 全集 32 个；订阅为其子集）。
// 改动 topic 名或 payload 结构 = 接口变更，单独出 PR 并在 docs/MIGRATION.md 登记版本。

/** @typedef {'enemy:alert'|'enemy:fire'|'enemy:hit'|'enemy:killed'|'enemy:melee'|'enemy:spawn'|'enemy:step'|'enemy:telegraph'|'explosion'|'extraction:reached'|'game:state'|'impact'|'input:lock'|'objective:all'|'objective:done'|'objective:progress'|'player:dead'|'player:hit'|'player:hitEnemy'|'player:jump'|'player:land'|'player:rescued'|'player:step'|'quality:auto'|'radio:line'|'shell:bounce'|'thunder'|'ui:click'|'ui:hover'|'weapon:dry'|'weapon:fire'|'weapon:reload'} Topic */

export const Topics = Object.freeze({
  // enemy
  ENEMY_ALERT: 'enemy:alert',
  ENEMY_FIRE: 'enemy:fire',
  ENEMY_HIT: 'enemy:hit',
  ENEMY_KILLED: 'enemy:killed',
  ENEMY_MELEE: 'enemy:melee',
  ENEMY_SPAWN: 'enemy:spawn',
  ENEMY_STEP: 'enemy:step',
  ENEMY_TELEGRAPH: 'enemy:telegraph',
  // world / fx
  EXPLOSION: 'explosion',
  EXTRACTION_REACHED: 'extraction:reached',
  GAME_STATE: 'game:state',
  IMPACT: 'impact',
  INPUT_LOCK: 'input:lock',
  THUNDER: 'thunder',
  // objective
  OBJECTIVE_ALL: 'objective:all',
  OBJECTIVE_DONE: 'objective:done',
  OBJECTIVE_PROGRESS: 'objective:progress',
  // player
  PLAYER_DEAD: 'player:dead',
  PLAYER_HIT: 'player:hit',
  PLAYER_HIT_ENEMY: 'player:hitEnemy',
  PLAYER_JUMP: 'player:jump',
  PLAYER_LAND: 'player:land',
  PLAYER_RESCUED: 'player:rescued',
  PLAYER_STEP: 'player:step',
  // quality / audio / ui
  QUALITY_AUTO: 'quality:auto',
  RADIO_LINE: 'radio:line',
  SHELL_BOUNCE: 'shell:bounce',
  UI_CLICK: 'ui:click',
  UI_HOVER: 'ui:hover',
  // weapon
  WEAPON_DRY: 'weapon:dry',
  WEAPON_FIRE: 'weapon:fire',
  WEAPON_RELOAD: 'weapon:reload',

  // 兼容别名（v1 遗留，test.mjs 依赖，勿删）
  ENTITY_DAMAGE: 'enemy:hit',
  ENTITY_KILLED: 'enemy:killed',
})

export class EventBus {
  #handlers = new Map()

  /**
   * @param {Topic|string} topic
   * @param {(payload: any) => void} fn
   * @returns {() => void} 取消订阅函数
   */
  on(topic, fn) {
    if (!this.#handlers.has(topic)) this.#handlers.set(topic, new Set())
    this.#handlers.get(topic).add(fn)
    return () => this.off(topic, fn)
  }

  /** @param {Topic|string} topic @param {(payload: any) => void} fn */
  once(topic, fn) {
    const off = this.on(topic, (p) => { off(); fn(p) })
    return off
  }

  /** @param {Topic|string} topic @param {(payload: any) => void} fn */
  off(topic, fn) {
    this.#handlers.get(topic)?.delete(fn)
  }

  /**
   * 同步派发；单个 handler 抛错不阻断其他 handler（错误走 console.error）。
   * @param {Topic|string} topic @param {any} payload
   */
  emit(topic, payload) {
    const handlers = this.#handlers.get(topic)
    if (!handlers) return
    for (const fn of [...handlers]) {
      try { fn(payload) } catch (err) { console.error(`[events] handler error on ${topic}:`, err) }
    }
  }
}
