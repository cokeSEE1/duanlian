// 一次性迁移脚本：把 main@73623b28 的单文件 index.html 拆成 src 模块。
// 根目录 index.html 是构建产物，保持原样不动；本脚本生成 src/index.template.html 作为构建输入。
// 块 1（three+engine）是同一个 IIFE 闭包，模板里写成相邻两个 script 标签，仅允许作为构建输入，禁止直接打开。
// 已执行完毕，仅留档可追溯；重跑要求工作区回到 main@73623b28 的 index.html。
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { dirname } from 'node:path'

const SRC = 'index.html'
const THETA_GUARD = 'window.__THREE__="180");'

const html = readFileSync(SRC, 'utf8')

function scriptSpans(text) {
  const spans = []
  const re = /<script>/g
  let m
  while ((m = re.exec(text))) {
    const innerStart = m.index + '<script>'.length
    const close = text.indexOf('</script>', innerStart)
    if (close < 0) throw new Error('unclosed <script>')
    spans.push({ tagStart: m.index, innerStart, innerEnd: close, end: close + '</script>'.length })
  }
  return spans
}

const spans = scriptSpans(html)
if (spans.length !== 3) throw new Error(`expected 3 script blocks, got ${spans.length}`)

const bundle = html.slice(spans[0].innerStart, spans[0].innerEnd)
const guardCount = bundle.split(THETA_GUARD).length - 1
if (guardCount !== 1) throw new Error(`expected exactly one __THREE__ guard, got ${guardCount}`)

const cut = bundle.indexOf(THETA_GUARD) + THETA_GUARD.length
const three = bundle.slice(0, cut)
const engine = bundle.slice(cut)
if (!engine.startsWith('function Ty(){')) throw new Error('unexpected engine start: ' + engine.slice(0, 40))

const parts = [
  { path: 'src/lib/three.js', content: three },
  { path: 'src/game/engine.js', content: engine },
  { path: 'src/platform/adep.js', content: html.slice(spans[1].innerStart, spans[1].innerEnd) },
  { path: 'src/platform/mobile.js', content: html.slice(spans[2].innerStart, spans[2].innerEnd) },
]

for (const { path, content } of parts) {
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, content)
}

// 模板与原文件的唯一差异：script 块换成 src 引用；块 1 拆成相邻两行，构建时合并回同一个 <script>。
let template = ''
let cursor = 0
const spanFiles = [
  ['src/lib/three.js', 'src/game/engine.js'],
  ['src/platform/adep.js'],
  ['src/platform/mobile.js'],
]
spans.forEach((span, i) => {
  const tags = spanFiles[i].map((f) => `<script src="${f}"></script>`).join('\n')
  template += html.slice(cursor, span.tagStart) + tags
  cursor = span.end
})
template += html.slice(cursor)
writeFileSync('src/index.template.html', template)

const pins = {}
for (const { path, content } of parts) pins[path] = createHash('sha256').update(content).digest('hex')
writeFileSync('scripts/pins.json', JSON.stringify(pins, null, 2) + '\n')

console.log(`split ok: three=${Buffer.byteLength(three)}B engine=${Buffer.byteLength(engine)}B adep=${Buffer.byteLength(parts[2].content)}B mobile=${Buffer.byteLength(parts[3].content)}B`)
console.log(`original index.html sha256=${createHash('sha256').update(html).digest('hex')}`)
