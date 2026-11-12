# game/ — 玩法与流程（待 carve）

职责：玩家控制（桌面键鼠/手柄/移动端虚拟摇杆）、武器（fire/ads/reload/sprint 手感）、目标流程（切断 3 处中继 → 撤离）、关卡流程与结算。

当前状态：`engine.js` 是从原 index.html 整块切出的引擎闭包（与 `src/lib/three.js` 同属一个 IIFE，构建时合并回同一个 `<script>`）；carve 时按 docs/MIGRATION.md 的顺序把 render/world/ai/audio/ui 拆走后，剩余部分归本模块。

HUD/菜单样式内联在根 index.html 的 `<style>` 中（注释已标 owned by the Game agent）。