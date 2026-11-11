import { describe, expect, it } from 'vitest'
import { TACTICS } from '../../data/tactics'
import { buildTimeline, DEFENSE_AT } from '../../player/timeline'
import { createKit } from '../kit'
import { createWorld } from '../world'
import { createScenes } from './index'

// 画面に描かずに、舞台と場面だけを組み立てて動かす
const kit = createKit(createWorld())
const scenes = createScenes(kit)
const timeline = buildTimeline()
const exampleIds = TACTICS.flatMap((t) => t.examples.map((e) => e.id))

describe('場面の対応', () => {
  it('データにある技術には、必ず場面がある', () => {
    for (const id of exampleIds) expect(scenes.techniques[id], id).toBeDefined()
  })

  it('データに無い技術の場面は残っていない', () => {
    expect(Object.keys(scenes.techniques).sort()).toEqual([...exampleIds].sort())
  })
})

describe('場面の実行', () => {
  const all = timeline.map((s) => ({
    name: s.title ?? s.kind,
    duration: s.duration,
    captions: s.captions,
    def:
      s.kind === 'intro'
        ? scenes.intro
        : s.kind === 'outro'
          ? scenes.outro
          : scenes.techniques[s.techniqueId!],
  }))

  it.each(all)('$name は最初から最後までエラーなく動く', ({ duration, def }) => {
    for (let t = 0; t <= duration; t += 0.05) {
      kit.view.T = 3 + t
      kit.reset()
      def.run(t)
      expect(Number.isFinite(kit.view.camS)).toBe(true)
      expect(kit.view.camT.every(Number.isFinite)).toBe(true)
    }
  })

  it.each(all.filter((s) => s.def.hits.length))(
    '$name の成功の合図は、攻撃側の字幕の時間内にある',
    ({ captions, def }) => {
      for (const hit of def.hits) {
        const caption = captions.find((c) => hit >= c[0] && hit < c[1])
        expect(caption?.[2], `hit ${hit}`).toBe('a')
      }
    },
  )

  it('別の手口の例は、防御側の番までに成功の合図が出る', () => {
    for (const s of timeline.filter((x) => x.kind === 'extra')) {
      const hit = scenes.techniques[s.techniqueId!].hits[0]
      expect(hit, s.title).toBeLessThan(DEFENSE_AT)
    }
  })
})

describe('reset', () => {
  it('どの場面のあとでも、舞台を同じ初期状態に戻す', () => {
    // 見えている物の一覧と、その位置・大きさ・向きを比べる。
    // 攻撃者と防御者は場面が毎回置き直すので、位置は比べない（見えていることだけ確かめる）。
    const snapshot = () => {
      const out: number[] = []
      const visit = (o: (typeof kit.scene)['children'][number], i: number) => {
        if (!o.visible) return
        out.push(i)
        if (o !== kit.atk && o !== kit.def)
          out.push(...o.position.toArray(), ...o.scale.toArray(), o.rotation.x, o.rotation.y, o.rotation.z)
        o.children.forEach(visit)
      }
      kit.scene.children.forEach(visit)
      return out
    }
    kit.view.T = 1
    kit.reset()
    const clean = snapshot()
    for (const s of timeline) {
      if (!s.techniqueId) continue
      for (const t of [0.5, 2.5, 4, 6.5]) {
        kit.view.T = 1
        kit.reset()
        scenes.techniques[s.techniqueId].run(t)
      }
      kit.view.T = 1
      kit.reset()
      expect(snapshot(), `${s.title} のあと`).toEqual(clean)
    }
  })
})
