
(function () {
  'use strict'
  var ua = navigator.userAgent
  var shortSide = Math.min(screen.width, screen.height)
  var isPhone = /iPhone|iPod/i.test(ua) || (/Android/i.test(ua) && /Mobile/i.test(ua)) || (navigator.maxTouchPoints > 1 && shortSide < 700)
  var isIOS = /iPhone|iPad|iPod/i.test(ua) || (/Macintosh/i.test(ua) && navigator.maxTouchPoints > 1)
  var hint = null

  if (isPhone) {
    hint = document.createElement('div')
    hint.id = 'rotate-hint'
    hint.innerHTML =
      '<div class="rh-phone"></div>' +
      '<div class="rh-title">请横屏游玩</div>' +
      '<div class="rh-sub">' + (isIOS ? '旋转手机，获得完整视野' : '旋转手机，或点击下方按钮') + '</div>' +
      (isIOS ? '' : '<button class="rh-btn" type="button">进入横屏</button>')
    document.body.appendChild(hint)
  }

  function isPortrait() { return window.innerHeight > window.innerWidth }
  function sync() { if (hint) hint.classList.toggle('on', isPortrait()) }

  function lockLandscape() {
    try {
      if (screen.orientation && screen.orientation.lock) {
        var p = screen.orientation.lock('landscape')
        if (p && p.catch) p.catch(function () {})
      }
    } catch (e) {}
  }

  var fsPending = false
  function immersive() {
    var el = document.documentElement
    if (document.fullscreenElement || document.webkitFullscreenElement) {
      if (isPhone) lockLandscape()
      return
    }
    if (fsPending) return
    var req = el.requestFullscreen || el.webkitRequestFullscreen
    if (!req) return
    fsPending = true
    function done() {
      fsPending = false
      if (isPhone) lockLandscape()
    }
    try {
      var p = el.requestFullscreen ? el.requestFullscreen({ navigationUI: 'hide' }) : el.webkitRequestFullscreen()
      if (p && p.then) p.then(done).catch(done)
      else done()
    } catch (e) { done() }
  }

  if (hint) {
    hint.addEventListener('click', function (e) {
      if (e.target && e.target.classList && e.target.classList.contains('rh-btn')) immersive()
    })
    window.addEventListener('resize', sync)
    window.addEventListener('orientationchange', function () { setTimeout(sync, 120) })
    if (screen.orientation && screen.orientation.addEventListener) screen.orientation.addEventListener('change', sync)
    sync()
  }

  // 浏览器不允许无手势自动全屏：第一次点击/触摸页面任意位置时进入全屏
  document.addEventListener('click', function () { immersive() }, { capture: true, once: true })

  // 进入游戏时再兜底一次（例如中途退出过全屏）
  document.addEventListener('click', function (e) {
    var t = e.target && e.target.closest ? e.target.closest('[data-act="deploy"],[data-act="resume"],[data-act="retry"],[data-act="redeploy"]') : null
    if (t) immersive()
  }, true)
})()
