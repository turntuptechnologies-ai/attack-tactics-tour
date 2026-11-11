// TA0003 永続化（Persistence）の場面。
import type { Kit } from '../kit'
import { seg, sm, lerp, back, track, put, beam } from '../motion'
import type { SceneMap } from './types'

export default function persistence(kit: Kit): SceneMap {
  const {
    def,
    emps,
    key,
    user,
    fake,
    links,
    beams,
    RZ,
    racks,
    TWP,
    H,
    IS,
    imp,
    anchor,
    keys3,
    pk,
    c2,
    drings,
    clock,
    hand,
    view,
    idle,
    impAt,
    sensor,
    bob,
    base,
    IH,
    fly,
    pop,
    deny,
    alarm,
    lands,
  } = kit
  return {
    // T1053 Scheduled Task/Job（本編）
    T1053: {
      hits: [1.8, 5.7],
      run(t) {
        view.camT = [1.8, 4]
        view.camS = 10
        base(4) // Persistence
        put(
          imp,
          track(
            [
              [0, H[0], H[1]],
              [0.5, H[0], H[1]],
              [1.2, 2.2, 1.7],
              [1.9, 2.2, 1.7],
              [2.6, H[0], H[1]],
              [9, H[0], H[1]],
            ],
            t,
          ),
        )
        imp.scale.multiplyScalar(IS)
        if (t >= 2.6) imp.rotation.y = 0.6
        if (t > 1.5) {
          anchor.visible = true
          const k = back(seg(t, 1.5, 1.8)) * (1 + 0.4 * Math.sin(Math.PI * seg(t, 4.7, 5.4)))
          anchor.scale.set(k, k, k)
        }
        pop(clock, 3.2, 2.2 + Math.sin(view.T * 3) * 0.05, 1.6, t, 1.7, 0.8)
        clock.rotation.y = 0.6
        hand.rotation.z = -seg(t, 1.9, 5.3) * Math.PI * 2
        const dp = sm(seg(t, 2.9, 3.5)) * (1 - sm(seg(t, 4.1, 4.6)))
        sensor(lerp(0.5, H[0], dp), lerp(3.3, 2.7, dp) + Math.sin(view.T * 3) * 0.1, lerp(3.5, H[1], dp))
        if (t > 3.5 && t < 3.9) {
          const b = beams[2]
          b.visible = true
          b.rotation.set(0, 0, 0)
          b.position.set(H[0], 1.6, H[1])
          b.scale.set(0.3, 1.8, 0.3)
        }
        if (t > 3.6 && t < 5.3) {
          const s = 1 - seg(t, 3.6, 3.9)
          impAt(H[0], 0, H[1], IS * s)
        } else if (t >= 5.3) {
          impAt(H[0], bob(), H[1], IS * back(seg(t, 5.3, 5.7)))
        }
      },
    },
    // T1136 Create Account
    T1136: {
      hits: [1.5],
      run(t) {
        view.camT = [1.8, 3.6]
        view.camS = 10
        base(4) // Create Account
        const fx = 3.4,
          fz = 1.9
        if (t > 0.5 && t < 1.1) beam(links[0], IH(0.8), [fx, 0.8, fz], 0.1)
        if (t > 1.0) {
          const s = back(seg(t, 1.0, 1.4)) * (1 - sm(seg(t, 6.0, 6.5)))
          fake.visible = s > 0.01
          fake.position.set(fx, 0, fz)
          fake.rotation.y = 0.5
          fake.scale.set(s, s, s)
          if (t < 4.6) {
            key.visible = true
            key.scale.set(0.7, 0.7, 0.7)
            key.position.set(fx, 2.5 + Math.sin(t * 5) * 0.08, fz)
            key.rotation.y = t * 3
          }
        }
        if (t > 4.6) {
          put(
            def,
            track(
              [
                [4.6, -2, 5],
                [5.6, 2.2, 2.4],
                [7, 2.2, 2.4],
              ],
              t,
              0.4,
            ),
          )
          deny(fx, 2.6, fz, t, 5.6)
        }
      },
    },
    // T1547 Boot or Logon Autostart Execution
    T1547: {
      hits: [4],
      run(t) {
        view.camT = [2.4, 3.8]
        view.camS = 9.5
        base(4) // Boot or Logon Autostart Execution
        const d = [2.9, 1.0, 4.5],
          m = pk[0],
          ms = 0.3 * (1 - sm(seg(t, 5.8, 6.2)))
        fly(m, IH(1.2), d, t, 0.5, 1.3, 1.5, 6)
        m.scale.set(ms, ms, ms)
        m.visible = ms > 0.01
        if (t >= 1.3) m.rotation.y = view.T * 2
        emps[2].scale.y = 1 - 0.45 * (sm(seg(t, 1.8, 2.2)) - sm(seg(t, 2.9, 3.1)))
        alarm(0, 3.5, 2.2, 3.5, t, 2.9, 3.6)
        if (t > 2.9 && t < 4.0)
          drings.forEach((g, j) => {
            const ph = ((t - 2.9) * 0.9 + j * 0.5) % 1,
              k = 1 + ph * 6
            g.visible = true
            g.scale.set(k, 0.02, k)
            g.position.set(3.5, 0.08, 4.4)
            g.material.opacity = 0.5 * (1 - ph)
          })
        if (t >= 1.8 && t < 3.3) impAt(H[0], 0, H[1], IS * (1 - seg(t, 1.8, 2.1)))
        else if (t >= 3.3) lands(t, 3.3, 4.0, d, IH(0), 1.0, IS * back(seg(t, 3.3, 3.6)))
        if (t > 4.6) {
          put(
            def,
            track(
              [
                [4.6, -2, 5],
                [5.6, 2.0, 4.9],
                [7, 2.0, 4.9],
              ],
              t,
              0.4,
            ),
          )
          deny(d[0], 2.0, d[2], t, 5.5)
        }
      },
    },
    // T1505 Server Software Component
    T1505: {
      hits: [2.6],
      run(t) {
        view.camT = [1.5, 2]
        view.camS = 19
        base(4) // Server Software Component
        const r = racks[3],
          top = [r.x, 3.5, RZ],
          m = pk[0]
        fly(m, IH(1.2), top, t, 0.5, 1.7, 3.5, 6)
        m.scale.set(0.4, 0.4, 0.4)
        if (t >= 1.7) m.rotation.y = view.T * 2
        if (t > 1.7 && t < 5.6) r.lm.color.setHex(0xff6fd8)
        if (t > 2.4 && t < 5.2) {
          beam(c2, [TWP[0], 2.9, TWP[1]], top, 0.09)
          c2.material.opacity = 0.45 + 0.25 * Math.sin(t * 8)
        }
        if (t > 5.6) m.visible = false
        deny(top[0], top[1] + 0.9, top[2], t, 5.4)
      },
    },
    // T1098 Account Manipulation
    T1098: {
      hits: [2.1],
      run(t) {
        view.camT = [2.2, 3.2]
        view.camS = 9.5
        base(4) // Account Manipulation
        const ux = 3.6,
          uz = 1.8,
          k0 = keys3[0]
        user.visible = true
        put(user, idle(ux, uz, 0.5))
        k0.visible = true
        k0.scale.set(0.6, 0.6, 0.6)
        k0.position.set(ux - 0.35, 2.5 + Math.sin(view.T * 4) * 0.06, uz)
        k0.rotation.y = 0.6
        if (t > 0.8) {
          const k1 = keys3[1],
            g = 0.6 * (1 - sm(seg(t, 5.6, 6.0))),
            m = pk[0]
          fly(k1, IH(1.8), [ux + 0.4, 2.5, uz], t, 0.8, 2.0, 1.5, 6)
          k1.scale.set(g, g, g)
          k1.visible = g > 0.02
          if (t >= 2.0) k1.rotation.y = 0.6
          m.visible = k1.visible
          m.scale.set(0.2, 0.2, 0.2)
          m.position.set(k1.position.x, k1.position.y + 0.55, k1.position.z)
          m.rotation.y = view.T * 3
        }
        if (t > 4.6) {
          put(
            def,
            track(
              [
                [4.6, -2, 5],
                [5.6, 2.4, 2.8],
                [7, 2.4, 2.8],
              ],
              t,
              0.4,
            ),
          )
          deny(ux + 0.4, 3.4, uz, t, 5.4)
        }
      },
    },
  }
}
