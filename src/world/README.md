# world/ — 世界与关卡（待 carve）

职责：玄鲸港区场景生成（集装箱/门架/码头/海面/室内仓库）、材质与贴图（全部运行时 Canvas 程序生成，无外部资源）、关卡程序化排布、室内 CubeCamera 探针。

将迁入（bundle 内锚点）：关卡包围盒与实体布点、`saltline-sea-1` 海面、apron 湿地材质 `onBeforeCompile` 补丁、容器堆几何、路灯/招牌 emissive。

输出契约：`src/shared/schema.js` 的 `WorldLayout`（seed/bounds/entities/objectives）。