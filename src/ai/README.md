# ai/ — 敌人 AI（待 carve）

职责：感知、状态机（patrol → alert → engage）、四类敌人行为（hound 主力 / guard / turret / drone）。

将迁入（bundle 内锚点）：hound 感知与追击逻辑、guard 巡逻路线、turret 扫描与射击、drone 空中支援路径。

下一步（拆出后）：squad 协同（包抄、交叉火力、掩护推进）+ 新增远程压制型/精英型（护盾两阶段）/环境联动型敌人。跨模块通信只走 `src/shared/events.js`。