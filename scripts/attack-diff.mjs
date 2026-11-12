#!/usr/bin/env node
// ATT&CK の公式データ（STIX）と、このサイトのマトリックス（src/data/matrix.ts）を比べる。
// ATT&CK の版が上がったときに、増えた・消えた・名前が変わった技術を先に一覧にして、作業量を見積もるためのもの。
//
//   npm run attack:diff                      最新の公式データを取ってきて比べる
//   npm run attack:diff -- path/to/file.json 手元の STIX ファイルと比べる（URL も渡せる）
//   npm run attack:diff -- --mitigations T1190 T1566
//                                            その技術の、公式の緩和策を表示する（防御側の字幕を書くときの手がかり）
//
// 違いがあれば終了コード 1、無ければ 0 で終わる。ネットワークを使うので、CI では動かさない。
import { readFile } from 'node:fs/promises'

const LATEST =
  'https://raw.githubusercontent.com/mitre-attack/attack-stix-data/master/enterprise-attack/enterprise-attack.json'
const MATRIX_FILE = new URL('../src/data/matrix.ts', import.meta.url)

const args = process.argv.slice(2)
const wantMitigations = args.includes('--mitigations')
const positional = args.filter((a) => !a.startsWith('--'))
const techniqueArgs = wantMitigations ? positional.filter((a) => /^T\d{4}$/.test(a)) : []
const source = positional.find((a) => !/^T\d{4}$/.test(a)) ?? LATEST

/** src/data/matrix.ts を読んで、戦術ごとの技術の一覧にする。「// TA0043 Reconnaissance」の行が戦術の区切り */
async function readSiteMatrix() {
  const text = await readFile(MATRIX_FILE, 'utf8')
  const tactics = []
  for (const line of text.split('\n')) {
    const tactic = /^\s*\/\/ (TA\d{4}) (.+)$/.exec(line)
    if (tactic) tactics.push({ id: tactic[1], name: tactic[2].trim(), techniques: new Map() })
    else if (tactics.length)
      for (const m of line.matchAll(/(T\d{4}) ([^|']+)/g)) tactics.at(-1).techniques.set(m[1], m[2].trim())
  }
  return tactics
}

async function readBundle(from) {
  if (/^https?:/.test(from)) {
    console.error(`公式データを取得しています: ${from}`)
    const res = await fetch(from)
    if (!res.ok) throw new Error(`取得できませんでした（${res.status}）: ${from}`)
    return res.json()
  }
  return JSON.parse(await readFile(from, 'utf8'))
}

const attackId = (o) => o.external_references?.find((r) => r.source_name === 'mitre-attack')?.external_id
const alive = (o) => !o.revoked && !o.x_mitre_deprecated

/** 公式データを、戦術ごとの技術の一覧（サブテクニックを除く）にする */
function readOfficial(bundle) {
  const objects = bundle.objects
  const byStixId = new Map(objects.map((o) => [o.id, o]))
  const version = objects.find((o) => o.type === 'x-mitre-collection')?.x_mitre_version ?? '不明'
  const matrix = objects.find((o) => o.type === 'x-mitre-matrix' && alive(o))
  const tactics = matrix.tactic_refs.map((ref) => {
    const t = byStixId.get(ref)
    return { id: attackId(t), name: t.name, shortname: t.x_mitre_shortname, techniques: new Map() }
  })
  const byShortname = new Map(tactics.map((t) => [t.shortname, t]))
  const techniques = new Map()
  for (const o of objects) {
    if (o.type !== 'attack-pattern' || o.x_mitre_is_subtechnique) continue
    const id = attackId(o)
    techniques.set(id, o)
    if (!alive(o)) continue
    for (const phase of o.kill_chain_phases ?? [])
      if (phase.kill_chain_name === 'mitre-attack') byShortname.get(phase.phase_name)?.techniques.set(id, o.name)
  }
  // 緩和策と、置き換え先（revoked-by）
  const mitigations = new Map()
  const replacedBy = new Map()
  for (const o of objects) {
    if (o.type !== 'relationship') continue
    const from = byStixId.get(o.source_ref)
    const to = byStixId.get(o.target_ref)
    if (!from || !to) continue
    if (o.relationship_type === 'revoked-by' && from.type === 'attack-pattern')
      replacedBy.set(attackId(from), `${attackId(to)} ${to.name}`)
    if (o.relationship_type === 'mitigates' && alive(o) && alive(from) && from.type === 'course-of-action') {
      const id = attackId(to)
      if (!mitigations.has(id)) mitigations.set(id, [])
      mitigations.get(id).push({ id: attackId(from), name: from.name, note: (o.description ?? '').trim() })
    }
  }
  return { version, tactics, techniques, mitigations, replacedBy }
}

const url = (id) => `https://attack.mitre.org/techniques/${id}/`
const listMitigations = (official, id, withNotes) => {
  const list = (official.mitigations.get(id) ?? []).sort((a, b) => a.id.localeCompare(b.id))
  if (!list.length) return ['      公式の緩和策: なし（検知が中心になる）']
  if (!withNotes) return [`      公式の緩和策: ${list.map((m) => `${m.id} ${m.name}`).join(' / ')}`]
  return list.map((m) => `      ${m.id} ${m.name}: ${m.note.replace(/\s+/g, ' ').replace(/\(Citation:[^)]*\)/g, '').trim()}`)
}

const [site, official] = [await readSiteMatrix(), readOfficial(await readBundle(source))]

if (wantMitigations) {
  console.log(`公式データ: Enterprise ATT&CK v${official.version}`)
  for (const id of techniqueArgs) {
    const o = official.techniques.get(id)
    console.log(`\n${id} ${o ? o.name : '（公式データに無い）'}  ${url(id)}`)
    if (o) console.log(listMitigations(official, id, true).join('\n'))
  }
  process.exit(0)
}

console.log(`公式データ: Enterprise ATT&CK v${official.version}`)
const siteCells = site.reduce((n, t) => n + t.techniques.size, 0)
const officialCells = official.tactics.reduce((n, t) => n + t.techniques.size, 0)
console.log(`このサイト: 戦術 ${site.length}・マス ${siteCells} ／ 公式: 戦術 ${official.tactics.length}・マス ${officialCells}`)

let differences = 0
let scenesToWrite = 0
let scenesToRemove = 0
const say = (line) => {
  differences++
  console.log(line)
}

// 戦術そのものの増減と並び
const siteIds = site.map((t) => t.id)
const officialIds = official.tactics.map((t) => t.id)
for (const t of official.tactics) if (!siteIds.includes(t.id)) say(`\n戦術が増えた: ${t.id} ${t.name}（技術 ${t.techniques.size} 個）`)
for (const t of site) if (!officialIds.includes(t.id)) say(`\n戦術が消えた: ${t.id} ${t.name}`)
const common = (ids, other) => ids.filter((id) => other.includes(id)).join(' ')
if (common(siteIds, officialIds) !== common(officialIds, siteIds))
  say(`\n戦術の並びが違う\n  このサイト: ${siteIds.join(' ')}\n  公式:       ${officialIds.join(' ')}`)

for (const tactic of official.tactics) {
  const mine = site.find((t) => t.id === tactic.id)
  if (!mine) continue
  if (mine.name !== tactic.name) say(`\n戦術の名前が変わった: ${tactic.id} ${mine.name} → ${tactic.name}`)
  const added = [...tactic.techniques].filter(([id]) => !mine.techniques.has(id))
  const removed = [...mine.techniques].filter(([id]) => !tactic.techniques.has(id))
  const renamed = [...tactic.techniques].filter(([id, name]) => mine.techniques.has(id) && mine.techniques.get(id) !== name)
  if (!added.length && !removed.length && !renamed.length) continue
  console.log(`\n${tactic.id} ${tactic.name}`)
  for (const [id, name] of added) {
    scenesToWrite++
    say(`  ＋ 増えた: ${id} ${name}  ${url(id)}`)
    console.log(listMitigations(official, id, false).join('\n'))
  }
  for (const [id, name] of removed) {
    scenesToRemove++
    const elsewhere = official.tactics.filter((t) => t.techniques.has(id)).map((t) => t.id)
    const old = official.techniques.get(id)
    const why = official.replacedBy.has(id)
      ? `→ ${official.replacedBy.get(id)} に置き換え`
      : old?.x_mitre_deprecated
        ? '非推奨になった'
        : elsewhere.length
          ? `この戦術から外れた（残っている戦術: ${elsewhere.join(' ')}）`
          : '公式データに無い'
    say(`  － 消えた: ${id} ${name}（${why}）`)
  }
  for (const [id, name] of renamed) say(`  ～ 名前が変わった: ${id} ${mine.techniques.get(id)} → ${name}`)
}

if (!differences) {
  console.log('\n違いはありません。マトリックスは公式データと一致しています。')
  process.exit(0)
}
console.log(`
まとめ: 違い ${differences} 件。場面を書く技術 ${scenesToWrite} 個、場面を消す技術 ${scenesToRemove} 個。
進め方は README の「ATT&CK の版が上がったとき」を参照。`)
process.exit(1)
