// TA0005 ステルス（Stealth）の場面。
import type { Kit } from '../kit'
import { progress, smooth, lerp, walk, applyPose } from '../motion'
import type { SceneMap } from './types'

export default function stealth(kit: Kit): SceneMap {
  const {
    defender,
    glass,
    scanPlane,
    HOST_SPOT,
    ADMIN_MALWARE_SIZE,
    malware,
    crown,
    disguise,
    pinkCubes,
    clock,
    clockHand,
    view,
    storyState,
    popIn,
    showAlert,
    documents,
  } = kit
  return {
    // T1036 Masquerading（本編）
    T1036: {
      hits: [3.6],
      run(t) {
        view.target = [1.5, 4]
        view.height = 10
        storyState(6) // Stealth
        malware.rotation.y = 0.6 + smooth(progress(t, 0.5, 1.4)) * Math.PI * 4
        disguise.visible = t > 0.95
        crown.visible = t <= 0.95
        if (t > 1.4) malware.position.y = 0
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
    },
    // T1070 Indicator Removal
    T1070: {
      hits: [3.8],
      run(t) {
        view.target = [1.2, 4.2]
        view.height = 10
        storyState(6) // Indicator Removal
        applyPose(
          malware,
          walk(
            [
              [0, HOST_SPOT[0], HOST_SPOT[1]],
              [0.8, HOST_SPOT[0], HOST_SPOT[1]],
              [2.4, 0.3, 5.5],
              [2.7, 0.3, 5.5],
              [3.7, HOST_SPOT[0], HOST_SPOT[1]],
              [7, HOST_SPOT[0], HOST_SPOT[1]],
            ],
            t,
          ),
        )
        malware.scale.multiplyScalar(ADMIN_MALWARE_SIZE)
        if (t >= 3.7) malware.rotation.y = 0.6
        for (let i = 0; i < 6; i++) {
          const amount = (i + 0.5) / 6,
            cube = pinkCubes[i],
            scale = 1 - smooth(progress(t, 0.7 + amount * 1.6, 1.0 + amount * 1.6))
          cube.visible = scale > 0.01
          cube.scale.set(0.34 * scale, 0.06, 0.34 * scale)
          cube.position.set(
            lerp(HOST_SPOT[0], 0.3, amount) + (i & 1 ? 0.2 : -0.2),
            0.04,
            lerp(HOST_SPOT[1], 5.5, amount),
          )
        }
        applyPose(
          defender,
          walk(
            [
              [0, -5, 5.4],
              [4.6, -5, 5.4],
              [6.2, -0.6, 5.3],
              [7, -0.6, 5.3],
            ],
            t,
            0,
          ),
        )
      },
    },
    // T1027 Obfuscated Files or Information
    T1027: {
      hits: [3.9],
      run(t) {
        view.target = [1.5, 3.8]
        view.height = 9.5
        storyState(6) // Obfuscated Files or Information
        const scrambled = smooth(progress(t, 0.6, 1.3)) * (1 - smooth(progress(t, 3.3, 3.8))),
          scale = ADMIN_MALWARE_SIZE * (1 - scrambled),
          n = Math.floor(t * 6) // scrambled=1: scrambled into pieces
        malware.scale.set(scale, scale, scale)
        malware.visible = scale > 0.2
        crown.visible = scrambled < 0.3
        for (let i = 0; i < 7; i++) {
          const cube = pinkCubes[i],
            q = 0.36 * scrambled,
            angle = i * 0.9 + n * 1.7 * (i + 1),
            radius = 0.25 + (0.7 * scrambled * ((i * 37 + n * 13) % 5)) / 4
          cube.visible = q > 0.01
          cube.scale.set(q, q, q)
          cube.position.set(
            HOST_SPOT[0] + Math.cos(angle) * radius,
            0.3 + ((i * 53 + n * 31) % 7) * 0.3 * scrambled,
            HOST_SPOT[1] + Math.sin(angle) * radius,
          )
          cube.rotation.set(i, n * 0.8, 0)
        }
        if (t > 1.7 && t < 3.2) {
          scanPlane.visible = true
          scanPlane.rotation.y = Math.PI / 2
          scanPlane.scale.set(2.8, 2.8, 0.08)
          scanPlane.position.set(lerp(3.9, -0.1, progress(t, 1.7, 3.2)), 1.4, HOST_SPOT[1])
          scanPlane.material.opacity = 0.4
        }
        if (t > 3.8 && t < 4.6) malware.position.y = Math.abs(Math.sin((t - 3.8) * 7)) * 0.35
      },
    },
    // T1564 Hide Artifacts
    T1564: {
      hits: [2.6],
      run(t) {
        view.target = [2.2, 3.8]
        view.height = 9.5
        storyState(6) // Hide Artifacts
        applyPose(
          malware,
          walk(
            [
              [0, HOST_SPOT[0], HOST_SPOT[1]],
              [0.6, HOST_SPOT[0], HOST_SPOT[1]],
              [1.6, 2.3, 4.6],
              [7, 2.3, 4.6],
            ],
            t,
          ),
        )
        malware.scale.multiplyScalar(ADMIN_MALWARE_SIZE)
        if (t >= 1.6) malware.rotation.y = 0.6
        const hide = smooth(progress(t, 1.7, 2.4)) * (1 - smooth(progress(t, 5.6, 6.2)))
        malware.scale.y *= 1 - 0.82 * hide
        crown.visible = hide < 0.5
        // 持っているファイルも、机の陰に運んで見えにくくする
        const doc = documents[0]
        const carried = smooth(progress(t, 0.6, 1.6))
        const size = 1 - 0.8 * hide
        doc.visible = true
        doc.rotation.y = 0.6
        doc.scale.set(size, size, size)
        doc.position.set(
          lerp(HOST_SPOT[0] + 0.9, 3.1, carried),
          lerp(1.5, 0.35, hide),
          lerp(HOST_SPOT[1] + 0.3, 4.95, carried),
        )
        applyPose(
          defender,
          walk(
            [
              [0, -5, 5.4],
              [2.4, -5, 5.4],
              [4.4, 5.5, 5.4],
              [4.6, 5.5, 5.4],
              [5.6, 1.0, 5.3],
              [7, 1.0, 5.3],
            ],
            t,
            0,
          ),
        )
        showAlert(0, 1.0, 2.6, 5.3, t, 5.6, 7)
      },
    },
    // T1497 Virtualization/Sandbox Evasion
    T1497: {
      hits: [3.8],
      run(t) {
        view.target = [1.5, 3.8]
        view.height = 9.5
        storyState(6) // Virtualization/Sandbox Evasion
        const up = 1 - smooth(progress(t, 0.4, 1.0)) + smooth(progress(t, 3.2, 3.7))
        if (up < 0.99) {
          glass.visible = true
          glass.scale.set(2.2, 2.2, 2.2)
          glass.position.set(HOST_SPOT[0], 1.12 + up * 5, HOST_SPOT[1])
          glass.material.opacity = 0.35
        }
        if (t > 1.0 && t < 3.3) {
          const size = ADMIN_MALWARE_SIZE * 0.8
          malware.position.y = 0
          malware.scale.set(size, size * 0.5, size)
          crown.visible = false
        } // lies flat until the analysis time runs out
        if (t > 0.9 && t < 3.5) {
          popIn(clock, HOST_SPOT[0], 3.9, HOST_SPOT[1], t, 0.9, 1.1)
          clock.rotation.y = 0.6
          clockHand.rotation.z = -progress(t, 1.1, 3.2) * Math.PI * 2
        }
        if (t > 3.7 && t < 4.6) {
          malware.position.y = Math.abs(Math.sin((t - 3.7) * 7)) * 0.4
          for (let i = 0; i < 5; i++) {
            const p = progress(t, 3.7 + i * 0.12, 4.4 + i * 0.12),
              cube = pinkCubes[i],
              size = 0.3 * (1 - p * 0.6)
            if (p <= 0 || p >= 1) continue
            cube.visible = true
            cube.scale.set(size, size, size)
            cube.position.set(
              HOST_SPOT[0] + Math.sin(i * 2.1 + p * 5) * 0.6,
              1.0 + p * 2.3,
              HOST_SPOT[1] + Math.cos(i * 2.1 + p * 5) * 0.6,
            )
          }
        }
      },
    },
  }
}
