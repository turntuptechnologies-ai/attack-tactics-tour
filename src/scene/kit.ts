// 場面を書くための道具。舞台の物（world）に、よく使う動かし方を足して、場面に渡す。
// 毎フレーム reset() で全部を初期状態に戻してから場面の run(t) を呼ぶので、
// 場面は「時刻 t のときの状態」を毎回ゼロから組み立てればよい（前のフレームを引きずらない）。
import type { Object3D } from 'three'
import { arc, back, beam, cl, lerp, put, seg, sm, type Pose, type Vec3 } from './motion'
import type { World } from './world'

/** 場面が毎フレーム決める、見せ方の状態 */
export type View = {
  /** カメラが見る地点 [x, z] */
  camT: number[]
  /** 画面に収める高さ（小さいほど寄る） */
  camS: number
  /** いま攻撃側の主役になっている物。足もとの輪やドクロはこれに付く */
  actor: Object3D
  /** 再生を始めてからの通算時間（秒）。ゆらゆらした動きに使う */
  T: number
}

export function createKit(w: World) {
  const {
    doorL,
    doorR,
    imp,
    crown,
    drones,
    bots,
    racks,
    cross,
    check,
    bangs,
    orb,
    c2,
    A,
    H,
    S,
    TWP,
    IS,
    IC,
  } = w
  const view: View = { camT: [0, 6], camS: 22, actor: w.atk, T: 0 }

  /** 正門を開ける（0 が閉、1 が開） */
  function gate(open: number) {
    const o = sm(cl(open))
    doorL.position.x = -0.75 - o * 1.4
    doorR.position.x = 0.75 + o * 1.4
  }

  /** その場で立っている姿勢 */
  const idle = (x: number, z: number, rot?: number): Pose => ({
    x,
    y: 0,
    z,
    rot: rot == null ? Math.PI : rot,
    sq: 1 + Math.sin(view.T * 4) * 0.03,
  })

  /** マルウェアを置く。s は大きさ（0 で消える） */
  function impAt(x: number, y: number, z: number, s: number) {
    imp.visible = s > 0.01
    imp.position.set(x, y, z)
    imp.scale.set(s, s, s)
  }

  /** 防御側のセンサー（ドローン）を置く。tilt を渡すと、止められて傾いた状態になる */
  function sensor(x: number, y: number, z: number, tilt?: number) {
    const d = drones[2]
    d.visible = true
    d.position.set(x, y, z)
    d.rotation.z = tilt || 0
    if (!tilt) d.userData.rot.rotation.y = view.T * 25
  }

  /** 乗っ取った端末のしるしを置く */
  function cp(i: number, x: number, z: number, s?: number) {
    const b = bots[i]
    let k = s == null ? 1 : s
    b.visible = k > 0.01
    k *= 1.3
    b.scale.set(k, k, k)
    b.position.set(x, Math.abs(Math.sin(view.T * 5 + i)) * 0.08, z)
    b.rotation.y = 0.6
  }

  /** 集めたデータを積む場所（サーバー室）と、持ち出した先（攻撃側）の i 番目の位置 */
  const PILE = (i: number) => [-1.2 + (i - 1.5) * 0.75, 0.3, -2.2]
  const STK = (i: number) => [5.9, 0.3 + i * 0.62, 12.5]

  /** 小さく弾む高さ */
  const bob = () => Math.abs(Math.sin(view.T * 5)) * 0.08

  /** 攻撃者の頭上と、端末にいるマルウェアの上（高さ y） */
  const TOP = () => [A[0], 2.9, A[1]]
  const IH = (y: number) => [H[0], y, H[1]]

  /** すべてを初期状態に戻す。場面が変えうる物は、必ずここで元に戻すこと */
  function reset() {
    doorL.position.x = -0.75
    doorR.position.x = 0.75
    const single: Object3D[] = [
      w.mfa,
      w.key,
      cross,
      w.clone,
      w.truckA,
      w.truckB,
      w.botB,
      w.arch,
      w.scan,
      w.segW,
      w.user,
      check,
      w.grant,
      w.fake,
      w.field,
      w.hammer,
      orb,
      w.tower,
      imp,
      crown,
      w.shell,
      w.anchor,
      w.shield,
      w.skull,
      w.steps,
      w.ascan,
      c2,
      w.plock,
      w.cloud,
      w.dbx,
      w.proc,
      w.clock,
    ]
    const groups: Object3D[][] = [
      bots,
      w.letters,
      bangs,
      drones,
      w.beams,
      w.rings,
      w.links,
      w.keys3,
      w.marks,
      w.pk,
      w.exps,
      w.drings,
      w.docs,
    ]
    for (const o of single) o.visible = false
    for (const g of groups) for (const o of g) o.visible = false

    const unrotate: Object3D[] = [
      cross,
      check,
      w.user,
      w.fake,
      w.clone,
      w.hammer,
      w.truckA,
      w.truckB,
      w.key,
      w.plock,
      w.cloud,
      w.arch,
      w.scan,
      w.field,
      w.grant,
      w.ascan,
      ...w.letters,
      ...w.keys3,
      ...w.pk,
      ...w.docs,
    ]
    for (const o of unrotate) o.rotation.set(0, 0, 0)
    const unscale: Object3D[] = [
      cross,
      check,
      w.user,
      w.fake,
      w.clone,
      w.hammer,
      w.truckA,
      w.truckB,
      w.arch,
      ...w.letters,
    ]
    for (const o of unscale) o.scale.set(1, 1, 1)

    w.grant.scale.set(0.5, 0.5, 0.5)
    w.field.scale.set(4, 2.6, 0.12)
    w.scan.scale.set(3.8, 2.9, 0.08)
    w.ascan.scale.set(0.5, 1.8, 1.6)
    w.arch.position.set(0, 0, 9.3)
    w.exps.forEach((m, i) => m.position.set(w.EX[i], 2.5, 6.5))
    for (const m of Object.values(w.wm)) m.color.setHex(0xd9dde4)
    for (const d of drones) d.scale.set(1, 1, 1)

    w.ambient(view.T)
    w.atk.visible = w.def.visible = true
    w.atk.scale.set(1, 1, 1)
    view.actor = w.atk
    imp.rotation.set(0, 0.6, 0)
    drones[2].rotation.set(0, 0, 0)
    w.anchor.scale.set(1, 1, 1)
    w.steps.scale.set(1, 1, 1)
    w.tower.scale.set(1, 1, 1)
    w.segMat.color.setHex(0x6f9dff)
    for (const r of racks) {
      r.lm.color.setHex(0x4dff9a)
      r.lock.visible = false
      r.lock.position.set(r.x, 2.75, w.RZ)
      r.lock.rotation.set(0, 0, 0)
      r.bk.visible = false
      r.bk.scale.set(0.6, 0.6, 0.6)
      r.bk.position.set(r.x, 2.72, w.RZ)
      r.cube.visible = true
      r.cube.position.set(r.x, 2.72, w.RZ)
      r.cube.scale.set(0.6, 0.6, 0.6)
      r.cube.rotation.set(0, 0, 0)
    }
    w.emps.forEach((e, i) => {
      e.position.y = 0
      e.scale.y = 1 + Math.sin(view.T * 3 + i * 2) * 0.03
    })
    w.mfa.position.set(0, 3.2, 7.15)
  }

  /**
   * k 番目の戦術に入った時点の、本編の状況を作る（k は TACTICS の添字）。
   * 本編はひとつの侵入が続いていく話なので、あとの戦術ほど、すでに起きたことが積み重なっている。
   */
  function base(k: number) {
    put(w.def, idle(-2, 5, 0.4))
    if (k >= 2) {
      w.tower.visible = true
      put(w.atk, idle(A[0], A[1]))
    }
    if (k >= 3) {
      const p = k >= 11 ? S : H
      impAt(p[0], bob(), p[1], k >= 6 ? IC : IS)
      crown.visible = k >= 6
      view.actor = imp
    }
    if (k >= 5) w.anchor.visible = true
    if (k >= 4 && k <= 7) sensor(0.5, 3.3 + Math.sin(view.T * 3) * 0.1, 3.5)
    else if (k >= 8) sensor(0.5, 0.25, 3.5, 0.5)
    if (k >= 11) {
      cp(1, -2.3, 2.6)
      cp(2, -4.8, 3.9)
      w.segW.visible = true
      w.segW.position.y = 1.5
    }
    if (k === 12 || k === 13)
      for (let i = 0; i < 4; i++) {
        const p = PILE(i)
        racks[i].cube.position.set(p[0], p[1], p[2])
      }
    if (k >= 14)
      for (let i = 0; i < 4; i++) {
        const p = STK(i)
        racks[i].cube.position.set(p[0], p[1], p[2])
      }
  }

  /** 攻撃側のサーバーと、サーバー室のマルウェアを結ぶ指令の通信路を出す。両端の座標を返す */
  function c2beam(t: number) {
    const a = [TWP[0], 2.9, TWP[1]]
    const b = [S[0], 0.7, S[1]]
    beam(c2, a, b, 0.1)
    c2.material.opacity = 0.45 + 0.25 * Math.sin(t * 8)
    return [a, b]
  }

  /** t0〜t1 のあいだに、a から b へ山なりに飛ばす。spin を渡すと飛んでいる間だけ回る。進んだ割合を返す */
  function fly(o: Object3D, a: Vec3, b: Vec3, t: number, t0: number, t1: number, h?: number, spin?: number) {
    const p = seg(t, t0, t1)
    o.visible = true
    arc(o, a, b, sm(p), h || 0)
    if (spin && p > 0 && p < 1) o.rotation.y = t * spin
    return p
  }

  /** t0 に、ぽんと現れる。s は最終的な大きさ */
  function pop(o: Object3D, x: number, y: number, z: number, t: number, t0: number, s?: number) {
    const k = (s == null ? 1 : s) * back(seg(t, t0, t0 + 0.3))
    o.visible = k > 0.01
    o.position.set(x, y, z)
    o.scale.set(k, k, k)
  }

  /** 赤い × を出す（止めた・通らなかった） */
  function deny(x: number, y: number, z: number, t: number, t0: number) {
    pop(cross, x, y + Math.sin(view.T * 6) * 0.08, z, t, t0)
    cross.rotation.y = 0.6
  }

  /** 緑のチェックを出す（通った・戻った） */
  function ok(x: number, y: number, z: number, t: number, t0: number) {
    pop(check, x, y, z, t, t0)
    check.rotation.y = 0.6
  }

  /** t0〜t1 のあいだ、その場で跳ねさせる */
  function hop(o: Object3D, t: number, t0: number, t1: number, h?: number) {
    if (t > t0 && t < t1) o.position.y = Math.abs(Math.sin((t - t0) * 9)) * (h || 0.2)
  }

  /** t0〜t1 のあいだ、「！」を出す */
  function alarm(i: number, x: number, y: number, z: number, t: number, t0: number, t1: number) {
    if (t > t0 && t < t1) {
      const b = bangs[i]
      b.visible = true
      b.position.set(x, y + Math.abs(Math.sin(t * 9)) * 0.2, z)
    }
  }

  /** マルウェアを a から b へ跳ばして着地させる */
  function lands(t: number, t0: number, t1: number, a: Vec3, b: Vec3, h: number, s: number) {
    const p = sm(seg(t, t0, t1))
    impAt(
      lerp(a[0], b[0], p),
      lerp(a[1], b[1], p) + Math.sin(Math.PI * p) * h + (p >= 1 ? bob() : 0),
      lerp(a[2], b[2], p),
      s,
    )
  }

  /** 防御側の番（4.6 秒以降）に、センサーが見張りに降りてくる */
  function watch(t: number) {
    if (t > 4.6) sensor(0.5, lerp(8, 3.3, sm(seg(t, 4.6, 5.6))) + Math.sin(view.T * 3) * 0.1, 3.5)
  }

  /** 攻撃者の頭上に、操作中のしるしを出す */
  function ORB(t: number) {
    orb.visible = true
    orb.position.set(A[0], 2.9 + Math.sin(t * 5) * 0.1, A[1])
    orb.rotation.set(t * 2, t * 3, 0)
  }

  return {
    ...w,
    view,
    reset,
    base,
    gate,
    idle,
    impAt,
    sensor,
    cp,
    PILE,
    STK,
    bob,
    TOP,
    IH,
    c2beam,
    fly,
    pop,
    deny,
    ok,
    hop,
    alarm,
    lands,
    watch,
    ORB,
  }
}

export type Kit = ReturnType<typeof createKit>
