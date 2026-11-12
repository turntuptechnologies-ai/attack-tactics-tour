// TA0011 コマンド＆コントロール（Command and Control）の場面。
import type { Kit } from '../kit'
import { progress, smooth, lerp, overshoot, arcBetween, stretchBetween, walk, applyPose } from '../motion'
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
    trustedProcess,
    trustedProcessEyes,
    popIn,
    checkpoint,
    scanPlane,
    YELLOW_CUBE_X,
    yellowCubes,
    defender,
    user,
    token,
    pulseRings,
    documents,
    standing,
    flyTo,
    showCheck,
    showAlert,
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
    // T1219 Remote Access Tools
    T1219: {
      hits: [3.0],
      run(t) {
        view.target = [1.5, 4.5]
        view.height = 21
        storyState(12)
        view.actor = attacker
        showOperatorOrb(t)
        // 業務でも使われる正規の遠隔操作ソフトを入れ、その通信（水色の線）を指令の通り道にする
        const tool = [SERVER_SPOT[0] + 1.3, SERVER_SPOT[1] + 0.4]
        const from = [TOWER_SPOT[0], 2.9, TOWER_SPOT[1]]
        const to = [tool[0], 1.0, tool[1]]
        popIn(trustedProcess, tool[0], 0, tool[1], t, 0.6, 1.4)
        trustedProcess.rotation.y = 0.6
        trustedProcessEyes.visible = false
        if (t > 1.4) stretchBetween(cyanBeams[0], from, to, 0.09)
        if (t > 1.8)
          for (let i = 0; i < 4; i++) {
            const p = ((t - 1.8) * 0.5 + i * 0.25) % 1
            const cube = pinkCubes[i]
            cube.visible = true
            cube.scale.set(0.26, 0.26, 0.26)
            cube.position.set(lerp(from[0], to[0], p), lerp(from[1], to[1], p), lerp(from[2], to[2], p))
          }
        showCross(tool[0], 2.3, tool[1], t, 5.4)
      },
    },
    // T1008 Fallback Channels
    T1008: {
      hits: [3.6],
      run(t) {
        view.target = [-0.5, 5]
        view.height = 22
        storyState(12)
        view.actor = attacker
        showOperatorOrb(t)
        // 主の通り道が止められたときのために、予備の通り道を用意しておく
        const from = [TOWER_SPOT[0], 2.9, TOWER_SPOT[1]]
        const to = [SERVER_SPOT[0], 0.7, SERVER_SPOT[1]]
        const spare = [-7.5, 0.7, 11]
        const legs = [from, spare, to]
        relayBot.visible = true
        relayBot.scale.set(1.2, 1.2, 1.2)
        relayBot.position.set(spare[0], bobHeight(), spare[2])
        relayBot.rotation.y = 0.6
        if (t < 1.8) {
          stretchBetween(c2Link, from, to, 0.1)
          c2Link.material.opacity = 0.45 + 0.25 * Math.sin(t * 8)
        } else if (t < 4.6) showCross((from[0] + to[0]) / 2, 3.4, (from[2] + to[2]) / 2, t, 1.8)
        if (t > 2.6) {
          stretchBetween(pinkBeams[0], from, spare, 0.09)
          stretchBetween(pinkBeams[1], spare, to, 0.09)
          for (let i = 0; i < 3; i++) {
            const along = (((t - 2.6) * 0.45 + i / 3) % 1) * 2
            const j = Math.min(1, Math.floor(along))
            const q = along - j
            const cube = pinkCubes[i]
            cube.visible = true
            cube.scale.set(0.28, 0.28, 0.28)
            cube.position.set(
              lerp(legs[j][0], legs[j + 1][0], q),
              lerp(legs[j][1], legs[j + 1][1], q),
              lerp(legs[j][2], legs[j + 1][2], q),
            )
          }
        }
        if (t > 3.4 && t < 4.6) malware.position.y = Math.abs(Math.sin((t - 3.4) * 6)) * 0.3
      },
    },
    // T1571 Non-Standard Port
    T1571: {
      hits: [2.8],
      run(t) {
        view.target = [-1.5, 5]
        view.height = 22
        storyState(12)
        view.actor = attacker
        showOperatorOrb(t)
        // 門（ふだん使う口）は見張られている。見張られていない、ふつうは使わない口のほうを通す
        const port = [YELLOW_CUBE_X[0], 2.5, 6.5]
        const legs = [[TOWER_SPOT[0], 2.9, TOWER_SPOT[1]], port, [SERVER_SPOT[0], 0.7, SERVER_SPOT[1]]]
        const drawn = progress(t, 0.6, 1.6) * 2
        const hole = yellowCubes[0]
        checkpoint.visible = true
        scanPlane.visible = true
        scanPlane.position.set(0, 1.45, 9.3)
        scanPlane.material.opacity = 0.3 + 0.15 * Math.sin(t * 8)
        hole.visible = true
        hole.material.color.setHex(0xf6c531)
        hole.scale.set(0.5, 0.5, 0.5)
        hole.rotation.y = view.time
        if (drawn > 0) stretchBetween(c2Link, legs[0], legs[1], 0.09)
        if (drawn > 1) stretchBetween(pinkBeams[0], legs[1], legs[2], 0.09)
        if (t > 1.6)
          for (let i = 0; i < 4; i++) {
            const along = (((t - 1.6) * 0.4 + i * 0.25) % 1) * 2
            const j = Math.min(1, Math.floor(along))
            const q = along - j
            const cube = pinkCubes[i]
            cube.visible = true
            cube.scale.set(0.28, 0.28, 0.28)
            cube.position.set(
              lerp(legs[j][0], legs[j + 1][0], q),
              lerp(legs[j][1], legs[j + 1][1], q),
              lerp(legs[j][2], legs[j + 1][2], q),
            )
          }
      },
    },
    // T1092 Communication Through Removable Media
    T1092: {
      hits: [3.0],
      run(t) {
        view.target = [1.6, -1.6]
        view.height = 15
        storyState(12)
        // 壁の向こうの機器は、ネットワークにつながっていない。指令と結果は、人が持ち運ぶUSBメモリ（水色の箱）に載せて受け渡す
        const near = [1.0, -2.6]
        const far = [4.4, -3.4]
        const pose = walk(
          [
            [0, near[0], near[1]],
            [0.8, near[0], near[1]],
            [1.4, 1.2, -0.4],
            [2.0, 3.8, -0.6],
            [2.6, far[0], far[1]],
            [3.4, far[0], far[1]],
            [4.0, 3.8, -0.6],
            [4.6, 1.2, -0.4],
            [5.2, near[0], near[1]],
            [7, near[0], near[1]],
          ],
          t,
        )
        const order = pinkCubes[0]
        const result = documents[0]
        user.visible = true
        applyPose(user, pose)
        token.visible = true
        token.scale.set(0.35, 0.35, 0.35)
        token.position.set(pose.x, 2.0, pose.z)
        token.rotation.y = view.time * 2
        // 行きは指令、帰りは結果
        if (t < 2.8) {
          if (t < 0.8)
            flyTo(order, [SERVER_SPOT[0], 1.2, SERVER_SPOT[1]], [near[0], 2.5, near[1]], t, 0.2, 0.8, 0.8, 6)
          else {
            order.visible = true
            order.position.set(pose.x, 2.5, pose.z)
          }
          order.scale.set(0.24, 0.24, 0.24)
        }
        if (t > 2.6) racks[4].lights.color.setHex(0xff6fd8)
        if (t > 3.2) {
          result.visible = true
          result.scale.set(0.7, 0.7, 0.7)
          result.rotation.y = 0.6
          if (t < 5.2) result.position.set(pose.x, 2.6, pose.z)
          else
            arcBetween(
              result,
              [near[0], 2.6, near[1]],
              [SERVER_SPOT[0] + 1.0, 0.5, SERVER_SPOT[1] + 1.6],
              smooth(progress(t, 5.2, 5.9)),
              0.8,
            )
        }
      },
    },
    // T1659 Content Injection
    T1659: {
      hits: [3.6],
      run(t) {
        view.target = [-1.5, 5]
        view.height = 22
        storyState(12)
        view.actor = attacker
        showOperatorOrb(t)
        // 侵入済みの端末は、ふつうのWebサイト（雲）と通信している。その応答を途中で差し替えて、指令や追加の道具を届ける
        const site = [-7.5, 5.2, 10]
        const inside = [SERVER_SPOT[0], 0.9, SERVER_SPOT[1]]
        const middle = [(site[0] + inside[0]) / 2, (site[1] + inside[1]) / 2, (site[2] + inside[2]) / 2]
        const inject = pinkCubes[0]
        const tool = bots[6]
        popIn(cloud, site[0], site[1], site[2], t, 0.1, 1.6)
        cloud.rotation.y = 0.6
        stretchBetween(cyanBeams[0], inside, site, 0.07)
        if (t > 0.8 && t < 3.0) {
          if (t < 1.9) flyTo(inject, [TOWER_SPOT[0], 2.9, TOWER_SPOT[1]], middle, t, 0.8, 1.9, 2.0, 6)
          else flyTo(inject, middle, inside, t, 2.0, 3.0, 0.2)
          inject.scale.set(0.36, 0.36, 0.36)
        }
        if (t > 3.0) {
          const size = overshoot(progress(t, 3.0, 3.4))
          tool.visible = true
          tool.scale.set(size, size, size)
          tool.position.set(SERVER_SPOT[0] + 1.3, Math.abs(Math.sin(t * 6)) * 0.15, SERVER_SPOT[1] + 0.6)
          tool.rotation.y = 0.6
        }
        showCross(middle[0], middle[1] + 1.4, middle[2], t, 5.4)
      },
    },
    // T1132 Data Encoding
    T1132: {
      hits: [3.2],
      run(t) {
        view.target = [0.5, 5]
        view.height = 22
        storyState(12)
        view.actor = attacker
        showOperatorOrb(t)
        // 指令（紙）は、送る前に別の表現（箱）に変える。届いた先で、元に戻して読む
        const [from, to] = showC2Link(t)
        for (let i = 0; i < 3; i++) {
          const p = ((t - 0.4) * 0.28 + i / 3) % 1
          if (t < 0.4 + i * 0.3) continue
          const at = [lerp(from[0], to[0], p), lerp(from[1], to[1], p) + 0.5, lerp(from[2], to[2], p)]
          const encoded = p > 0.2 && p < 0.8
          const item = encoded ? pinkCubes[i] : documents[i]
          item.visible = true
          item.position.set(at[0], at[1], at[2])
          if (encoded) {
            item.scale.set(0.34, 0.34, 0.34)
            item.rotation.set(0.8, t * 2, 0.6)
          } else {
            item.scale.set(0.9, 0.9, 0.9)
            item.rotation.y = 0.6
          }
        }
        // 変わる場所のしるし
        ;[0.2, 0.8].forEach((p, j) => {
          const ring = pulseRings[j]
          if (!ring) return
          ring.visible = true
          ring.scale.set(1.6, 0.02, 1.6)
          ring.position.set(lerp(from[0], to[0], p), 0.08, lerp(from[2], to[2], p))
          ring.material.opacity = 0.35
        })
      },
    },
    // T1001 Data Obfuscation
    T1001: {
      hits: [3.2],
      run(t) {
        view.target = [0.5, 5]
        view.height = 22
        storyState(12)
        view.actor = attacker
        showOperatorOrb(t)
        // 指令（ピンクの粒）は、関係のないデータ（黄色い箱や紙）に混ぜて流す。どれが本物か、見分けにくい
        const [from, to] = showC2Link(t)
        const along = (p: number, lift: number) => [
          lerp(from[0], to[0], p),
          lerp(from[1], to[1], p) + lift,
          lerp(from[2], to[2], p),
        ]
        if (t > 0.4) {
          yellowCubes.forEach((junk, i) => {
            const at = along(((t - 0.4) * 0.3 + i / 3) % 1, 0.35 + (i & 1) * 0.3)
            junk.visible = true
            junk.material.color.setHex(0xf6c531)
            junk.scale.set(0.34, 0.34, 0.34)
            junk.position.set(at[0], at[1], at[2])
            junk.rotation.y = t * 2
          })
          for (let i = 0; i < 3; i++) {
            const at = along(((t - 0.4) * 0.3 + i / 3 + 0.17) % 1, 0.5 - (i & 1) * 0.3)
            const junk = documents[i]
            junk.visible = true
            junk.scale.set(0.7, 0.7, 0.7)
            junk.position.set(at[0], at[1], at[2])
            junk.rotation.y = 0.6
          }
          for (let i = 0; i < 2; i++) {
            const at = along(((t - 0.4) * 0.3 + i / 2 + 0.08) % 1, 0.4)
            const real = pinkCubes[i]
            real.visible = true
            real.scale.set(0.2, 0.2, 0.2)
            real.position.set(at[0], at[1], at[2])
          }
        }
      },
    },
    // T1665 Hide Infrastructure
    T1665: {
      hits: [3.0],
      run(t) {
        view.target = [0.5, 5.5]
        view.height = 22
        storyState(12)
        view.actor = attacker
        showOperatorOrb(t)
        showC2Link(t)
        // 調べに来た通信（水色の線）には、無害な顔（ガラスの板）を見せる。本当の指令サーバーだとは分からない
        const tower = [TOWER_SPOT[0], 2.4, TOWER_SPOT[1]]
        const probing = t > 1.2 && t < 3.6
        applyPose(defender, standing(-2, 5, 2.4))
        if (probing)
          stretchBetween(cyanBeams[0], [-2, 1.6, 5], [tower[0] - 0.9, tower[1], tower[2] - 0.6], 0.07)
        if (t > 0.8 && t < 4.6) {
          glass.visible = true
          glass.scale.set(2.2, 3.6, 0.12)
          glass.position.set(tower[0] - 0.9, 1.9, tower[2] - 0.6)
          glass.rotation.y = 0.9
          glass.material.opacity = 0.6 * smooth(progress(t, 0.8, 1.2))
        }
        if (t < 4.6) showCheck(tower[0] - 1.2, 4.6, tower[2] - 0.8, t, 2.4)
        showAlert(0, -2, 2.2, 5, t, 5.4, 6.8)
      },
    },
    // T1104 Multi-Stage Channels
    T1104: {
      hits: [3.4],
      run(t) {
        view.target = [-0.5, 5]
        view.height = 22
        storyState(12)
        view.actor = attacker
        showOperatorOrb(t)
        // 最初の通信先（左の中継）は、次の行き先を教えるだけ。本命の指令サーバーは、そのあとで初めて使う
        const first = [-7.5, 0.9, 11]
        const inside = [SERVER_SPOT[0], 0.7, SERVER_SPOT[1]]
        const note = documents[0]
        relayBot.visible = true
        relayBot.scale.set(1.2, 1.2, 1.2)
        relayBot.position.set(first[0], bobHeight(), first[2])
        relayBot.rotation.y = 0.6
        c2Tower.visible = t > 2.4
        if (t > 2.4 && t < 2.8) {
          const size = overshoot(progress(t, 2.4, 2.8))
          c2Tower.scale.set(size, size, size)
        }
        if (t > 0.4 && t < 2.6) stretchBetween(pinkBeams[0], inside, first, 0.08)
        if (t > 1.0 && t < 2.4) {
          flyTo(note, first, [inside[0], 1.6, inside[2]], t, 1.0, 2.2, 3, 5)
          note.scale.set(0.8, 0.8, 0.8)
        }
        if (t > 2.9) {
          const [from, to] = showC2Link(t)
          for (let i = 0; i < 3; i++) {
            const p = ((t - 2.9) * 0.4 + i / 3) % 1
            const cube = pinkCubes[i]
            cube.visible = true
            cube.scale.set(0.28, 0.28, 0.28)
            cube.position.set(lerp(from[0], to[0], p), lerp(from[1], to[1], p), lerp(from[2], to[2], p))
          }
        }
      },
    },
    // T1095 Non-Application Layer Protocol
    T1095: {
      hits: [3.0],
      run(t) {
        view.target = [-0.5, 5]
        view.height = 22
        storyState(12)
        view.actor = attacker
        showOperatorOrb(t)
        // 門の検査は、Webやメールの高さだけを見ている。その下の層をくぐらせて、指令をやり取りする
        const legs = [
          [TOWER_SPOT[0], 0.25, TOWER_SPOT[1]],
          [0, 0.25, 9.3],
          [0, 0.25, 5.6],
          [SERVER_SPOT[0], 0.5, SERVER_SPOT[1]],
        ]
        const drawn = progress(t, 0.5, 1.7) * 3
        checkpoint.visible = true
        scanPlane.visible = true
        scanPlane.scale.set(3.8, 1.6, 0.08)
        scanPlane.position.set(0, 2.1, 9.3)
        scanPlane.material.opacity = 0.3 + 0.15 * Math.sin(t * 8)
        for (let j = 0; j < 3; j++) if (drawn > j) stretchBetween(pinkBeams[j], legs[j], legs[j + 1], 0.07)
        if (t > 1.7)
          for (let i = 0; i < 4; i++) {
            const along = (((t - 1.7) * 0.3 + i * 0.25) % 1) * 3
            const j = Math.min(2, Math.floor(along))
            const q = along - j
            const cube = pinkCubes[i]
            cube.visible = true
            cube.scale.set(0.3, 0.14, 0.3)
            cube.position.set(
              lerp(legs[j][0], legs[j + 1][0], q),
              lerp(legs[j][1], legs[j + 1][1], q),
              lerp(legs[j][2], legs[j + 1][2], q),
            )
          }
      },
    },
    // T1205 Traffic Signaling
    T1205: {
      hits: [3.4],
      run(t) {
        view.target = [-1.5, 4.5]
        view.height = 22
        storyState(12)
        view.actor = attacker
        showOperatorOrb(t)
        // ひそませた機能（うずくまった機械）は、ふだんは通信しない。壁の3つの口を、決めた順番でたたくと目を覚ます
        const order = [0, 2, 1]
        const wake = 3.0
        const sleeper = bots[6]
        const rise = overshoot(progress(t, wake, wake + 0.4))
        yellowCubes.forEach((port, i) => {
          const knocked = 0.8 + order.indexOf(i) * 0.7 + 0.6
          port.visible = true
          port.material.color.setHex(t > knocked && t < 4.6 ? 0xff6fd8 : 0xf6c531)
          port.scale.set(0.5, 0.5, 0.5)
        })
        order.forEach((portIndex, n) => {
          const start = 0.8 + n * 0.7
          const p = progress(t, start, start + 0.6)
          if (p <= 0 || p >= 1) return
          const knock = pinkCubes[n]
          knock.visible = true
          knock.scale.set(0.28, 0.28, 0.28)
          arcBetween(
            knock,
            [TOWER_SPOT[0], 2.9, TOWER_SPOT[1]],
            [YELLOW_CUBE_X[portIndex], 2.5, 6.6],
            smooth(p),
            2.2,
          )
        })
        sleeper.visible = true
        sleeper.scale.set(1.1, lerp(0.35, 1.1, rise), 1.1)
        sleeper.position.set(
          SERVER_SPOT[0] + 1.4,
          t > wake ? Math.abs(Math.sin(t * 6)) * 0.15 : 0,
          SERVER_SPOT[1] + 0.6,
        )
        sleeper.rotation.y = 0.6
        if (t > wake + 0.2)
          stretchBetween(
            pinkBeams[0],
            [TOWER_SPOT[0], 2.9, TOWER_SPOT[1]],
            [SERVER_SPOT[0] + 1.4, 0.9, SERVER_SPOT[1] + 0.6],
            0.09,
          )
      },
    },
  }
}
