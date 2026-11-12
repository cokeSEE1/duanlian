# ui/ — HUD 与菜单（待 carve）

职责：HUD（血量/弹药/目标提示）、无线电字幕、菜单（设置面板/结算）、触控控件 DOM。

当前：全部内联在根 index.html 的 `<style>` + engine 内 DOM 操作里；CSS 注释已标 owned by the Game agent。
将迁入：设置面板（灵敏度/音量/FOV/画质）、结算界面、目标指引。