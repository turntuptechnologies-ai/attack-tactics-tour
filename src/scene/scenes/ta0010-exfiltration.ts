// TA0010 持ち出し（Exfiltration）の場面。
import type { Kit } from '../kit'
import { progress, smooth, lerp, overshoot, walk, applyPose, arcBetween, stretchBetween } from '../motion'
import type { SceneMap } from './types'

export default function exfiltration(kit: Kit): SceneMap {
  const {
    impostor,
    cyanBeams,
    checkpoint,
    scanPlane,
    racks,
    SERVER_SPOT,
    cloud,
    clock,
    clockHand,
    view,
    openGate,
    pileSpot,
    stolenSpot,
    storyState,
    showC2Link,
    pinkCubes,
    relayBot,
    pulseRings,
    bobHeight,
  } = kit
  return {
    // T1041 Exfiltration Over C2 Channel（本編）
    T1041: {
      hits: [4.1],
      run(t) {
        view.target = [1.5, 4.5]
        view.height = 21
        storyState(13) // Exfiltration
        showC2Link(t)
        for (let i = 0; i < 4; i++) {
          const start = 0.5 + i * 0.7,
            p = progress(t, start, start + 1.5)
          if (p <= 0) continue
          arcBetween(racks[i].data, pileSpot(i), stolenSpot(i), smooth(p), 4)
          if (p < 1) racks[i].data.rotation.y = t * 5
        }
      },
    },
    // T1567 Exfiltration Over Web Service
    T1567: {
      hits: [4.1],
      run(t) {
        view.target = [-1, 4]
        view.height = 21
        storyState(13) // Exfiltration Over Web Service
        const centre = [-7.5, 5.2, 11.5],
          scale = 1.6 * overshoot(progress(t, 0.2, 0.6)),
          by = Math.sin(view.time * 2) * 0.15
        cloud.visible = scale > 0.01
        cloud.scale.set(scale, scale, scale)
        cloud.position.set(centre[0], centre[1] + by, centre[2])
        cloud.rotation.y = 0.6
        for (let i = 0; i < 4; i++) {
          const start = 0.9 + i * 0.6,
            p = progress(t, start, start + 1.4),
            rackData = racks[i].data
          if (p <= 0) continue
          arcBetween(
            rackData,
            pileSpot(i),
            [centre[0] - 0.9 + i * 0.6, centre[1] + 1.5, centre[2]],
            smooth(p),
            4,
          )
          if (p < 1) rackData.rotation.y = t * 5
          else rackData.position.y += by
        }
      },
    },
    // T1052 Exfiltration Over Physical Medium
    T1052: {
      hits: [3.4],
      run(t) {
        view.target = [0, 3.5]
        view.height = 17
        storyState(13) // Exfiltration Over Physical Medium
        const pose = walk(
          [
            [0, -2.3, -1.4],
            [0.6, -2.3, -1.4],
            [2.0, 0, 2.5],
            [3.2, 0, 8.2],
            [4.2, 2.0, 11.4],
            [7, 2.0, 11.4],
          ],
          t,
          0,
        )
        impostor.visible = true
        applyPose(impostor, pose)
        const rackData = racks[0].data
        rackData.position.set(pose.x, pose.y + 2.1, pose.z)
        rackData.scale.set(0.45, 0.45, 0.45)
        rackData.rotation.y = t * 2
        openGate(progress(t, 2.0, 2.4) - progress(t, 3.4, 3.8))
        if (t > 5.0) {
          const scale = overshoot(progress(t, 5.0, 5.4))
          checkpoint.visible = true
          checkpoint.scale.set(scale, scale, scale)
          scanPlane.visible = true
          scanPlane.position.set(0, 1.45 * scale, 9.3)
          scanPlane.scale.set(3.8 * scale, 2.9 * scale, 0.08)
          scanPlane.material.opacity = 0.3 + 0.15 * Math.sin(t * 10)
        }
      },
    },
    // T1048 Exfiltration Over Alternative Protocol
    T1048: {
      hits: [4.1],
      run(t) {
        view.target = [0, 4.5]
        view.height = 22
        storyState(13)
        showC2Link(t) // Exfiltration Over Alternative Protocol
        const nodes = [
          [SERVER_SPOT[0], 0.8, SERVER_SPOT[1]],
          [-8.5, 3.5, 9],
          [5.9, 1.2, 12.5],
        ]
        stretchBetween(cyanBeams[0], nodes[0], nodes[1], 0.08)
        stretchBetween(cyanBeams[1], nodes[1], nodes[2], 0.08)
        for (let i = 0; i < 4; i++) {
          const p = progress(t, 0.6 + i * 0.6, 2.2 + i * 0.6) * 2,
            rackData = racks[i].data,
            j = p >= 1 ? 1 : 0,
            q = p - j,
            to = j ? stolenSpot(i) : nodes[1],
            fr = j ? nodes[1] : pileSpot(i)
          if (p <= 0) continue
          if (p >= 2) {
            const z = stolenSpot(i)
            rackData.position.set(z[0], z[1], z[2])
            continue
          }
          rackData.position.set(lerp(fr[0], to[0], q), lerp(fr[1], to[1], q), lerp(fr[2], to[2], q))
          rackData.scale.set(0.35, 0.35, 0.35)
          rackData.rotation.y = t * 5
        }
      },
    },
    // T1029 Scheduled Transfer
    T1029: {
      hits: [4.4],
      run(t) {
        view.target = [1.5, 4.5]
        view.height = 21
        storyState(13)
        showC2Link(t) // Scheduled Transfer
        clock.visible = true
        clock.position.set(SERVER_SPOT[0] - 1.8, 3.0, SERVER_SPOT[1])
        clock.rotation.y = 0.6
        clock.scale.set(1.5, 1.5, 1.5)
        clockHand.rotation.z = -(t - 0.5) * Math.PI * 2
        for (let i = 0; i < 4; i++) {
          const start = 0.5 + i,
            p = progress(t, start, start + 0.9)
          if (p <= 0) continue
          arcBetween(racks[i].data, pileSpot(i), stolenSpot(i), smooth(p), 4)
          if (p < 1) racks[i].data.rotation.y = t * 5
        }
      },
    },
    // T1030 Data Transfer Size Limits
    T1030: {
      hits: [4.2],
      run(t) {
        view.target = [1.5, 4.5]
        view.height = 21
        storyState(13)
        const ends = showC2Link(t)
        // ひとかたまりで送ると通信量で目立つので、小さく刻んで少しずつ送る
        const sent = progress(t, 0.8, 4.2)
        const source = racks[0].data
        const received = racks[1].data
        const from = pileSpot(0)
        const to = stolenSpot(0)
        const left = 0.6 * (1 - 0.85 * sent)
        const got = 0.12 + 0.48 * sent
        source.scale.set(left, left, left)
        source.position.set(from[0], from[1], from[2])
        received.visible = sent > 0.02
        received.scale.set(got, got, got)
        received.position.set(to[0], to[1], to[2])
        if (t > 0.8 && t < 4.4)
          for (let i = 0; i < 6; i++) {
            const p = (t * 0.55 + i / 6) % 1
            const cube = pinkCubes[i]
            cube.visible = true
            cube.scale.set(0.16, 0.16, 0.16)
            cube.position.set(
              lerp(ends[1][0], ends[0][0], p),
              lerp(ends[1][1], ends[0][1], p) + 0.25,
              lerp(ends[1][2], ends[0][2], p),
            )
          }
      },
    },
    // T1011 Exfiltration Over Other Network Medium
    T1011: {
      hits: [3.8],
      run(t) {
        view.target = [2.5, 3.5]
        view.height = 21
        storyState(13)
        // 監視されている回線は使わず、無線などの別の経路で、外で待つ受け手へ送る
        const receiver = [8.5, 10.5]
        relayBot.visible = true
        relayBot.scale.set(1.2, 1.2, 1.2)
        relayBot.position.set(receiver[0], bobHeight(), receiver[1])
        relayBot.rotation.y = -0.6
        if (t > 0.4 && t < 4.4)
          pulseRings.forEach((ring, j) => {
            const phase = ((t - 0.4) * 0.6 + j * 0.5) % 1
            const scale = 1 + phase * 10
            ring.visible = true
            ring.scale.set(scale, 0.02, scale)
            ring.position.set(SERVER_SPOT[0], 0.08, SERVER_SPOT[1])
            ring.material.opacity = 0.5 * (1 - phase)
          })
        for (let i = 0; i < 3; i++) {
          const start = 0.8 + i * 0.7
          const p = progress(t, start, start + 1.5)
          if (p <= 0) continue
          const data = racks[i].data
          arcBetween(data, pileSpot(i), [receiver[0] - 0.5 + i * 0.5, 1.6, receiver[1] + 0.2], smooth(p), 6)
          if (p < 1) data.rotation.y = t * 5
        }
      },
    },
  }
}
