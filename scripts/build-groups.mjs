#!/usr/bin/env node
// ATT&CK の公式データ（STIX）から、攻撃グループごとの「使った技術」の一覧を作り、src/data/groups.ts に書き出す。
//
//   npm run attack:groups                      最新の公式データから作る
//   npm run attack:groups -- path/to/file.json 手元の STIX ファイルから作る（URL も渡せる）
//
// サブテクニックは親の技術にまとめる（このサイトのマトリックスは、サブテクニックを省いているため）。
// ネットワークを使うので、CI では動かさない。ATT&CK の版を上げたときに、手で実行して結果をコミットする。
import { readFile, writeFile } from 'node:fs/promises'

const LATEST =
  'https://raw.githubusercontent.com/mitre-attack/attack-stix-data/master/enterprise-attack/enterprise-attack.json'
const OUT = new URL('../src/data/groups.ts', import.meta.url)
/** 別名は、報告によって呼び名が違うので多めに載せる（よく知られた呼び名が後ろのほうにあることがある） */
const MAX_ALIASES = 12

const source = process.argv.slice(2).find((a) => !a.startsWith('--')) ?? LATEST
let bundle
if (/^https?:/.test(source)) {
  console.error(`公式データを取得しています: ${source}`)
  const res = await fetch(source)
  if (!res.ok) throw new Error(`取得できませんでした（${res.status}）: ${source}`)
  bundle = await res.json()
} else bundle = JSON.parse(await readFile(source, 'utf8'))

const objects = bundle.objects
const byStixId = new Map(objects.map((o) => [o.id, o]))
const attackId = (o) => o.external_references?.find((r) => r.source_name === 'mitre-attack')?.external_id
const alive = (o) => !o.revoked && !o.x_mitre_deprecated
const version = objects.find((o) => o.type === 'x-mitre-collection')?.x_mitre_version ?? '不明'

const used = new Map()
for (const o of objects) {
  if (o.type !== 'relationship' || o.relationship_type !== 'uses' || !alive(o)) continue
  const group = byStixId.get(o.source_ref)
  const technique = byStixId.get(o.target_ref)
  if (group?.type !== 'intrusion-set' || technique?.type !== 'attack-pattern' || !alive(group) || !alive(technique)) continue
  if (!used.has(group.id)) used.set(group.id, new Set())
  used.get(group.id).add(attackId(technique).split('.')[0])
}

const quote = (text) => `'${text.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`
const groups = objects
  .filter((o) => o.type === 'intrusion-set' && alive(o) && used.has(o.id))
  .map((o) => ({
    id: attackId(o),
    name: o.name,
    aliases: (o.aliases ?? []).filter((a) => a !== o.name).slice(0, MAX_ALIASES),
    techniques: [...used.get(o.id)].sort(),
  }))
  .sort((a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }))

const lines = groups.map(
  (g) => `  g(${quote(g.id)}, ${quote(g.name)}, ${quote(g.aliases.join('|'))}, ${quote(g.techniques.join(' '))}),`,
)
const text = `// 攻撃グループと、そのグループが使ったと記録されている技術。
// scripts/build-groups.mjs が ATT&CK の公式データ（Enterprise v${version}）から作ったもの。手で書き換えず、
// npm run attack:groups で作り直すこと。サブテクニックは親の技術にまとめてある。
//
// 載っているのは、公開された報告に基づく「使ったことがある」の記録で、使った順番や、使わなかった技術は分からない。

export type Group = {
  /** ATT&CK のグループID（例: G0007） */
  id: string
  name: string
  /** 別名（報告によって呼び名が違う）。一部だけ */
  aliases: string[]
  /** 使ったと記録されている技術のID。同じ技術が複数の戦術に載っていても、ここでは 1 つ */
  techniques: string[]
}

const g = (id: string, name: string, aliases: string, techniques: string): Group => ({
  id,
  name,
  aliases: aliases ? aliases.split('|') : [],
  techniques: techniques.split(' '),
})

/** 公式データの版 */
export const GROUPS_VERSION = ${quote(version)}

/** 名前の順 */
export const GROUPS: Group[] = [
${lines.join('\n')}
]
`
await writeFile(OUT, text)
const counts = groups.map((x) => x.techniques.length).sort((a, b) => a - b)
console.log(
  `src/data/groups.ts を書き出しました: v${version}、${groups.length} グループ、技術は 1 グループあたり ${counts[0]}〜${counts.at(-1)}（中央値 ${counts[counts.length >> 1]}）`,
)
