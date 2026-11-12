import { describe, expect, it } from 'vitest'
import { placeLabels, type Label } from './labels'

const W = 358
const H = 201
const rect = (l: Label) => ({ left: l.x - l.w / 2, right: l.x + l.w / 2, top: l.y - l.h, bottom: l.y })
const collide = (a: Label, b: Label) => {
  const p = rect(a)
  const q = rect(b)
  return p.left < q.right && q.left < p.right && p.top < q.bottom && q.top < p.bottom
}

describe('placeLabels', () => {
  it('離れているラベルは動かさない', () => {
    const labels = [
      { x: 100, y: 150, w: 42, h: 17 },
      { x: 250, y: 60, w: 62, h: 17 },
    ]
    expect(placeLabels(labels, W, H)).toEqual(labels)
  })

  it('重なるラベルは、先のものを残して、あとのものを上へずらす', () => {
    const [first, second] = placeLabels(
      [
        { x: 165, y: 80, w: 42, h: 17 },
        { x: 190, y: 75, w: 62, h: 17 },
      ],
      W,
      H,
    )
    expect(first).toMatchObject({ x: 165, y: 80 })
    expect(collide(first, second)).toBe(false)
    expect(second.y).toBeLessThan(first.y - first.h)
  })

  it('上に空きが無いときは、下へずらす', () => {
    const [first, second] = placeLabels(
      [
        { x: 165, y: 30, w: 42, h: 17 },
        { x: 170, y: 28, w: 62, h: 17 },
      ],
      W,
      H,
    )
    expect(collide(first, second)).toBe(false)
    expect(second.y).toBeGreaterThan(first.y)
  })

  it('舞台の端からはみ出さない', () => {
    const [left, right, top] = placeLabels(
      [
        { x: 5, y: 100, w: 62, h: 17 },
        { x: 400, y: 150, w: 42, h: 17 },
        { x: 200, y: -20, w: 42, h: 17 },
      ],
      W,
      H,
    )
    expect(rect(left).left).toBeGreaterThanOrEqual(0)
    expect(rect(right).right).toBeLessThanOrEqual(W)
    expect(rect(top).top).toBeGreaterThanOrEqual(8)
  })

  it('3つが固まっていても、どれも重ならない', () => {
    const out = placeLabels(
      [
        { x: 180, y: 90, w: 42, h: 17 },
        { x: 185, y: 92, w: 62, h: 17 },
        { x: 175, y: 88, w: 42, h: 17 },
      ],
      W,
      H,
    )
    for (let i = 0; i < out.length; i++)
      for (let j = i + 1; j < out.length; j++) expect(collide(out[i], out[j])).toBe(false)
  })
})
