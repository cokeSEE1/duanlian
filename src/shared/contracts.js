// 模块契约（冻结接口 v2）：每个从 bundle carve 出来的模块必须导出同一套生命周期。
// 目的：多 agent 并行时，集成方只看这三个入口 + events 订阅，不关心模块内部。
// v2 变更：EntityKinds / GameContext / RenderContext 对齐引擎真实实现（AI 每帧热循环依赖的注入服务、输入工厂完整接口、渲染模块公开面）。

/** @typedef {'hound'|'gull'|'relay'|'prop'} EntityKind */
export const EntityKinds = Object.freeze(['hound', 'gull', 'relay', 'prop'])

/** 模块必须导出的生命周期入口名 */
export const ModuleLifecycle = Object.freeze({ create: 'create', update: 'update', dispose: 'dispose' })

/**
 * 渲染上下文：render 模块 create 时产出、其余模块只读消费。
 * @typedef {object} RenderContext
 * @property {import('three').WebGLRenderer} renderer  NoToneMapping + sRGB 输出，HDR 链自管
 * @property {import('three').Scene} scene
 * @property {import('three').PerspectiveCamera} camera
 * @property {import('three').PerspectiveCamera} viewCamera   第一人称武器相机（近裁面独立，避免武器穿模）
 * @property {import('three').DirectionalLight} sun           唯一投影光源（PCSS 阴影）
 * @property {import('three').Texture} env                    PMREM 烘焙的天空环境贴图
 * @property {object} quality                                 当前档位（见 schema.js QualityTier）
 * @property {object} post                                    后期参数对象（bloom/SSAO/tonemapping/TAA 等可调项）
 * @property {number} exposure                                曝光值
 * @property {{width:number,height:number,scale:number}} resolution  渲染分辨率（含动态缩放）
 * @property {(pass: (renderer: import('three').WebGLRenderer, scene: import('three').Scene, camera: import('three').PerspectiveCamera) => void) => void} addPrePass  注册合成前额外 pass
 * @property {(world: unknown) => void} renderWorld           渲染整个世界（合成前主绘制入口）
 * @property {(tier: object) => void} setQuality              切换画质档位
 * @property {object} stats                                   帧统计（FPS/帧时间等）
 * @property {(layout: import('./schema.js').WorldLayout) => void} onLevelReady  关卡布局就绪回调
 * @property {number} frame                                   当前帧序号
 * @property {unknown} lightPool                              灯光池（复用光源实例）
 * @property {(position: {x:number,y:number,z:number}) => import('three').Texture} captureInteriorProbe  烘焙室内反射探针
 * @note TAA（时间抗锯齿）：由画质档名决定，test/low 自动关、medium/high/ultra 自动开；`?taa=0` URL 参数可强制关。反馈强度为 post.taaFeedback（默认 0.12）。
 */

/**
 * 游戏帧上下文：每帧传给所有模块的 update。
 * @typedef {object} GameContext
 * @property {import('./events.js').EventBus} events
 * @property {import('three').Scene} scene
 * @property {import('three').PerspectiveCamera} camera
 * @property {object} input     输入完整接口（game 模块产出）
 * @property {number} dt         秒
 * @property {number} time       累计秒
 * @property {object} physics    碰撞/查询：raycast、lineOfSight、groundHeight
 * @property {object} nav        寻路：findPath、replan、卡住检测
 * @property {object} combat     战斗：enemyShot、playerShot、explode
 * @property {object} level      关卡查询：coverPoints、vantage、skylights、shedLights、interiorBoxes、cinematicPath、objectives、extraction
 * @property {object} player     玩家只读快照（位置/朝向/生命/弹药等）
 * @property {object} weapon     武器系统（game 模块产出）：equip(id)/nextWeapon/prevWeapon/currentId/setVisible 等；对应引擎 `i.weapon` 武器视件对象
 * @property {() => number} rng  种子随机（mulberry32 fork，禁止 Math.random）
 */

/**
 * 输入对象（game 模块的输入工厂产出，`v_`）。
 * @typedef {object} InputState
 * @property {{x:number,y:number}} move      移动轴
 * @property {{x:number,y:number}} look      视角增量
 * @property {boolean} fire                  开火
 * @property {boolean} ads                   瞄准
 * @property {boolean} sprint                冲刺
 * @property {boolean} crouch                蹲伏
 * @property {(code:string) => boolean} down        键是否按下
 * @property {(code:string) => boolean} pressed     本帧刚按下
 * @property {() => void} requestLock       请求指针锁定
 * @property {(enabled:boolean) => void} setGameplay  切换 gameplay 输入态
 * @property {object} touch                 触屏输入
 * @property {object} gamepad               手柄输入
 * @property {'gameplay'|'menu'|string} mode 输入模式
 * @property {number} sensitivity           灵敏度
 * @property {boolean} invertY               Y 轴反转
 * @property {() => void} nextWeapon        切换下一把武器
 * @property {() => void} prevWeapon        切换上一把武器
 */

/**
 * 模块生命周期约定（与 ModuleLifecycle 对应）：
 *   export function create(ctx: GameContext|RenderContext): object  — 初始化，可返回模块私有句柄
 *   export function update(ctx: GameContext, handle: object): void   — 每帧调用（渲染模块在合成前）
 *   export function dispose(handle: object): void                    — 释放 GPU/监听资源
 */
