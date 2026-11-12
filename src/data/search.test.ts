import { describe, expect, it } from 'vitest'
import { techniqueTitle } from '../player/timeline'
import { searchTechniques } from './search'
import { TACTICS } from './tactics'

const search = (query: string) => searchTechniques(TACTICS, query, techniqueTitle)
const count = (query: string) => search(query).reduce((n, found) => n + found.examples.length, 0)
const total = TACTICS.reduce((n, t) => n + t.examples.length, 0)

describe('searchTechniques', () => {
  it('語が空なら、すべての戦術と技術を返す', () => {
    expect(search('')).toHaveLength(TACTICS.length)
    expect(count('')).toBe(total)
    expect(count('   ')).toBe(total)
  })

  it('技術IDで探せる。同じ技術が複数の戦術にあれば、それぞれ出る', () => {
    const found = search('T1053')
    expect(found.map((f) => f.tactic.id)).toEqual(['TA0002', 'TA0003', 'TA0004'])
    for (const f of found) expect(f.examples.map((x) => x.example.id)).toEqual(['T1053'])
  })

  it('大文字と小文字、全角と半角を区別しない', () => {
    expect(count('phishing')).toBe(count('Phishing'))
    expect(count('ｔ１０５３')).toBe(count('T1053'))
    expect(count('phishing')).toBeGreaterThan(0)
  })

  it('戦術の名前でも、防御側の打ち手の言葉でも探せる', () => {
    const recon = search('偵察').find((f) => f.tactic.id === 'TA0043')!
    expect(recon.examples).toHaveLength(TACTICS[0].examples.length)
    expect(count('多要素')).toBeGreaterThan(0)
  })

  it('空白で区切った語は、すべて含むものだけに絞る', () => {
    expect(count('TA0003 T1053')).toBe(1)
    expect(count('多要素 TA0003')).toBeLessThan(count('多要素'))
  })

  it('合う技術が無い戦術は結果に含めず、何も合わなければ空になる', () => {
    expect(search('T1190').map((f) => f.tactic.id)).toEqual(['TA0001'])
    expect(search('どこにも無い言葉')).toEqual([])
  })

  it('本編かどうかを見分けられるよう、戦術の中での元の順番を返す', () => {
    const story = search('T1566')[0].examples[0]
    expect(story.j).toBe(0)
    const extra = search('T1190')[0].examples[0]
    expect(extra.j).toBeGreaterThan(0)
  })
})
