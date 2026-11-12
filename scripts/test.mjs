import assert from 'node:assert/strict'
import { test } from 'node:test'
import { EventBus, Topics } from '../src/shared/events.js'
import { EntityKinds, ModuleLifecycle } from '../src/shared/contracts.js'

test('event bus: on/emit/off/once', () => {
  const bus = new EventBus()
  const got = []
  const fn = (p) => got.push(p)
  bus.on(Topics.ENTITY_DAMAGE, fn)
  bus.emit(Topics.ENTITY_DAMAGE, { id: 1, amount: 10 })
  bus.off(Topics.ENTITY_DAMAGE, fn)
  bus.emit(Topics.ENTITY_DAMAGE, { id: 1, amount: 5 })
  assert.deepEqual(got, [{ id: 1, amount: 10 }])

  let onceCalled = 0
  bus.once(Topics.ENTITY_KILLED, () => onceCalled++)
  bus.emit(Topics.ENTITY_KILLED, {})
  bus.emit(Topics.ENTITY_KILLED, {})
  assert.equal(onceCalled, 1)
})

test('event bus: handler errors are isolated', () => {
  const bus = new EventBus()
  const order = []
  bus.on(Topics.ENTITY_DAMAGE, () => { throw new Error('boom') })
  bus.on(Topics.ENTITY_DAMAGE, () => order.push('after'))
  assert.doesNotThrow(() => bus.emit(Topics.ENTITY_DAMAGE, {}))
  assert.deepEqual(order, ['after'])
})

test('contracts: frozen tables', () => {
  assert.ok(EntityKinds.includes('hound') && EntityKinds.includes('relay'))
  assert.throws(() => { EntityKinds.push('x') })
  assert.deepEqual(Object.keys(ModuleLifecycle), ['create', 'update', 'dispose'])
})
