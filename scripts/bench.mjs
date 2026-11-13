// 帧时间基准（P1 验收基础设施）
// 依赖引擎内置 ?bench 钩子：飞越相机 + 逐帧采样，结果写到 #bench 覆盖层。
// headless 走 SwiftShader 软渲染，绝对帧时间无意义，只能当「相对退化闸门」：
// 同一台机器、同一画质档下对比 median/p99，避免 carve 引入的性能退化。
// 用法：
//   node scripts/bench.mjs                默认跑 test 档，60s 采样，打印结果
//   node scripts/bench.mjs --q medium     指定画质档（test/low/medium/high/ultra）
//   node scripts/bench.mjs --all          依次跑全部画质档
//   node scripts/bench.mjs --update       保存基准 JSON（tests/bench-baseline.json）
//   node scripts/bench.mjs                存在基准时对比，median 退化 >20% 退出码 1

import { createServer } from 'node:http'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, extname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const BASELINE_PATH = join(ROOT, 'tests', 'bench-baseline.json')

const DURATION = parseInt(process.env.BENCH_DURATION || '60', 10) // 采样时长（秒）
const REGRESS_RATIO = 1.2 // median 退化阈值：>20% 判退化
const TIERS = ['test', 'low', 'medium', 'high', 'ultra']

const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.png': 'image/png',
}

function startServer() {
  const server = createServer((req, res) => {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname)
    const file = join(ROOT, pathname === '/' ? 'index.html' : pathname)
    if (!file.startsWith(ROOT) || !existsSync(file)) {
      res.writeHead(404); res.end('not found'); return
    }
    res.writeHead(200, { 'Content-Type': MIME[extname(file)] || 'application/octet-stream' })
    res.end(readFileSync(file))
  })
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve({ server, port: server.address().port })))
}

// 解析 #bench 覆盖层文本，如：
//   frame ms avg 250.0  median 245.0  p99 300.0  => 4 fps
//   buffer 1280x720  quality test  dpr 1
function parseBench(text) {
  const num = (re) => { const m = text.match(re); return m ? parseFloat(m[1]) : null }
  return {
    avg: num(/avg\s+([\d.]+)/),
    median: num(/median\s+([\d.]+)/),
    p99: num(/p99\s+([\d.]+)/),
    fps: num(/=>\s+([\d.]+)\s+fps/),
    quality: (text.match(/quality\s+(\S+)/) || [])[1] || null,
    gpu: (text.match(/GPU:\s*(.+)/) || [])[1] || null,
    buffer: (text.match(/buffer\s+(\d+)x(\d+)/) || []).slice(1).join('x') || null,
  }
}

async function runTier(page, baseUrl, tier) {
  const url = `${baseUrl}/index.html?bench=1&seed=4207&q=${tier}`
  await page.goto(url, { waitUntil: 'domcontentloaded' })
  // #bench 覆盖层的 `t=` 是飞越采样时长（跳过 ~2s warmup 后才开始累积），
  // 等它达到 DURATION 才算采满；编译阶段（SwiftShader 同步编译 ~18s）不计入。
  await page.waitForFunction(
    ({ d }) => {
      const m = document.getElementById('bench')?.textContent?.match(/t=(\d+)/)
      return m && parseInt(m[1], 10) >= d
    },
    { d: DURATION },
    { timeout: 300000 },
  )
  const text = await page.evaluate(() => document.getElementById('bench')?.textContent || '')
  const s = parseBench(text)
  s.tier = tier
  return s
}

async function main() {
  const args = process.argv.slice(2)
  const all = args.includes('--all')
  const update = args.includes('--update')
  const qIdx = args.indexOf('--q')
  const q = qIdx >= 0 ? args[qIdx + 1] : null
  const tiers = all ? TIERS : q ? [q] : ['test']

  const browser = await chromium.launch({
    args: ['--use-angle=swiftshader', '--disable-gpu', '--force-color-profile=srgb'],
  })
  const { server, port } = await startServer()
  const baseUrl = `http://127.0.0.1:${port}`
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } })

  const results = {}
  let failed = false
  try {
    for (const tier of tiers) {
      process.stdout.write(`[bench] ${tier}: 采样 ${DURATION}s ... `)
      const r = await runTier(page, baseUrl, tier)
      results[tier] = r
      console.log(`median ${r.median}ms  p99 ${r.p99}ms  avg ${r.avg}ms  (${r.fps}fps, ${r.gpu}, ${r.buffer})`)
    }
  } finally {
    await browser.close()
    server.close()
  }

  if (update) {
    writeFileSync(BASELINE_PATH, JSON.stringify({ generated: new Date().toISOString(), results }, null, 2))
    console.log(`[bench] 基准已写入 ${BASELINE_PATH}`)
    return
  }

  if (existsSync(BASELINE_PATH)) {
    const base = JSON.parse(readFileSync(BASELINE_PATH, 'utf8')).results
    console.log('\n[bench] 对比基准（median 退化 >20% 判 FAIL）：')
    for (const tier of Object.keys(results)) {
      const cur = results[tier].median
      const prev = base[tier]?.median
      if (prev == null) { console.log(`  ${tier}: 无基准，跳过`); continue }
      const ratio = cur / prev
      const bad = ratio > REGRESS_RATIO
      if (bad) failed = true
      console.log(`  ${tier}: median ${prev}ms -> ${cur}ms (${((ratio - 1) * 100).toFixed(1)}%)${bad ? '  FAIL' : '  ok'}`)
    }
  } else {
    console.log(`\n[bench] 无基准（${BASELINE_PATH} 不存在），用 --update 生成。`)
  }

  if (failed) { console.error('[bench] 有画质档退化超阈值'); process.exit(1) }
  console.log('[bench] 完成')
}

main().catch((e) => { console.error(e); process.exit(1) })
