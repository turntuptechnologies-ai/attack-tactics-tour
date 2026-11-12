// 場面を書くための道具。舞台の物（world）に、よく使う動かし方を足して、場面に渡す。
// 毎フレーム reset() で全部を初期状態に戻してから場面の run(t) を呼ぶので、
// 場面は「時刻 t のときの状態」を毎回ゼロから組み立てればよい（前のフレームを引きずらない）。
import { Box3, Object3D, Vector3 } from 'three'
import {
  arcBetween,
  overshoot,
  stretchBetween,
  clamp01,
  lerp,
  applyPose,
  bounce,
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
      w.gateGuard,
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
    w.c2Tower.position.set(TOWER_SPOT[0], 0, TOWER_SPOT[1])
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
    w.gateGuard.position.set(0, 3.2, 7.15)
  }

  /**
   * k 番目の戦術に入った時点の、本編の状況を作る（k は TACTICS の添字）。
   * 本編はひとつの侵入が続いていく話なので、あとの戦術ほど、すでに起きたことが積み重なっている。
   */
  function storyState(k: number) {
    applyPose(w.defender, standing(w.DEFENDER_SPOT[0], w.DEFENDER_SPOT[1], 0.4))
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

  /** t0 から、コードが動いているしるし（らせんを描いて上がるピンクの粒）を出す。first は、使う粒の最初の番号 */
  function showSparks(x: number, y: number, z: number, t: number, t0: number, first = 0, count = 4) {
    for (let i = 0; i < count; i++) {
      const p = progress(t, t0 + i * 0.2, t0 + 1.0 + i * 0.2)
      if (p <= 0 || p >= 1) continue
      const cube = w.pinkCubes[first + i]
      const size = 0.28 * (1 - p * 0.6)
      cube.visible = true
      cube.scale.set(size, size, size)
      cube.position.set(x + Math.sin(i * 2.1 + p * 5) * 0.5, y + p * 2.0, z + Math.cos(i * 2.1 + p * 5) * 0.5)
    }
  }

  /**
   * 永続化の見せ方。見張りが t0 にマルウェアを見つけて消すが、t1 に from（残しておいた仕掛け）から戻ってくる。
   * 水色の線は 3 本目（cyanBeams[2]）を使う。
   */
  function wipeThenReturn(t: number, t0: number, t1: number, from: Vec3) {
    const over = smooth(progress(t, t0 - 0.6, t0)) * (1 - smooth(progress(t, t0 + 0.6, t0 + 1.1)))
    placeSensor(
      lerp(0.5, HOST_SPOT[0], over),
      lerp(3.3, 2.7, over) + Math.sin(view.time * 3) * 0.1,
      lerp(3.5, HOST_SPOT[1], over),
    )
    if (t > t0 && t < t0 + 0.4) {
      const ray = w.cyanBeams[2]
      ray.visible = true
      ray.rotation.set(0, 0, 0)
      ray.position.set(HOST_SPOT[0], 1.6, HOST_SPOT[1])
      ray.scale.set(0.3, 1.8, 0.3)
    }
    if (t > t0 + 0.1 && t < t1)
      placeMalware(HOST_SPOT[0], 0, HOST_SPOT[1], MALWARE_SIZE * (1 - progress(t, t0 + 0.1, t0 + 0.4)))
    else if (t >= t1)
      jumpMalware(
        t,
        t1,
        t1 + 0.7,
        from,
        aboveHost(0),
        1.0,
        MALWARE_SIZE * overshoot(progress(t, t1, t1 + 0.3)),
      )
  }

  /**
   * ステルスの見せ方。見張りが t0〜t1 のあいだ、(x, z) の真上まで調べに来て、何も見つけずに戻る。
   * ray を true にすると、真下を照らす（水色の線の 3 本目 cyanBeams[2] を使う）。
   */
  function sensorVisits(t: number, t0: number, t1: number, x: number, z: number, ray = false) {
    const near = smooth(progress(t, t0, t0 + 0.6)) * (1 - smooth(progress(t, t1 - 0.5, t1)))
    placeSensor(lerp(0.5, x, near), lerp(3.3, 3.0, near) + Math.sin(view.time * 3) * 0.1, lerp(3.5, z, near))
    if (ray && t > t0 + 0.6 && t < t1 - 0.5) {
      const beam = w.cyanBeams[2]
      beam.visible = true
      beam.rotation.set(0, 0, 0)
      beam.position.set(x, 1.5, z)
      beam.scale.set(0.3, 2.4, 0.3)
    }
  }

  // ---- 防御側の番（4.6 秒から）の絵 ----
  // 防御側の字幕が言っていることを、その場面でねらわれている物に対して描く。
  // 相手（target）は、座標 [x, y, z] でも、舞台の物そのものでも渡せる。物を渡すと、その物のてっぺんを指す。
  // 「！」は 3 つ目と 4 つ目、水色の線は 3 本目と 5 本目を使う。場面の側では、防御側の番にこれらを使わないこと。

  type Target = Vec3 | Object3D
  const box = new Box3()
  const boxCentre = new Vector3()
  /** 相手の場所。物なら、そのてっぺんの中央 */
  function spotOf(target: Target): number[] {
    if (!(target instanceof Object3D)) return [target[0], target[1], target[2]]
    box.setFromObject(target)
    if (box.isEmpty()) return [target.position.x, target.position.y, target.position.z]
    box.getCenter(boxCentre)
    return [boxCentre.x, box.max.y, boxCentre.z]
  }
  /** 防御者が相手へ向ける、水色の細い線（目を向ける、手を打つ） */
  function defenderReaches(t: number, at: Vec3, t0 = 5.0, t1 = 6.7) {
    const d = w.defender.position
    if (t > t0 && t < t1) stretchBetween(w.cyanBeams[4], [d.x, 1.7, d.z], at, 0.05)
  }

  /** 検知する。防御者が気づいて（「！」）、怪しい物へ目を向ける。相手を省くと、いまの攻撃側の主役を見る */
  function defenderNotices(t: number, target: Target = view.actor) {
    const d = w.defender.position
    showAlert(3, d.x, 2.2, d.z, t, 4.9, 6.5)
    defenderReaches(t, spotOf(target), 5.1)
  }

  /** 止める。気づいたうえで、相手の上に × を出す（遮断する、使えなくする） */
  function defenderBlocks(t: number, target: Target = view.actor) {
    const at = spotOf(target)
    defenderNotices(t, target)
    // 攻撃側の主役の頭上には名前の札が出るので、× はその上に出す
    showCross(at[0], at[1] + (target === view.actor ? 1.9 : 0.9), at[2], t, 5.5)
  }

  /** 錠を掛ける。相手に錠が降りてくる（権限を絞る、書き込めなくする、守る） */
  function defenderLocks(t: number, target: Target) {
    const at = spotOf(target)
    defenderReaches(t, at)
    if (t < 5.0) return
    w.padlock.visible = true
    w.padlock.scale.set(0.7, 0.7, 0.7)
    w.padlock.rotation.set(0, 0.6, 0)
    w.padlock.position.set(at[0], at[1] + 0.55 + (1 - bounce(progress(t, 5.0, 5.7))) * 5, at[2])
  }

  /** 取り除く。相手が × とともに消える（不審なものを消す、機能を無効にする、閉じる） */
  function defenderRemoves(t: number, target: Object3D) {
    const at = spotOf(target)
    defenderReaches(t, at, 5.0, 5.9)
    showCross(at[0], at[1] + 0.9, at[2], t, 5.3)
    const left = 1 - smooth(progress(t, 5.3, 5.9))
    target.scale.multiplyScalar(Math.max(left, 0.001))
    if (left < 0.02) target.visible = false
  }

  /** 点検する。水色の光の板が、相手の上を端から端まで走る（監査する、設定を確かめる、検証する） */
  function defenderScans(t: number, from: Target, to: Target = from) {
    const a = spotOf(from)
    const b = spotOf(to)
    const wide = from === to ? 1.1 : 0.5
    defenderReaches(t, [(a[0] + b[0]) / 2, Math.max(a[1], b[1]), (a[2] + b[2]) / 2], 4.9, 5.4)
    if (t < 5.0 || t > 6.6) return
    const p = smooth(progress(t, 5.0, 6.6))
    w.scanPlane.visible = true
    w.scanPlane.rotation.set(0, Math.PI / 2, 0)
    w.scanPlane.scale.set(1.8, 2.2, 0.08)
    // 高い所にある物（雲など）は、その高さで照らす
    const height = Math.max(1.15, Math.max(a[1], b[1]) - 0.9)
    w.scanPlane.position.set(lerp(a[0] - wide, b[0] + wide, p), height, lerp(a[2], b[2], p))
    w.scanPlane.material.opacity = 0.42
  }

  /**
   * 見張りを向かわせる。見張り（ドローン）が相手の真上まで来て、下を照らす（振る舞いを監視する）。
   * 浮かんでいる見張りがいればそれを、いなければ（まだ居ない、または止められている）新しい見張りを呼ぶ。
   */
  function defenderSendsSensor(t: number, target: Target = view.actor) {
    const at = spotOf(target)
    const hover = Math.max(at[1] + 1.7, 3.2) + Math.sin(view.time * 3) * 0.1
    const sensor = drones[2]
    const arrive = smooth(progress(t, 4.8, 5.6))
    if (sensor.visible && sensor.position.y > 1.5 && sensor.rotation.z === 0) {
      if (t > 4.8)
        placeSensor(
          lerp(sensor.position.x, at[0], arrive),
          lerp(sensor.position.y, hover, arrive),
          lerp(sensor.position.z, at[2], arrive),
        )
    } else if (t > 4.8) {
      const extra = drones[0]
      extra.visible = true
      extra.rotation.set(0, 0, 0)
      extra.position.set(at[0], lerp(hover + 6, hover, arrive), at[2])
      extra.userData.rot.rotation.y = view.time * 20
    }
    if (t > 5.6 && t < 6.7) {
      const ray = w.cyanBeams[2]
      const height = hover - at[1] - 0.3
      ray.visible = true
      ray.rotation.set(0, 0, 0)
      ray.scale.set(0.3, Math.max(height, 0.2), 0.3)
      ray.position.set(at[0], at[1] + height / 2, at[2])
    }
  }

  /** 直す。相手の上に緑のチェックが出る（更新する、守りの機能を有効にする） */
  function defenderApproves(t: number, target: Target) {
    const at = spotOf(target)
    defenderReaches(t, at, 5.0, 5.8)
    showCheck(at[0], at[1] + 0.9, at[2], t, 5.4)
  }

  /** 従業員に確かめさせる。声を掛けられた従業員が気づき、確かめてから進める（訓練する、別の経路で確かめる） */
  function defenderWarnsStaff(t: number, who: number) {
    const employee = w.employees[who]
    const { x, z } = employee.position
    defenderReaches(t, [x, 1.6, z], 4.9, 5.7)
    hopInPlace(employee, t, 5.1, 5.8, 0.15)
    showAlert(2, x + 0.6, 2.7, z + 0.7, t, 5.1, 5.8)
    // 席のすぐ奥に侵入した端末があることが多いので、チェックは従業員の手前寄りに出す
    showCheck(x + 0.6, 2.9, z + 0.7, t, 5.8)
  }

  /** 記録を取り寄せる。相手の所から、記録の紙が防御者の手もとへ飛んでくる（記録する、照会を監視する、監査する） */
  function defenderCollectsLogs(t: number, target: Target) {
    const at = spotOf(target)
    const d = w.defender.position
    defenderReaches(t, at, 4.9, 5.5)
    if (t > 5.1) flyPaper(w.documents[3], at, [d.x - 0.7, 2.4, d.z], t, 5.3, 6.3, 1.4, 5.1, 0.75)
  }

  /** 通り道を断つ。2 つの場所を結ぶ道のまん中に × を出す（通信を遮断する、つながりを減らす） */
  function defenderCutsLink(t: number, from: Target, to: Target) {
    const a = spotOf(from)
    const b = spotOf(to)
    const middle = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + 0.6, (a[2] + b[2]) / 2]
    defenderNotices(t, middle)
    showCross(middle[0], middle[1] + 0.5, middle[2], t, 5.5)
  }

  /**
   * 備えを固める。入口に守りの盾が降りてくる。
   * 偵察やリソース開発のように、攻撃側の動きそのものは標的から見えない段階で使う。
   */
  function defenderHardens(t: number) {
    if (t < 4.9) return
    w.gateGuard.visible = true
    w.gateGuard.position.y = 3.2 + (1 - bounce(progress(t, 4.9, 5.6))) * 6
  }

  /** 外に見せるものを減らす。外壁に出ている物（黄色い箱）が小さくなる（公開する情報を絞る） */
  function defenderHidesExposure(t: number) {
    const less = smooth(progress(t, 5.0, 5.8))
    let shown: Object3D | null = null
    for (const cube of w.yellowCubes) {
      if (!cube.visible) continue
      shown = shown ?? cube
      cube.scale.multiplyScalar(lerp(1, 0.4, less))
    }
    const at = shown ? spotOf(shown) : [0, 3, 6.5]
    defenderReaches(t, at, 4.9, 5.8)
    showCheck(at[0], at[1] + 1.1, at[2], t, 5.8)
  }

  /** 外を見張る。防御者が外の相手へ目を向け、そこから分かったこと（紙）を手もとに集める（脅威情報で監視する） */
  function defenderWatchesOutside(t: number, target: Target) {
    const at = spotOf(target)
    const d = w.defender.position
    defenderReaches(t, at, 4.9, 6.7)
    if (t > 5.1) flyPaper(w.documents[3], at, [d.x - 0.7, 2.6, d.z], t, 5.3, 6.4, 2.6, 5.1, 0.75)
  }

  /**
   * ピンクの粒を、折れ線 path に沿って等間隔に流す（通信が流れている様子）。
   * clock は進み具合で、1 増えるごとに端から端まで 1 回流れる。size は粒の大きさ（[x, y, z] でも渡せる）。
   */
  function flowAlong(path: Vec3[], count: number, clock: number, size: number | Vec3 = 0.28) {
    const legs = path.length - 1
    for (let i = 0; i < count; i++) {
      const along = ((clock + i / count) % 1) * legs
      const j = Math.min(legs - 1, Math.floor(along))
      const q = along - j
      const cube = w.pinkCubes[i]
      cube.visible = true
      if (typeof size === 'number') cube.scale.set(size, size, size)
      else cube.scale.set(size[0], size[1], size[2])
      cube.position.set(
        lerp(path[j][0], path[j + 1][0], q),
        lerp(path[j][1], path[j + 1][1], q),
        lerp(path[j][2], path[j + 1][2], q),
      )
    }
  }

  /** 侵入した端末を中心にした円の上の点。集めた鍵などを、マルウェアのまわりに回すのに使う */
  const aroundHost = (angle: number, radius = 1, y = 2.4) => [
    HOST_SPOT[0] + Math.cos(angle) * radius,
    y,
    HOST_SPOT[1] + Math.sin(angle) * radius,
  ]

  /**
   * 床に広がる波紋（2 本の輪）を出す。clock は波の進み具合で、1 増えるごとに 1 回広がる
   * （たとえば (t - 1.6) * 0.9 なら、1.6 秒から始まって 1 秒に 0.9 回）。spread は広がる大きさ。
   */
  function showRipples(x: number, z: number, clock: number, spread: number, strength = 0.5) {
    w.pulseRings.forEach((ring, j) => {
      const phase = (clock + j * 0.5) % 1
      const scale = 1 + phase * spread
      ring.visible = true
      ring.scale.set(scale, 0.02, scale)
      ring.position.set(x, 0.08, z)
      ring.material.opacity = strength * (1 - phase)
    })
  }

  /**
   * 紙（documents のひとつ）を、appear にぽんと出して、t0〜t1 のあいだに from から to へ山なりに飛ばす。
   * 飛んでいる間は回り、着いたら正面を向く。arc は山の高さ、size は紙の大きさ。
   */
  function flyPaper(
    paper: Object3D,
    from: Vec3,
    to: Vec3,
    t: number,
    t0: number,
    t1: number,
    arc: number,
    appear: number,
    size = 0.8,
  ) {
    const k = size * overshoot(progress(t, appear, appear + 0.3))
    flyTo(paper, from, to, t, t0, t1, arc, 5)
    paper.scale.set(k, k, k)
    if (t >= t1) paper.rotation.y = 0.6
  }

  /** 探索の見せ方。t0 から dur 秒のあいだ、マルウェアから to へ、調べる線（ピンクの線の i 本目）を伸ばす */
  function probeFromHost(i: number, to: Vec3, t: number, t0: number, dur = 0.6) {
    if (t > t0 && t < t0 + dur) stretchBetween(w.pinkBeams[i], aboveHost(0.9), to, 0.07)
  }

  /** 探索の見せ方。t0 に、調べて分かったこと（紙の i 枚目）を from からマルウェアの頭上へ持ち帰る */
  function takeNote(i: number, from: Vec3, t: number, t0: number) {
    if (t < t0) return
    const to = [HOST_SPOT[0] - 0.9 + i * 0.6, 2.8 + (i & 1) * 0.4, HOST_SPOT[1]]
    flyPaper(w.documents[i], from, to, t, t0 + 0.2, t0 + 1.0, 1.0, t0)
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
    showSparks,
    wipeThenReturn,
    sensorVisits,
    probeFromHost,
    takeNote,
    showRipples,
    flyPaper,
    flowAlong,
    aroundHost,
    defenderNotices,
    defenderBlocks,
    defenderLocks,
    defenderRemoves,
    defenderScans,
    defenderSendsSensor,
    defenderApproves,
    defenderWarnsStaff,
    defenderCollectsLogs,
    defenderCutsLink,
    defenderHardens,
    defenderHidesExposure,
    defenderWatchesOutside,
  }
}

export type Kit = ReturnType<typeof createKit>
