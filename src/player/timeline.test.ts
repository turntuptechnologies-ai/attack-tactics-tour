import { describe, expect, it } from 'vitest'
import { TACTICS } from '../data/tactics'
import { buildTimeline, captionAt, DEFENSE_AT, indexOfTechnique, parseHash, step } from './timeline'

const timeline = buildTimeline()
const examples = TACTICS.reduce((n, t) => n + t.examples.length, 0)

describe('buildTimeline', () => {
  it('導入・すべての技術・まとめを順に並べる', () => {
    expect(timeline).toHaveLength(examples + 2)
    expect(timeline[0].kind).toBe('intro')
    expect(timeline[timeline.length - 1].kind).toBe('outro')
  })

  it('各戦術の先頭の技術が本編で、残りは別の手口の例になる', () => {
    TACTICS.forEach((t, k) => {
      const scenes = timeline.filter((s) => s.tactic === k)
      expect(scenes.map((s) => s.techniqueId)).toEqual(t.examples.map((e) => e.id))
      expect(scenes.map((s) => s.kind)).toEqual(t.examples.map((_, j) => (j === 0 ? 'story' : 'extra')))
    })
  })

  it('字幕は場面の最初から最後までを切れ目なく覆う', () => {
    for (const s of timeline) {
      expect(s.captions[0][0]).toBe(0)
      expect(s.captions[s.captions.length - 1][1]).toBe(s.duration)
      s.captions.slice(1).forEach((c, i) => expect(c[0]).toBe(s.captions[i][1]))
    }
  })

  it('本編だけを通すと約2分になる', () => {
    const total = timeline.filter((s) => s.kind !== 'extra').reduce((n, s) => n + s.duration, 0)
    expect(total).toBeGreaterThan(110)
    expect(total).toBeLessThan(130)
  })
})

describe('captionAt', () => {
  it('前半は攻撃側、後半は防御側の字幕を返す', () => {
    const scene = timeline[indexOfTechnique(timeline, 'T1566')]
    expect(captionAt(scene, 1)[2]).toBe('a')
    expect(captionAt(scene, DEFENSE_AT)[2]).toBe('d')
    expect(captionAt(scene, 99)[2]).toBe('d')
  })
})

describe('step', () => {
  it('本編だけのときは、別の手口の例を飛ばす', () => {
    let i = 0
    const visited: string[] = []
    do {
      visited.push(timeline[i].kind)
      i = step(timeline, i, 1, false)
    } while (i !== 0)
    expect(visited).not.toContain('extra')
    expect(visited.filter((k) => k === 'story')).toHaveLength(TACTICS.length)
  })

  it('別の手口の例から進むと、次の戦術の本編に戻る', () => {
    const extra = indexOfTechnique(timeline, 'T1598')
    const next = timeline[step(timeline, extra, 1, false)]
    expect(next.kind).toBe('story')
    expect(next.tactic).toBe(timeline[extra].tactic + 1)
  })

  it('例も含めるときは、すべての場面を一巡する', () => {
    let i = 0
    let count = 0
    do {
      count++
      i = step(timeline, i, 1, true)
    } while (i !== 0)
    expect(count).toBe(timeline.length)
  })

  it('前へ戻ると、先頭から末尾へ回る', () => {
    expect(step(timeline, 0, -1, false)).toBe(timeline.length - 1)
  })
})

describe('parseHash', () => {
  it('技術IDはその技術の場面を指す', () => {
    expect(parseHash(timeline, '#T1190')).toEqual({ index: indexOfTechnique(timeline, 'T1190') })
  })

  it('戦術IDはその戦術の本編の場面を指す', () => {
    const hit = parseHash(timeline, '#TA0001')!
    expect(timeline[hit.index]).toMatchObject({ kind: 'story', techniqueId: 'T1566' })
  })

  it('-t を付けると、その時刻で止める', () => {
    expect(parseHash(timeline, '#T1190-t34')?.pauseAt).toBe(3.4)
  })

  it('知らない指定は無視する', () => {
    expect(parseHash(timeline, '')).toBeNull()
    expect(parseHash(timeline, '#T0000')).toBeNull()
    expect(parseHash(timeline, '#settings')).toBeNull()
  })
})
