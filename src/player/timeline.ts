// 再生の順番。データ（TACTICS）から場面の並びを作り、次にどの場面へ進むかを決める。
// 画面にも 3D にも触れないので、ここだけで試験できる。
import { MATRIX } from '../data/matrix'
import { TACTICS, type Caption, type Tactic } from '../data/tactics'

export type TimelineScene = {
  /** intro=導入、story=本編の技術、extra=別の手口の例、outro=まとめ */
  kind: 'intro' | 'story' | 'extra' | 'outro'
  /** TACTICS の添字。導入とまとめは -1 */
  tactic: number
  /** 技術ID（導入とまとめには無い） */
  techniqueId?: string
  /** 「T1595 Active Scanning」の形の表示名 */
  title?: string
  duration: number
  captions: Caption[]
}

/** 防御側の番に切り替わる時刻（秒） */
export const DEFENSE_AT = 4.6

const INTRO =
  'MITRE ATT&CK は、攻撃者の目的を15の「戦術」に整理した知識ベース。ひとつの侵入を例に、順に見ていきます。'
const OUTRO =
  'ここまでが15の戦術。実際の攻撃では順番が前後し、すべてを使うとは限らない。どの段階でも、気づいて止める機会がある。'

/** マトリックスに載っている技術名を引く */
export function techniqueTitle(tactic: number, id: string): string {
  const found = MATRIX[tactic]?.find((x) => x.id === id)
  return found ? `${id} ${found.name}` : id
}

/** 導入 → 戦術ごとに（本編の技術、別の手口の例…） → まとめ、の順に並べる */
export function buildTimeline(tactics: Tactic[] = TACTICS): TimelineScene[] {
  const out: TimelineScene[] = [{ kind: 'intro', tactic: -1, duration: 5, captions: [[0, 5, '', INTRO]] }]
  tactics.forEach((tactic, k) => {
    tactic.examples.forEach((e, j) => {
      const duration = e.duration ?? 7
      out.push({
        kind: j === 0 ? 'story' : 'extra',
        tactic: k,
        techniqueId: e.id,
        title: techniqueTitle(k, e.id),
        duration,
        captions: e.captions ?? [
          [0, DEFENSE_AT, 'a', e.attack],
          [DEFENSE_AT, duration, 'd', e.defense],
        ],
      })
    })
  })
  out.push({ kind: 'outro', tactic: -1, duration: 7, captions: [[0, 7, '', OUTRO]] })
  return out
}

/** 時刻 t に出す字幕 */
export function captionAt(scene: TimelineScene, t: number): Caption {
  return scene.captions.find((c) => t >= c[0] && t < c[1]) ?? scene.captions[scene.captions.length - 1]
}

/**
 * 次（dir=1）または前（dir=-1）の場面の添字を返す。端までいくと反対側へ回る。
 * includeExtras が false なら、別の手口の例は飛ばして本編だけをたどる。
 */
export function step(timeline: TimelineScene[], index: number, dir: 1 | -1, includeExtras: boolean): number {
  const n = timeline.length
  let i = index
  do {
    i = (i + dir + n) % n
  } while (timeline[i].kind === 'extra' && !includeExtras)
  return i
}

/** 技術IDの場面の添字（無ければ -1） */
export function indexOfTechnique(timeline: TimelineScene[], id: string): number {
  return timeline.findIndex((s) => s.techniqueId === id)
}

/**
 * URL の # を読む。#T1190 はその技術の場面、#TA0001 はその戦術の本編の場面。
 * #T1190-t34 のように -t を付けると、3.4 秒の位置で止めた状態で開く（確認用）。
 */
export function parseHash(
  timeline: TimelineScene[],
  hash: string,
  tactics: Tactic[] = TACTICS,
): { index: number; pauseAt?: number } | null {
  const m = /^#(TA?\d{4})(?:-t(\d+))?$/.exec(hash)
  if (!m) return null
  const index = m[1].startsWith('TA')
    ? timeline.findIndex((s) => s.kind === 'story' && tactics[s.tactic].id === m[1])
    : indexOfTechnique(timeline, m[1])
  if (index < 0) return null
  return m[2] ? { index, pauseAt: Number(m[2]) / 10 } : { index }
}
