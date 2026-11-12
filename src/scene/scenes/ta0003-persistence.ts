// TA0003 永続化（Persistence）の場面。
import type { Kit } from '../kit'
import { progress, smooth, lerp, overshoot, walk, applyPose, stretchBetween } from '../motion'
import type { SceneMap } from './types'

export default function persistence(kit: Kit): SceneMap {
  const {
    defender,
    employees,
    key,
    user,
    impostor,
    pinkBeams,
    cyanBeams,
    RACK_Z,
    racks,
    TOWER_SPOT,
    HOST_SPOT,
    MALWARE_SIZE,
    malware,
    implant,
    spareKeys,
    pinkCubes,
    c2Link,
    clock,
    clockHand,
    view,
    standing,
    placeMalware,
    placeSensor,
    bobHeight,
    storyState,
    aboveHost,
    flyTo,
    popIn,
    showCross,
    showAlert,
    jumpMalware,
    hopInPlace,
    stairs,
    attacker,
    secondAttacker,
    glass,
    bots,
    truckB,
    checkpoint,
    scanPlane,
    ATTACKER_SPOT,
    YELLOW_CUBE_X,
    yellowCubes,
    padlock,
    cloud,
    documents,
    trustedProcess,
    trustedProcessEyes,
    showCheck,
    showSparks,
    wipeThenReturn,
    DEFENDER_SPOT,
    showRipples,
    defenderLocks,
    defenderRemoves,
  } = kit
  return {
    // T1053 Scheduled Task/Job（本編）
    T1053: {
      hits: [1.8, 5.7],
      run(t) {
        view.target = [1.8, 4]
        view.height = 10
        storyState(4) // Persistence
        applyPose(
          malware,
          walk(
            [
              [0, HOST_SPOT[0], HOST_SPOT[1]],
              [0.5, HOST_SPOT[0], HOST_SPOT[1]],
              [1.2, 2.2, 1.7],
              [1.9, 2.2, 1.7],
              [2.6, HOST_SPOT[0], HOST_SPOT[1]],
              [9, HOST_SPOT[0], HOST_SPOT[1]],
            ],
            t,
          ),
        )
        malware.scale.multiplyScalar(MALWARE_SIZE)
        if (t >= 2.6) malware.rotation.y = 0.6
        if (t > 1.5) {
          implant.visible = true
          const scale =
            overshoot(progress(t, 1.5, 1.8)) * (1 + 0.4 * Math.sin(Math.PI * progress(t, 4.7, 5.4)))
          implant.scale.set(scale, scale, scale)
        }
        popIn(clock, 3.2, 2.2 + Math.sin(view.time * 3) * 0.05, 1.6, t, 1.7, 0.8)
        clock.rotation.y = 0.6
        clockHand.rotation.z = -progress(t, 1.9, 5.3) * Math.PI * 2
        const dp = smooth(progress(t, 2.9, 3.5)) * (1 - smooth(progress(t, 4.1, 4.6)))
        placeSensor(
          lerp(0.5, HOST_SPOT[0], dp),
          lerp(3.3, 2.7, dp) + Math.sin(view.time * 3) * 0.1,
          lerp(3.5, HOST_SPOT[1], dp),
        )
        if (t > 3.5 && t < 3.9) {
          const ray = cyanBeams[2]
          ray.visible = true
          ray.rotation.set(0, 0, 0)
          ray.position.set(HOST_SPOT[0], 1.6, HOST_SPOT[1])
          ray.scale.set(0.3, 1.8, 0.3)
        }
        if (t > 3.6 && t < 5.3) {
          const size = 1 - progress(t, 3.6, 3.9)
          placeMalware(HOST_SPOT[0], 0, HOST_SPOT[1], MALWARE_SIZE * size)
        } else if (t >= 5.3) {
          placeMalware(
            HOST_SPOT[0],
            bobHeight(),
            HOST_SPOT[1],
            MALWARE_SIZE * overshoot(progress(t, 5.3, 5.7)),
          )
        }
      },
    },
    // T1136 Create Account
    T1136: {
      hits: [1.5],
      run(t) {
        view.target = [1.8, 3.6]
        view.height = 10
        storyState(4) // Create Account
        const fx = 3.4,
          fz = 1.9
        if (t > 0.5 && t < 1.1) stretchBetween(pinkBeams[0], aboveHost(0.8), [fx, 0.8, fz], 0.1)
        if (t > 1.0) {
          const size = overshoot(progress(t, 1.0, 1.4)) * (1 - smooth(progress(t, 6.0, 6.5)))
          impostor.visible = size > 0.01
          impostor.position.set(fx, 0, fz)
          impostor.rotation.y = 0.5
          impostor.scale.set(size, size, size)
          if (t < 4.6) {
            key.visible = true
            key.scale.set(0.7, 0.7, 0.7)
            key.position.set(fx, 2.5 + Math.sin(t * 5) * 0.08, fz)
            key.rotation.y = t * 3
          }
        }
        if (t > 4.6) {
          applyPose(
            defender,
            walk(
              [
                [4.6, DEFENDER_SPOT[0], DEFENDER_SPOT[1]],
                [5.6, 2.2, 2.4],
                [7, 2.2, 2.4],
              ],
              t,
              0.4,
            ),
          )
          showCross(fx, 2.6, fz, t, 5.6)
        }
      },
    },
    // T1547 Boot or Logon Autostart Execution
    T1547: {
      hits: [4],
      run(t) {
        view.target = [2.4, 3.8]
        view.height = 9.5
        storyState(4) // Boot or Logon Autostart Execution
        const desk = [2.9, 1.0, 4.5],
          cube = pinkCubes[0],
          ms = 0.3 * (1 - smooth(progress(t, 5.8, 6.2)))
        flyTo(cube, aboveHost(1.2), desk, t, 0.5, 1.3, 1.5, 6)
        cube.scale.set(ms, ms, ms)
        cube.visible = ms > 0.01
        if (t >= 1.3) cube.rotation.y = view.time * 2
        employees[2].scale.y = 1 - 0.45 * (smooth(progress(t, 1.8, 2.2)) - smooth(progress(t, 2.9, 3.1)))
        showAlert(0, 3.5, 2.2, 3.5, t, 2.9, 3.6)
        if (t > 2.9 && t < 4.0) showRipples(3.5, 4.4, (t - 2.9) * 0.9, 6)
        if (t >= 1.8 && t < 3.3)
          placeMalware(HOST_SPOT[0], 0, HOST_SPOT[1], MALWARE_SIZE * (1 - progress(t, 1.8, 2.1)))
        else if (t >= 3.3)
          jumpMalware(t, 3.3, 4.0, desk, aboveHost(0), 1.0, MALWARE_SIZE * overshoot(progress(t, 3.3, 3.6)))
        if (t > 4.6) {
          applyPose(
            defender,
            walk(
              [
                [4.6, DEFENDER_SPOT[0], DEFENDER_SPOT[1]],
                [5.6, 2.0, 4.9],
                [7, 2.0, 4.9],
              ],
              t,
              0.4,
            ),
          )
          showCross(desk[0], 2.0, desk[2], t, 5.5)
        }
      },
    },
    // T1505 Server Software Component
    T1505: {
      hits: [2.6],
      run(t) {
        view.target = [1.5, 2]
        view.height = 19
        storyState(4) // Server Software Component
        const rack = racks[3],
          top = [rack.x, 3.5, RACK_Z],
          cube = pinkCubes[0]
        flyTo(cube, aboveHost(1.2), top, t, 0.5, 1.7, 3.5, 6)
        cube.scale.set(0.4, 0.4, 0.4)
        if (t >= 1.7) cube.rotation.y = view.time * 2
        if (t > 1.7 && t < 5.6) rack.lights.color.setHex(0xff6fd8)
        if (t > 2.4 && t < 5.2) {
          stretchBetween(c2Link, [TOWER_SPOT[0], 2.9, TOWER_SPOT[1]], top, 0.09)
          c2Link.material.opacity = 0.45 + 0.25 * Math.sin(t * 8)
        }
        if (t > 5.6) cube.visible = false
        showCross(top[0], top[1] + 0.9, top[2], t, 5.4)
      },
    },
    // T1098 Account Manipulation
    T1098: {
      hits: [2.1],
      run(t) {
        view.target = [2.2, 3.2]
        view.height = 9.5
        storyState(4) // Account Manipulation
        const ux = 3.6,
          uz = 1.8,
          k0 = spareKeys[0]
        user.visible = true
        applyPose(user, standing(ux, uz, 0.5))
        k0.visible = true
        k0.scale.set(0.6, 0.6, 0.6)
        k0.position.set(ux - 0.35, 2.5 + Math.sin(view.time * 4) * 0.06, uz)
        k0.rotation.y = 0.6
        if (t > 0.8) {
          const k1 = spareKeys[1],
            amount = 0.6 * (1 - smooth(progress(t, 5.6, 6.0))),
            cube = pinkCubes[0]
          flyTo(k1, aboveHost(1.8), [ux + 0.4, 2.5, uz], t, 0.8, 2.0, 1.5, 6)
          k1.scale.set(amount, amount, amount)
          k1.visible = amount > 0.02
          if (t >= 2.0) k1.rotation.y = 0.6
          cube.visible = k1.visible
          cube.scale.set(0.2, 0.2, 0.2)
          cube.position.set(k1.position.x, k1.position.y + 0.55, k1.position.z)
          cube.rotation.y = view.time * 3
        }
        // 足した鍵で、いつでも入れる状態が続く
        if (t > 2.8 && t < 4.4 && Math.sin(t * 9) > -0.3)
          stretchBetween(pinkBeams[0], [ux + 0.4, 2.5, uz], aboveHost(0.9), 0.06)
        if (t > 4.6) {
          applyPose(
            defender,
            walk(
              [
                [4.6, DEFENDER_SPOT[0], DEFENDER_SPOT[1]],
                [5.6, 2.4, 2.8],
                [7, 2.4, 2.8],
              ],
              t,
              0.4,
            ),
          )
          showCross(ux + 0.4, 3.4, uz, t, 5.4)
        }
      },
    },
    // T1176 Software Extensions
    T1176: {
      hits: [4.2],
      run(t) {
        view.target = [2.5, 3.8]
        view.height = 9.5
        storyState(4)
        // 従業員のブラウザ（画面）に、拡張機能として取り付く
        const screen = [3.5, 1.35, 4.45]
        const piece = pinkCubes[0]
        const size = 0.3 * (1 - smooth(progress(t, 5.9, 6.3)))
        flyTo(piece, aboveHost(1.2), screen, t, 0.5, 1.4, 1.4, 6)
        piece.scale.set(size, size, size)
        piece.visible = size > 0.01
        if (t >= 1.4) piece.rotation.y = 0
        // マルウェア本体が見つかって駆除されても…
        const near = smooth(progress(t, 1.9, 2.5)) * (1 - smooth(progress(t, 3.0, 3.4)))
        placeSensor(
          lerp(0.5, HOST_SPOT[0], near),
          lerp(3.3, 2.7, near) + Math.sin(view.time * 3) * 0.1,
          lerp(3.5, HOST_SPOT[1], near),
        )
        if (t > 2.5 && t < 2.9) {
          const ray = cyanBeams[2]
          ray.visible = true
          ray.rotation.set(0, 0, 0)
          ray.position.set(HOST_SPOT[0], 1.6, HOST_SPOT[1])
          ray.scale.set(0.3, 1.8, 0.3)
        }
        // …ブラウザを使うたびに、拡張機能から戻ってくる
        hopInPlace(employees[2], t, 3.3, 3.9, 0.15)
        if (t >= 2.6 && t < 3.6)
          placeMalware(HOST_SPOT[0], 0, HOST_SPOT[1], MALWARE_SIZE * (1 - progress(t, 2.6, 2.9)))
        else if (t >= 3.6)
          jumpMalware(t, 3.6, 4.2, screen, aboveHost(0), 0.9, MALWARE_SIZE * overshoot(progress(t, 3.6, 3.9)))
        if (t > 4.6) {
          applyPose(
            defender,
            walk(
              [
                [4.6, DEFENDER_SPOT[0], DEFENDER_SPOT[1]],
                [5.6, 2.2, 4.9],
                [7, 2.2, 4.9],
              ],
              t,
              0.4,
            ),
          )
          showCross(screen[0], 2.3, screen[2], t, 5.6)
        }
      },
    },
    // T1542 Pre-OS Boot
    T1542: {
      hits: [4.2],
      run(t) {
        view.target = [1.4, 3.4]
        view.height = 10
        storyState(4)
        // 段の低いほうほど、OSより深い層（起動の仕組みやファームウェア）。いちばん低い段に仕掛ける
        const deep = [0.9, 0.75, 3.0]
        const piece = pinkCubes[0]
        stairs.visible = true
        flyTo(piece, aboveHost(1.2), deep, t, 0.5, 1.4, 1.0, 6)
        piece.scale.set(0.3, 0.3, 0.3)
        // OSごと入れ直されても（輪）、深い層に残した仕掛けから戻ってくる
        if (t > 2.0 && t < 3.4) showRipples(HOST_SPOT[0], HOST_SPOT[1], (t - 2.0) * 0.9, 5)
        if (t >= 2.2 && t < 3.6)
          placeMalware(HOST_SPOT[0], 0, HOST_SPOT[1], MALWARE_SIZE * (1 - progress(t, 2.2, 2.5)))
        else if (t >= 3.6)
          jumpMalware(t, 3.6, 4.2, deep, aboveHost(0), 0.9, MALWARE_SIZE * overshoot(progress(t, 3.6, 3.9)))
        defenderRemoves(t, pinkCubes[0])
      },
    },
    // T1078 Valid Accounts
    T1078: {
      hits: [4.2],
      run(t) {
        view.target = [1.2, 4.6]
        view.height = 11.5
        storyState(4)
        // 手に入れた正規のアカウント（鍵を持った人形）。マルウェアが消されても、これで正面から入り直せる
        const pose = walk(
          [
            [0, 0.2, 5.4],
            [2.8, 0.2, 5.4],
            [3.6, 1.2, 3.6],
            [7, 1.2, 3.6],
          ],
          t,
          0.6,
        )
        impostor.visible = true
        applyPose(impostor, pose)
        key.visible = true
        key.scale.set(0.7, 0.7, 0.7)
        key.rotation.y = view.time * 2
        key.position.set(pose.x, pose.y + 2.5, pose.z)
        // マルウェア本体は見つかって駆除される
        const near = smooth(progress(t, 1.2, 1.8)) * (1 - smooth(progress(t, 2.4, 2.8)))
        placeSensor(
          lerp(0.5, HOST_SPOT[0], near),
          lerp(3.3, 2.7, near) + Math.sin(view.time * 3) * 0.1,
          lerp(3.5, HOST_SPOT[1], near),
        )
        if (t > 1.8 && t < 2.2) {
          const ray = cyanBeams[2]
          ray.visible = true
          ray.rotation.set(0, 0, 0)
          ray.position.set(HOST_SPOT[0], 1.6, HOST_SPOT[1])
          ray.scale.set(0.3, 1.8, 0.3)
        }
        if (t >= 1.9 && t < 3.6)
          placeMalware(HOST_SPOT[0], 0, HOST_SPOT[1], MALWARE_SIZE * (1 - progress(t, 1.9, 2.2)))
        else if (t >= 3.6)
          jumpMalware(
            t,
            3.6,
            4.2,
            [1.2, 1.0, 3.6],
            aboveHost(0),
            0.6,
            MALWARE_SIZE * overshoot(progress(t, 3.6, 3.9)),
          )
        showCross(pose.x, 3.4, pose.z, t, 5.6)
      },
    },
    // T1197 BITS Jobs
    T1197: {
      hits: [3.9],
      run(t) {
        view.target = [0.8, 3.2]
        view.height = 10.5
        storyState(4)
        // OSに備わっている運び役（トラック）に、長く残る仕事を預けておく。マルウェアが消されても、運び役がまた届け直す
        const stop = [-0.4, 3.0]
        const slip = documents[0]
        truckB.visible = true
        truckB.scale.set(0.45, 0.45, 0.45)
        truckB.position.set(
          stop[0],
          t > 2.9 && t < 3.3 ? Math.abs(Math.sin((t - 2.9) * 16)) * 0.1 : 0,
          stop[1],
        )
        truckB.rotation.y = Math.PI / 2
        if (t > 0.5 && t < 5.6) {
          flyTo(slip, aboveHost(0.9), [stop[0], 1.5, stop[1]], t, 0.5, 1.3, 0.8, 5)
          slip.scale.set(0.7, 0.7, 0.7)
          if (t >= 1.3) slip.rotation.y = 0.6
        }
        wipeThenReturn(t, 2.0, 3.2, [stop[0], 0.8, stop[1]])
        showCross(stop[0], 2.6, stop[1], t, 5.6)
      },
    },
    // T1037 Boot or Logon Initialization Scripts
    T1037: {
      hits: [3.9],
      run(t) {
        view.target = [0.8, 3.0]
        view.height = 10.5
        storyState(4)
        // 起動やログオンのたびに読み上げられる手順書。そこへ一行を書き足しておけば、消されても、次の起動でまた動く
        const page = [-1.6, 1.7, 2.5]
        const script = documents[0]
        const line = pinkCubes[0]
        script.visible = true
        script.scale.set(1.6, 1.6, 1.6)
        script.position.set(page[0], page[1], page[2])
        script.rotation.y = 0.6
        if (t > 0.5 && t < 5.6) {
          flyTo(line, aboveHost(0.9), [page[0] + 0.05, page[1] - 0.45, page[2] + 0.12], t, 0.5, 1.4, 0.8)
          line.scale.set(0.5, 0.09, 0.09)
          line.rotation.y = 0.6
        }
        // 起動の合図で、上から順に読まれる
        if (t > 2.7 && t < 3.3)
          stretchBetween(
            cyanBeams[0],
            [page[0] - 1.2, 1.2, page[2] + 0.6],
            [page[0], lerp(page[1] + 0.5, page[1] - 0.45, progress(t, 2.7, 3.2)), page[2]],
            0.06,
          )
        wipeThenReturn(t, 1.9, 3.2, [page[0], page[1] - 0.45, page[2]])
        showCross(page[0], 3.1, page[2], t, 5.6)
      },
    },
    // T1671 Cloud Application Integration
    T1671: {
      hits: [3.0],
      run(t) {
        view.target = [0.2, 3.0]
        view.height = 11
        storyState(4)
        // 乗っ取ったアカウント（人形）で、クラウドに連携アプリ（小さな機械）を登録しておく。アカウントが止められても、アプリの入口は残る
        const sky = [-1.2, 3.8, 1.8]
        const account = [-0.2, 3.8]
        const app = [sky[0] - 1.2, 2.2, sky[2] + 0.6]
        const stopped = t > 2.2
        const mine = bots[6]
        popIn(cloud, sky[0], sky[1], sky[2], t, 0.1, 1.3)
        cloud.rotation.y = 0.6
        impostor.visible = true
        applyPose(impostor, standing(account[0], account[1], 0.6))
        if (stopped) impostor.scale.y *= 0.6
        if (!stopped)
          stretchBetween(pinkBeams[0], [account[0], 1.4, account[1]], [sky[0], sky[1] - 0.5, sky[2]], 0.06)
        else if (t < 5.0) showCross(account[0], 2.4, account[1], t, 2.2)
        if (t > 1.0 && t < 5.6) {
          const size = 0.8 * overshoot(progress(t, 1.0, 1.4))
          mine.visible = true
          mine.scale.set(size, size, size)
          mine.position.set(app[0], app[1] + Math.sin(view.time * 3) * 0.06, app[2])
          mine.rotation.y = 0.6
          stretchBetween(pinkBeams[1], [app[0], app[1] + 0.6, app[2]], [sky[0], sky[1] - 0.5, sky[2]], 0.06)
        }
        if (t >= 5.0) showCross(app[0] + 0.2, app[1] - 1.2, app[2] + 1.4, t, 5.4)
      },
    },
    // T1554 Compromise Host Software Binary
    T1554: {
      hits: [3.9],
      run(t) {
        view.target = [1.0, 3.2]
        view.height = 10.5
        storyState(4)
        // 従業員がふだん使っている正規のプログラム。その中に自分のコードを埋め込んでおけば、使われるたびに戻ってこられる
        const program = [-0.2, 3.4]
        const part = pinkCubes[0]
        trustedProcess.visible = true
        trustedProcess.scale.set(1.5, 1.5, 1.5)
        trustedProcess.position.set(program[0], 0, program[1])
        trustedProcess.rotation.y = 0.6
        trustedProcessEyes.visible = t > 1.4 && t < 5.6
        if (t > 0.5 && t < 1.4) {
          flyTo(part, aboveHost(0.9), [program[0], 0.9, program[1]], t, 0.5, 1.4, 0.8, 6)
          part.scale.set(0.32, 0.32, 0.32)
        }
        // 従業員が使う
        if (t > 2.8 && t < 3.4)
          stretchBetween(cyanBeams[0], [3.5, 1.0, 4.4], [program[0], 0.9, program[1]], 0.06)
        wipeThenReturn(t, 1.9, 3.2, [program[0], 0.9, program[1]])
        showCross(program[0], 2.4, program[1], t, 5.6)
      },
    },
    // T1543 Create or Modify System Process
    T1543: {
      hits: [4.0],
      run(t) {
        view.target = [0.6, 3.2]
        view.height = 10.5
        storyState(4)
        // OSが起動のたびに起こすサービス（機械の列）。そこに自分のサービスを加えておくと、消されても、起動のたびに起こしてもらえる
        const at = (i: number) => [-1.9 + i * 0.95, 3.5 - i * 0.3]
        for (let i = 0; i < 3; i++) {
          const service = bots[4 + i]
          const mine = i === 2
          const wake = 2.7 + i * 0.25
          if (mine && (t < 0.9 || t > 5.6)) continue
          const size = mine ? 0.9 * overshoot(progress(t, 0.9, 1.3)) : 0.9
          service.visible = true
          service.scale.set(size, size, size)
          service.position.set(
            at(i)[0],
            t > wake && t < wake + 0.4 ? Math.abs(Math.sin((t - wake) * 8)) * 0.35 : 0,
            at(i)[1],
          )
          service.rotation.y = 0.6
        }
        if (t > 0.4 && t < 1.0) stretchBetween(pinkBeams[0], aboveHost(0.9), [at(2)[0], 0.5, at(2)[1]], 0.08)
        wipeThenReturn(t, 1.9, 3.3, [at(2)[0], 0.8, at(2)[1]])
        showCross(at(2)[0], 2.2, at(2)[1], t, 5.6)
      },
    },
    // T1546 Event Triggered Execution
    T1546: {
      hits: [3.9],
      run(t) {
        view.target = [2.2, 3.6]
        view.height = 10
        storyState(4)
        // 従業員がログオンする、ファイルを開く。そうした出来事（黄色い箱）に、自分のコードを結び付けておく
        const desk = [3.5, 1.6, 4.4]
        const hook = [2.2, 0.5, 3.9]
        const planted = pinkCubes[0]
        const event = yellowCubes[0]
        if (t > 0.5 && t < 5.6) {
          flyTo(planted, aboveHost(0.9), hook, t, 0.5, 1.3, 0.8, 6)
          planted.scale.set(0.3, 0.3, 0.3)
          if (t > 1.3) stretchBetween(pinkBeams[0], hook, desk, 0.04)
        }
        hopInPlace(employees[2], t, 2.7, 3.1, 0.12)
        if (t > 2.8 && t < 3.6) {
          const size = 0.3 * overshoot(progress(t, 2.8, 3.0))
          event.visible = true
          event.material.color.setHex(0xf6c531)
          event.scale.set(size, size, size)
          event.position.set(desk[0], desk[1] + 0.3, desk[2])
          event.rotation.y = t * 4
        }
        wipeThenReturn(t, 1.9, 3.2, hook)
        showCross(hook[0], 1.8, hook[2], t, 5.6)
      },
    },
    // T1668 Exclusive Control
    T1668: {
      hits: [3.3],
      run(t) {
        view.target = [0.8, 5.6]
        view.height = 14
        storyState(4)
        // 入り込んだ機器を、独り占めする。先にいた別のマルウェアを追い出し、自分が使った入口（黄色い箱）は自分でふさいでしまう
        const hole = [YELLOW_CUBE_X[1], 2.5, 6.5]
        const rivalAt = [0.2, 3.6]
        const rival = bots[6]
        const out = smooth(progress(t, 0.9, 1.5))
        const entry = yellowCubes[1]
        entry.visible = true
        entry.material.color.setHex(t > 2.4 ? 0x4a4f5c : 0xf6c531)
        entry.scale.set(0.5, 0.5, 0.5)
        if (out < 0.98) {
          rival.visible = true
          rival.scale.set(1 - out, 1 - out, 1 - out)
          rival.position.set(rivalAt[0] - out * 1.5, out * 1.2, rivalAt[1])
          rival.rotation.y = 0.6 + out * 6
        }
        if (t > 0.5 && t < 1.2)
          stretchBetween(pinkBeams[0], aboveHost(0.9), [rivalAt[0], 0.6, rivalAt[1]], 0.09)
        if (t > 1.7) {
          flyTo(padlock, aboveHost(1.2), [hole[0], hole[1] + 0.2, hole[2] + 0.5], t, 1.7, 2.4, 1.6)
          padlock.scale.set(0.7, 0.7, 0.7)
          padlock.rotation.y = 0.6
        }
        // あとから来た別の攻撃者は、もう入れない
        secondAttacker.visible = t > 2.4
        applyPose(secondAttacker, standing(-2.6, 10.6, 2.6))
        if (t > 2.8 && t < 3.6)
          stretchBetween(pinkBeams[1], [-2.6, 1.6, 10.6], [hole[0], hole[1], hole[2] + 0.7], 0.07)
        if (t < 5.2) showCross(hole[0], 4.2, hole[2] + 0.5, t, 3.2)
        showAlert(0, DEFENDER_SPOT[0], 2.2, DEFENDER_SPOT[1], t, 5.2, 6.6)
      },
    },
    // T1133 External Remote Services
    T1133: {
      hits: [4.1],
      run(t) {
        view.target = [3.6, 6.6]
        view.height = 14
        storyState(4)
        // 外から接続するための正規の入口（右の小さな門）。マルウェアが消されても、この入口と鍵があれば、いつでも戻ってこられる
        const door = [6.5, 7.3]
        const pose = walk(
          [
            [0, ATTACKER_SPOT[0], ATTACKER_SPOT[1]],
            [2.0, ATTACKER_SPOT[0], ATTACKER_SPOT[1]],
            [3.0, door[0], 9.4],
            [7, door[0], 9.4],
          ],
          t,
        )
        applyPose(attacker, pose)
        checkpoint.visible = true
        checkpoint.position.set(door[0], 0, door[1])
        checkpoint.scale.set(0.55, 0.55, 0.55)
        scanPlane.visible = true
        scanPlane.position.set(door[0], 0.85, door[1])
        scanPlane.scale.set(2.0, 1.6, 0.08)
        scanPlane.material.opacity = 0.3 + 0.15 * Math.sin(t * 8)
        key.visible = true
        key.scale.set(0.8, 0.8, 0.8)
        key.position.set(pose.x, 2.9 + Math.sin(view.time * 4) * 0.06, pose.z)
        key.rotation.y = view.time * 2
        if (t > 3.1 && t < 5.2) showCheck(door[0], 2.6, door[1], t, 3.1)
        wipeThenReturn(t, 1.4, 3.4, [door[0], 0.9, door[1] - 0.6])
        showCross(door[0], 2.6, door[1], t, 5.4)
      },
    },
    // T1525 Implant Internal Image
    T1525: {
      hits: [3.0],
      run(t) {
        view.target = [0.0, 3.2]
        view.height = 11
        storyState(4)
        // 新しい環境を作るときの「ひな形」（ガラスの箱の中の機械）。ここに仕込んでおくと、そこから作られる環境すべてに、最初から入っている
        const mold = [-0.4, 2.8]
        const seed = pinkCubes[0]
        const master = bots[4]
        glass.visible = true
        glass.scale.set(1.5, 1.6, 1.5)
        glass.position.set(mold[0], 0.8, mold[1])
        glass.material.opacity = 0.35
        master.visible = true
        master.scale.set(0.9, 0.9, 0.9)
        master.position.set(mold[0], 0, mold[1])
        master.rotation.y = 0.6
        if (t > 0.5) {
          flyTo(seed, aboveHost(0.9), [mold[0], 1.15, mold[1]], t, 0.5, 1.4, 0.9, 6)
          seed.scale.set(0.26, 0.26, 0.26)
        }
        for (let i = 0; i < 2; i++) {
          const start = 2.0 + i * 0.7
          if (t < start) continue
          const copy = bots[5 + i]
          const p = smooth(progress(t, start, start + 0.6))
          const size = 0.9 * overshoot(progress(t, start, start + 0.3))
          const x = lerp(mold[0], mold[0] - 1.3 - i * 1.1, p)
          const z = lerp(mold[1], mold[1] + 0.5 - i * 0.9, p)
          const mark = pinkCubes[1 + i]
          copy.visible = true
          copy.scale.set(size, size, size)
          copy.position.set(x, Math.sin(Math.PI * p) * 0.5, z)
          copy.rotation.y = 0.6
          mark.visible = true
          mark.scale.set(0.26, 0.26, 0.26)
          mark.position.set(x, 1.15 + Math.sin(Math.PI * p) * 0.5, z)
        }
        defenderLocks(t, glass)
      },
    },
    // T1556 Modify Authentication Process
    T1556: {
      hits: [3.2],
      run(t) {
        view.target = [0.0, 3.2]
        view.height = 11
        storyState(4)
        // ログインの確認をする仕組み（小さな門）を書き換える。攻撃者だけが知っている合言葉なら、だれの名前でも通れる裏口ができる
        const gate = [-1.0, 3.4]
        const pose = walk(
          [
            [0, -3.0, gate[1]],
            [1.8, -3.0, gate[1]],
            [3.2, 0.2, gate[1]],
            [7, 0.2, gate[1]],
          ],
          t,
        )
        const bug = pinkCubes[0]
        checkpoint.visible = true
        checkpoint.position.set(gate[0], 0, gate[1])
        checkpoint.rotation.y = Math.PI / 2
        checkpoint.scale.set(0.6, 0.6, 0.6)
        if (t > 0.5 && t < 5.4) {
          flyTo(bug, aboveHost(0.9), [gate[0], 2.0, gate[1]], t, 0.5, 1.4, 0.9, 6)
          bug.scale.set(0.26, 0.26, 0.26)
        }
        impostor.visible = t > 1.6
        applyPose(impostor, pose)
        if (t > 2.6 && t < 5.2) showCheck(gate[0], 3.0, gate[1], t, 2.6)
        showCross(gate[0], 3.0, gate[1], t, 5.4)
      },
    },
    // T1112 Modify Registry
    T1112: {
      hits: [3.9],
      run(t) {
        view.target = [0.8, 3.0]
        view.height = 10.5
        storyState(4)
        // OSやアプリの設定が並ぶ場所（箱の列）。たくさんの設定の陰に、自分を呼び戻す仕掛けを書き込んでおく
        const slot = (i: number) => [-1.7 + i * 0.75, 1.4, 2.4]
        const hidden = pinkCubes[0]
        const tucked = [slot(1)[0], slot(1)[1] - 0.45, slot(1)[2] + 0.1]
        yellowCubes.forEach((setting, i) => {
          const at = slot(i)
          setting.visible = true
          setting.material.color.setHex(0xf6c531)
          setting.scale.set(0.4, 0.4, 0.4)
          setting.position.set(at[0], at[1], at[2])
          setting.rotation.y = 0.6
        })
        if (t > 0.5 && t < 5.6) {
          flyTo(hidden, aboveHost(0.9), tucked, t, 0.5, 1.4, 0.8, 6)
          hidden.scale.set(0.2, 0.2, 0.2)
        }
        wipeThenReturn(t, 1.9, 3.2, tucked)
        showCross(tucked[0], 2.6, tucked[2], t, 5.6)
      },
    },
    // T1137 Office Application Startup
    T1137: {
      hits: [3.9],
      run(t) {
        view.target = [2.2, 3.6]
        view.height = 10
        storyState(4)
        // 文書作成ソフトが、起動のたびに読み込むひな形（紙）。そこに仕込んでおけば、従業員がソフトを開くたびに動く
        const desk = [2.7, 1.3, 4.7]
        const template = documents[0]
        const planted = pinkCubes[0]
        const opened = smooth(progress(t, 2.7, 3.1))
        template.visible = true
        template.scale.set(1.0, 1.0, 1.0)
        template.position.set(desk[0], desk[1] + opened * 0.5, desk[2])
        template.rotation.set((1 - opened) * (Math.PI / 2), 0.6, 0)
        if (t > 0.5 && t < 5.6) {
          flyTo(planted, aboveHost(0.9), [desk[0] + 0.15, desk[1] + 0.2, desk[2] + 0.1], t, 0.5, 1.3, 0.8, 6)
          planted.scale.set(0.2, 0.2, 0.2)
          if (t > 2.7) planted.position.y = desk[1] + 0.2 + opened * 0.5
        }
        hopInPlace(employees[2], t, 2.6, 3.0, 0.12)
        wipeThenReturn(t, 1.9, 3.2, desk)
        showCross(desk[0], 2.8, desk[2], t, 5.6)
      },
    },
    // T1653 Power Settings
    T1653: {
      hits: [3.0],
      run(t) {
        view.target = [1.4, 3.4]
        view.height = 11
        storyState(4)
        // 夜になれば、端末は眠る。眠ればマルウェアも止まる。だから電源の設定（黄色い箱）を書き換えて、眠らないようにしておく
        const dial = aboveHost(2.3)
        const night = smooth(progress(t, 2.0, 2.6)) * (1 - smooth(progress(t, 5.6, 6.2)))
        const power = yellowCubes[0]
        power.visible = true
        power.material.color.setHex(0xf6c531)
        power.scale.set(0.4, 0.4, 0.4)
        power.position.set(dial[0], dial[1], dial[2])
        power.rotation.y = 0.6
        if (t > 0.6 && t < 1.2) stretchBetween(pinkBeams[0], aboveHost(0.9), dial, 0.07)
        if (t > 1.1 && t < 5.4) {
          popIn(padlock, dial[0], dial[1] + 0.55, dial[2], t, 1.1, 0.55)
          padlock.rotation.y = 0.6
        }
        // まわりは眠る
        employees.forEach((employee) => (employee.scale.y = 1 - 0.45 * night))
        racks.forEach((rack) => {
          if (night > 0.5) rack.lights.color.setHex(0x1a1d24)
        })
        // 眠らずに動き続ける
        if (t > 2.4 && t < 4.6) malware.position.y = Math.abs(Math.sin((t - 2.4) * 6)) * 0.25
        showSparks(HOST_SPOT[0], 0.9, HOST_SPOT[1], t, 2.8)
        showAlert(0, DEFENDER_SPOT[0], 2.2, DEFENDER_SPOT[1], t, 5.2, 6.6)
      },
    },
    // T1205 Traffic Signaling
    T1205: {
      hits: [4.3],
      run(t) {
        view.target = [1.0, 6.0]
        view.height = 15
        storyState(4)
        // 機器の奥に、眠ったままの仕掛け（うずくまった機械）を残しておく。通信もしないので見つからない。外から合図が届いたときだけ、目を覚ます
        const nest = [0.2, 2.4]
        const port = [YELLOW_CUBE_X[1], 2.5, 6.6]
        const wake = 3.3
        const rise = overshoot(progress(t, wake, wake + 0.3)) * (1 - smooth(progress(t, 5.6, 6.0)))
        const sleeper = bots[6]
        const knock = pinkCubes[0]
        const entry = yellowCubes[1]
        sleeper.visible = true
        sleeper.scale.set(1, lerp(0.25, 1, rise), 1)
        sleeper.position.set(nest[0], 0, nest[1])
        sleeper.rotation.y = 0.6
        entry.visible = true
        entry.material.color.setHex(t > 3.1 && t < 4.6 ? 0xff6fd8 : 0xf6c531)
        entry.scale.set(0.5, 0.5, 0.5)
        if (t > 2.5 && t < 3.1) {
          flyTo(knock, [TOWER_SPOT[0], 2.9, TOWER_SPOT[1]], port, t, 2.5, 3.1, 2.2, 6)
          knock.scale.set(0.3, 0.3, 0.3)
        }
        if (t > 3.1 && t < wake + 0.3) stretchBetween(pinkBeams[0], port, [nest[0], 0.5, nest[1]], 0.07)
        wipeThenReturn(t, 1.4, 3.6, [nest[0], 0.9, nest[1]])
        showCross(nest[0], 2.2, nest[1], t, 5.6)
      },
    },
  }
}
