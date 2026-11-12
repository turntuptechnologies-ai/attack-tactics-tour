// TA0004 権限昇格（Privilege Escalation）の場面。
import type { Kit } from '../kit'
import { progress, smooth, lerp, overshoot, walk, applyPose, arcBetween, stretchBetween } from '../motion'
import type { SceneMap } from './types'

export default function privilegeEscalation(kit: Kit): SceneMap {
  const {
    token,
    glass,
    pinkBeams,
    checkpoint,
    scanPlane,
    HOST_SPOT,
    MALWARE_SIZE,
    ADMIN_MALWARE_SIZE,
    malware,
    crown,
    stairs,
    trustedProcess,
    trustedProcessEyes,
    view,
    placeMalware,
    bobHeight,
    storyState,
    aboveHost,
    flyTo,
    showCross,
    jumpMalware,
  } = kit
  return {
    // T1068 Exploitation for Privilege Escalation（本編）
    T1068: {
      hits: [3.8],
      run(t) {
        view.target = [0.4, 2.4]
        view.height = 10.5
        storyState(5) // Privilege Escalation
        stairs.visible = true
        stairs.scale.y = Math.max(0.01, overshoot(progress(t, 0.2, 0.7)))
        const points = [
            [HOST_SPOT[0], 0, HOST_SPOT[1]],
            [0.9, 0.5, 3.0],
            [0.1, 1.0, 3.0],
            [-0.7, 1.5, 3.0],
          ],
          T0 = [0.9, 1.8, 2.7]
        let pos: number[] | null = points[0]
        malware.rotation.y = -0.9
        for (let i = 0; i < 3; i++) {
          if (t >= T0[i]) {
            const p = progress(t, T0[i], T0[i] + 0.7)
            arcBetween(malware, points[i], points[i + 1], smooth(p), 0.8)
            pos = null
          }
        }
        if (pos) malware.position.set(pos[0], pos[1] + bobHeight(), pos[2])
        if (t > 3.4) {
          malware.rotation.y = 0.6
          crown.visible = t > 3.6
          const size = lerp(MALWARE_SIZE, ADMIN_MALWARE_SIZE, overshoot(progress(t, 3.6, 4.0)))
          malware.scale.set(size, size, size)
          malware.position.y = 1.5 + bobHeight()
        }
      },
    },
    // T1548 Abuse Elevation Control Mechanism
    T1548: {
      hits: [3.8],
      run(t) {
        view.target = [0.6, 2.8]
        view.height = 10.5
        storyState(5) // Abuse Elevation Control Mechanism
        checkpoint.visible = true
        checkpoint.position.set(0.3, 0, 3.0)
        checkpoint.rotation.y = Math.PI / 2
        checkpoint.scale.set(0.6, 0.6, 0.6)
        scanPlane.visible = true
        scanPlane.position.set(0.3, 0.95, 3.0)
        scanPlane.rotation.y = Math.PI / 2
        scanPlane.scale.set(2.2, 1.7, 0.08)
        scanPlane.material.opacity = 0.3 + 0.2 * Math.sin(t * 10)
        applyPose(
          malware,
          walk(
            [
              [0, HOST_SPOT[0], HOST_SPOT[1]],
              [0.6, HOST_SPOT[0], HOST_SPOT[1]],
              [1.1, 1.3, 3.0],
              [1.8, 1.3, 3.0],
              [2.4, 1.0, 0.9],
              [3.0, -0.6, 0.9],
              [3.6, -1.0, 3.0],
              [7, -1.0, 3.0],
            ],
            t,
          ),
        )
        malware.scale.multiplyScalar(lerp(MALWARE_SIZE, ADMIN_MALWARE_SIZE, overshoot(progress(t, 3.7, 4.1))))
        crown.visible = t > 3.7
        if (t >= 3.6) malware.rotation.y = 0.6
        if (t > 5.0) {
          glass.visible = true
          glass.rotation.y = Math.PI / 2
          glass.scale.set(1.6, 1.8, 0.12)
          glass.position.set(0.3, 0.9, 1.0)
          glass.material.opacity = 0.55 * smooth(progress(t, 5.0, 5.5))
        }
      },
    },
    // T1134 Access Token Manipulation
    T1134: {
      hits: [3.2],
      run(t) {
        view.target = [0.8, 2.8]
        view.height = 10
        storyState(5) // Access Token Manipulation
        const ux = -0.8,
          uz = 2.6
        // 高い権限で動いている正規のプロセス。その頭上のトークンを盗む
        trustedProcess.visible = true
        trustedProcess.scale.set(1.6, 1.6, 1.6)
        trustedProcess.position.set(ux, 0, uz)
        trustedProcess.rotation.y = 0.6
        trustedProcessEyes.visible = false
        if (t > 0.7 && t < 1.6) stretchBetween(pinkBeams[0], aboveHost(0.8), [ux, 1.0, uz], 0.08)
        if (t < 3.0) {
          flyTo(token, [ux, 2.4, uz], aboveHost(2.2), t, 1.6, 2.8, 1.2, 5)
          if (t < 1.6) {
            token.position.y += Math.sin(t * 4) * 0.08
            token.rotation.y = t * 2
          }
        } else {
          crown.visible = true
          const size = lerp(MALWARE_SIZE, ADMIN_MALWARE_SIZE, overshoot(progress(t, 3.0, 3.4)))
          malware.scale.set(size, size, size)
        }
      },
    },
    // T1055 Process Injection
    T1055: {
      hits: [2.8],
      run(t) {
        view.target = [0.8, 2.8]
        view.height = 9.5
        storyState(5) // Process Injection
        const px = -0.4,
          pz = 2.6
        trustedProcess.visible = true
        trustedProcess.scale.set(ADMIN_MALWARE_SIZE, ADMIN_MALWARE_SIZE, ADMIN_MALWARE_SIZE)
        trustedProcess.position.set(
          px,
          t > 2.6 ? Math.abs(Math.sin((t - 2.6) * 6)) * 0.2 * (1 - progress(t, 2.6, 3.6)) : 0,
          pz,
        )
        trustedProcess.rotation.y = 0.6
        trustedProcessEyes.visible = t > 2.6 && t < 5.6
        if (t >= 1.4 && t < 2.6) {
          const p = smooth(progress(t, 1.4, 2.6))
          placeMalware(
            lerp(HOST_SPOT[0], px, p),
            Math.sin(Math.PI * p) * 1.6 + 0.4 * p,
            lerp(HOST_SPOT[1], pz, p),
            MALWARE_SIZE * (1 - 0.85 * p),
          )
        }
        if (t >= 2.6) {
          placeMalware(0, 0, 0, 0)
          view.actor = trustedProcess
        }
        showCross(px, 2.7, pz, t, 5.6)
      },
    },
    // T1611 Escape to Host
    T1611: {
      hits: [3.2],
      run(t) {
        view.target = [1.0, 3.0]
        view.height = 9.5
        storyState(5) // Escape to Host
        glass.visible = true
        glass.scale.set(1.7, 1.7, 1.7)
        glass.position.set(HOST_SPOT[0], 0.86, HOST_SPOT[1])
        glass.material.opacity = t > 2.2 && t < 2.9 && Math.sin(t * 40) > 0 ? 0.12 : 0.4
        if (t < 2.2) malware.position.x = HOST_SPOT[0] + Math.sin(t * 9) * 0.25 * progress(t, 0.6, 1.0)
        else {
          jumpMalware(
            t,
            2.2,
            3.0,
            aboveHost(0),
            [-0.2, 0, 2.8],
            1.4,
            lerp(MALWARE_SIZE, ADMIN_MALWARE_SIZE, overshoot(progress(t, 3.1, 3.5))),
          )
          crown.visible = t > 3.1
        }
      },
    },
  }
}
