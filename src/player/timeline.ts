// 再生の順番。データ（TACTICS）から場面の並びを作り、次にどの場面へ進むかを決める。
// 画面にも 3D にも触れないので、ここだけで試験できる。
import { MATRIX } from '../data/matrix'
import { TACTICS } from '../data/tactics'
import type { Caption, Tactic } from '../data/types'

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

/** 自動で次の場面へ進むとき、暗転したまま次の技術の名前を見せておく秒数（技術の場面の前にだけ置く） */
export const LEAD = 1.2

const INTRO =
  'MITRE ATT&CK は、攻撃者の目的を15の「戦術」に整理した知識ベース。ひとつの侵入を例に、順に見ていきます。'
const OUTRO =
  'ここまでが15の戦術。実際の攻撃では順番が前後し、すべてを使うとは限らない。どの段階でも、気づいて止める機会がある。'

/** マトリックスに載っている技術名を引く */
export function techniqueTitle(tactic: number, id: string): string {
  const found = MATRIX[tactic]?.find((x) => x.id === id)
  return found ? `${id} ${found.name}` : id
}

/** 導入 → 戦術ごとに（本編の技術、ほかの技術…） → まとめ、の順に並べる */
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

/** 本編だけを自動で一巡したときの長さ（秒）。場面の長さに、技術の場面の前に置く間を足したもの */
export function storyLoopSeconds(timeline: TimelineScene[]): number {
  return timeline
    .filter((s) => s.kind !== 'extra')
    .reduce((n, s) => n + s.duration + (s.techniqueId ? LEAD : 0), 0)
}

/** 時刻 t に出す字幕 */
export function captionAt(scene: TimelineScene, t: number): Caption {
  return scene.captions.find((c) => t >= c[0] && t < c[1]) ?? scene.captions[scene.captions.length - 1]
}

const inStory = (scene: TimelineScene) => scene.kind !== 'extra'

/**
 * 次（dir=1）または前（dir=-1）の場面の添字を返す。端までいくと反対側へ回る。
 * includeExtras が false なら、本編（導入・各戦術の先頭の技術・まとめ）だけをたどる。
 */
export function step(timeline: TimelineScene[], index: number, dir: 1 | -1, includeExtras: boolean): number {
  const n = timeline.length
  let i = index
  do {
    i = (i + dir + n) % n
  } while (!includeExtras && !inStory(timeline[i]))
  return i
}

/** tactic 番目の戦術の、その技術の場面の添字（無ければ -1） */
export function indexOfExample(timeline: TimelineScene[], tactic: number, id: string): number {
  return timeline.findIndex((s) => s.tactic === tactic && s.techniqueId === id)
}

/**
 * 技術IDだけから場面を選ぶ。同じ技術が複数の戦術にあるときは、
 * 本編の場面を優先し、無ければ別の手口の例のうち先に並ぶものを選ぶ。どこにも無ければ -1。
 */
export function indexOfTechnique(timeline: TimelineScene[], id: string): number {
  for (const kind of ['story', 'extra'] as const) {
    const index = timeline.findIndex((s) => s.techniqueId === id && s.kind === kind)
    if (index >= 0) return index
  }
  return -1
}

/** その場面を開く # を返す。#T1190 で一意に決まるならそれを、決まらないなら #TA0003-T1078 の形にする */
export function hashFor(timeline: TimelineScene[], index: number, tactics: Tactic[] = TACTICS): string {
  const scene = timeline[index]
  if (!scene.techniqueId) return ''
  return indexOfTechnique(timeline, scene.techniqueId) === index
    ? `#${scene.techniqueId}`
    : `#${tactics[scene.tactic].id}-${scene.techniqueId}`
}

/**
 * URL の # を読む。#T1190 はその技術の場面、#TA0001 はその戦術の本編の場面、
 * #TA0003-T1078 は、その戦術に載っているその技術の場面。
 * 末尾に -t34 を付けると、3.4 秒の位置で止めた状態で開く（確認用）。
 */
export function parseHash(
  timeline: TimelineScene[],
  hash: string,
  tactics: Tactic[] = TACTICS,
): { index: number; pauseAt?: number } | null {
  const m = /^#(?:(TA\d{4})(?:-(T\d{4}))?|(T\d{4}))(?:-t(\d+))?$/.exec(hash)
  if (!m) return null
  const [, tacticId, inTactic, alone, pause] = m
  let index: number
  if (alone) index = indexOfTechnique(timeline, alone)
  else {
    const tactic = tactics.findIndex((t) => t.id === tacticId)
    index = inTactic
      ? indexOfExample(timeline, tactic, inTactic)
      : timeline.findIndex((s) => s.kind === 'story' && s.tactic === tactic)
  }
  if (index < 0) return null
  return pause ? { index, pauseAt: Number(pause) / 10 } : { index }
}
