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
    pulseRings,
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
                [4.6, -2, 5],
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
        if (t > 2.9 && t < 4.0)
          pulseRings.forEach((ring, j) => {
            const ph = ((t - 2.9) * 0.9 + j * 0.5) % 1,
              scale = 1 + ph * 6
            ring.visible = true
            ring.scale.set(scale, 0.02, scale)
            ring.position.set(3.5, 0.08, 4.4)
            ring.material.opacity = 0.5 * (1 - ph)
          })
        if (t >= 1.8 && t < 3.3)
          placeMalware(HOST_SPOT[0], 0, HOST_SPOT[1], MALWARE_SIZE * (1 - progress(t, 1.8, 2.1)))
        else if (t >= 3.3)
          jumpMalware(t, 3.3, 4.0, desk, aboveHost(0), 1.0, MALWARE_SIZE * overshoot(progress(t, 3.3, 3.6)))
        if (t > 4.6) {
          applyPose(
            defender,
            walk(
              [
                [4.6, -2, 5],
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
        if (t > 4.6) {
          applyPose(
            defender,
            walk(
              [
                [4.6, -2, 5],
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
                [4.6, -2, 5],
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
        if (t > 2.0 && t < 3.4)
          pulseRings.forEach((ring, j) => {
            const phase = ((t - 2.0) * 0.9 + j * 0.5) % 1
            const scale = 1 + phase * 5
            ring.visible = true
            ring.scale.set(scale, 0.02, scale)
            ring.position.set(HOST_SPOT[0], 0.08, HOST_SPOT[1])
            ring.material.opacity = 0.5 * (1 - phase)
          })
        if (t >= 2.2 && t < 3.6)
          placeMalware(HOST_SPOT[0], 0, HOST_SPOT[1], MALWARE_SIZE * (1 - progress(t, 2.2, 2.5)))
        else if (t >= 3.6)
          jumpMalware(t, 3.6, 4.2, deep, aboveHost(0), 0.9, MALWARE_SIZE * overshoot(progress(t, 3.6, 3.9)))
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
  }
}
