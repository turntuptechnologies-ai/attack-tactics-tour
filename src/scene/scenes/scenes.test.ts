import { describe, expect, it } from 'vitest'
import { TACTICS } from '../../data/tactics'
import { buildTimeline, DEFENSE_AT, type TimelineScene } from '../../player/timeline'
import { createKit } from '../kit'
import { createWorld } from '../world'
import { createScenes } from './index'

// 画面に描かずに、舞台と場面だけを組み立てて動かす
const kit = createKit(createWorld())
const scenes = createScenes(kit)
const timeline = buildTimeline()
/** データにあるすべての技術を、「戦術ID/技術ID」の形で並べたもの */
const detailed = TACTICS.flatMap((t) => t.examples.map((e) => `${t.id}/${e.id}`))

const sceneDefOf = (s: TimelineScene) =>
  s.kind === 'intro'
    ? scenes.intro
    : s.kind === 'outro'
      ? scenes.outro
      : scenes.technique(TACTICS[s.tactic].id, s.techniqueId!)!

/** 見えている物の一覧と、その位置・大きさ・向き。攻撃者と防御者は場面が毎回置き直すので、位置は比べない */
const snapshot = () => {
  const out: number[] = []
  const visit = (o: (typeof kit.scene)['children'][number], i: number) => {
    if (!o.visible) return
    out.push(i)
    if (o !== kit.attacker && o !== kit.defender)
      out.push(...o.position.toArray(), ...o.scale.toArray(), o.rotation.x, o.rotation.y, o.rotation.z)
    o.children.forEach(visit)
  }
  kit.scene.children.forEach(visit)
  return out
}

describe('場面の対応', () => {
  it('データにあるすべての技術に、場面がある', () => {
    for (const key of detailed) {
      const [tacticId, techniqueId] = key.split('/')
      expect(scenes.technique(tacticId, techniqueId), key).toBeDefined()
    }
  })

  it('データに無い技術の場面は残っていない', () => {
    const have = Object.entries(scenes.byTactic).flatMap(([tacticId, map]) =>
      Object.keys(map).map((techniqueId) => `${tacticId}/${techniqueId}`),
    )
    expect(have.sort()).toEqual([...detailed].sort())
  })
})

describe('場面の実行', () => {
  const all = timeline.map((s) => ({
    name: `${s.kind} ${s.tactic >= 0 ? TACTICS[s.tactic].id : ''} ${s.title ?? ''}`.trim(),
    duration: s.duration,
    captions: s.captions,
    sceneDef: sceneDefOf(s),
  }))

  it.each(all)('$name は最初から最後までエラーなく動く', ({ duration, sceneDef }) => {
    for (let t = 0; t <= duration; t += 0.05) {
      kit.view.time = 3 + t
      kit.reset()
      sceneDef.run(t)
      expect(Number.isFinite(kit.view.height)).toBe(true)
      expect(kit.view.target.every(Number.isFinite)).toBe(true)
    }
  })

  it('成功の合図は、攻撃側の字幕の時間内にある', () => {
    for (const s of all)
      for (const hit of s.sceneDef.hits) {
        const caption = s.captions.find((c) => hit >= c[0] && hit < c[1])
        expect(caption?.[2], `${s.name} hit ${hit}`).toBe('a')
      }
  })

  it('本編以外の技術は、防御側の番までに成功の合図が出る', () => {
    for (const s of timeline.filter((x) => x.kind === 'extra'))
      expect(sceneDefOf(s).hits[0], s.title).toBeLessThan(DEFENSE_AT)
  })
})

describe('reset', () => {
  it('どの場面のあとでも、舞台を同じ初期状態に戻す', () => {
    kit.view.time = 1
    kit.reset()
    const clean = snapshot()
    const defs = new Map(timeline.map((s) => [`${s.kind} ${s.tactic} ${s.techniqueId ?? ''}`, sceneDefOf(s)]))
    for (const [name, sceneDef] of defs) {
      for (const t of [0.5, 2.5, 4, 6.5]) {
        kit.view.time = 1
        kit.reset()
        sceneDef.run(t)
      }
      kit.view.time = 1
      kit.reset()
      expect(snapshot(), `${name} のあと`).toEqual(clean)
    }
  })
})
