// 世界数据 schema（冻结接口 v1）。这里只冻结「字段名与语义」；数值以现引擎实现为准，carve 时回填并登记到 docs/MIGRATION.md。
// 并行开发纪律：改 schema 先出 schema PR 合并，再各自实现。

/** @typedef {'hound'|'guard'|'turret'|'drone'|'relay'|'prop'} EntityKind */

/**
 * 实体记录。position/rotation 用 three 的 Vector3/Quaternion 语义（x,y,z + yaw）。
 * @typedef {object} EntityRecord
 * @property {string} id            稳定唯一 ID（关卡内不重复）
 * @property {EntityKind} kind
 * @property {{x:number,y:number,z:number}} position
 * @property {number} yaw
 * @property {number} health
 * @property {boolean} alive
 * @property {string[]} tags        供 AI/渲染/音频按 tag 订阅，不按类型硬编码
 */

/**
 * 目标（现在 = 切断 3 处中继；多阶段关卡时扩展 type 与阶段字段）。
 * @typedef {object} ObjectiveRecord
 * @property {string} id
 * @property {'relay'} type
 * @property {{x:number,y:number,z:number}} position
 * @property {'pending'|'active'|'done'|'failed'} state
 */

/**
 * 画质档位。字段名冻结；数值（resScale/shadowMapSize/planar/ssaoSamples/bloomLevels/pixelBudget 等）
 * 以 render 模块 carve 时的现实现为准回填，不在此编造。
 * @typedef {object} QualityTier
 * @property {number} resScale        动态分辨率基准（帧时间自适应会在此上下浮动）
 * @property {number} shadowMapSize   太阳阴影贴图边长
 * @property {number} planar          平面反射 RT 缩放
 * @property {number} ssaoSamples     SSAO Vogel 采样数
 * @property {number} bloomLevels     bloom 级数
 */

/**
 * 关卡布局（程序化排布的输入/输出契约，world 模块负责产出）。
 * @typedef {object} WorldLayout
 * @property {number} seed
 * @property {{min:{x:number,y:number,z:number},max:{x:number,y:number,z:number}}} bounds
 * @property {EntityRecord[]} entities
 * @property {ObjectiveRecord[]} objectives
 */
