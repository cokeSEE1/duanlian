// boss 冒烟测试（D 路第二波验收）：headless 下验证 sentinel 三阶段 boss 完整生命周期。
// 覆盖 spawn → phase2(≤66% hp) → phase3(≤33% hp) → killed 四段状态机 + 事件配对。
// 依赖引擎 ?shot 钩子跳过 intro 进 gameplay；boss 直接用 __G.enemies.spawn('sentinel',...) 生成，
// 走真实 damage() 入口触发击杀（直接改 hp 不判死，invulnT 护盾会拦截伤害）。
// 注意：本测试验证 ai 模块的 boss 状态机本身；「切断第 3 处中继 → bossAppear()」的 game 侧触发链
// 属游戏流程，不在本脚本覆盖范围（该处为简单三元，已静态核对）。
// 用法：node scripts/boss-smoke.mjs   任一阶段失败退出码 1

import { createServer } from 'node:http'
import { readFileSync, existsSync } from 'node:fs'
import { extname, join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.png': 'image/png',
}

function startServer() {
  const server = createServer((req, res) => {
    const pathname = decodeURIComponent(new URL(req.url, 'http://x').pathname)
    const file = join(ROOT, pathname === '/' ? 'index.html' : pathname)
    if (!file.startsWith(ROOT) || !existsSync(file)) { res.writeHead(404); res.end('nf'); return }
    res.writeHead(200, { 'Content-Type': MIME[extname(file)] || 'application/octet-stream' })
    res.end(readFileSync(file))
  })
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve({ server, port: server.address().port })))
}

const { server, port } = await startServer()
const browser = await chromium.launch()
let failures = 0

const check = (name, pass, detail) => {
  console.log(`[${pass ? 'ok' : 'FAIL'}] ${name}${detail ? ' — ' + detail : ''}`)
  if (!pass) failures++
}

try {
  const page = await browser.newPage()
  const pageErrors = []
  page.on('pageerror', (e) => pageErrors.push(e.message))
  page.on('console', (m) => { if (m.type() === 'error') pageErrors.push(m.text().slice(0, 200)) })

  await page.goto(`http://127.0.0.1:${port}/index.html?shot=1&q=test&seed=4207`, { timeout: 60000 })
  await page.waitForFunction(() => window.__ready === true, { timeout: 300000 })

  // 订阅事件 + spawn sentinel
  const spawn = await page.evaluate(() => {
    const G = window.__G
    const fired = []
    window.__bossEvents = fired
    for (const t of ['boss:spawn', 'boss:phase', 'boss:killed', 'enemy:spawn', 'enemy:killed'])
      G.events.on(t, (p) => fired.push({ t, phase: p.phase, enemyType: p.enemy && p.enemy.type }))
    let b = null, err = null
    try { b = G.enemies.spawn('sentinel', { x: 0, y: 0, z: -10 }, { variant: 'standard' }) } catch (e) { err = String(e) }
    window.__boss = b
    return { ok: !!b, err, type: b && b.type, active: b && b.active, alive: b && b.alive,
      phase: b && b.phase, maxHp: b && b.maxHp, hp: b && b.hp, fired: [...fired] }
  })
  check('spawn sentinel 返回 boss', spawn.ok && spawn.type === 'sentinel',
    spawn.err ? 'err=' + spawn.err : `type=${spawn.type} phase=${spawn.phase} hp=${spawn.hp}/${spawn.maxHp}`)
  check('spawn 状态字段', spawn.active === true && spawn.alive === true && spawn.phase === 1, `active=${spawn.active} alive=${spawn.alive}`)
  check('boss:spawn + enemy:spawn 事件',
    spawn.fired.some((e) => e.t === 'boss:spawn') && spawn.fired.some((e) => e.t === 'enemy:spawn'),
    JSON.stringify(spawn.fired))

  if (!spawn.ok) throw new Error('boss spawn failed, abort')

  // 转阶段 2（≤66%）
  await page.evaluate(() => { window.__boss.hp = window.__boss.maxHp * 0.55 })
  const p2 = await page.waitForFunction(() => window.__boss.phase === 2, { timeout: 30000 }).then(() => true).catch(() => false)
  const p2ev = await page.evaluate(() => window.__bossEvents.filter((e) => e.t === 'boss:phase'))
  check('phase2（hp≤66%）', p2 && p2ev.some((e) => e.phase === 2), `phase=${await page.evaluate(() => window.__boss.phase)} events=${JSON.stringify(p2ev)}`)

  // 转阶段 3（≤33%）
  await page.evaluate(() => { window.__boss.hp = window.__boss.maxHp * 0.2 })
  const p3 = await page.waitForFunction(() => window.__boss.phase === 3, { timeout: 30000 }).then(() => true).catch(() => false)
  const p3ev = await page.evaluate(() => window.__bossEvents.filter((e) => e.t === 'boss:phase'))
  check('phase3（hp≤33%）', p3 && p3ev.some((e) => e.phase === 3), `events=${JSON.stringify(p3ev)}`)

  // 击杀：走真实伤害入口，先清 invulnT 护盾（sPh 转阶段会加无敌帧）
  const kill = await page.evaluate(() => {
    const b = window.__boss
    b.invulnT = 0
    let r = null, err = null
    try { r = b.damage(b.maxHp * 10, b.pos, true, 'body') } catch (e) { err = String(e) }
    return { returned: r, alive: b.alive, err }
  })
  const killEvents = await page.evaluate(() => window.__bossEvents.filter((e) => e.t === 'boss:killed' || e.t === 'enemy:killed'))
  check('击杀（damage 入口）', kill.returned === true && kill.alive === false && !kill.err,
    `returned=${kill.returned} alive=${kill.alive} err=${kill.err}`)
  check('boss:killed + enemy:killed 事件',
    killEvents.some((e) => e.t === 'boss:killed') && killEvents.some((e) => e.t === 'enemy:killed'),
    JSON.stringify(killEvents))

  check('无页面运行时错误', pageErrors.length === 0, pageErrors.join(' | ').slice(0, 300))
} finally {
  await browser.close()
  server.close()
}

console.log(failures === 0 ? '\n[boss-smoke] 全部通过' : `\n[boss-smoke] ${failures} 项失败`)
process.exit(failures === 0 ? 0 : 1)
