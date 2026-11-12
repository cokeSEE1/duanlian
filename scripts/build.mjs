// 构建：src/index.template.html + src 模块 → 根目录单文件 index.html（与拆分前的原文件逐字节等价）。
// 根目录 index.html 是运行与部署的唯一产物；改动请进 src/ 后跑 npm run build 重新生成。
// --check 不写盘：pins 未漂移 + 模板重放结果与当前 index.html 一致，CI 用。
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'

const TEMPLATE = 'src/index.template.html'
const OUT = 'index.html'
const PINS = 'scripts/pins.json'

// 块 1 的 two parts 同属一个 IIFE 闭包，必须合并进同一个 <script>。
const MERGE = [
  ['src/lib/three.js', 'src/game/engine.js'],
  ['src/platform/adep.js'],
  ['src/platform/mobile.js'],
]

const check = process.argv.includes('--check')
const read = (p) => readFileSync(p, 'utf8')

let drift = 0
const pins = JSON.parse(read(PINS))
for (const [path, sha] of Object.entries(pins)) {
  const actual = createHash('sha256').update(read(path)).digest('hex')
  if (actual !== sha) {
    drift++
    console.error(`pin drift: ${path}\n  pinned  ${sha}\n  actual  ${actual}\n  如为有意修改，请在同一次提交里更新 ${PINS}`)
  }
}

let out = read(TEMPLATE)
for (const group of MERGE) {
  const tags = group.map((f) => `<script src="${f}"></script>`).join('\n')
  if (!out.includes(tags)) throw new Error(`template 缺少 script 引用: ${group.join(' + ')}`)
  // 用函数形式替换，避免文件内容里的 $& / $' 被当作替换模式
  out = out.replace(tags, () => `<script>${group.map(read).join('')}</script>`)
}

const sha = createHash('sha256').update(out).digest('hex')
const current = existsSync(OUT) ? read(OUT) : ''
const inSync = current === out

if (drift) process.exit(1)
if (check) {
  if (!inSync) {
    console.error('index.html 与 src 不同步：请运行 npm run build 后连同产物一起提交')
    process.exit(1)
  }
  console.log(`check ok: pins clean, index.html in sync (${Buffer.byteLength(out)}B sha256=${sha})`)
} else {
  writeFileSync(OUT, out)
  console.log(`built index.html ${Buffer.byteLength(out)}B sha256=${sha}${inSync ? ' (unchanged)' : ''}`)
}
