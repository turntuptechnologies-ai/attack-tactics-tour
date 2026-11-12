// TA0112 防御の妨害（Defense Impairment）の場面。
import type { Kit } from '../kit'
import { progress, smooth, lerp, arcBetween, stretchBetween } from '../motion'
import type { SceneMap } from './types'

export default function defenseImpairment(kit: Kit): SceneMap {
  const {
    employees,
    checkMark,
    glass,
    pinkBeams,
    drones,
    cyanBeams,
    TOWER_SPOT,
    HOST_SPOT,
    malware,
    pinkCubes,
    pulseRings,
    documents,
    trustedProcess,
    trustedProcessEyes,
    view,
    openGate,
    placeSensor,
    storyState,
    aboveHost,
    showCross,
    showCheck,
    padlock,
    flyTo,
    showAlert,
    gateGuard,
  } = kit
  return {
    // T1685 Disable or Modify Tools（本編）
    T1685: {
      hits: [2.2],
      run(t) {
        view.target = [1, 3.8]
        view.height = 10
        storyState(7) // Defense Impairment
        if (t > 1 && t < 1.5)
          stretchBetween(pinkBeams[0], [HOST_SPOT[0], 0.7, HOST_SPOT[1]], [0.5, 3.3, 3.5], 0.12)
        const amount = progress(t, 1.4, 2.2)
        if (amount > 0) placeSensor(0.5, lerp(3.3, 0.25, amount * amount), 3.5, 0.5 * amount)
        if (t > 2.2 && t < 4.4) malware.position.y = Math.abs(Math.sin((t - 2.2) * 5)) * 0.4
      },
    },
    // T1686 Disable or Modify System Firewall
    T1686: {
      hits: [2.4],
      run(t) {
        view.target = [1.5, 6.5]
        view.height = 13
        storyState(7) // Disable or Modify System Firewall
        if (t > 0.8 && t < 1.5) stretchBetween(pinkBeams[0], aboveHost(0.9), [0, 1.5, 6.3], 0.12)
        openGate(progress(t, 1.3, 2.0) - progress(t, 5.2, 5.8))
        const point = [0, 1.0, 6.5],
          from = [TOWER_SPOT[0], 2.9, TOWER_SPOT[1]],
          to = aboveHost(0.9)
        if (t > 2.0 && t < 5.4)
          for (let i = 0; i < 5; i++) {
            const ph = ((t - 2.0) * 0.5 + i * 0.2) % 1,
              q = ph < 0.5 ? ph * 2 : ph * 2 - 1,
              u = ph < 0.5 ? from : point,
              w = ph < 0.5 ? point : to,
              cube = pinkCubes[i]
            cube.visible = true
            cube.scale.set(0.3, 0.3, 0.3)
            cube.position.set(lerp(u[0], w[0], q), lerp(u[1], w[1], q), lerp(u[2], w[2], q))
          }
        showCheck(0, 4.1, 6.9, t, 5.8)
      },
    },
    // T1553 Subvert Trust Controls
    T1553: {
      hits: [3.6],
      run(t) {
        view.target = [0.6, 3.2]
        view.height = 10.5
        storyState(7) // Subvert Trust Controls
        const px = -1.4,
          pz = 2.4,
          st = [px, 2.3, pz]
        trustedProcess.visible = true
        trustedProcess.scale.set(1.6, 1.6, 1.6)
        trustedProcess.position.set(px, 0, pz)
        trustedProcess.rotation.y = 0.6
        trustedProcessEyes.visible = false // trusted, signed software
        if (t > 0.5 && t < 1.0) stretchBetween(pinkBeams[0], aboveHost(1.0), st, 0.07)
        if (t < 5.4) {
          checkMark.visible = true
          checkMark.scale.set(0.7, 0.7, 0.7)
          checkMark.rotation.y = 0.6
          arcBetween(checkMark, st, aboveHost(3.0), smooth(progress(t, 0.9, 1.9)), 1.2)
          if (t < 0.9) checkMark.position.y += Math.sin(t * 4) * 0.06
        } // its signature, stolen
        const dp = smooth(progress(t, 2.2, 2.9)) * (1 - smooth(progress(t, 3.6, 4.2)))
        placeSensor(
          lerp(0.5, HOST_SPOT[0], dp),
          lerp(3.3, 4.7, dp) + Math.sin(view.time * 3) * 0.1,
          lerp(3.5, HOST_SPOT[1], dp),
        )
        if (t > 2.9 && t < 3.5) {
          const bm = cyanBeams[2]
          bm.visible = true
          bm.rotation.set(0, 0, 0)
          bm.position.set(HOST_SPOT[0], 4.0, HOST_SPOT[1])
          bm.scale.set(0.25, 0.7, 0.25)
        }
        showCross(HOST_SPOT[0], 3.1, HOST_SPOT[1], t, 5.4)
      },
    },
    // T1690 Prevent Command History Logging
    T1690: {
      hits: [2.5],
      run(t) {
        view.target = [1.0, 3.2]
        view.height = 9.5
        storyState(7) // Prevent Command History Logging
        const logAt = [0, 1.7, 2.3],
          doc = documents[0],
          amount = smooth(progress(t, 1.8, 2.4)) * (1 - smooth(progress(t, 5.4, 6.0)))
        doc.visible = true
        doc.scale.set(1.7, 1.7, 1.7)
        doc.position.set(logAt[0], lerp(logAt[1], 0.12, amount), logAt[2])
        doc.rotation.set((-amount * Math.PI) / 2, 0.6 * (1 - amount), 0)
        for (let i = 0; i < 2; i++) {
          const start = 0.3 + i * 0.6,
            p = progress(t, start, start + 0.8),
            cube = pinkCubes[i]
          if (p > 0 && p < 1) {
            cube.visible = true
            cube.scale.set(0.2, 0.2, 0.2)
            arcBetween(cube, aboveHost(1.6), logAt, p, 0.6)
          }
        }
        if (t > 1.5 && t < 1.9) stretchBetween(pinkBeams[0], aboveHost(1.0), logAt, 0.1)
        if (t > 2.6 && t < 4.6) {
          malware.position.y = Math.abs(Math.sin((t - 2.6) * 5)) * 0.4
          for (let i = 2; i < 6; i++) {
            const p = progress(t, 2.6 + (i - 2) * 0.4, 3.4 + (i - 2) * 0.4),
              cube = pinkCubes[i],
              size = 0.2 * (1 - p) + 0.01
            if (p <= 0 || p >= 1) continue
            cube.visible = true
            cube.scale.set(size, size, size)
            arcBetween(cube, aboveHost(1.6), [logAt[0] + 0.6, 1.2, logAt[2] + 0.3], p, 0.8)
          }
        }
      },
    },
    // T1688 Safe Mode Boot
    T1688: {
      hits: [2.7],
      run(t) {
        view.target = [1.4, 3.8]
        view.height = 10
        storyState(7) // Safe Mode Boot
        if (t > 0.6 && t < 1.2) stretchBetween(pinkBeams[0], aboveHost(0.9), [3.5, 0.9, 4.4], 0.1)
        employees[2].scale.y = 1 - 0.45 * (smooth(progress(t, 1.2, 1.6)) - smooth(progress(t, 2.2, 2.5)))
        if (t > 1.2 && t < 2.6)
          pulseRings.forEach((ring, j) => {
            const ph = ((t - 1.2) * 0.9 + j * 0.5) % 1,
              scale = 1 + ph * 5
            ring.visible = true
            ring.scale.set(scale, 0.02, scale)
            ring.position.set(3.5, 0.08, 4.4)
            ring.material.opacity = 0.5 * (1 - ph)
          })
        const amount = smooth(progress(t, 1.6, 2.2)) * (1 - smooth(progress(t, 5.2, 5.8))),
          drone = drones[2]
        drone.visible = true
        drone.rotation.z = 0
        drone.position.set(0.5, 3.3 + (amount < 0.05 ? Math.sin(view.time * 3) * 0.1 : 0), 3.5)
        drone.userData.rot.rotation.y = amount > 0.5 ? 0.5 : view.time * 25
        if (amount > 0.02) {
          glass.visible = true
          glass.scale.set(1.5 * amount, 1.1 * amount, 1.5 * amount)
          glass.position.set(0.5, 3.35, 3.5)
          glass.material.opacity = 0.45
        } // the placeSensor never loads: frozen, boxed in
        if (t > 2.6 && t < 4.6) malware.position.y = Math.abs(Math.sin((t - 2.6) * 5)) * 0.4
      },
    },
    // T1222 File and Directory Permissions Modification
    T1222: {
      hits: [3.2],
      run(t) {
        view.target = [0.9, 3.0]
        view.height = 9.5
        storyState(7)
        // 鍵のかかったファイル。権限を書き換えて鍵を外し、読み書きできるようにする
        const at = [0, 1.7, 2.3]
        const file = documents[0]
        const open = smooth(progress(t, 1.6, 2.2))
        file.visible = true
        if (t < 2.4) {
          file.scale.set(1.6, 1.6, 1.6)
          file.position.set(at[0], at[1], at[2])
        } else {
          flyTo(file, at, aboveHost(2.7), t, 2.4, 3.2, 1.0)
          file.scale.set(1.2, 1.2, 1.2)
        }
        file.rotation.y = 0.6
        padlock.visible = open < 0.98
        padlock.scale.set(0.7, 0.7, 0.7)
        padlock.rotation.set(0, 0.6, open * 1.2)
        padlock.position.set(at[0] + open * 0.9, lerp(at[1] + 1.1, 0.3, open * open), at[2])
        if (t > 0.9 && t < 1.7) stretchBetween(pinkBeams[0], aboveHost(0.8), [at[0], at[1] + 1.1, at[2]], 0.1)
        showAlert(0, -2, 2.6, 5, t, 5.0, 7)
      },
    },
    // T1689 Downgrade Attack
    T1689: {
      hits: [3.3],
      run(t) {
        view.target = [1.2, 6.4]
        view.height = 13
        storyState(7)
        // 入口の守り（盾）を外させ、古くて弱い方式（薄い板）に切り替えさせる
        const down = smooth(progress(t, 1.4, 2.2)) * (1 - smooth(progress(t, 5.4, 6.0)))
        gateGuard.visible = true
        gateGuard.position.set(0, 3.2 + down * 6, 7.15)
        if (down > 0.05) {
          glass.visible = true
          glass.scale.set(2.6, 2.0, 0.1)
          glass.position.set(0, 1.2, 7.05)
          glass.material.opacity = 0.3 * down
        }
        if (t > 0.7 && t < 1.5) stretchBetween(pinkBeams[0], aboveHost(0.9), [0, 3.2, 7.0], 0.1)
        // 弱い方式なら、外からの通信が通り抜けてしまう
        if (t > 2.4 && t < 5.2)
          for (let i = 0; i < 4; i++) {
            const p = ((t - 2.4) * 0.6 + i * 0.25) % 1
            const cube = pinkCubes[i]
            cube.visible = true
            cube.scale.set(0.28, 0.28, 0.28)
            cube.position.set(
              lerp(TOWER_SPOT[0], HOST_SPOT[0], p),
              lerp(2.9, 0.9, p) + Math.sin(Math.PI * p) * 1.2,
              lerp(TOWER_SPOT[1], HOST_SPOT[1], p),
            )
          }
        if (t > 5.6) showCheck(0, 4.7, 7.0, t, 5.8)
      },
    },
  }
}
