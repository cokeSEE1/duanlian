// 事件总线（冻结接口 v1）：模块间通信的唯一通道。
// 规则：模块之间不直接 import 对方的内部符号；跨模块通知一律走 Topics。
// 改动 topic 名或 payload 结构 = 接口变更，单独出 PR 并在 docs/MIGRATION.md 登记版本。

/** @typedef {'entity.spawn'|'entity.damage'|'entity.kill'|'weapon.fire'|'weapon.reload'|'player.damage'|'player.health'|'objective.progress'|'objective.complete'|'quality.change'|'frame.stats'|'audio.play'} Topic */

export const Topics = Object.freeze({
  ENTITY_SPAWN: 'entity.spawn',
  ENTITY_DAMAGE: 'entity.damage',
  ENTITY_KILLED: 'entity.kill',
  WEAPON_FIRED: 'weapon.fire',
  WEAPON_RELOADED: 'weapon.reload',
  PLAYER_DAMAGED: 'player.damage',
  PLAYER_HEALTH: 'player.health',
  OBJECTIVE_PROGRESS: 'objective.progress',
  OBJECTIVE_COMPLETE: 'objective.complete',
  QUALITY_CHANGED: 'quality.change',
  FRAME_STATS: 'frame.stats',
  AUDIO_PLAY: 'audio.play',
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
