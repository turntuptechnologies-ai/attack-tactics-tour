// 場面を書くための道具。舞台の物（world）に、よく使う動かし方を足して、場面に渡す。
// 毎フレーム reset() で全部を初期状態に戻してから場面の run(t) を呼ぶので、
// 場面は「時刻 t のときの状態」を毎回ゼロから組み立てればよい（前のフレームを引きずらない）。
import type { Object3D } from 'three'
import {
  arcBetween,
  overshoot,
  stretchBetween,
  clamp01,
  lerp,
  applyPose,
  progress,
  smooth,
  type Pose,
  type Vec3,
} from './motion'
import type { World } from './world'

/** 場面が毎フレーム決める、見せ方の状態 */
export type View = {
  /** カメラが見る地点 [x, z] */
  target: number[]
  /** 画面に収める高さ（小さいほど寄る） */
  height: number
  /** いま攻撃側の主役になっている物。足もとの輪やドクロはこれに付く */
  actor: Object3D
  /** 再生を始めてからの通算時間（秒）。ゆらゆらした動きに使う */
  time: number
}

export function createKit(w: World) {
  const {
    doorL,
    doorR,
    malware,
    crown,
    drones,
    bots,
    racks,
    crossMark,
    checkMark,
    alertMarks,
    operatorOrb,
    c2Link,
    ATTACKER_SPOT,
    HOST_SPOT,
    SERVER_SPOT,
    TOWER_SPOT,
    MALWARE_SIZE,
    ADMIN_MALWARE_SIZE,
  } = w
  const view: View = { target: [0, 6], height: 22, actor: w.attacker, time: 0 }

  /** 正門を開ける（0 が閉、1 が開） */
  function openGate(open: number) {
    const o = smooth(clamp01(open))
    doorL.position.x = -0.75 - o * 1.4
    doorR.position.x = 0.75 + o * 1.4
  }

  /** その場で立っている姿勢 */
  const standing = (x: number, z: number, rot?: number): Pose => ({
    x,
    y: 0,
    z,
    rot: rot == null ? Math.PI : rot,
    sq: 1 + Math.sin(view.time * 4) * 0.03,
  })

  /** マルウェアを置く。s は大きさ（0 で消える） */
  function placeMalware(x: number, y: number, z: number, s: number) {
    malware.visible = s > 0.01
    malware.position.set(x, y, z)
    malware.scale.set(s, s, s)
  }

  /** 防御側のセンサー（ドローン）を置く。tilt を渡すと、止められて傾いた状態になる */
  function placeSensor(x: number, y: number, z: number, tilt?: number) {
    const d = drones[2]
    d.visible = true
    d.position.set(x, y, z)
    d.rotation.z = tilt || 0
    if (!tilt) d.userData.rot.rotation.y = view.time * 25
  }

  /** 乗っ取った端末のしるしを置く */
  function markCompromised(i: number, x: number, z: number, s?: number) {
    const b = bots[i]
    let k = s == null ? 1 : s
    b.visible = k > 0.01
    k *= 1.3
    b.scale.set(k, k, k)
    b.position.set(x, Math.abs(Math.sin(view.time * 5 + i)) * 0.08, z)
    b.rotation.y = 0.6
  }

  /** 集めたデータを積む場所（サーバー室）と、持ち出した先（攻撃側）の i 番目の位置 */
  const pileSpot = (i: number) => [-1.2 + (i - 1.5) * 0.75, 0.3, -2.2]
  const stolenSpot = (i: number) => [5.9, 0.3 + i * 0.62, 12.5]

  /** 小さく弾む高さ */
  const bobHeight = () => Math.abs(Math.sin(view.time * 5)) * 0.08

  /** 攻撃者の頭上と、端末にいるマルウェアの上（高さ y） */
  const aboveAttacker = () => [ATTACKER_SPOT[0], 2.9, ATTACKER_SPOT[1]]
  const aboveHost = (y: number) => [HOST_SPOT[0], y, HOST_SPOT[1]]

  /** すべてを初期状態に戻す。場面が変えうる物は、必ずここで元に戻すこと */
  function reset() {
    doorL.position.x = -0.75
    doorR.position.x = 0.75
    const single: Object3D[] = [
      w.mfaPanel,
      w.key,
      crossMark,
      w.secondAttacker,
      w.truckA,
      w.truckB,
      w.relayBot,
      w.checkpoint,
      w.scanPlane,
      w.segmentWall,
      w.user,
      checkMark,
      w.token,
      w.impostor,
      w.glass,
      w.hammer,
      operatorOrb,
      w.c2Tower,
      malware,
      crown,
      w.disguise,
      w.implant,
      w.shield,
      w.skull,
      w.stairs,
      w.attackerScan,
      c2Link,
      w.padlock,
      w.cloud,
      w.database,
      w.trustedProcess,
      w.clock,
    ]
    const groups: Object3D[][] = [
      bots,
      w.mails,
      alertMarks,
      drones,
      w.cyanBeams,
      w.turnRings,
      w.pinkBeams,
      w.spareKeys,
      w.rackMarks,
      w.pinkCubes,
      w.yellowCubes,
      w.pulseRings,
      w.documents,
    ]
    for (const o of single) o.visible = false
    for (const g of groups) for (const o of g) o.visible = false

    const unrotate: Object3D[] = [
      crossMark,
      checkMark,
      w.user,
      w.impostor,
      w.secondAttacker,
      w.hammer,
      w.truckA,
      w.truckB,
      w.key,
      w.padlock,
      w.cloud,
      w.checkpoint,
      w.scanPlane,
      w.glass,
      w.token,
      w.attackerScan,
      ...w.mails,
      ...w.spareKeys,
      ...w.pinkCubes,
      ...w.documents,
    ]
    for (const o of unrotate) o.rotation.set(0, 0, 0)
    const unscale: Object3D[] = [
      crossMark,
      checkMark,
      w.user,
      w.impostor,
      w.secondAttacker,
      w.hammer,
      w.truckA,
      w.truckB,
      w.checkpoint,
      ...w.mails,
    ]
    for (const o of unscale) o.scale.set(1, 1, 1)

    w.token.scale.set(0.5, 0.5, 0.5)
    w.glass.scale.set(4, 2.6, 0.12)
    w.scanPlane.scale.set(3.8, 2.9, 0.08)
    w.attackerScan.scale.set(0.5, 1.8, 1.6)
    w.checkpoint.position.set(0, 0, 9.3)
    w.yellowCubes.forEach((m, i) => m.position.set(w.YELLOW_CUBE_X[i], 2.5, 6.5))
    for (const m of Object.values(w.wallMaterials)) m.color.setHex(0xd9dde4)
    for (const d of drones) d.scale.set(1, 1, 1)

    w.ambient(view.time)
    w.attacker.visible = w.defender.visible = true
    w.attacker.scale.set(1, 1, 1)
    view.actor = w.attacker
    malware.rotation.set(0, 0.6, 0)
    drones[2].rotation.set(0, 0, 0)
    w.implant.scale.set(1, 1, 1)
    w.stairs.scale.set(1, 1, 1)
    w.c2Tower.scale.set(1, 1, 1)
    w.segmentWallMaterial.color.setHex(0x6f9dff)
    for (const r of racks) {
      r.lights.color.setHex(0x4dff9a)
      r.lock.visible = false
      r.lock.position.set(r.x, 2.75, w.RACK_Z)
      r.lock.rotation.set(0, 0, 0)
      r.backup.visible = false
      r.backup.scale.set(0.6, 0.6, 0.6)
      r.backup.position.set(r.x, 2.72, w.RACK_Z)
      r.data.visible = true
      r.data.position.set(r.x, 2.72, w.RACK_Z)
      r.data.scale.set(0.6, 0.6, 0.6)
      r.data.rotation.set(0, 0, 0)
    }
    w.employees.forEach((e, i) => {
      e.position.y = 0
      e.scale.y = 1 + Math.sin(view.time * 3 + i * 2) * 0.03
    })
    w.mfaPanel.position.set(0, 3.2, 7.15)
  }

  /**
   * k 番目の戦術に入った時点の、本編の状況を作る（k は TACTICS の添字）。
   * 本編はひとつの侵入が続いていく話なので、あとの戦術ほど、すでに起きたことが積み重なっている。
   */
  function storyState(k: number) {
    applyPose(w.defender, standing(-2, 5, 0.4))
    if (k >= 2) {
      w.c2Tower.visible = true
      applyPose(w.attacker, standing(ATTACKER_SPOT[0], ATTACKER_SPOT[1]))
    }
    if (k >= 3) {
      const p = k >= 11 ? SERVER_SPOT : HOST_SPOT
      placeMalware(p[0], bobHeight(), p[1], k >= 6 ? ADMIN_MALWARE_SIZE : MALWARE_SIZE)
      crown.visible = k >= 6
      view.actor = malware
    }
    if (k >= 5) w.implant.visible = true
    if (k >= 4 && k <= 7) placeSensor(0.5, 3.3 + Math.sin(view.time * 3) * 0.1, 3.5)
    else if (k >= 8) placeSensor(0.5, 0.25, 3.5, 0.5)
    if (k >= 11) {
      markCompromised(1, -2.3, 2.6)
      markCompromised(2, -4.8, 3.9)
      w.segmentWall.visible = true
      w.segmentWall.position.y = 1.5
    }
    if (k === 12 || k === 13)
      for (let i = 0; i < 4; i++) {
        const p = pileSpot(i)
        racks[i].data.position.set(p[0], p[1], p[2])
      }
    if (k >= 14)
      for (let i = 0; i < 4; i++) {
        const p = stolenSpot(i)
        racks[i].data.position.set(p[0], p[1], p[2])
      }
  }

  /** 攻撃側のサーバーと、サーバー室のマルウェアを結ぶ指令の通信路を出す。両端の座標を返す */
  function showC2Link(t: number) {
    const a = [TOWER_SPOT[0], 2.9, TOWER_SPOT[1]]
    const b = [SERVER_SPOT[0], 0.7, SERVER_SPOT[1]]
    stretchBetween(c2Link, a, b, 0.1)
    c2Link.material.opacity = 0.45 + 0.25 * Math.sin(t * 8)
    return [a, b]
  }

  /** t0〜t1 のあいだに、a から b へ山なりに飛ばす。spin を渡すと飛んでいる間だけ回る。進んだ割合を返す */
  function flyTo(
    o: Object3D,
    a: Vec3,
    b: Vec3,
    t: number,
    t0: number,
    t1: number,
    h?: number,
    spin?: number,
  ) {
    const p = progress(t, t0, t1)
    o.visible = true
    arcBetween(o, a, b, smooth(p), h || 0)
    if (spin && p > 0 && p < 1) o.rotation.y = t * spin
    return p
  }

  /** t0 に、ぽんと現れる。s は最終的な大きさ */
  function popIn(o: Object3D, x: number, y: number, z: number, t: number, t0: number, s?: number) {
    const k = (s == null ? 1 : s) * overshoot(progress(t, t0, t0 + 0.3))
    o.visible = k > 0.01
    o.position.set(x, y, z)
    o.scale.set(k, k, k)
  }

  /** 赤い × を出す（止めた・通らなかった） */
  function showCross(x: number, y: number, z: number, t: number, t0: number) {
    popIn(crossMark, x, y + Math.sin(view.time * 6) * 0.08, z, t, t0)
    crossMark.rotation.y = 0.6
  }

  /** 緑のチェックを出す（通った・戻った） */
  function showCheck(x: number, y: number, z: number, t: number, t0: number) {
    popIn(checkMark, x, y, z, t, t0)
    checkMark.rotation.y = 0.6
  }

  /** t0〜t1 のあいだ、その場で跳ねさせる */
  function hopInPlace(o: Object3D, t: number, t0: number, t1: number, h?: number) {
    if (t > t0 && t < t1) o.position.y = Math.abs(Math.sin((t - t0) * 9)) * (h || 0.2)
  }

  /** t0〜t1 のあいだ、「！」を出す */
  function showAlert(i: number, x: number, y: number, z: number, t: number, t0: number, t1: number) {
    if (t > t0 && t < t1) {
      const b = alertMarks[i]
      b.visible = true
      b.position.set(x, y + Math.abs(Math.sin(t * 9)) * 0.2, z)
    }
  }

  /** マルウェアを a から b へ跳ばして着地させる */
  function jumpMalware(t: number, t0: number, t1: number, a: Vec3, b: Vec3, h: number, s: number) {
    const p = smooth(progress(t, t0, t1))
    placeMalware(
      lerp(a[0], b[0], p),
      lerp(a[1], b[1], p) + Math.sin(Math.PI * p) * h + (p >= 1 ? bobHeight() : 0),
      lerp(a[2], b[2], p),
      s,
    )
  }

  /** 防御側の番（4.6 秒以降）に、センサーが見張りに降りてくる */
  function sensorArrives(t: number) {
    if (t > 4.6)
      placeSensor(0.5, lerp(8, 3.3, smooth(progress(t, 4.6, 5.6))) + Math.sin(view.time * 3) * 0.1, 3.5)
  }

  /** 攻撃者の頭上に、操作中のしるしを出す */
  function showOperatorOrb(t: number) {
    operatorOrb.visible = true
    operatorOrb.position.set(ATTACKER_SPOT[0], 2.9 + Math.sin(t * 5) * 0.1, ATTACKER_SPOT[1])
    operatorOrb.rotation.set(t * 2, t * 3, 0)
  }

  return {
    ...w,
    view,
    reset,
    storyState,
    openGate,
    standing,
    placeMalware,
    placeSensor,
    markCompromised,
    pileSpot,
    stolenSpot,
    bobHeight,
    aboveAttacker,
    aboveHost,
    showC2Link,
    flyTo,
    popIn,
    showCross,
    showCheck,
    hopInPlace,
    showAlert,
    jumpMalware,
    sensorArrives,
    showOperatorOrb,
  }
}

export type Kit = ReturnType<typeof createKit>
