// 世界数据 schema（冻结接口 v2）。这里只冻结「字段名与语义」；数值以现引擎实现为准，carve 时回填并登记到 docs/MIGRATION.md。
// 并行开发纪律：改 schema 先出 schema PR 合并，再各自实现。
// v2：枚举/字段对齐引擎真实实现（敌人仅 hound/gull，objective state=live/cutting/cut，实体字段=type/pos/hp/alive/active，Pr 与 ob() 真实字段回填）。

/**
 * 实体类型。敌人三类：hound（机械猎犬，四足地面主力）/ gull（机械飞鸥，四旋翼无人机）/ sentinel（重装四足机甲，图 1 关底 boss）。
 * 注意：turret 是 hound 模型上的炮塔骨骼、guard 是场景道具名（guard_booth）、drone 是音频名（music_drone），
 * 它们不是敌人类型。relay = 中继目标；prop = 道具（具体变体名由 EntityRecord.tags 承载）。
 * @typedef {'hound'|'gull'|'relay'|'prop'|'sentinel'} EntityKind
 */

/**
 * 实体记录。pos 用 three 的 Vector3 语义（{x,y,z}）。
 * @typedef {object} EntityRecord
 * @property {EntityKind} type       实体类型（prop 实体的具体变体名由 tags 承载）
 * @property {{x:number,y:number,z:number}} pos  世界坐标（THREE Vector3 语义）
 * @property {number} hp             生命值
 * @property {boolean} alive         是否存活
 * @property {boolean} active        是否激活（敌人出生时 inactive，进入战斗才 active）
 * @property {'standard'|'suppressor'|'elite'|'env'} variant  敌人变体（standard 默认 / suppressor 远程压制 / elite 护盾精英 / env 环境联动）
 * @property {string[]} tags         道具变体名（container20/container40/container40hc/crate_wood/barrel/…），兼作 AI/渲染/音频订阅 tag
 */

/**
 * 武器定义（对齐 game 模块 WEAPON_DEFS 真实字段，D 路三武器 pac9/shotgun/rifle）。
 * @typedef {object} WeaponRecord
 * @property {string} id              武器 id（pac9 / shotgun / rifle）
 * @property {string} name            显示名
 * @property {'auto'|'pump'|'semi'} mode  射击模式（auto 自动 / pump 泵动 / semi 半自动）
 * @property {number} damage          单颗弹丸伤害（霰弹枪按每颗计，×pellets）
 * @property {number} rpm             射速（发/分）
 * @property {number} magSize         弹匣容量
 * @property {number} reserve         备用弹药
 * @property {number} spreadBase      基础散布（弧度；越小越准，pac9 0.0125 / shotgun 0.055 / rifle 0.004）
 * @property {number} range           射程（米）
 * @property {number} pellets         单次击发弹丸数（霰弹枪 8，其余 1）
 * @property {number} reloadTactical  战术换弹时长（秒）
 * @property {number} reloadEmpty     空仓换弹时长（秒）
 */

/**
 * 目标（现在 = 切断 3 处中继；多阶段关卡时扩展 type 与阶段字段）。
 * state 沿 live → cutting → cut 推进（存活 → 切割中 → 已切断），由 game 模块驱动、引擎 object.userData.setState 落地。
 * @typedef {object} ObjectiveRecord
 * @property {string} id
 * @property {'relay'} type
 * @property {{x:number,y:number,z:number}} position
 * @property {'live'|'cutting'|'cut'} state
 */

/**
 * 画质档位（对齐渲染模块 Pr 表真实字段）。
 * @typedef {object} QualityTier
 * @property {number} scale         分辨率缩放（0.7 / 0.85 / 1）
 * @property {number} shadow        阴影贴图边长（1024 / 2048 / 4096）
 * @property {number} tex           纹理档（256 / 512 / 1024 / 2048）
 * @property {number} volSteps      体积光步数（10 / 12 / 16 / 24 / 40）
 * @property {boolean} ao           SSAO 开关（采样数由档名派生：低 8 / 中 12 / 高 16）
 * @property {number} planar        平面反射 RT 缩放（0 / 0.5 / 1）
 * @property {boolean} bloom        bloom 开关
 * @property {boolean} motionBlur   运动模糊开关
 * @property {number} rain          雨量（0.4 ~ 1）
 */

/**
 * 关卡布局（level 模块 ob() 的产出契约）。
 * @typedef {object} WorldLayout
 * @property {{pos:{x:number,y:number,z:number}, yaw:number}} playerStart   玩家出生点
 * @property {ObjectiveRecord[]} objectives                                 中继目标（relay_a/b/c 三处）
 * @property {{pos:{x:number,y:number,z:number}, radius:number}} extraction 撤离点
 * @property {Array<{pos:{x:number,y:number,z:number}, zone:string, type:'air'|'ground'}>} enemySpawns 敌人生成点
 * @property {Array<{name:string, min:[number,number,number], max:[number,number,number]}>} zones 区域（gate/yard/shed/quay 等）
 * @property {Array<{min:{x:number,y:number,z:number}, max:{x:number,y:number,z:number}}>} interiorBoxes 室内包围盒
 * @property {Array<{pos:[number,number,number], look:[number,number,number]}>} cinematicPath 开场运镜路径
 * @property {Array<{x:number,y:number,z:number}>} coverPoints               掩体点
 * @property {Array} skylights                                                天窗
 * @property {Array} shedLights                                               库房灯
 * @property {{stairsFoot:{x:number,y:number,z:number}, roof:{x:number,y:number,z:number}}} vantage 制高点
 * @property {object} stats                                                   统计（labelsAtlased/containers/props/tris/meshes）
 */
