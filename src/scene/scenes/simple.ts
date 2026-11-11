// 型の場面（簡易表示）。専用の場面を持たない技術は、戦術ごとに用意した型の絵で見せる。
// 型は戦術ごとに1つで、絵の種類（variant）が 0〜2 の3通りある。どの技術がどれを使うかはデータ側で決める。
// 専用の場面と違い、その技術だけの仕組みまでは描かない。「その戦術で何をねらうのか」が伝わればよい。
import type { Kit } from '../kit'
import { applyPose, arcBetween, lerp, overshoot, progress, smooth, stretchBetween, walk } from '../motion'
import type { SceneDef } from './types'

/** 型ごとの絵の種類の数 */
export const SIMPLE_VARIANTS = 3

export function createSimpleScenes(kit: Kit) {
  const {
    view,
    attacker,
    defender,
    employees,
    malware,
    crown,
    disguise,
    pinkCubes,
    yellowCubes,
    rackMarks,
    pulseRings,
    pinkBeams,
    cyanBeams,
    documents,
    mails,
    mail,
    spareKeys,
    key,
    token,
    user,
    impostor,
    trustedProcess,
    trustedProcessEyes,
    hammer,
    cloud,
    relayBot,
    bots,
    racks,
    c2Link,
    ATTACKER_SPOT: A,
    HOST_SPOT: H,
    SERVER_SPOT: S,
    TOWER_SPOT,
    MALWARE_SIZE,
    ADMIN_MALWARE_SIZE,
    RACK_Z,
    storyState,
    standing,
    placeMalware,
    jumpMalware,
    placeSensor,
    sensorArrives,
    markCompromised,
    bobHeight,
    aboveAttacker,
    aboveHost,
    pileSpot,
    stolenSpot,
    openGate,
    flyTo,
    popIn,
    showCheck,
    showAlert,
    hopInPlace,
    showC2Link,
    showOperatorOrb,
  } = kit

  /** (x, z) から床に広がる輪 */
  function pulse(x: number, z: number, t: number, from: number, to: number, reach: number) {
    if (t < from || t > to) return
    pulseRings.forEach((ring, j) => {
      const phase = ((t - from) * 0.55 + j * 0.5) % 1
      const scale = 1 + phase * reach
      ring.visible = true
      ring.scale.set(scale, 0.02, scale)
      ring.position.set(x, 0.08, z)
      ring.material.opacity = 0.5 * (1 - phase)
    })
  }

  /** (x, z) から立ちのぼる粒（何かが動いた合図） */
  function sparks(x: number, z: number, t: number, from: number) {
    for (let i = 0; i < 5; i++) {
      const p = progress(t, from + i * 0.2, from + i * 0.2 + 1)
      if (p <= 0 || p >= 1) continue
      const cube = pinkCubes[i]
      const size = 0.3 * (1 - p * 0.6)
      cube.visible = true
      cube.scale.set(size, size, size)
      cube.position.set(
        x + Math.sin(i * 2.1 + p * 5) * 0.55,
        0.8 + p * 2.3,
        z + Math.cos(i * 2.1 + p * 5) * 0.55,
      )
    }
  }

  /** i 番目のピンクの箱を、その場に浮かべる */
  function hover(i: number, at: number[], t: number, from: number, size = 0.36) {
    const cube = pinkCubes[i]
    const s = size * overshoot(progress(t, from, from + 0.3))
    cube.visible = s > 0.01
    cube.scale.set(s, s, s)
    cube.position.set(at[0], at[1] + Math.sin(view.time * 4 + i) * 0.06, at[2])
    cube.rotation.y = view.time * 2
  }

  /** i 番目のピンクの箱を、from から to へ飛ばす */
  function send(
    i: number,
    from: number[],
    to: number[],
    t: number,
    t0: number,
    t1: number,
    arc = 2.5,
    size = 0.36,
  ) {
    if (t < t0) return
    const cube = pinkCubes[i]
    flyTo(cube, from, to, t, t0, t1, arc, 5)
    cube.scale.set(size, size, size)
  }

  const types: ((variant: number) => SceneDef)[] = [
    // 偵察: 攻撃者が外から探り、手がかりが集まってくる（0=外壁から、1=人から、2=外の情報源から）
    (v) => ({
      hits: [3.6],
      run(t) {
        view.target = [1, 8.5]
        view.height = 15
        applyPose(attacker, standing(A[0], A[1]))
        applyPose(defender, standing(-3, 4.6, 0.4))
        pulse(A[0], A[1], t, 0.3, 3.6, 12)
        const sources =
          v === 0
            ? [
                [-7, 2.6, 6.5],
                [-3, 2.6, 6.5],
                [4, 2.6, 6.5],
              ]
            : v === 1
              ? [0, 2, 3].map((i) => [employees[i].position.x, 2.4, employees[i].position.z])
              : [
                  [-4.4, 4.9, 11.5],
                  [-3.5, 4.9, 11.5],
                  [-2.6, 4.9, 11.5],
                ]
        if (v === 2) {
          popIn(cloud, -3.5, 4.2, 11.5, t, 0.2, 1.5)
          cloud.rotation.y = 0.6
        }
        sources.forEach((from, i) => {
          const start = 0.8 + i * 0.6
          if (t < start) return
          send(i, from, [A[0] - 0.6 + i * 0.6, 2.9, A[1]], t, start + 0.5, start + 1.5)
          const size = 0.36 * overshoot(progress(t, start, start + 0.3))
          pinkCubes[i].scale.set(size, size, size)
        })
      },
    }),
    // リソース開発: 攻撃者が手もとで準備する（0=道具を作る、1=外に置き場を確保する、2=アカウントを手に入れる）
    (v) => ({
      hits: [3.0],
      run(t) {
        view.target = [1.2, 11]
        view.height = 12
        applyPose(attacker, standing(A[0], A[1], -1.2))
        applyPose(defender, standing(2, 5, 0.4))
        if (v === 0) {
          if (t > 0.4 && t < 2.9) {
            hammer.visible = true
            hammer.position.set(1.7, 0.9, 12.5)
            hammer.rotation.z = 0.3 + Math.abs(Math.cos(((t - 0.6) * Math.PI) / 0.7))
          }
          const built = t > 0.6 ? 0.25 + 0.75 * progress(t, 0.6, 2.8) : 0
          placeMalware(0.6, t > 2.9 ? bobHeight() : 0, 12.4, MALWARE_SIZE * built)
        } else if (v === 1) {
          popIn(cloud, -1.6, 3.2, 12, t, 0.5, 1.4)
          cloud.rotation.y = 0.6
          if (t > 1.6 && t < 2.6) stretchBetween(pinkBeams[0], [A[0], 1.6, A[1]], [-1.6, 3.2, 12], 0.08)
          hover(0, [-1.6, 4.4, 12], t, 2.5, 0.45)
        } else {
          const figure = t >= 2.6 ? impostor : user
          figure.visible = true
          applyPose(figure, standing(-0.8, 12.2, 0.6))
          figure.position.y = Math.sin(Math.PI * progress(t, 2.6, 3.1)) * 0.5
          flyTo(key, aboveAttacker(), [-0.8, 2.7, 12.2], t, 1.0, 2.4, 1.5, 6)
          key.scale.set(0.8, 0.8, 0.8)
          if (t >= 2.4) key.rotation.y = t * 3
        }
      },
    }),
    // 初期アクセス: 外から中へ入り込む（0=門を通って、1=壁を越えて、2=中の人を経由して）
    (v) => ({
      hits: [3.4],
      run(t) {
        view.target = [2, 8]
        view.height = 14
        storyState(2)
        if (v === 0) {
          openGate(progress(t, 1.2, 1.8) - progress(t, 3.6, 4.1))
          if (t < 2.3) send(0, aboveAttacker(), [0, 1.2, 6.8], t, 0.6, 2.2, 1.5, 0.4)
          else {
            jumpMalware(
              t,
              2.3,
              3.3,
              [0, 0.4, 6.2],
              aboveHost(0),
              1.0,
              MALWARE_SIZE * overshoot(progress(t, 2.3, 2.6)),
            )
            view.actor = malware
          }
        } else if (v === 1) {
          if (t > 0.8) {
            jumpMalware(t, 0.8, 3.3, aboveAttacker(), aboveHost(0), 5, MALWARE_SIZE * progress(t, 0.8, 1.2))
            if (t > 3.3) view.actor = malware
          }
        } else {
          const seat = employees[1].position
          if (t < 2.0) flyTo(mail, aboveAttacker(), [seat.x, 1.9, seat.z + 0.1], t, 0.5, 1.8, 3.2, 5)
          showAlert(0, seat.x, 2.3, seat.z, t, 1.8, 2.8)
          if (t > 2.6) {
            placeMalware(
              seat.x + 0.95,
              bobHeight(),
              seat.z + 0.2,
              MALWARE_SIZE * overshoot(progress(t, 2.6, 3.0)),
            )
            view.actor = malware
          }
        }
      },
    }),
    // 実行: 入り込んだコードが動き出す（0=自分で、1=利用者の操作で、2=システムの機能を借りて）
    (v) => ({
      hits: [2.8],
      run(t) {
        view.target = [1.6, 3.6]
        view.height = 10
        storyState(3)
        if (v === 1) {
          showAlert(0, 3.5, 2.2, 3.5, t, 0.5, 1.6)
          hopInPlace(employees[2], t, 1.0, 1.8)
        }
        if (v === 2) {
          token.visible = t < 1.8
          token.scale.set(0.7, 0.7, 0.7)
          arcBetween(token, [0, 0.6, 2.2], aboveHost(1.2), smooth(progress(t, 0.8, 1.8)), 1.0)
          token.rotation.y = t * 3
        }
        if (t > 1.8 && t < 4.4) malware.position.y = Math.abs(Math.sin(t * 6)) * 0.25
        sparks(H[0], H[1], t, 1.9)
        sensorArrives(t)
      },
    }),
    // 永続化: 消されても戻れる仕掛けを残す（0=端末に、1=サーバーに、2=アカウントに）
    (v) => ({
      hits: [4.2],
      run(t) {
        storyState(4)
        const far = v === 1
        view.target = far ? [1.5, 1] : [2.4, 3.4]
        view.height = far ? 17 : 10
        const at = v === 0 ? [2.9, 1.0, 4.5] : v === 1 ? [racks[3].x, 3.5, RACK_Z] : [3.6, 2.5, 1.8]
        if (v === 2) {
          popIn(user, 3.6, 0, 1.8, t, 0.3)
          user.rotation.y = 0.5
        }
        send(0, aboveHost(1.2), at, t, 0.6, 1.6, far ? 3.5 : 1.5, 0.34)
        if (t >= 1.6) pinkCubes[0].rotation.y = view.time * 2
        if (far && t > 1.6) racks[3].lights.color.setHex(0xff6fd8)
        // いったん消されても、残した仕掛けから戻ってくる
        if (t >= 2.3 && t < 3.4) placeMalware(H[0], 0, H[1], MALWARE_SIZE * (1 - progress(t, 2.3, 2.6)))
        else if (t >= 3.4)
          jumpMalware(
            t,
            3.4,
            4.2,
            at,
            aboveHost(0),
            far ? 3 : 1,
            MALWARE_SIZE * overshoot(progress(t, 3.4, 3.7)),
          )
      },
    }),
    // 権限昇格: より強い権限を手に入れる（0=弱点を突いて、1=人の権限を借りて、2=強い権限の仕組みに乗って）
    (v) => ({
      hits: [3.3],
      run(t) {
        view.target = [0.8, 2.8]
        view.height = 10
        storyState(5)
        const side = [-0.8, 2.6]
        if (v === 0) {
          const cube = yellowCubes[0]
          const angle = t * 4
          const radius = 1.2 * (1 - smooth(progress(t, 1.6, 2.8)))
          cube.visible = t < 2.8
          cube.material.color.setHex(t > 2.0 && Math.sin(t * 40) > 0 ? 0xff4a3d : 0xf6c531)
          cube.scale.set(0.3, 0.3, 0.3)
          cube.position.set(H[0] + Math.cos(angle) * radius, 1.0, H[1] + Math.sin(angle) * radius)
        } else if (v === 1) {
          user.visible = true
          applyPose(user, standing(side[0], side[1], 0.5))
          if (t < 2.8) flyTo(token, [side[0], 2.4, side[1]], aboveHost(2.2), t, 1.4, 2.8, 1.2, 5)
        } else {
          trustedProcess.visible = true
          trustedProcess.scale.set(1.6, 1.6, 1.6)
          trustedProcess.position.set(side[0], 0, side[1])
          trustedProcess.rotation.y = 0.6
          trustedProcessEyes.visible = false
          if (t > 1.2 && t < 2.8) stretchBetween(pinkBeams[0], aboveHost(0.9), [side[0], 0.9, side[1]], 0.09)
        }
        if (t > 2.8) {
          crown.visible = true
          const size = lerp(MALWARE_SIZE, ADMIN_MALWARE_SIZE, overshoot(progress(t, 2.8, 3.2)))
          malware.scale.set(size, size, size)
        }
      },
    }),
    // ステルス: 見つからないようにする（0=別物に見せかける、1=身をひそめる、2=中身を分かりにくくする）
    (v) => ({
      hits: [3.4],
      run(t) {
        view.target = [1.5, 4]
        view.height = 10
        storyState(6)
        const until = 1 - smooth(progress(t, 5.6, 6.2))
        if (v === 0) {
          malware.rotation.y = 0.6 + smooth(progress(t, 0.6, 1.4)) * Math.PI * 4
          disguise.visible = t > 1.0
          crown.visible = t <= 1.0
          if (t > 1.4) malware.position.y = 0
        } else if (v === 1) {
          const hidden = smooth(progress(t, 0.8, 1.5)) * until
          malware.position.y = 0
          malware.scale.y *= 1 - 0.82 * hidden
          crown.visible = hidden < 0.5
        } else {
          const shown = smooth(progress(t, 0.6, 1.2)) * until
          for (let i = 0; i < 6; i++) {
            const cube = pinkCubes[i]
            const angle = t * 4 + i * 1.05
            const size = 0.3 * shown
            cube.visible = size > 0.01
            cube.scale.set(size, size, size)
            cube.position.set(
              H[0] + Math.cos(angle) * 0.75,
              0.5 + (i % 3) * 0.5,
              H[1] + Math.sin(angle) * 0.75,
            )
          }
        }
        // 防御側が見回っても、気づかずに通り過ぎる
        applyPose(
          defender,
          walk(
            [
              [0, -5, 5.4],
              [1.6, -5, 5.4],
              [4.4, 6, 5.4],
              [7, 6, 5.4],
            ],
            t,
            0,
          ),
        )
      },
    }),
    // 防御の妨害: 守りの仕組みを弱める（0=見張りを止める、1=入口の守りを開ける、2=記録や設定を書き換える）
    (v) => ({
      hits: [2.4],
      run(t) {
        view.target = [1, 4.2]
        view.height = v === 1 ? 13 : 10
        storyState(7)
        const at = v === 0 ? [0.5, 3.3, 3.5] : v === 1 ? [0, 1.5, 6.4] : [0, 1.7, 2.3]
        if (t > 0.9 && t < 1.5) stretchBetween(pinkBeams[0], aboveHost(0.8), at, 0.11)
        if (v === 0) {
          const fall = progress(t, 1.4, 2.2)
          if (fall > 0) placeSensor(0.5, lerp(3.3, 0.25, fall * fall), 3.5, 0.5 * fall)
        } else if (v === 1) {
          openGate(progress(t, 1.4, 2.0) - progress(t, 5.2, 5.8))
          showCheck(0, 4.1, 6.9, t, 5.8)
        } else {
          const doc = documents[0]
          const fall = smooth(progress(t, 1.4, 2.0)) * (1 - smooth(progress(t, 5.4, 6)))
          doc.visible = true
          doc.scale.set(1.7, 1.7, 1.7)
          doc.position.set(at[0], lerp(at[1], 0.12, fall), at[2])
          doc.rotation.set((-fall * Math.PI) / 2, 0.6 * (1 - fall), 0)
        }
        if (t > 2.2 && t < 4.4) malware.position.y = Math.abs(Math.sin((t - 2.2) * 5)) * 0.4
      },
    }),
    // 認証情報アクセス: 鍵（認証情報）を手に入れる（0=端末や人から、1=サーバーから、2=通信の途中から）
    (v) => ({
      hits: [3.3],
      run(t) {
        storyState(8)
        const far = v === 1
        view.target = far ? [0.5, 0.5] : [0.5, 3.4]
        view.height = far ? 15 : 12
        const sources =
          v === 0
            ? [0, 3].map((i) => [employees[i].position.x, 2.4, employees[i].position.z])
            : v === 1
              ? [
                  [racks[2].x, 3.5, RACK_Z],
                  [racks[3].x, 3.5, RACK_Z],
                ]
              : [
                  [-3.5, 1.6, 0.4],
                  [-3.5, 1.6, -1.6],
                ]
        if (v === 2) stretchBetween(cyanBeams[0], [-3.5, 1.2, 2.0], [-3.6, 1.6, RACK_Z + 0.6], 0.07)
        sources.forEach((from, j) => {
          const start = 0.6 + j * 0.5
          const leave = start + 1.2
          const spare = spareKeys[j]
          if (t < start) return
          const size = 0.8 * overshoot(progress(t, start, start + 0.3))
          const angle = t * 2 + j * 2.09
          const orbit = [H[0] + Math.cos(angle), 2.3, H[1] + Math.sin(angle)]
          spare.visible = true
          spare.rotation.y = t * 3 + j
          spare.scale.set(size, size, size)
          if (t < leave) spare.position.set(from[0], from[1] + Math.sin(t * 5 + j) * 0.08, from[2])
          else if (t < leave + 0.9)
            arcBetween(spare, from, orbit, smooth(progress(t, leave, leave + 0.9)), 1.5)
          else spare.position.set(orbit[0], orbit[1], orbit[2])
        })
      },
    }),
    // 探索: 中の様子を調べる（0=人やアカウントを、1=機器やネットワークを、2=その端末の中身を）
    (v) => ({
      hits: [3.2],
      run(t) {
        storyState(9)
        const far = v === 1
        view.target = far ? [0, -0.5] : [0.5, 3.2]
        view.height = far ? 15.5 : 12
        pulse(H[0], H[1], t, 0.3, 4.6, far ? 26 : 14)
        if (v === 0)
          [0, 1, 3].forEach((who, i) => {
            const seat = employees[who].position
            hover(i, [seat.x, 2.4, seat.z], t, 1.0 + i * 0.5)
          })
        else if (v === 1)
          racks.forEach((_, i) => {
            const start = 1.2 + i * 0.3
            if (t < start || i % 2) return
            const flash = rackMarks[i]
            const size = 0.4 * overshoot(progress(t, start, start + 0.3))
            flash.visible = true
            flash.scale.set(size, size, size)
            flash.position.y = 3.7
            flash.rotation.y = view.time * 2
          })
        else
          documents.slice(0, 3).forEach((doc, i) => {
            const angle = 1.2 + i * 2.1
            const y = 1.6 + Math.sin(view.time * 4 + i) * 0.06
            popIn(doc, H[0] + Math.sin(angle) * 1.7, y, H[1] + Math.cos(angle) * 1.7, t, 1.0 + i * 0.5, 0.9)
            doc.rotation.y = 0.6
          })
      },
    }),
    // 水平展開: となりの機器へ移る（0=遠隔の接続で、1=物を送り込んで、2=サーバーへ）
    (v) => ({
      hits: [3.0],
      run(t) {
        view.target = [-0.8, 1.6]
        view.height = 13
        storyState(10)
        const next = v === 2 ? [S[0], S[1] + 1.2] : [-2.3, 2.6]
        if (v === 1) {
          if (t > 0.8 && t < 2.2) send(0, aboveHost(1.2), [next[0], 0.6, next[1]], t, 0.8, 2.2, 2.2, 0.34)
        } else if (t > 0.8 && t < 2.2)
          stretchBetween(pinkBeams[0], aboveHost(0.9), [next[0], 0.7, next[1]], 0.09)
        if (t > 2.2) markCompromised(1, next[0], next[1], overshoot(progress(t, 2.2, 2.5)))
      },
    }),
    // 収集: ねらいの情報を集める（0=サーバーから、1=端末や共有の場所から、2=やり取りの中から）
    (v) => ({
      hits: [3.4],
      run(t) {
        storyState(11)
        view.target = v === 0 ? [-1.5, -3.2] : [-1, 0.5]
        view.height = v === 0 ? 10.5 : 14
        for (let i = 0; i < 2; i++) {
          const start = 0.6 + i * 0.9
          if (v === 0) {
            const rack = racks[i]
            const p = progress(t, start, start + 1.2)
            if (p <= 0) continue
            arcBetween(rack.data, [rack.x, 2.72, RACK_Z], pileSpot(i), smooth(p), 1.5)
            if (p < 1) rack.data.rotation.y = t * 5
          } else {
            if (t < start) continue
            const seat = employees[i ? 2 : 1].position
            const item = v === 1 ? documents[i] : mails[i]
            const size = overshoot(progress(t, start, start + 0.3))
            flyTo(
              item,
              [seat.x, 2.2, seat.z],
              [S[0] - 0.4 + i * 0.8, 0.35, S[1] + 1.4],
              t,
              start + 0.4,
              start + 1.6,
              3,
              5,
            )
            item.scale.set(size, size, size)
            if (t >= start + 1.6) item.rotation.y = 0.5
          }
        }
      },
    }),
    // コマンド＆コントロール: 外から指令を送る（0=直接つなぐ、1=別の機器を中継する、2=外のサービスを経由する）
    (v) => ({
      hits: [2.6],
      run(t) {
        view.target = [0.5, 4.8]
        view.height = 21
        storyState(12)
        view.actor = attacker
        showOperatorOrb(t)
        const from = [TOWER_SPOT[0], 2.9, TOWER_SPOT[1]]
        const to = [S[0], 0.7, S[1]]
        const via = v === 1 ? [-6, 0.7, 11] : [-5, 5.2, 8]
        const nodes = v === 0 ? [from, to] : [from, via, to]
        const legs = nodes.length - 1
        if (v === 1) {
          const size = 1.3 * overshoot(progress(t, 0.2, 0.5))
          relayBot.visible = size > 0.01
          relayBot.scale.set(size, size, size)
          relayBot.position.set(via[0], bobHeight(), via[2])
          relayBot.rotation.y = 0.6
        }
        if (v === 2) {
          popIn(cloud, via[0], via[1] - 0.4, via[2], t, 0.2, 1.6)
          cloud.rotation.y = 0.6
        }
        const drawn = progress(t, 0.6, 1.6) * legs
        ;[c2Link, pinkBeams[0]].slice(0, legs).forEach((line, j) => {
          if (drawn <= j) return
          stretchBetween(line, nodes[j], nodes[j + 1], 0.1)
          line.material.opacity = 0.45 + 0.25 * Math.sin(t * 8)
        })
        if (t > 1.6)
          for (let i = 0; i < 4; i++) {
            const along = (((t - 1.6) * 0.4 + i * 0.25) % 1) * legs
            const j = Math.min(legs - 1, Math.floor(along))
            const q = along - j
            const cube = pinkCubes[i]
            cube.visible = true
            cube.scale.set(0.3, 0.3, 0.3)
            cube.position.set(
              lerp(nodes[j][0], nodes[j + 1][0], q),
              lerp(nodes[j][1], nodes[j + 1][1], q),
              lerp(nodes[j][2], nodes[j + 1][2], q),
            )
          }
      },
    }),
    // 持ち出し: 集めたデータを外へ出す（0=指令の通信路で、1=外のサービスへ、2=目立たないよう少しずつ）
    (v) => ({
      hits: [3.9],
      run(t) {
        view.target = [0.5, 4.5]
        view.height = 21
        storyState(13)
        if (v === 0) showC2Link(t)
        const cloudAt = [-7, 5.2, 11]
        if (v === 1) {
          popIn(cloud, cloudAt[0], cloudAt[1], cloudAt[2], t, 0.2, 1.6)
          cloud.rotation.y = 0.6
        }
        for (let i = 0; i < 3; i++) {
          const start = 0.7 + i * 0.7
          const p = progress(t, start, start + 1.6)
          if (p <= 0) continue
          const data = racks[i].data
          const to = v === 1 ? [cloudAt[0] - 0.7 + i * 0.7, cloudAt[1] + 1.4, cloudAt[2]] : stolenSpot(i)
          arcBetween(data, pileSpot(i), to, smooth(p), v === 2 ? 1.2 : 4)
          if (v === 2) data.scale.set(0.3, 0.3, 0.3)
          if (p < 1) data.rotation.y = t * 5
        }
      },
    }),
    // 影響: 業務やデータに害を与える（0=止める・使えなくする、1=書き換える・狂わせる、2=資源を食いつぶす）
    (v) => ({
      hits: [2.8],
      run(t) {
        view.target = [0, -3.2]
        view.height = 13.5
        storyState(14)
        applyPose(defender, standing(4.8, -3, -Math.PI / 2))
        racks.forEach((rack, i) => {
          const start = 0.6 + i * 0.3
          if (t <= start || t >= 5.2 + i * 0.2) return
          if (v === 0) rack.lights.color.setHex(0x1a1d24)
          else if (v === 1) rack.lights.color.setHex(Math.sin(t * 10 + i) > 0 ? 0xff4a3d : 0xffb020)
          else rack.lights.color.setHex(0xff4a3d)
        })
        if (v === 2)
          for (let j = 0; j < 8; j++) {
            const bot = bots[j + 4]
            const start = 0.4 + j * 0.15
            const size = overshoot(progress(t, start, start + 0.3)) * (1 - smooth(progress(t, 5.2, 5.7)))
            bot.visible = size > 0.01
            bot.scale.set(size, size, size)
            bot.position.set(
              -6.5 + j * 1.8,
              Math.abs(Math.sin(t * 7 + j)) * 0.3,
              RACK_Z + 1.6 + (j % 2) * 0.7,
            )
            bot.rotation.y = Math.PI
          }
        showAlert(0, 4.8, 2.2, -3, t, 2.8, 4.5)
        hopInPlace(defender, t, 2.8, 4.5, 0.15)
        if (t > 5.6) showCheck(0, 4.4, RACK_Z, t, 5.8)
      },
    }),
  ]

  const cache = new Map<string, SceneDef>()
  /** tactic 番目の戦術の型を、絵の種類 variant で返す */
  return function simpleScene(tactic: number, variant: number): SceneDef {
    const key = `${tactic}:${variant}`
    let scene = cache.get(key)
    if (!scene) {
      scene = types[tactic](variant)
      cache.set(key, scene)
    }
    return scene
  }
}
