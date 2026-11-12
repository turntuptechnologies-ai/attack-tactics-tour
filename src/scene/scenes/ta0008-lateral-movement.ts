// TA0008 水平展開（Lateral Movement）の場面。
import type { Kit } from '../kit'
import { progress, smooth, lerp, overshoot, walk, applyPose, arcBetween } from '../motion'
import type { SceneMap } from './types'

export default function lateralMovement(kit: Kit): SceneMap {
  const {
    employees,
    mails,
    key,
    token,
    glass,
    hammer,
    bots,
    checkpoint,
    scanPlane,
    RACK_Z,
    racks,
    segmentWallMaterial,
    segmentWall,
    HOST_SPOT,
    SERVER_SPOT,
    ADMIN_MALWARE_SIZE,
    malware,
    pinkCubes,
    view,
    markCompromised,
    storyState,
    aboveHost,
    flyTo,
    showCross,
    showCheck,
    showAlert,
    documents,
  } = kit
  return {
    // T1021 Remote Services（本編）
    T1021: {
      hits: [3.7],
      run(t) {
        view.target = [-1, 0.6]
        view.height = 14
        storyState(10) // Lateral Movement
        const pose = walk(
          [
            [0, HOST_SPOT[0], HOST_SPOT[1]],
            [0.4, HOST_SPOT[0], HOST_SPOT[1]],
            [1.4, -2.3, 2.6],
            [1.9, -2.3, 2.6],
            [3.6, SERVER_SPOT[0], SERVER_SPOT[1]],
            [7, SERVER_SPOT[0], SERVER_SPOT[1]],
          ],
          t,
        )
        applyPose(malware, pose)
        malware.scale.multiplyScalar(ADMIN_MALWARE_SIZE)
        if (t >= 3.6) malware.rotation.y = 0.6
        key.visible = true
        key.position.set(pose.x, pose.y + 2.3, pose.z)
        key.rotation.y = t * 3
        key.scale.set(0.8, 0.8, 0.8)
        if (t > 1.7) markCompromised(1, -2.3, 2.6, overshoot(progress(t, 1.7, 2.0)))
        if (t > 2.0) {
          applyPose(
            bots[2],
            walk(
              [
                [2.0, -2.3, 2.6],
                [3.0, -4.8, 3.9],
                [7, -4.8, 3.9],
              ],
              t,
            ),
          )
          bots[2].visible = true
          if (t >= 3) bots[2].rotation.y = 0.6
        }
        if (t > 4.6) {
          segmentWall.visible = true
          segmentWall.position.y = lerp(-1.6, 1.5, overshoot(progress(t, 4.6, 5.3)))
          if (t > 5.2) {
            applyPose(
              bots[3],
              walk(
                [
                  [5.2, -0.2, SERVER_SPOT[1]],
                  [5.9, 1.7, SERVER_SPOT[1]],
                  [6.2, 1.7, SERVER_SPOT[1]],
                  [6.6, 0.8, SERVER_SPOT[1]],
                  [7, 0.8, SERVER_SPOT[1]],
                ],
                t,
              ),
            )
            bots[3].visible = true
          }
          if (t > 5.9 && t < 6.3) segmentWallMaterial.color.setHex(Math.sin(t * 30) > 0 ? 0xffffff : 0x6f9dff)
        }
      },
    },
    // T1570 Lateral Tool Transfer
    T1570: {
      hits: [3.3],
      run(t) {
        view.target = [-1, 2.6]
        view.height = 12
        storyState(10) // Lateral Tool Transfer
        ;[
          [-2.3, 2.6],
          [-4.8, 3.9],
        ].forEach((q, j) => {
          const start = 0.6 + j * 1.3,
            cube = pinkCubes[j],
            p = progress(t, start, start + 1),
            src = j ? [-2.3, 0.9, 2.6] : aboveHost(1.2)
          if (t > start && p < 1) {
            cube.visible = true
            cube.scale.set(0.34, 0.34, 0.34)
            arcBetween(cube, src, [q[0], 0.6, q[1]], smooth(p), 2.2)
            cube.rotation.set(t * 5, t * 4, 0)
          }
          if (t >= start + 1)
            markCompromised(1 + j, q[0], q[1], overshoot(progress(t, start + 1, start + 1.3)))
        })
        if (t > 5.0) {
          glass.visible = true
          glass.rotation.y = Math.PI / 2
          glass.scale.set(3.5, 2.2, 0.12)
          glass.position.set(-0.4, 1.1, 3.0)
          glass.material.opacity = 0.5 * smooth(progress(t, 5.0, 5.5))
        }
      },
    },
    // T1534 Internal Spearphishing
    T1534: {
      hits: [3.4],
      run(t) {
        view.target = [0, 3.2]
        view.height = 12.5
        storyState(10) // Internal Spearphishing
        const to = [
          [-3.5, 1.9, 2.1],
          [-6, 1.9, 3.6],
        ]
        ;[1, 0].forEach((who, j) => {
          const start = 0.5 + j * 0.6,
            seat = employees[who].position
          if (t < start) return
          if (t < start + 1.7) flyTo(mails[j], [3.5, 2.0, 3.6], to[j], t, start, start + 1.3, 3, 5)
          showAlert(j, seat.x, 2.2, seat.z, t, start + 1.3, start + 2.3)
          if (t > start + 1.9)
            markCompromised(
              1 + j,
              seat.x + 0.95,
              seat.z + 0.2,
              overshoot(progress(t, start + 1.9, start + 2.2)),
            )
        })
      },
    },
    // T1210 Exploitation of Remote Services
    T1210: {
      hits: [3.4],
      run(t) {
        view.target = [-0.5, 1]
        view.height = 13.5
        storyState(10) // Exploitation of Remote Services
        const h1 = [-2.3, 0.8, 2.6],
          h2 = [racks[2].x, 1.4, RACK_Z + 0.7]
        const from = [aboveHost(1.2), h1],
          dest = [h1, h2]
        ;[0.6, 2.3].forEach((t0, j) => {
          const p = progress(t, t0, t0 + 1.0),
            to = dest[j]
          if (p > 0 && p < 1) {
            hammer.visible = true
            arcBetween(hammer, from[j], to, p, 2.0)
            hammer.rotation.z = t * 12
          }
          showAlert(j, to[0], to[1] + 1.3, to[2], t, t0 + 1.0, t0 + 1.5)
        })
        if (t > 1.6) markCompromised(1, -2.3, 2.6, overshoot(progress(t, 1.6, 1.9)))
        if (t > 3.3 && t < 5.6) racks[2].lights.color.setHex(0xff6fd8)
        showCheck(racks[2].x, 3.9, RACK_Z, t, 5.6)
      },
    },
    // T1550 Use Alternate Authentication Material
    T1550: {
      hits: [3.8],
      run(t) {
        view.target = [-0.5, 0.6]
        view.height = 13
        storyState(10) // Use Alternate Authentication Material
        checkpoint.visible = true
        checkpoint.position.set(SERVER_SPOT[0], 0, -0.9)
        checkpoint.scale.set(0.6, 0.6, 0.6)
        scanPlane.visible = true
        scanPlane.position.set(SERVER_SPOT[0], 0.95, -0.9)
        scanPlane.scale.set(2.2, 1.7, 0.08)
        scanPlane.material.opacity = 0.3 + 0.15 * Math.sin(t * 8)
        const pose = walk(
          [
            [0, HOST_SPOT[0], HOST_SPOT[1]],
            [0.5, HOST_SPOT[0], HOST_SPOT[1]],
            [1.8, SERVER_SPOT[0], 0.4],
            [2.8, SERVER_SPOT[0], 0.4],
            [3.8, SERVER_SPOT[0], SERVER_SPOT[1]],
            [7, SERVER_SPOT[0], SERVER_SPOT[1]],
          ],
          t,
        )
        applyPose(malware, pose)
        malware.scale.multiplyScalar(ADMIN_MALWARE_SIZE)
        if (t >= 3.8) malware.rotation.y = 0.6
        token.visible = true
        token.position.set(pose.x, pose.y + 2.6, pose.z)
        token.rotation.y = t * 3
        if (t > 2.0 && t < 3.6) showCheck(SERVER_SPOT[0], 2.9, -0.9, t, 2.0)
        showCross(SERVER_SPOT[0], 2.9, -0.9, t, 5.2)
      },
    },
    // T1080 Taint Shared Content
    T1080: {
      hits: [3.8],
      run(t) {
        view.target = [-1.2, 2.6]
        view.height = 12.5
        storyState(10)
        // みんなが使う共有フォルダ。置かれたファイルに不正なコードを仕込み、開いた人の端末へ広がる
        const share = [-0.6, 1.0, 1.2]
        const taint = pinkCubes[0]
        glass.visible = true
        glass.scale.set(1.6, 1.4, 1.2)
        glass.position.set(share[0], 0.72, share[2])
        glass.material.opacity = 0.35
        if (t < 1.6) {
          flyTo(taint, aboveHost(1.2), share, t, 0.5, 1.5, 1.6, 6)
          taint.scale.set(0.3, 0.3, 0.3)
        }
        for (let i = 0; i < 2; i++) {
          const doc = documents[i]
          const seat = employees[1 - i].position
          const start = 2.0 + i * 0.5
          const shelf = [share[0] - 0.3 + i * 0.6, 0.7, share[2]]
          doc.visible = true
          doc.scale.set(0.8, 0.8, 0.8)
          doc.rotation.y = 0.6
          if (t < start) doc.position.set(shelf[0], shelf[1], shelf[2])
          else flyTo(doc, shelf, [seat.x, 1.9, seat.z + 0.2], t, start, start + 0.9, 1.6)
          if (t > start + 0.9)
            markCompromised(
              1 + i,
              seat.x + 0.95,
              seat.z + 0.2,
              overshoot(progress(t, start + 0.9, start + 1.2)),
            )
        }
      },
    },
  }
}
