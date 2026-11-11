// TA0004 権限昇格（Privilege Escalation）の場面。
import type { Kit } from '../kit'
import { seg, sm, lerp, back, track, put, arc, beam } from '../motion'
import type { SceneMap } from './types'

export default function privilegeEscalation(kit: Kit): SceneMap {
  const {
    user,
    grant,
    field,
    links,
    arch,
    scan,
    H,
    IS,
    IC,
    imp,
    crown,
    steps,
    proc,
    procEye,
    view,
    idle,
    impAt,
    bob,
    base,
    IH,
    fly,
    deny,
    lands,
  } = kit
  return {
    // T1068 Exploitation for Privilege Escalation（本編）
    T1068: {
      hits: [3.8],
      run(t) {
        view.camT = [0.4, 2.4]
        view.camS = 10.5
        base(5) // Privilege Escalation
        steps.visible = true
        steps.scale.y = Math.max(0.01, back(seg(t, 0.2, 0.7)))
        const P = [
            [H[0], 0, H[1]],
            [0.9, 0.5, 3.0],
            [0.1, 1.0, 3.0],
            [-0.7, 1.5, 3.0],
          ],
          T0 = [0.9, 1.8, 2.7]
        let pos: number[] | null = P[0]
        imp.rotation.y = -0.9
        for (let i = 0; i < 3; i++) {
          if (t >= T0[i]) {
            const p = seg(t, T0[i], T0[i] + 0.7)
            arc(imp, P[i], P[i + 1], sm(p), 0.8)
            pos = null
          }
        }
        if (pos) imp.position.set(pos[0], pos[1] + bob(), pos[2])
        if (t > 3.4) {
          imp.rotation.y = 0.6
          crown.visible = t > 3.6
          const s = lerp(IS, IC, back(seg(t, 3.6, 4.0)))
          imp.scale.set(s, s, s)
          imp.position.y = 1.5 + bob()
        }
      },
    },
    // T1548 Abuse Elevation Control Mechanism
    T1548: {
      hits: [3.8],
      run(t) {
        view.camT = [0.6, 2.8]
        view.camS = 10.5
        base(5) // Abuse Elevation Control Mechanism
        arch.visible = true
        arch.position.set(0.3, 0, 3.0)
        arch.rotation.y = Math.PI / 2
        arch.scale.set(0.6, 0.6, 0.6)
        scan.visible = true
        scan.position.set(0.3, 0.95, 3.0)
        scan.rotation.y = Math.PI / 2
        scan.scale.set(2.2, 1.7, 0.08)
        scan.material.opacity = 0.3 + 0.2 * Math.sin(t * 10)
        put(
          imp,
          track(
            [
              [0, H[0], H[1]],
              [0.6, H[0], H[1]],
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
        imp.scale.multiplyScalar(lerp(IS, IC, back(seg(t, 3.7, 4.1))))
        crown.visible = t > 3.7
        if (t >= 3.6) imp.rotation.y = 0.6
        if (t > 5.0) {
          field.visible = true
          field.rotation.y = Math.PI / 2
          field.scale.set(1.6, 1.8, 0.12)
          field.position.set(0.3, 0.9, 1.0)
          field.material.opacity = 0.55 * sm(seg(t, 5.0, 5.5))
        }
      },
    },
    // T1134 Access Token Manipulation
    T1134: {
      hits: [3.2],
      run(t) {
        view.camT = [0.8, 2.8]
        view.camS = 10
        base(5) // Access Token Manipulation
        const ux = -0.8,
          uz = 2.6
        user.visible = true
        put(user, idle(ux, uz, 0.5))
        if (t > 0.7 && t < 1.6) beam(links[0], IH(0.8), [ux, 1.0, uz], 0.08)
        if (t < 3.0) {
          fly(grant, [ux, 2.4, uz], IH(2.2), t, 1.6, 2.8, 1.2, 5)
          if (t < 1.6) {
            grant.position.y += Math.sin(t * 4) * 0.08
            grant.rotation.y = t * 2
          }
        } else {
          crown.visible = true
          const s = lerp(IS, IC, back(seg(t, 3.0, 3.4)))
          imp.scale.set(s, s, s)
        }
      },
    },
    // T1055 Process Injection
    T1055: {
      hits: [2.8],
      run(t) {
        view.camT = [0.8, 2.8]
        view.camS = 9.5
        base(5) // Process Injection
        const px = -0.4,
          pz = 2.6
        proc.visible = true
        proc.scale.set(IC, IC, IC)
        proc.position.set(
          px,
          t > 2.6 ? Math.abs(Math.sin((t - 2.6) * 6)) * 0.2 * (1 - seg(t, 2.6, 3.6)) : 0,
          pz,
        )
        proc.rotation.y = 0.6
        procEye.visible = t > 2.6 && t < 5.6
        if (t >= 1.4 && t < 2.6) {
          const p = sm(seg(t, 1.4, 2.6))
          impAt(
            lerp(H[0], px, p),
            Math.sin(Math.PI * p) * 1.6 + 0.4 * p,
            lerp(H[1], pz, p),
            IS * (1 - 0.85 * p),
          )
        }
        if (t >= 2.6) {
          impAt(0, 0, 0, 0)
          view.actor = proc
        }
        deny(px, 2.7, pz, t, 5.6)
      },
    },
    // T1611 Escape to Host
    T1611: {
      hits: [3.2],
      run(t) {
        view.camT = [1.0, 3.0]
        view.camS = 9.5
        base(5) // Escape to Host
        field.visible = true
        field.scale.set(1.7, 1.7, 1.7)
        field.position.set(H[0], 0.86, H[1])
        field.material.opacity = t > 2.2 && t < 2.9 && Math.sin(t * 40) > 0 ? 0.12 : 0.4
        if (t < 2.2) imp.position.x = H[0] + Math.sin(t * 9) * 0.25 * seg(t, 0.6, 1.0)
        else {
          lands(t, 2.2, 3.0, IH(0), [-0.2, 0, 2.8], 1.4, lerp(IS, IC, back(seg(t, 3.1, 3.5))))
          crown.visible = t > 3.1
        }
      },
    },
  }
}
