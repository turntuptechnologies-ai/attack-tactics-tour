// TA0002 実行（Execution）の場面。
import type { Kit } from '../kit'
import { seg, sm, lerp, back, beam } from '../motion'
import type { SceneMap } from './types'

export default function execution(kit: Kit): SceneMap {
  const {
    emps,
    letter,
    grant,
    field,
    links,
    bots,
    H,
    IS,
    imp,
    pk,
    exps,
    docs,
    view,
    impAt,
    sensor,
    base,
    IH,
    fly,
    hop,
    alarm,
    lands,
    watch,
  } = kit
  return {
    // T1059 Command and Scripting Interpreter（本編）
    T1059: {
      hits: [3.2],
      run(t) {
        view.camT = [1.5, 3.8]
        view.camS = 10
        base(3) // Execution
        if (t < 4.4) {
          imp.position.y = Math.abs(Math.sin(t * 6)) * 0.25
          const s = IS * (1 + 0.12 * Math.sin(t * 12))
          imp.scale.set(s, s, s)
        }
        pk.forEach((m, i) => {
          const a = 0.4 + i * 0.5,
            p = seg(t, a, a + 1.1)
          if (p <= 0 || p >= 1) return
          m.visible = true
          m.position.set(
            H[0] + Math.sin(i * 2.1 + p * 5) * 0.55,
            0.8 + p * 2.3,
            H[1] + Math.cos(i * 2.1 + p * 5) * 0.55,
          )
          const s = 0.32 * (1 - p * 0.6)
          m.scale.set(s, s, s)
          m.rotation.set(t * 4, t * 6, 0)
        })
        if (t > 4.6) sensor(0.5, lerp(8, 3.3, sm(seg(t, 4.6, 5.6))) + Math.sin(view.T * 3) * 0.1, 3.5)
      },
    },
    // T1204 User Execution
    T1204: {
      hits: [3.1],
      run(t) {
        view.camT = [2.6, 3.8]
        view.camS = 9
        base(3) // User Execution
        if (t < 2.3) {
          letter.visible = true
          letter.position.set(2.9, 1.1 + Math.sin(t * 5) * 0.05, 4.5)
          letter.rotation.y = 0.3
          impAt(0, 0, 0, 0)
        } else {
          lands(t, 2.3, 3.1, [2.9, 1.0, 4.5], IH(0), 1.2, IS * back(seg(t, 2.3, 2.6)))
          if (t > 3.1 && t < 4.4) imp.position.y = Math.abs(Math.sin(t * 6)) * 0.25
        }
        alarm(0, 3.5, 2.2, 3.5, t, 0.8, 2.0)
        hop(emps[2], t, 1.6, 2.4)
        pk.forEach((m, i) => {
          const a = 3.1 + i * 0.25,
            p = seg(t, a, a + 1)
          if (i > 3 || p <= 0 || p >= 1) return
          m.visible = true
          m.position.set(
            H[0] + Math.sin(i * 2.1 + p * 5) * 0.55,
            0.8 + p * 2.3,
            H[1] + Math.cos(i * 2.1 + p * 5) * 0.55,
          )
          const s = 0.32 * (1 - p * 0.6)
          m.scale.set(s, s, s)
        })
        watch(t)
      },
    },
    // T1072 Software Deployment Tools
    T1072: {
      hits: [3],
      run(t) {
        view.camT = [0.5, 3.4]
        view.camS = 12.5
        base(3) // Software Deployment Tools
        emps.forEach((g, i) => {
          const e = g.position,
            m = pk[i],
            a = 0.8 + i * 0.25,
            to = [e.x + 0.95, 0.3, e.z + 0.2]
          if (t > a && t < a + 1) {
            fly(m, IH(1.2), to, t, a, a + 1, 2.2, 6)
            m.scale.set(0.3, 0.3, 0.3)
          }
          if (t >= a + 1) {
            const b = bots[4 + i],
              s = back(seg(t, a + 1, a + 1.3))
            b.visible = true
            b.scale.set(s, s, s)
            b.position.set(to[0], Math.abs(Math.sin(t * 6 + i)) * 0.2, to[2])
            b.rotation.y = 0.6
          }
        })
        watch(t)
      },
    },
    // T1203 Exploitation for Client Execution
    T1203: {
      hits: [3.1],
      run(t) {
        view.camT = [2.6, 3.8]
        view.camS = 9
        base(3) // Exploitation for Client Execution
        const w = [3.5, 1.9, 4.5],
          hit = t > 1.9,
          gone = sm(seg(t, 2.3, 2.6)),
          o = docs[0],
          m = exps[0]
        if (t < 2.6) {
          field.visible = true
          field.scale.set(1.5 * (1 + 0.25 * gone), 1.1 * (1 - gone) + 0.02, 0.1)
          field.position.set(w[0] + (hit ? Math.sin(t * 60) * 0.06 : 0), w[1], w[2])
          field.material.opacity = hit && Math.sin(t * 40) > 0 ? 0.9 : 0.55
        }
        if (t < 1.9) {
          fly(o, [1.2, 2.6, 5.6], w, t, 0.5, 1.6, 1.0, 0)
          o.rotation.y = 0.3
          m.visible = true
          m.material.color.setHex(0xf6c531)
          m.scale.set(0.2, 0.2, 0.2)
          m.position.set(o.position.x + 0.2, o.position.y - 0.15, o.position.z + 0.12)
        }
        if (t < 2.3) impAt(0, 0, 0, 0)
        else {
          lands(t, 2.3, 3.1, w, IH(0), 0.8, IS * back(seg(t, 2.3, 2.6)))
          const p = seg(t, 2.3, 3.1)
          if (p < 1)
            for (let i = 0; i < 5; i++) {
              const q = pk[i],
                a = i * 1.26,
                s = 0.3 * (1 - p) + 0.01
              q.visible = true
              q.scale.set(s, s, s)
              q.position.set(w[0] + Math.cos(a) * p * 1.6, w[1] + p * 0.8, w[2] + Math.sin(a) * p * 1.6)
            }
        }
        watch(t)
      },
    },
    // T1047 Windows Management Instrumentation
    T1047: {
      hits: [3],
      run(t) {
        view.camT = [0.5, 3.2]
        view.camS = 11
        base(3) // Windows Management Instrumentation
        const g = [0, 0.6, 2.2]
        grant.visible = true
        grant.scale.set(0.9, 0.9, 0.9)
        grant.position.set(g[0], g[1] + Math.sin(view.T * 3) * 0.05, g[2])
        grant.rotation.y = view.T * (t > 1.2 && t < 4.4 ? 3 : 0.5)
        if (t > 0.6 && t < 1.3) beam(links[0], IH(0.8), g, 0.1)
        ;[1, 2, 3].forEach((ei, j) => {
          const e = emps[ei].position,
            a = 1.5 + j * 0.5,
            m = pk[j],
            p = seg(t, a + 0.4, a + 1.6)
          if (t > a && t < a + 0.6) beam(links[1 + j], g, [e.x, 0.9, e.z + 0.9], 0.07)
          if (p > 0 && p < 1) {
            const s = 0.3 * (1 - p * 0.6)
            m.visible = true
            m.scale.set(s, s, s)
            m.position.set(e.x + Math.sin(p * 5) * 0.4, 1.3 + p * 1.8, e.z + 0.9 + Math.cos(p * 5) * 0.4)
          }
        })
        watch(t)
      },
    },
  }
}
