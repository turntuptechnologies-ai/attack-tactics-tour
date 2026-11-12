// 舞台の上のラベル（「攻撃側」「マルウェア」など）の置き場所を決める。
// 物どうしが近いとラベルが重なって読めなくなるので、重ならない位置へずらす。

/** ラベル。x, y は下辺の中央（物の頭上の点）、w, h は大きさ。単位は舞台の左上からのピクセル */
export type Label = { x: number; y: number; w: number; h: number }

const overlaps = (a: Label, b: Label, gap: number) =>
  a.x - a.w / 2 < b.x + b.w / 2 + gap &&
  b.x - b.w / 2 < a.x + a.w / 2 + gap &&
  a.y - a.h < b.y + gap &&
  b.y - b.h < a.y + gap

/**
 * ラベルを、舞台からはみ出さず、互いに重ならない位置に置き直す。
 * 先に渡したものほど優先して元の位置に置き、あとのものを上（上に空きが無ければ下）へずらす。
 * top は、舞台の上端に空けておく幅（進み具合の帯など）。
 */
export function placeLabels(labels: Label[], width: number, height: number, top = 8, gap = 2): Label[] {
  const placed: Label[] = []
  for (const label of labels) {
    const l = { ...label }
    l.x = Math.min(Math.max(l.x, l.w / 2), Math.max(l.w / 2, width - l.w / 2))
    l.y = Math.min(Math.max(l.y, top + l.h), Math.max(top + l.h, height))
    // ぶつかる相手がいなくなるまで、相手のすぐ上へ逃がす。上に出てしまうなら、相手のすぐ下へ
    for (let tries = 0; tries < placed.length * 2 + 1; tries++) {
      const hit = placed.find((p) => overlaps(l, p, gap))
      if (!hit) break
      const above = hit.y - hit.h - gap
      l.y = above - l.h >= top ? above : hit.y + gap + l.h
    }
    placed.push(l)
  }
  return placed
}
