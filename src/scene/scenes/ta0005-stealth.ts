// TA0005 ステルス（Stealth）の場面。
import type { Kit } from '../kit'
import { seg, sm, lerp, track, put } from '../motion'
import type { SceneMap } from './types'

export default function stealth(kit: Kit): SceneMap {
  const { def, field, scan, H, IC, imp, crown, shell, pk, clock, hand, view, base, pop, alarm } = kit
  return {
    // T1036 Masquerading（本編）
    T1036: {
      hits: [3.6],
      run(t) {
        view.camT = [1.5, 4]
        view.camS = 10
        base(6) // Stealth
        imp.rotation.y = 0.6 + sm(seg(t, 0.5, 1.4)) * Math.PI * 4
        shell.visible = t > 0.95
        crown.visible = t <= 0.95
        if (t > 1.4) imp.position.y = 0
        put(
          def,
          track(
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
        view.camT = [1.2, 4.2]
        view.camS = 10
        base(6) // Indicator Removal
        put(
          imp,
          track(
            [
              [0, H[0], H[1]],
              [0.8, H[0], H[1]],
              [2.4, 0.3, 5.5],
              [2.7, 0.3, 5.5],
              [3.7, H[0], H[1]],
              [7, H[0], H[1]],
            ],
            t,
          ),
        )
        imp.scale.multiplyScalar(IC)
        if (t >= 3.7) imp.rotation.y = 0.6
        for (let i = 0; i < 6; i++) {
          const f = (i + 0.5) / 6,
            m = pk[i],
            k = 1 - sm(seg(t, 0.7 + f * 1.6, 1.0 + f * 1.6))
          m.visible = k > 0.01
          m.scale.set(0.34 * k, 0.06, 0.34 * k)
          m.position.set(lerp(H[0], 0.3, f) + (i & 1 ? 0.2 : -0.2), 0.04, lerp(H[1], 5.5, f))
        }
        put(
          def,
          track(
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
        view.camT = [1.5, 3.8]
        view.camS = 9.5
        base(6) // Obfuscated Files or Information
        const sc = sm(seg(t, 0.6, 1.3)) * (1 - sm(seg(t, 3.3, 3.8))),
          k = IC * (1 - sc),
          n = Math.floor(t * 6) // sc=1: scrambled into pieces
        imp.scale.set(k, k, k)
        imp.visible = k > 0.2
        crown.visible = sc < 0.3
        for (let i = 0; i < 7; i++) {
          const m = pk[i],
            q = 0.36 * sc,
            a = i * 0.9 + n * 1.7 * (i + 1),
            r = 0.25 + (0.7 * sc * ((i * 37 + n * 13) % 5)) / 4
          m.visible = q > 0.01
          m.scale.set(q, q, q)
          m.position.set(
            H[0] + Math.cos(a) * r,
            0.3 + ((i * 53 + n * 31) % 7) * 0.3 * sc,
            H[1] + Math.sin(a) * r,
          )
          m.rotation.set(i, n * 0.8, 0)
        }
        if (t > 1.7 && t < 3.2) {
          scan.visible = true
          scan.rotation.y = Math.PI / 2
          scan.scale.set(2.8, 2.8, 0.08)
          scan.position.set(lerp(3.9, -0.1, seg(t, 1.7, 3.2)), 1.4, H[1])
          scan.material.opacity = 0.4
        }
        if (t > 3.8 && t < 4.6) imp.position.y = Math.abs(Math.sin((t - 3.8) * 7)) * 0.35
      },
    },
    // T1564 Hide Artifacts
    T1564: {
      hits: [2.6],
      run(t) {
        view.camT = [2.2, 3.8]
        view.camS = 9.5
        base(6) // Hide Artifacts
        put(
          imp,
          track(
            [
              [0, H[0], H[1]],
              [0.6, H[0], H[1]],
              [1.6, 2.3, 4.6],
              [7, 2.3, 4.6],
            ],
            t,
          ),
        )
        imp.scale.multiplyScalar(IC)
        if (t >= 1.6) imp.rotation.y = 0.6
        const hide = sm(seg(t, 1.7, 2.4)) * (1 - sm(seg(t, 5.6, 6.2)))
        imp.scale.y *= 1 - 0.82 * hide
        crown.visible = hide < 0.5
        put(
          def,
          track(
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
        alarm(0, 1.0, 2.6, 5.3, t, 5.6, 7)
      },
    },
    // T1497 Virtualization/Sandbox Evasion
    T1497: {
      hits: [3.8],
      run(t) {
        view.camT = [1.5, 3.8]
        view.camS = 9.5
        base(6) // Virtualization/Sandbox Evasion
        const up = 1 - sm(seg(t, 0.4, 1.0)) + sm(seg(t, 3.2, 3.7))
        if (up < 0.99) {
          field.visible = true
          field.scale.set(2.2, 2.2, 2.2)
          field.position.set(H[0], 1.12 + up * 5, H[1])
          field.material.opacity = 0.35
        }
        if (t > 1.0 && t < 3.3) {
          const s = IC * 0.8
          imp.position.y = 0
          imp.scale.set(s, s * 0.5, s)
          crown.visible = false
        } // lies flat until the analysis time runs out
        if (t > 0.9 && t < 3.5) {
          pop(clock, H[0], 3.9, H[1], t, 0.9, 1.1)
          clock.rotation.y = 0.6
          hand.rotation.z = -seg(t, 1.1, 3.2) * Math.PI * 2
        }
        if (t > 3.7 && t < 4.6) {
          imp.position.y = Math.abs(Math.sin((t - 3.7) * 7)) * 0.4
          for (let i = 0; i < 5; i++) {
            const p = seg(t, 3.7 + i * 0.12, 4.4 + i * 0.12),
              m = pk[i],
              s = 0.3 * (1 - p * 0.6)
            if (p <= 0 || p >= 1) continue
            m.visible = true
            m.scale.set(s, s, s)
            m.position.set(
              H[0] + Math.sin(i * 2.1 + p * 5) * 0.6,
              1.0 + p * 2.3,
              H[1] + Math.cos(i * 2.1 + p * 5) * 0.6,
            )
          }
        }
      },
    },
  }
}
