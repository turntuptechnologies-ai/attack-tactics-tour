// TA0009 収集（Collection）の場面。
import type { Kit } from '../kit'
import { seg, sm, lerp, back, arc } from '../motion'
import type { SceneMap } from './types'

export default function collection(kit: Kit): SceneMap {
  const { emps, letters, grant, field, RZ, racks, S, drings, plock, docs, view, PILE, base, fly, pop } = kit
  return {
    // T1005 Data from Local System（本編）
    T1005: {
      hits: [3.5],
      run(t) {
        view.camT = [-1.5, -3.2]
        view.camS = 10.5
        base(11) // Collection
        for (let i = 0; i < 4; i++) {
          const r = racks[i],
            a = 0.6 + i * 0.6,
            p = seg(t, a, a + 1)
          if (p <= 0) continue
          arc(r.cube, [r.x, 2.72, RZ], PILE(i), sm(p), 1.5)
          if (p < 1) r.cube.rotation.y = t * 5
        }
      },
    },
    // T1114 Email Collection
    T1114: {
      hits: [3.8],
      run(t) {
        view.camT = [-0.5, 0.5]
        view.camS = 14
        base(11) // Email Collection
        emps.forEach((g, i) => {
          const e = g.position,
            a = 0.5 + i * 0.5,
            l = letters[i]
          if (t < a) return
          fly(l, [e.x, 2.2, e.z], [S[0] - 0.9 + i * 0.6, 0.35, S[1] + 1.4], t, a + 0.5, a + 1.7, 3, 5)
          const k = back(seg(t, a, a + 0.3))
          l.scale.set(k, k, k)
          if (t >= a + 1.7) l.rotation.y = 0.4
        })
      },
    },
    // T1560 Archive Collected Data
    T1560: {
      hits: [3.2],
      run(t) {
        view.camT = [-1.5, -3.0]
        view.camS = 9.5
        base(11) // Archive Collected Data
        const c = [-1.2, 0.5, -2.2],
          q = sm(seg(t, 1.0, 2.2)),
          s = 0.6 * (1 - 0.9 * sm(seg(t, 1.8, 2.4)))
        for (let i = 0; i < 4; i++) {
          const r = racks[i],
            p0 = PILE(i)
          r.cube.position.set(lerp(p0[0], c[0], q), lerp(p0[1], c[1], q), p0[2])
          r.cube.scale.set(s, s, s)
          r.cube.visible = t < 2.4
        }
        if (t > 2.1) {
          const k = 0.95 * back(seg(t, 2.1, 2.5))
          grant.visible = true
          grant.scale.set(k, k, k)
          grant.position.set(c[0], 0.5, c[2])
          grant.rotation.y = 0.3
        }
        pop(plock, c[0], 1.3, c[2], t, 2.9, 0.6)
        plock.rotation.y = 0.6
      },
    },
    // T1113 Screen Capture
    T1113: {
      hits: [3.7],
      run(t) {
        view.camT = [-2, 0.6]
        view.camS = 12
        base(11) // Screen Capture
        const e = emps[1].position,
          scr = [e.x, 1.0, e.z + 0.7]
        for (let i = 0; i < 3; i++) {
          const a = 0.5 + i * 0.9,
            d = docs[i]
          if (t > a && t < a + 0.25) {
            field.visible = true
            field.scale.set(1.3, 1.0, 0.1)
            field.position.set(scr[0], scr[1], scr[2] + 0.5)
            field.material.opacity = 0.8
          }
          if (t > a + 0.1) {
            fly(
              d,
              [scr[0], 1.6, scr[2]],
              [S[0] - 0.7 + i * 0.7, 0.5, S[1] + 1.5],
              t,
              a + 0.3,
              a + 1.3,
              2.5,
              5,
            )
            const s = back(seg(t, a + 0.1, a + 0.4))
            d.scale.set(s, s, s)
            if (t >= a + 1.3) d.rotation.y = 0.6
          }
        }
      },
    },
    // T1074 Data Staged
    T1074: {
      hits: [3.7],
      run(t) {
        view.camT = [-2, -0.5]
        view.camS = 14
        base(11) // Data Staged
        const c = [-3.2, 0.3, -2.0]
        drings.forEach((g, j) => {
          const ph = (t * 0.5 + j * 0.5) % 1,
            k = 1 + ph * 4
          g.visible = true
          g.scale.set(k, 0.02, k)
          g.position.set(c[0], 0.08, c[2])
          g.material.opacity = 0.5 * (1 - ph)
        })
        for (let i = 0; i < 2; i++) {
          const r = racks[i],
            a = 0.5 + i * 1.2,
            p = seg(t, a, a + 1.1),
            e = emps[1 - i].position,
            d = docs[i],
            b = 1.1 + i * 1.2
          if (p > 0) {
            arc(r.cube, [r.x, 2.72, RZ], [c[0] - 0.4 + i * 0.8, 0.3, c[2] - 0.3], sm(p), 1.5)
            if (p < 1) r.cube.rotation.y = t * 5
          }
          if (t > b) {
            fly(d, [e.x, 2.2, e.z], [c[0] - 0.4 + i * 0.8, 0.45, c[2] + 0.5], t, b + 0.2, b + 1.3, 3, 5)
            const s = back(seg(t, b, b + 0.3))
            d.scale.set(s, s, s)
            if (t >= b + 1.3) d.rotation.y = 0.6
          }
        }
      },
    },
  }
}
