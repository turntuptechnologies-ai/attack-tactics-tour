import { describe, expect, it } from 'vitest'
import { MATRIX } from './matrix'
import { TACTICS } from './tactics'

describe('戦術と技術のデータ', () => {
  it('マトリックスは戦術と同じ数の列を持つ', () => {
    expect(TACTICS).toHaveLength(15)
    expect(MATRIX).toHaveLength(TACTICS.length)
  })

  it('マトリックスのすべての技術が、その戦術の例に入っている（網羅）', () => {
    TACTICS.forEach((t, k) => {
      const have = t.examples.map((e) => e.id).sort()
      const want = MATRIX[k].map((x) => x.id).sort()
      expect(have, t.id).toEqual(want)
    })
  })

  it('同じ戦術の中で、技術IDは重複しない', () => {
    for (const t of TACTICS) {
      const ids = t.examples.map((e) => e.id)
      expect(new Set(ids).size, t.id).toBe(ids.length)
    }
  })

  it('字幕の文面は空でなく、句点で終わる', () => {
    for (const t of TACTICS)
      for (const e of t.examples)
        for (const text of [e.attack, e.defense]) {
          expect(text.trim(), `${t.id} ${e.id}`).not.toBe('')
          expect(text.endsWith('。'), `${t.id} ${e.id}: ${text}`).toBe(true)
        }
  })
})
