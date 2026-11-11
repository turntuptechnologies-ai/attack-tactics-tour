// 動きの計算。舞台の状態を持たない関数だけを置く（時刻と座標を受け取り、値か姿勢を返す）。
import type { Object3D } from 'three'

/** [x, y, z] */
export type Vec3 = readonly number[]

/** 人物やマルウェアの立ち位置と向き。sq は跳ねるときの縦の伸び縮み（1 が等倍） */
export type Pose = { x: number; y: number; z: number; rot: number; sq: number }

/** 0〜1 に収める */
export const cl = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x)

/** t が a から b へ進む割合を 0〜1 で返す（範囲の外は 0 か 1） */
export const seg = (t: number, a: number, b: number) => cl((t - a) / (b - a))

/** 出だしと終わりをなめらかにする */
export const sm = (x: number) => x * x * (3 - 2 * x)

export const lerp = (a: number, b: number, p: number) => a + (b - a) * p

/** 少し行き過ぎてから戻る（ぽんと現れる動き） */
export const back = (x: number) => {
  x = cl(x)
  return 1 + 2.7 * Math.pow(x - 1, 3) + 1.7 * Math.pow(x - 1, 2)
}

/** 落ちてきて弾む */
export const bounce = (x: number) => {
  x = cl(x)
  const n = 7.5625
  const d = 2.75
  if (x < 1 / d) return n * x * x
  if (x < 2 / d) {
    x -= 1.5 / d
    return n * x * x + 0.75
  }
  if (x < 2.5 / d) {
    x -= 2.25 / d
    return n * x * x + 0.9375
  }
  x -= 2.625 / d
  return n * x * x + 0.984375
}

/**
 * 経路に沿って跳ねながら進む姿勢を返す。
 * keys は [時刻, x, z] の並び。位置が変わる区間は跳ねて移動し、同じ位置が続く区間はその場で待つ。
 * rot0 は、まだ一度も動いていないときの向き（省略時は奥向き）。
 */
export function track(keys: readonly Vec3[], t: number, rot0?: number): Pose {
  let i = 0
  while (i < keys.length - 2 && t >= keys[i + 1][0]) i++
  const a = keys[i]
  const b = keys[i + 1]
  let rot = rot0 || Math.PI
  for (let j = 0; j <= i; j++) {
    const dx = keys[j + 1][1] - keys[j][1]
    const dz = keys[j + 1][2] - keys[j][2]
    if ((dx || dz) && (j < i || t >= keys[j][0])) rot = Math.atan2(dx, dz)
  }
  const dx = b[1] - a[1]
  const dz = b[2] - a[2]
  const d = Math.hypot(dx, dz)
  if (d < 0.01 || t <= a[0]) return { x: a[1], y: 0, z: a[2], rot, sq: 1 + Math.sin(t * 4) * 0.03 }
  if (t >= b[0]) return { x: b[1], y: 0, z: b[2], rot, sq: 1 }
  const n = Math.max(1, Math.round(d / 1.25))
  const u = ((t - a[0]) / (b[0] - a[0])) * n
  const k = Math.min(n - 1, Math.floor(u))
  const f = u - k
  const e = Math.min(1, f / 0.75)
  const q = (k + sm(e)) / n
  return {
    x: lerp(a[1], b[1], q),
    y: Math.sin(Math.PI * e) * 0.6,
    z: lerp(a[2], b[2], q),
    rot,
    sq: e < 1 ? 1 + 0.1 * Math.sin(Math.PI * e) : 1 - 0.16 * Math.sin((Math.PI * (f - 0.75)) / 0.25),
  }
}

/** [時刻, 値] の並びを、なめらかにつないだ値を返す */
export function path(t: number, ks: readonly Vec3[]): number {
  let i = 0
  while (i < ks.length - 2 && t >= ks[i + 1][0]) i++
  return lerp(ks[i][1], ks[i + 1][1], sm(seg(t, ks[i][0], ks[i + 1][0])))
}

/** 姿勢を物に当てはめる */
export function put(o: Object3D, r: Pose) {
  o.position.set(r.x, r.y, r.z)
  o.rotation.set(0, r.rot, 0)
  const s = r.sq
  const w = 1 / Math.sqrt(s)
  o.scale.set(w, s, w)
}

/** a から b へ、高さ h の山なりで進んだ位置に物を置く（p は 0〜1） */
export function arc(o: Object3D, a: Vec3, b: Vec3, p: number, h: number) {
  o.position.set(lerp(a[0], b[0], p), lerp(a[1], b[1], p) + Math.sin(Math.PI * p) * h, lerp(a[2], b[2], p))
}

/** 箱を a から b へ渡した細い線（光線）にする。w は太さ */
export function beam(m: Object3D, a: Vec3, b: Vec3, w: number) {
  m.visible = true
  m.position.set((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2)
  m.scale.set(w, w, Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]))
  m.lookAt(b[0], b[1], b[2])
}
