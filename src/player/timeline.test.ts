import { describe, expect, it } from 'vitest'
import { MATRIX } from '../data/matrix'
import { TACTICS } from '../data/tactics'
import {
  buildTimeline,
  captionAt,
  DEFENSE_AT,
  hashFor,
  indexOfExample,
  indexOfTechnique,
  parseHash,
  step,
} from './timeline'

const timeline = buildTimeline()
const cells = MATRIX.reduce((n, col) => n + col.length, 0)
const tacticIndex = (id: string) => TACTICS.findIndex((t) => t.id === id)

describe('buildTimeline', () => {
  it('導入・マトリックスのすべての技術・まとめを順に並べる', () => {
    expect(timeline).toHaveLength(cells + 2)
    expect(timeline[0].kind).toBe('intro')
    expect(timeline[timeline.length - 1].kind).toBe('outro')
  })

  it('各戦術の先頭の技術が本編で、残りは専用の場面か簡易表示になる', () => {
    TACTICS.forEach((t, k) => {
      const scenes = timeline.filter((s) => s.tactic === k)
      expect(scenes.map((s) => s.techniqueId)).toEqual(t.examples.map((e) => e.id))
      expect(scenes.map((s) => s.kind)).toEqual(
        t.examples.map((e, j) => (j === 0 ? 'story' : e.simple == null ? 'extra' : 'simple')),
      )
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
    const story = timeline.filter((s) => s.kind !== 'extra' && s.kind !== 'simple')
    const total = story.reduce((n, s) => n + s.duration, 0)
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
  it('本編だけのときは、ほかの技術を飛ばす', () => {
    let i = 0
    const visited: string[] = []
    do {
      visited.push(timeline[i].kind)
      i = step(timeline, i, 1, false)
    } while (i !== 0)
    expect(visited).not.toContain('extra')
    expect(visited).not.toContain('simple')
    expect(visited.filter((k) => k === 'story')).toHaveLength(TACTICS.length)
  })

  it('本編以外の技術から進むと、次の戦術の本編に戻る', () => {
    for (const id of ['T1598', 'T1592']) {
      const from = indexOfTechnique(timeline, id)
      const next = timeline[step(timeline, from, 1, false)]
      expect(next.kind).toBe('story')
      expect(next.tactic).toBe(timeline[from].tactic + 1)
    }
  })

  it('すべて含めるときは、すべての場面を一巡する', () => {
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

describe('場面の検索', () => {
  it('同じ技術が複数の戦術にあるときは、本編、専用の場面、簡易表示の順に選ぶ', () => {
    // Scheduled Task は、実行（専用の場面）が先に並ぶが、本編は永続化にある
    const scene = timeline[indexOfTechnique(timeline, 'T1053')]
    expect(scene.kind).toBe('story')
    expect(TACTICS[scene.tactic].id).toBe('TA0003')
  })

  it('戦術を指定すれば、その戦術の場面を選べる', () => {
    for (const id of ['TA0002', 'TA0004']) {
      const scene = timeline[indexOfExample(timeline, tacticIndex(id), 'T1053')]
      expect(scene).toMatchObject({ kind: 'extra', tactic: tacticIndex(id) })
    }
  })
})

describe('parseHash と hashFor', () => {
  it('技術IDはその技術の場面を指す', () => {
    expect(parseHash(timeline, '#T1190')).toEqual({ index: indexOfTechnique(timeline, 'T1190') })
  })

  it('戦術IDはその戦術の本編の場面を指す', () => {
    const hit = parseHash(timeline, '#TA0001')!
    expect(timeline[hit.index]).toMatchObject({ kind: 'story', techniqueId: 'T1566' })
  })

  it('戦術と技術の組は、その戦術に載っている技術の場面を指す', () => {
    const hit = parseHash(timeline, '#TA0004-T1053')!
    expect(timeline[hit.index]).toMatchObject({ kind: 'extra', tactic: tacticIndex('TA0004') })
  })

  it('-t を付けると、その時刻で止める', () => {
    expect(parseHash(timeline, '#T1190-t34')?.pauseAt).toBe(3.4)
    expect(parseHash(timeline, '#TA0002-T1053-t20')?.pauseAt).toBe(2)
  })

  it('知らない指定は無視する', () => {
    for (const hash of ['', '#T0000', '#settings', '#TA9999', '#TA0002-T0000'])
      expect(parseHash(timeline, hash), hash).toBeNull()
  })

  it('どの場面も、hashFor で作った # から同じ場面に戻れる', () => {
    timeline.forEach((s, i) => {
      const hash = hashFor(timeline, i)
      if (!s.techniqueId) expect(hash).toBe('')
      else expect(parseHash(timeline, hash)?.index, hash).toBe(i)
    })
  })
})
