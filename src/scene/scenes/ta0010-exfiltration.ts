// TA0010 持ち出し（Exfiltration）の場面。
import type { Kit } from '../kit'
import { seg, sm, lerp, back, track, put, arc, beam } from '../motion'
import type { SceneMap } from './types'

export default function exfiltration(kit: Kit): SceneMap {
  const { fake, beams, arch, scan, racks, S, cloud, clock, hand, view, gate, PILE, STK, base, c2beam } = kit
  return {
    // T1041 Exfiltration Over C2 Channel（本編）
    T1041: {
      hits: [4.1],
      run(t) {
        view.camT = [1.5, 4.5]
        view.camS = 21
        base(13) // Exfiltration
        c2beam(t)
        for (let i = 0; i < 4; i++) {
          const a = 0.5 + i * 0.7,
            p = seg(t, a, a + 1.5)
          if (p <= 0) continue
          arc(racks[i].cube, PILE(i), STK(i), sm(p), 4)
          if (p < 1) racks[i].cube.rotation.y = t * 5
        }
      },
    },
    // T1567 Exfiltration Over Web Service
    T1567: {
      hits: [4.1],
      run(t) {
        view.camT = [-1, 4]
        view.camS = 21
        base(13) // Exfiltration Over Web Service
        const C = [-7.5, 5.2, 11.5],
          k = 1.6 * back(seg(t, 0.2, 0.6)),
          by = Math.sin(view.T * 2) * 0.15
        cloud.visible = k > 0.01
        cloud.scale.set(k, k, k)
        cloud.position.set(C[0], C[1] + by, C[2])
        cloud.rotation.y = 0.6
        for (let i = 0; i < 4; i++) {
          const a = 0.9 + i * 0.6,
            p = seg(t, a, a + 1.4),
            c = racks[i].cube
          if (p <= 0) continue
          arc(c, PILE(i), [C[0] - 0.9 + i * 0.6, C[1] + 1.5, C[2]], sm(p), 4)
          if (p < 1) c.rotation.y = t * 5
          else c.position.y += by
        }
      },
    },
    // T1052 Exfiltration Over Physical Medium
    T1052: {
      hits: [3.4],
      run(t) {
        view.camT = [0, 3.5]
        view.camS = 17
        base(13) // Exfiltration Over Physical Medium
        const r = track(
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
        fake.visible = true
        put(fake, r)
        const c = racks[0].cube
        c.position.set(r.x, r.y + 2.1, r.z)
        c.scale.set(0.45, 0.45, 0.45)
        c.rotation.y = t * 2
        gate(seg(t, 2.0, 2.4) - seg(t, 3.4, 3.8))
        if (t > 5.0) {
          const k = back(seg(t, 5.0, 5.4))
          arch.visible = true
          arch.scale.set(k, k, k)
          scan.visible = true
          scan.position.set(0, 1.45 * k, 9.3)
          scan.scale.set(3.8 * k, 2.9 * k, 0.08)
          scan.material.opacity = 0.3 + 0.15 * Math.sin(t * 10)
        }
      },
    },
    // T1048 Exfiltration Over Alternative Protocol
    T1048: {
      hits: [4.1],
      run(t) {
        view.camT = [0, 4.5]
        view.camS = 22
        base(13)
        c2beam(t) // Exfiltration Over Alternative Protocol
        const N = [
          [S[0], 0.8, S[1]],
          [-8.5, 3.5, 9],
          [5.9, 1.2, 12.5],
        ]
        beam(beams[0], N[0], N[1], 0.08)
        beam(beams[1], N[1], N[2], 0.08)
        for (let i = 0; i < 4; i++) {
          const p = seg(t, 0.6 + i * 0.6, 2.2 + i * 0.6) * 2,
            c = racks[i].cube,
            j = p >= 1 ? 1 : 0,
            q = p - j,
            to = j ? STK(i) : N[1],
            fr = j ? N[1] : PILE(i)
          if (p <= 0) continue
          if (p >= 2) {
            const z = STK(i)
            c.position.set(z[0], z[1], z[2])
            continue
          }
          c.position.set(lerp(fr[0], to[0], q), lerp(fr[1], to[1], q), lerp(fr[2], to[2], q))
          c.scale.set(0.35, 0.35, 0.35)
          c.rotation.y = t * 5
        }
      },
    },
    // T1029 Scheduled Transfer
    T1029: {
      hits: [4.4],
      run(t) {
        view.camT = [1.5, 4.5]
        view.camS = 21
        base(13)
        c2beam(t) // Scheduled Transfer
        clock.visible = true
        clock.position.set(S[0] - 1.8, 3.0, S[1])
        clock.rotation.y = 0.6
        clock.scale.set(1.5, 1.5, 1.5)
        hand.rotation.z = -(t - 0.5) * Math.PI * 2
        for (let i = 0; i < 4; i++) {
          const a = 0.5 + i,
            p = seg(t, a, a + 0.9)
          if (p <= 0) continue
          arc(racks[i].cube, PILE(i), STK(i), sm(p), 4)
          if (p < 1) racks[i].cube.rotation.y = t * 5
        }
      },
    },
  }
}
