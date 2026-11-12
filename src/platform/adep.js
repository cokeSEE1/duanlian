
/* ============================================================================
 * adep 模版接入层（追加在游戏本体之后，不改游戏代码 —— 只观察 .menu 的 data-screen）：
 *   1) 模板参数消费：window.__ADEP_ENV__（data.yml 声明、serve 响应期注入，与平台静态托管同机制）；
 *      本地直开或未注入时回落内置默认值 —— 模板的地板线是零依赖可玩。
 *   2) 全网计数器：POST /api/count（契约 {"op":"get"|"add","n":1} → {"total":N}）；
 *      任务完成（菜单 complete 屏出现）+1，标题屏展示「大家已经完成了 N 次任务」；
 *      云端不可达 → 隐藏统计行（不给 0 灾难读数、不白屏）。
 *   3) 品牌页脚：标题屏显示四要素（云柯驿站 · 应用名 · 由 adep 驱动 · 备案号 · 源码已开源）。
 * ========================================================================== */
;(function () {
  'use strict'
  var ENV = window.__ADEP_ENV__ || {}
  function env(key, fallback) {
    var v = ENV[key]
    return (v == null || v === '') ? fallback : String(v)
  }
  // 模板参数与内置默认值（改默认值时同步 data.yml 的 default 与 .env.example 的注释）
  var SQUAD_NAME = env('SQUAD_NAME', '玄鲸突击小队')
  var PREMISE = env('PREMISE', '港区防御系统失控。切断三处中继，突破封锁，登船撤离。')
  var DEV_TAG = env('DEV_TAG', '使用 Fable5.2 自主研发 · 国产第一人称射击游戏 · 开发体验版')
  var APP_NAME = '断链'
  var REPO_URL = 'https://git.a.jajabjbj.top:6602/a/jimao-3a'

  var lastScreen = null
  var statEl = null
  var brandEl = null

  function post(op, n) {
    return fetch('/api/count', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(n == null ? { op: op } : { op: op, n: n }),
    })
      .then(function (r) { return r.ok ? r.json() : null })
      .catch(function () { return null })
  }

  // 模板参数落到标题屏 DOM（无覆盖时写入的就是默认值，视觉无变化）
  function applyParams(menu) {
    var squad = menu.querySelector('.m-eyebrow span:not(.m-tag):not(.m-dim)')
    if (squad) squad.textContent = SQUAD_NAME
    var premise = menu.querySelector('.m-premise')
    if (premise) premise.textContent = PREMISE
    var note = menu.querySelector('.m-title-main .m-note')
    if (note) note.textContent = DEV_TAG
  }

  // 全网统计行：拿到 >0 的总数展示计数；0 展示引导语（不给 0 读数假象）；拿不到就隐藏
  function renderStat(menu) {
    var host = menu.querySelector('.m-title-main')
    if (!host) return
    if (!statEl || !statEl.isConnected) {
      statEl = document.createElement('p')
      statEl.className = 'm-global'
      statEl.setAttribute(
        'style',
        'margin:10px 0 0;font:400 11px/1.5 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;letter-spacing:.04em;color:rgba(141,154,163,.95);'
      )
      var note = host.querySelector('.m-note')
      if (note && note.parentNode) note.parentNode.insertBefore(statEl, note.nextSibling)
      else host.appendChild(statEl)
    }
    post('get').then(function (res) {
      if (!statEl) return
      if (!res || typeof res.total !== 'number') { statEl.style.display = 'none'; return }
      if (res.total > 0) {
        statEl.style.display = ''
        statEl.textContent = '大家已经完成了 ' + res.total + ' 次任务'
      } else {
        statEl.style.display = ''
        statEl.textContent = '全网暂无完成记录 —— 第一支完成任务的小队会留名这里'
      }
    })
  }

  function mountBrand() {
    brandEl = document.createElement('div')
    brandEl.id = 'adep-brandline'
    brandEl.innerHTML =
      '云柯驿站 · ' + APP_NAME + ' · 由 adep 驱动 · 粤ICP备2026153438号-1 · ' +
      '<a href="' + REPO_URL + '" target="_blank" rel="noopener">源码已开源</a>'
    brandEl.setAttribute(
      'style',
      'position:absolute;left:0;right:0;bottom:calc(4px + env(safe-area-inset-bottom,0px));padding:0 12px;' +
        'text-align:center;font:400 10px/1.6 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;letter-spacing:.05em;' +
        'color:rgba(232,228,218,.42);text-shadow:0 1px 3px rgba(0,0,0,.8);z-index:45;pointer-events:none;' +
        'opacity:0;visibility:hidden;transition:opacity .35s ease;'
    )
    brandEl.querySelector('a').setAttribute('style', 'color:rgba(232,228,218,.62);text-decoration:none;pointer-events:auto;')
    // 必须挂进 #app：#app 是 fixed 定位、自带堆叠上下文 —— 挂 body 上时 z 值
    // 会盖过内部的 #boot(z50)/#fatal(z99)，启动加载期页脚就会漏出来
    ;(document.getElementById('app') || document.body).appendChild(brandEl)
  }

  function syncChrome(screen) {
    if (!brandEl) return
    var on = screen === 'title'
    brandEl.style.opacity = on ? '1' : '0'
    brandEl.style.visibility = on ? 'visible' : 'hidden'
  }

  function watchMenu(menu) {
    applyParams(menu)
    mountBrand()
    // 游戏在创建菜单的同一同步 tick 里就 l.show('title') 了 —— 观察器挂上时
    // 属性变更已发生，必须先按当前屏状态初始化（否则统计行/页脚永远不出现）
    var screen0 = menu.dataset.screen || 'none'
    lastScreen = screen0
    if (screen0 === 'title') renderStat(menu)
    syncChrome(screen0)
    new MutationObserver(function () {
      var screen = menu.dataset.screen || 'none'
      if (screen === 'complete' && lastScreen !== 'complete') post('add', 1)
      if (screen === 'title' && lastScreen !== 'title') renderStat(menu)
      syncChrome(screen)
      lastScreen = screen
    }).observe(menu, { attributes: true, attributeFilter: ['data-screen'] })
  }

  var menuNow = document.querySelector('.menu')
  if (menuNow) watchMenu(menuNow)
  else {
    var io = new MutationObserver(function () {
      var el = document.querySelector('.menu')
      if (el) { io.disconnect(); watchMenu(el) }
    })
    io.observe(document.body, { childList: true, subtree: true })
  }
})()
