import { describe, expect, it } from 'vitest'
import { back, bounce, cl, lerp, path, seg, sm, track } from './motion'

describe('補間', () => {
  it('cl は 0〜1 に収める', () => {
    expect(cl(-1)).toBe(0)
    expect(cl(0.4)).toBe(0.4)
    expect(cl(3)).toBe(1)
  })

  it('seg は区間の外で 0 か 1、内側で割合を返す', () => {
    expect(seg(1, 2, 4)).toBe(0)
    expect(seg(3, 2, 4)).toBe(0.5)
    expect(seg(9, 2, 4)).toBe(1)
  })

  it('sm・back・bounce は 0 で 0、1 で 1 になる', () => {
    for (const f of [sm, back, bounce]) {
      expect(f(0)).toBeCloseTo(0)
      expect(f(1)).toBeCloseTo(1)
    }
  })

  it('lerp は両端の値をそのまま返す', () => {
    expect(lerp(2, 10, 0)).toBe(2)
    expect(lerp(2, 10, 1)).toBe(10)
    expect(lerp(2, 10, 0.25)).toBe(4)
  })
})

describe('track', () => {
  const keys = [
    [0, 0, 0],
    [1, 0, 0],
    [3, 5, 0],
    [6, 5, 0],
  ]

  it('動く前は最初の位置で、指定した向きのまま待つ', () => {
    const p = track(keys, 0.5, 0.4)
    expect([p.x, p.y, p.z]).toEqual([0, 0, 0])
    expect(p.rot).toBe(0.4)
  })

  it('移動中は進む方向を向き、地面より上にいる', () => {
    const p = track(keys, 2)
    expect(p.x).toBeGreaterThan(0)
    expect(p.x).toBeLessThan(5)
    expect(p.y).toBeGreaterThanOrEqual(0)
    expect(p.rot).toBeCloseTo(Math.PI / 2)
  })

  it('着いたあとは最後の位置にいて、動いた向きを保つ', () => {
    const p = track(keys, 5)
    expect([p.x, p.y, p.z]).toEqual([5, 0, 0])
    expect(p.rot).toBeCloseTo(Math.PI / 2)
  })
})

describe('path', () => {
  it('キーの時刻ではキーの値になる', () => {
    const ks = [
      [0, 10],
      [2, 4],
      [5, 4],
    ]
    expect(path(0, ks)).toBe(10)
    expect(path(2, ks)).toBe(4)
    expect(path(9, ks)).toBe(4)
  })
})
