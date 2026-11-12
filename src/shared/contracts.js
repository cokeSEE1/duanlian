// 模块契约（冻结接口 v1）：每个从 bundle carve 出来的模块必须导出同一套生命周期。
// 目的：多 agent 并行时，集成方只看这三个入口 + events 订阅，不关心模块内部。

/** @typedef {'hound'|'guard'|'turret'|'drone'|'relay'|'prop'} EntityKind */
export const EntityKinds = Object.freeze(['hound', 'guard', 'turret', 'drone', 'relay', 'prop'])

/** 模块必须导出的生命周期入口名 */
export const ModuleLifecycle = Object.freeze({ create: 'create', update: 'update', dispose: 'dispose' })

/**
 * 渲染上下文：render 模块 create 时产出、其余模块只读消费。
 * @typedef {object} RenderContext
 * @property {import('three').WebGLRenderer} renderer  NoToneMapping + sRGB 输出，HDR 链自管
 * @property {import('three').Scene} scene
 * @property {import('three').PerspectiveCamera} camera
 * @property {import('three').DirectionalLight} sun     唯一投影光源（PCSS 阴影）
 * @property {import('three').Texture} env              PMREM 烘焙的天空环境贴图
 * @property {object} quality                           当前档位（见 schema.js QualityTier）
 */

/**
 * 游戏帧上下文：每帧传给所有模块的 update。
 * @typedef {object} GameContext
 * @property {import('./events.js').EventBus} events
 * @property {import('three').Scene} scene
 * @property {import('three').PerspectiveCamera} camera
 * @property {object} input      move/look/fire/ads/sprint/crouch（platform 模块产出）
 * @property {number} dt         秒
 * @property {number} time       累计秒
 */

/**
 * 模块生命周期约定（与 ModuleLifecycle 对应）：
 *   export function create(ctx: GameContext|RenderContext): object  — 初始化，可返回模块私有句柄
 *   export function update(ctx: GameContext, handle: object): void   — 每帧调用（渲染模块在合成前）
 *   export function dispose(handle: object): void                    — 释放 GPU/监听资源
 */
