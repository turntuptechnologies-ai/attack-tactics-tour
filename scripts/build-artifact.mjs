#!/usr/bin/env node
// ビルド結果（dist/）を、1 枚の HTML にまとめる。claude.ai の Artifact に載せるためのもの。
//
//   npm run build:artifact      → artifact-out/attack-tactics-tour.html
//
// Artifact は外部のファイルを読めない（スクリプトとスタイルは 1 枚の中に入れる）。書体だけは Google Fonts から読める。
// そこで、スクリプトとスタイルを HTML に埋め込み、同梱している書体の指定を Google Fonts の読み込みに置き換える。
// Artifact 側がページの外枠（<html> や <body>）を用意するので、出力には中身だけを書く。
import { mkdir, readFile, writeFile } from 'node:fs/promises'

const DIST = new URL('../dist/', import.meta.url)
const OUT_DIR = new URL('../artifact-out/', import.meta.url)
const OUT = new URL('attack-tactics-tour.html', OUT_DIR)
const FONTS =
  'https://fonts.googleapis.com/css2?family=DotGothic16&family=Press+Start+2P&family=Zen+Kaku+Gothic+New:wght@400;700&display=swap'

const page = await readFile(new URL('index.html', DIST), 'utf8')
const find = (pattern, what) => {
  const m = pattern.exec(page)
  if (!m) throw new Error(`dist/index.html に ${what} が見つかりません。先に npm run build を実行してください。`)
  return m[1]
}
const assetUrl = (path) => new URL(path.replace(/^.*\/assets\//, 'assets/'), DIST)
const title = find(/<title>([^<]*)<\/title>/, 'title')
const script = await readFile(assetUrl(find(/<script[^>]+src="([^"]+\.js)"/, 'スクリプト')), 'utf8')
const styles = await readFile(assetUrl(find(/<link[^>]+href="([^"]+\.css)"/, 'スタイル')), 'utf8')

// 同梱の書体（@font-face）は、Artifact からは読めないファイルを指しているので外す
const css = styles.replace(/@font-face\{[^}]*\}/g, '')
if (/url\(/.test(css)) throw new Error('スタイルに、外部のファイルへの参照が残っています。')
// スクリプトを HTML に埋め込むので、途中で閉じタグと読まれる並びを避ける
if (script.includes('<!--')) throw new Error('スクリプトに "<!--" が含まれていて、そのままでは埋め込めません。')
const js = script.replace(/<\/script/gi, '<\\/script')

const html = `<title>${title}</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="stylesheet" href="${FONTS}">
<style>
${css}
</style>
<div id="root"></div>
<script type="module">
${js}
</script>
`
await mkdir(OUT_DIR, { recursive: true })
await writeFile(OUT, html)
console.log(`${OUT.pathname}（${Math.round(html.length / 1024)}KB）`)
