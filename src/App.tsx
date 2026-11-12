import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Matrix } from './components/Matrix'
import { Stage } from './components/Stage'
import { TechniqueTable } from './components/TechniqueTable'
import { GROUPS, type Group } from './data/groups'
import { groupUrl } from './data/official'
import { TACTICS } from './data/tactics'
import type { NowPlaying, Player } from './player/player'
import { buildTimeline, indexOfExample, playlistOf } from './player/timeline'

const TECHNIQUE_COUNT = new Set(TACTICS.flatMap((t) => t.examples.map((e) => e.id))).size

const TAG = { a: '攻撃', d: '防御' } as const

/** 場面の並び。再生機が持っているものと同じ（データから決まるので、作り直しても同じ並びになる） */
const TIMELINE = buildTimeline()
const groupById = (id: string) => GROUPS.find((g) => g.id === id) ?? null
/** URL の # がグループID（#G0007）なら、そのグループ */
const groupInHash = () => (/^#G\d{4}$/.test(location.hash) ? groupById(location.hash.slice(1)) : null)

export default function App() {
  const player = useRef<Player | null>(null)
  const [now, setNow] = useState<NowPlaying | null>(null)
  const [playing, setPlaying] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [group, setGroup] = useState<Group | null>(null)
  /** 選んだグループが使った技術と、その場面の並び（マトリックスの左から右） */
  const used = useMemo(() => (group ? new Set(group.techniques) : null), [group])
  const playlist = useMemo(() => (group ? playlistOf(TIMELINE, group.techniques) : []), [group])

  const onPlayer = useCallback((p: Player | null) => {
    player.current = p
  }, [])

  const pick = useCallback((tactic: number, techniqueId: string) => {
    const p = player.current
    if (!p) return
    const index = indexOfExample(p.timeline, tactic, techniqueId)
    if (index >= 0) p.show(index, true)
  }, [])

  /** グループを選ぶ（null で解除）。選んだら、そのグループの最初の技術から再生する */
  const chooseGroup = useCallback((next: Group | null, fromUser = true) => {
    setGroup(next)
    const p = player.current
    if (!p) return
    const list = next ? playlistOf(p.timeline, next.techniques) : []
    p.setPlaylist(next ? list : null)
    if (list.length) p.show(list[0], fromUser)
  }, [])

  // #G0007 の形の URL で開いたら、そのグループを選んだ状態にする
  useEffect(() => {
    const apply = () => {
      const fromHash = groupInHash()
      if (fromHash) chooseGroup(fromHash, false)
    }
    apply()
    window.addEventListener('hashchange', apply)
    return () => window.removeEventListener('hashchange', apply)
  }, [chooseGroup])

  const place = now ? playlist.indexOf(now.index) : -1
  const side = now?.caption[2] ?? ''
  const tag = side ? TAG[side] : now?.scene.kind === 'outro' ? 'まとめ' : '導入'
  const text =
    error ?? now?.caption[3] ?? 'MITRE ATT&CK は、攻撃者の目的を15の「戦術」に整理した知識ベースです。'

  return (
    <div className="wrap">
      <header>
        <h1>ATT&amp;CK Tactics Tour</h1>
        <p>
          MITRE ATT&amp;CK（Enterprise v20）の{TACTICS.length}の戦術と{TECHNIQUE_COUNT}
          の技術を、アニメーションで見て回れます。本編はひとつの侵入を最初から最後まで追う約2分15秒のループです。マトリックスの技術を押すと、その技術の場面に飛べます。
        </p>
      </header>

      <Stage now={now} onPlayer={onPlayer} onChange={setNow} onPlaying={setPlaying} onError={setError} />

      <div className="cap">
        <span className={`tag ${side}`}>{tag}</span>
        <span className="txt">{text}</span>
      </div>

      <div className="ctl">
        <button type="button" onClick={() => player.current?.prev()}>
          ◀ 前の場面
        </button>
        <button type="button" onClick={() => player.current?.toggle()}>
          {playing ? '一時停止' : '再生'}
        </button>
        <button type="button" onClick={() => player.current?.next()}>
          次の場面 ▶
        </button>
        <label className="ck" htmlFor="all">
          <input
            type="checkbox"
            id="all"
            disabled={!!group}
            onChange={(e) => player.current?.setIncludeExtras(e.target.checked)}
          />
          本編以外の技術も続けて再生
        </label>
      </div>

      <div className="grp">
        <label htmlFor="grp">攻撃グループで見る</label>
        <select id="grp" value={group?.id ?? ''} onChange={(e) => chooseGroup(groupById(e.target.value))}>
          <option value="">（選ばない）</option>
          {GROUPS.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}（{g.techniques.length}）
            </option>
          ))}
        </select>
        {group && (
          <>
            <button type="button" onClick={() => chooseGroup(group)}>
              ▶ 最初から
            </button>
            <button type="button" onClick={() => chooseGroup(null)}>
              解除
            </button>
          </>
        )}
      </div>
      {group && (
        <p className="mxnote" role="status">
          <b>{group.name}</b>（
          <a href={groupUrl(group.id)} target="_blank" rel="noopener noreferrer">
            {group.id}
          </a>
          {group.aliases.length > 0 && `、別名 ${group.aliases.join('、')}`}
          ）が使ったと記録されている技術は {group.techniques.length} 種類で、マトリックスの {playlist.length}{' '}
          マスが光っています{place >= 0 && `（いま ${place + 1} マス目）`}
          。公開された報告に基づく記録で、使った順番までは分かりません。ここでは、マトリックスの左の戦術から右へ順に再生します。{' '}
          <a href={`#${group.id}`}>このグループへのリンク</a>
        </p>
      )}

      <p className="mxnote">赤いドクロは攻撃が成功した合図、青い盾は防御側の対策です。</p>
      <p className="mxnote">
        ATT&amp;CK マトリックス（Enterprise
        v20）。列が戦術、その下が技術です。どの技術も押すと再生できます。太字は本編で通る技術、赤い枠はそれ以外の技術で、どの技術にも専用の場面があります。列の見出しを押すと、その戦術の先頭に飛びます。サブテクニックは省略しています。
      </p>
      <Matrix tactic={now?.scene.tactic ?? -1} techniqueId={now?.scene.techniqueId} onPick={pick} used={used} />

      <section>
        <h2>15の戦術と、すべての技術</h2>
        <p className="mxnote">
          「防御側の打ち手」は、MITRE ATT&amp;CK
          公式サイトの各技術のページにある緩和策（Mitigations）と検知（Detection）をもとに、代表的なものを一文にまとめたものです。原文（英語）は、各行の公式ページへのリンクから確認できます。
        </p>
        <TechniqueTable onPick={pick} />
      </section>

      <section className="notes">
        <h2>見るときの注意</h2>
        <p>
          戦術は攻撃者の「目的」で、決まった手順ではありません。実際の攻撃では順番が前後したり、同じ戦術を繰り返したり、使わない戦術があったりします。動画では表の左から右へ順に並べています。
        </p>
        <p>
          太字の技術をつなぐと、ひとつの侵入の流れ（本編）になります。それ以外の技術は、同じ戦術を別の手口で進めた場合を一場面ずつ描いたもので、本編の続きではありません。同じ技術が複数の戦術に載っている場合は、戦術ごとに場面と説明を分けています。
        </p>
        <p>
          v19（2026年4月）で、従来の「防御回避（Defense Evasion）」が Stealth と Defense Impairment
          の二つに分かれ、戦術は15になりました。この二つの日本語名「ステルス」「防御の妨害」は定訳がまだ見当たらないため、仮の訳です。
        </p>
      </section>

      <footer>
        MITRE ATT&amp;CK Enterprise v20（2026年10月公開）の内容をもとにした図解です。
        <ul>
          <li>
            <a href="https://attack.mitre.org/tactics/enterprise/">Enterprise Tactics（MITRE ATT&amp;CK）</a>
          </li>
          <li>
            <a href="https://attack.mitre.org/resources/updates/updates-april-2026/">
              Updates - April 2026（v19 の変更点）
            </a>
          </li>
          <li>
            <a href="https://attack.mitre.org/resources/updates/">Updates（最新版の変更点）</a>
          </li>
        </ul>
        <p>
          © The MITRE Corporation. This work is reproduced and distributed with the permission of The MITRE
          Corporation. MITRE ATT&amp;CK® は The MITRE Corporation の登録商標です。本サイトは MITRE
          とは無関係の非公式な解説です。
        </p>
      </footer>
    </div>
  )
}
