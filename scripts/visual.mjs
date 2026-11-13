// 固定机位截图回归（P1 验收基础设施）
// 依赖引擎内置钩子：?shot 确定性模式 + ?seed 固定种子 + ?cam 固定相机 + ?dt 固定时间步 + ?q 画质档。
// 只截 WebGL canvas（#view），绕开 HUD 字体跨机差异。
// 用法：
//   node scripts/visual.mjs            对比基线，超阈值退出码 1
//   node scripts/visual.mjs --update   重新生成基线
//   node scripts/visual.mjs --list     列出所有 shot

import { createServer } from 'node:http'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, extname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { PNG } from 'pngjs'
import pixelmatch from 'pixelmatch'
import { chromium } from 'playwright'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const BASELINE_DIR = join(ROOT, 'tests', 'baselines')

// shot 定义：name 唯一、url 为 index.html 后的 query、t 为确定性模拟时刻（秒，等 time.t >= t 后截图）
const SHOTS = [
  // t 为目标模拟时刻（秒）：headless SwiftShader 软渲染下 compile() 同步编译需 ~18s、
  // gameplay 渲染仅 ~0.8fps，故 t 取小值（12 帧）以控制单 shot 耗时在 ~35s。
  { name: 'overview', url: '?shot=1&seed=4207&q=test&dt=0.0166667&cam=0,10,0,0,-1,0&fov=74', t: 0.2 },
]

const MAX_DIFF_PIXEL_RATIO = 0.002 // 允许 0.2% 像素差异

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

async function capture(page, shot, baseUrl) {
  await page.goto(`${baseUrl}/index.html${shot.url}`)
  await page.waitForFunction(
    ({ t }) => window.__ready === true && window.__G && window.__G.time.t >= t,
    { t: shot.t },
    { timeout: 300000 },
  )
  const buf = await page.locator('#view').screenshot()
  return PNG.sync.read(buf)
}

function diff(img, baseline) {
  if (img.width !== baseline.width || img.height !== baseline.height) {
    return { ratio: 1, note: `尺寸不一致 current=${img.width}x${img.height} baseline=${baseline.width}x${baseline.height}` }
  }
  const diffCount = pixelmatch(img.data, baseline.data, null, img.width, img.height, { threshold: 0.2 })
  return { ratio: diffCount / (img.width * img.height), diffCount }
}

async function main() {
  const list = process.argv.includes('--list')
  const update = process.argv.includes('--update')
  if (list) { console.log(SHOTS.map((s) => s.name).join('\n')); return }

  mkdirSync(BASELINE_DIR, { recursive: true })
  const browser = await chromium.launch({
    args: ['--use-angle=swiftshader', '--disable-gpu', '--force-color-profile=srgb'],
  })
  const { server, port } = await startServer()
  const baseUrl = `http://127.0.0.1:${port}`
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } })

  let failed = 0
  try {
    for (const shot of SHOTS) {
      const baselinePath = join(BASELINE_DIR, `${shot.name}.png`)
      const img = await capture(page, shot, baseUrl)

      if (update || !existsSync(baselinePath)) {
        writeFileSync(baselinePath, PNG.sync.write(img))
        console.log(`[visual] ${shot.name}: ${update ? 'baseline 已更新' : 'baseline 已生成'}`)
        continue
      }

      const baseline = PNG.sync.read(readFileSync(baselinePath))
      const r = diff(img, baseline)
      if (r.ratio > MAX_DIFF_PIXEL_RATIO) {
        failed++
        console.log(`[visual] ${shot.name}: FAIL diff=${(r.ratio * 100).toFixed(3)}% (${r.diffCount}px)${r.note ? ' ' + r.note : ''}`)
      } else {
        console.log(`[visual] ${shot.name}: ok diff=${(r.ratio * 100).toFixed(3)}%`)
      }
    }
  } finally {
    await browser.close()
    server.close()
  }

  if (failed) { console.error(`[visual] ${failed}/${SHOTS.length} shots 超阈值`); process.exit(1) }
  console.log('[visual] 全部通过')
}

main().catch((e) => { console.error(e); process.exit(1) })
