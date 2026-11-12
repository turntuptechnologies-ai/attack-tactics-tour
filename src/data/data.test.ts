import { describe, expect, it } from 'vitest'
import { SIMPLE_VARIANTS } from '../scene/scenes/simple'
import { MATRIX } from './matrix'
import { MORE_TECHNIQUES } from './more-techniques'
import { TACTICS } from './tactics'

describe('戦術と技術のデータ', () => {
  it('マトリックスは戦術と同じ数の列を持つ', () => {
    expect(TACTICS).toHaveLength(15)
    expect(MATRIX).toHaveLength(TACTICS.length)
  })

  it('各戦術の先頭は、専用の場面を持つ本編の技術である', () => {
    for (const t of TACTICS) expect(t.examples[0].simple, t.id).toBeUndefined()
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

  it('簡易表示の絵の種類は、用意された範囲に収まる', () => {
    for (const t of TACTICS)
      for (const e of t.examples)
        if (e.simple != null) {
          expect(Number.isInteger(e.simple), `${t.id} ${e.id}`).toBe(true)
          expect(e.simple, `${t.id} ${e.id}`).toBeGreaterThanOrEqual(0)
          expect(e.simple, `${t.id} ${e.id}`).toBeLessThan(SIMPLE_VARIANTS)
        }
  })

  it('簡易表示の技術は、実在する戦術に付いている', () => {
    const tacticIds = TACTICS.map((t) => t.id)
    for (const id of Object.keys(MORE_TECHNIQUES)) expect(tacticIds).toContain(id)
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
