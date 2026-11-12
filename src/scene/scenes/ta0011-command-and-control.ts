// TA0011 コマンド＆コントロール（Command and Control）の場面。
import type { Kit } from '../kit'
import { progress, smooth, lerp, overshoot, arcBetween, stretchBetween } from '../motion'
import type { SceneMap } from './types'

export default function commandAndControl(kit: Kit): SceneMap {
  const {
    attacker,
    employees,
    mails,
    glass,
    operatorOrb,
    pinkBeams,
    bots,
    cyanBeams,
    relayBot,
    racks,
    ATTACKER_SPOT,
    TOWER_SPOT,
    SERVER_SPOT,
    malware,
    pinkCubes,
    c2Link,
    cloud,
    view,
    bobHeight,
    storyState,
    showC2Link,
    showCross,
    showOperatorOrb,
    hammer,
    markCompromised,
    c2Tower,
  } = kit
  return {
    // T1071 Application Layer Protocol（本編）
    T1071: {
      hits: [1.5],
      run(t) {
        view.target = [1.5, 4.5]
        view.height = 21
        storyState(12) // Command and Control
        const ends = showC2Link(t)
        view.actor = attacker
        operatorOrb.visible = true
        operatorOrb.position.set(ATTACKER_SPOT[0], 2.9 + Math.sin(t * 5) * 0.1, ATTACKER_SPOT[1])
        operatorOrb.rotation.set(t * 2, t * 3, 0)
        for (let i = 0; i < 4; i++) {
          const ph = (t * 0.6 + i * 0.25) % 1,
            cube = pinkCubes[i]
          cube.visible = true
          cube.scale.set(0.3, 0.3, 0.3)
          cube.position.set(
            lerp(ends[0][0], ends[1][0], ph),
            lerp(ends[0][1], ends[1][1], ph),
            lerp(ends[0][2], ends[1][2], ph),
          )
        }
      },
    },
    // T1090 Proxy
    T1090: {
      hits: [2.8],
      run(t) {
        view.target = [-1.5, 5]
        view.height = 22
        storyState(12)
        view.actor = attacker // Proxy
        const nodes = [
            [TOWER_SPOT[0], 2.9, TOWER_SPOT[1]],
            [-4, 0.7, 13.6],
            [-8.6, 0.7, 9.6],
            [SERVER_SPOT[0], 0.7, SERVER_SPOT[1]],
          ],
          on = progress(t, 0.4, 1.6) * 3,
          cut = t > 5.2
        ;[c2Link, pinkBeams[0], pinkBeams[1]].forEach((m, j) => {
          if (on > j && !(cut && j === 2)) {
            stretchBetween(m, nodes[j], nodes[j + 1], 0.1)
            m.material.opacity = 0.45 + 0.25 * Math.sin(t * 8)
          }
        })
        ;[relayBot, bots[5]].forEach((b, j) => {
          const size = 1.3 * overshoot(progress(t, 0.2 + j * 0.3, 0.5 + j * 0.3))
          b.visible = size > 0.01
          b.scale.set(size, size, size)
          b.position.set(nodes[j + 1][0], bobHeight(), nodes[j + 1][2])
          b.rotation.y = 0.6
        })
        if (t > 1.6)
          for (let i = 0; i < 4; i++) {
            const ph = (((t - 1.6) * 0.3 + i * 0.25) % 1) * 3,
              j = Math.min(2, Math.floor(ph)),
              q = ph - j,
              cube = pinkCubes[i]
            if (cut && j === 2) continue
            cube.visible = true
            cube.scale.set(0.3, 0.3, 0.3)
            cube.position.set(
              lerp(nodes[j][0], nodes[j + 1][0], q),
              lerp(nodes[j][1], nodes[j + 1][1], q),
              lerp(nodes[j][2], nodes[j + 1][2], q),
            )
          }
        operatorOrb.visible = true
        operatorOrb.position.set(ATTACKER_SPOT[0], 2.9 + Math.sin(t * 5) * 0.1, ATTACKER_SPOT[1])
        operatorOrb.rotation.set(t * 2, t * 3, 0)
        showCross(-8.6, 2.6, 9.6, t, 5.2)
      },
    },
    // T1573 Encrypted Channel
    T1573: {
      hits: [2],
      run(t) {
        view.target = [1.5, 4.5]
        view.height = 21
        storyState(12)
        const ends = showC2Link(t)
        view.actor = attacker
        showOperatorOrb(t) // Encrypted Channel
        racks.slice(0, 4).forEach((rack, i) => {
          const ph = (t * 0.45 + i / 4) % 1,
            lock = rack.lock,
            size = 0.95 * progress(t, 0.3, 0.8)
          lock.visible = size > 0.01
          lock.scale.set(size, size, size)
          lock.rotation.y = 0.6
          lock.position.set(
            lerp(ends[0][0], ends[1][0], ph),
            lerp(ends[0][1], ends[1][1], ph) + 0.45,
            lerp(ends[0][2], ends[1][2], ph),
          )
        })
      },
    },
    // T1102 Web Service
    T1102: {
      hits: [3.1],
      run(t) {
        view.target = [-0.5, 5]
        view.height = 22
        storyState(12)
        view.actor = attacker
        showOperatorOrb(t) // Web Service
        const centre = [-6, 5.2, 9.5],
          scale = 1.7 * overshoot(progress(t, 0.2, 0.6)),
          from = [TOWER_SPOT[0], 2.9, TOWER_SPOT[1]],
          to = [SERVER_SPOT[0], 1.4, SERVER_SPOT[1]]
        cloud.visible = scale > 0.01
        cloud.scale.set(scale, scale, scale)
        cloud.position.set(centre[0], centre[1] - 0.4 + Math.sin(view.time * 2) * 0.1, centre[2])
        cloud.rotation.y = 0.6
        if (t > 0.6 && t < 5.2)
          employees.forEach((employee, i) => {
            if ((t * 1.2 + i * 0.6) % 2 < 1.2)
              stretchBetween(
                cyanBeams[i],
                [employee.position.x, 1.2, employee.position.z + 0.9],
                centre,
                0.05,
              )
          }) // everyone uses the same service
        for (let i = 0; i < 2; i++) {
          const a0 = 1.0 + i * 1.6,
            mailItem = mails[i],
            p1 = progress(t, a0, a0 + 0.9),
            p2 = progress(t, a0 + 1.1, a0 + 2.0)
          if (t < a0 || p2 >= 1) continue
          mailItem.visible = true
          if (p2 <= 0) arcBetween(mailItem, from, [centre[0], centre[1] + 0.9, centre[2]], smooth(p1), 2.5)
          else arcBetween(mailItem, [centre[0], centre[1] + 0.9, centre[2]], to, smooth(p2), 2.5)
          mailItem.rotation.y = t * 4
        }
        if (t > 3.0 && t < 4.6) malware.position.y = Math.abs(Math.sin((t - 3.0) * 6)) * 0.4
        showCross(centre[0], centre[1] + 2.8, centre[2], t, 5.4)
      },
    },
    // T1572 Protocol Tunneling
    T1572: {
      hits: [2.4],
      run(t) {
        view.target = [1.5, 4.5]
        view.height = 21
        storyState(12)
        view.actor = attacker
        showOperatorOrb(t) // Protocol Tunneling
        const from = [TOWER_SPOT[0], 2.9, TOWER_SPOT[1]],
          to = [SERVER_SPOT[0], 0.7, SERVER_SPOT[1]],
          amount = Math.max(0.02, progress(t, 0.4, 1.4))
        stretchBetween(
          glass,
          from,
          [lerp(from[0], to[0], amount), lerp(from[1], to[1], amount), lerp(from[2], to[2], amount)],
          0.7,
        )
        glass.material.opacity = 0.35
        if (t > 1.4)
          for (let i = 0; i < 4; i++) {
            const ph = ((t - 1.4) * 0.5 + i * 0.25) % 1,
              cube = pinkCubes[i]
            cube.visible = true
            cube.scale.set(0.28, 0.28, 0.28)
            cube.position.set(lerp(from[0], to[0], ph), lerp(from[1], to[1], ph), lerp(from[2], to[2], ph))
          }
      },
    },
    // T1105 Ingress Tool Transfer
    T1105: {
      hits: [2.9],
      run(t) {
        view.target = [1.5, 4.5]
        view.height = 21
        storyState(12)
        const ends = showC2Link(t)
        view.actor = attacker
        showOperatorOrb(t)
        // 指令の通り道を使って、追加の道具を外から送り込む
        const along = (p: number, lift: number) => [
          lerp(ends[0][0], ends[1][0], p),
          lerp(ends[0][1], ends[1][1], p) + lift,
          lerp(ends[0][2], ends[1][2], p),
        ]
        const first = progress(t, 0.8, 2.8)
        const second = progress(t, 2.0, 4.0)
        hammer.visible = t > 0.8
        hammer.scale.set(1.6, 1.6, 1.6)
        if (first < 1) {
          const at = along(first, 0.2)
          hammer.position.set(at[0], at[1], at[2])
          hammer.rotation.z = t * 6
        } else {
          hammer.position.set(SERVER_SPOT[0] + 1.1, 0.2 + bobHeight(), SERVER_SPOT[1] + 0.4)
          hammer.rotation.z = 0.5
        }
        if (second > 0 && second < 1) {
          const at = along(second, 0)
          relayBot.visible = true
          relayBot.scale.set(1, 1, 1)
          relayBot.position.set(at[0], at[1], at[2])
          relayBot.rotation.y = t * 4
        } else if (second >= 1)
          markCompromised(5, SERVER_SPOT[0] - 1.3, SERVER_SPOT[1] + 0.6, overshoot(progress(t, 4.0, 4.3)))
      },
    },
    // T1568 Dynamic Resolution
    T1568: {
      hits: [2.6],
      run(t) {
        view.target = [-0.5, 5.2]
        view.height = 22
        storyState(12)
        view.actor = attacker
        showOperatorOrb(t)
        // 指令サーバーの居場所を、仕組みで次々に切り替える。ひとつ止められても、もう別の場所にいる
        const spots = [
          [TOWER_SPOT[0], TOWER_SPOT[1]],
          [-3.5, 13.2],
          [-8.0, 9.5],
        ]
        const now = Math.floor(Math.max(0, t - 0.6) / 1.3) % 3
        const from = [spots[now][0], 2.9, spots[now][1]]
        const to = [SERVER_SPOT[0], 0.7, SERVER_SPOT[1]]
        c2Tower.position.set(spots[now][0], 0, spots[now][1])
        stretchBetween(c2Link, from, to, 0.1)
        c2Link.material.opacity = 0.45 + 0.25 * Math.sin(t * 8)
        for (let i = 0; i < 3; i++) {
          const p = (t * 0.6 + i / 3) % 1
          const cube = pinkCubes[i]
          cube.visible = true
          cube.scale.set(0.3, 0.3, 0.3)
          cube.position.set(lerp(from[0], to[0], p), lerp(from[1], to[1], p), lerp(from[2], to[2], p))
        }
        // 防御側が前の居場所を止めても（×）、通信はもう別の場所へ移っている
        if (t > 4.6) {
          const old = spots[(now + 2) % 3]
          showCross(old[0], 3.6, old[1], t, 4.8)
        }
      },
    },
  }
}
