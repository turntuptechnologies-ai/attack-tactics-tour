import { describe, expect, it } from 'vitest'
import { GROUPS } from './groups'
import { MATRIX } from './matrix'

const known = new Set(MATRIX.flat().map((t) => t.id))

describe('攻撃グループのデータ', () => {
  it('グループIDは G と 4 桁の数字で、重複しない', () => {
    for (const g of GROUPS) expect(g.id, g.name).toMatch(/^G\d{4}$/)
    expect(new Set(GROUPS.map((g) => g.id)).size).toBe(GROUPS.length)
  })

  it('どのグループにも、技術がひとつ以上ある', () => {
    for (const g of GROUPS) expect(g.techniques.length, g.name).toBeGreaterThan(0)
  })

  it('グループの技術は、すべてマトリックスに載っている（版がずれていない）', () => {
    for (const g of GROUPS)
      for (const id of g.techniques) expect(known.has(id), `${g.name} の ${id}`).toBe(true)
  })

  it('技術は重複せず、名前の順に並んでいる', () => {
    for (const g of GROUPS) expect(new Set(g.techniques).size, g.name).toBe(g.techniques.length)
    const names = GROUPS.map((g) => g.name)
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' })))
  })
})
