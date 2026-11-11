import { describe, expect, it } from 'vitest'
import { MATRIX } from './matrix'
import { TACTICS } from './tactics'

describe('戦術と技術のデータ', () => {
  it('マトリックスは戦術と同じ数の列を持つ', () => {
    expect(TACTICS).toHaveLength(15)
    expect(MATRIX).toHaveLength(TACTICS.length)
  })

  it('どの戦術にも本編の技術がある', () => {
    for (const t of TACTICS) expect(t.examples.length).toBeGreaterThan(0)
  })

  it('例に挙げた技術は、その戦術のマトリックスに載っている', () => {
    TACTICS.forEach((t, k) => {
      const ids = MATRIX[k].map((x) => x.id)
      for (const e of t.examples) expect(ids, `${t.id} ${e.id}`).toContain(e.id)
    })
  })

  it('技術IDは全体で重複しない（場面と # の直リンクが ID で結び付くため）', () => {
    const ids = TACTICS.flatMap((t) => t.examples.map((e) => e.id))
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('字幕の文面は空でない', () => {
    for (const t of TACTICS)
      for (const e of t.examples) {
        expect(e.attack.trim(), e.id).not.toBe('')
        expect(e.defense.trim(), e.id).not.toBe('')
      }
  })
})
