import { useCallback, useRef, useState } from 'react'
import { Matrix } from './components/Matrix'
import { Stage } from './components/Stage'
import { TechniqueTable } from './components/TechniqueTable'
import { TACTICS } from './data/tactics'
import type { NowPlaying, Player } from './player/player'
import { indexOfExample } from './player/timeline'

const TECHNIQUE_COUNT = new Set(TACTICS.flatMap((t) => t.examples.map((e) => e.id))).size

const TAG = { a: '攻撃', d: '防御' } as const

export default function App() {
  const player = useRef<Player | null>(null)
  const [now, setNow] = useState<NowPlaying | null>(null)
  const [playing, setPlaying] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const onPlayer = useCallback((p: Player | null) => {
    player.current = p
  }, [])

  const pick = useCallback((tactic: number, techniqueId: string) => {
    const p = player.current
    if (!p) return
    const index = indexOfExample(p.timeline, tactic, techniqueId)
    if (index >= 0) p.show(index, true)
  }, [])

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
          の技術を、アニメーションで見て回れます。本編はひとつの侵入を最初から最後まで追う約2分のループです。マトリックスの技術を押すと、その技術の場面に飛べます。
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
            onChange={(e) => player.current?.setIncludeExtras(e.target.checked)}
          />
          本編以外の技術も続けて再生
        </label>
      </div>

      <p className="mxnote">赤いドクロは攻撃が成功した合図、青い盾は防御側の対策です。</p>
      <p className="mxnote">
        ATT&amp;CK マトリックス（Enterprise
        v20）。列が戦術、その下が技術です。どの技術も押すと再生できます。太字は本編で通る技術、赤い実線の枠は専用の場面で描いた技術、点線の枠は戦術ごとの共通の絵で見せる技術（簡易表示）です。列の見出しを押すと、その戦術の先頭に飛びます。サブテクニックは省略しています。
      </p>
      <Matrix tactic={now?.scene.tactic ?? -1} techniqueId={now?.scene.techniqueId} onPick={pick} />

      <section>
        <h2>15の戦術と、すべての技術</h2>
        <TechniqueTable onPick={pick} />
      </section>

      <section className="notes">
        <h2>見るときの注意</h2>
        <p>
          戦術は攻撃者の「目的」で、決まった手順ではありません。実際の攻撃では順番が前後したり、同じ戦術を繰り返したり、使わない戦術があったりします。動画では表の左から右へ順に並べています。
        </p>
        <p>
          太字の技術をつなぐと、ひとつの侵入の流れ（本編）になります。それ以外の技術は、同じ戦術を別の手口で進めた場合を一場面ずつ描いたもので、本編の続きではありません。
        </p>
        <p>
          点線の枠の技術（簡易表示）は、その技術だけの仕組みまでは描いていません。絵は戦術ごとに共通で、「その戦術で何をねらうのか」を示すものです。技術ごとの違いは、字幕の説明で読み取ってください。同じ技術が複数の戦術に載っている場合は、戦術ごとに説明を分けています。
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
