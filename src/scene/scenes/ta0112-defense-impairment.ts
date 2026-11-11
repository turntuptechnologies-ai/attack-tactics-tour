// TA0112 防御の妨害（Defense Impairment）の場面。
import type { Kit } from '../kit'
import { seg, sm, lerp, arc, beam } from '../motion'
import type { SceneMap } from './types'

export default function defenseImpairment(kit: Kit): SceneMap {
  const {
    emps,
    check,
    field,
    links,
    drones,
    beams,
    TWP,
    H,
    imp,
    pk,
    drings,
    docs,
    proc,
    procEye,
    view,
    gate,
    sensor,
    base,
    IH,
    deny,
    ok,
  } = kit
  return {
    // T1685 Disable or Modify Tools（本編）
    T1685: {
      hits: [2.2],
      run(t) {
        view.camT = [1, 3.8]
        view.camS = 10
        base(7) // Defense Impairment
        if (t > 1 && t < 1.5) beam(links[0], [H[0], 0.7, H[1]], [0.5, 3.3, 3.5], 0.12)
        const f = seg(t, 1.4, 2.2)
        if (f > 0) sensor(0.5, lerp(3.3, 0.25, f * f), 3.5, 0.5 * f)
        if (t > 2.2 && t < 4.4) imp.position.y = Math.abs(Math.sin((t - 2.2) * 5)) * 0.4
      },
    },
    // T1686 Disable or Modify System Firewall
    T1686: {
      hits: [2.4],
      run(t) {
        view.camT = [1.5, 6.5]
        view.camS = 13
        base(7) // Disable or Modify System Firewall
        if (t > 0.8 && t < 1.5) beam(links[0], IH(0.9), [0, 1.5, 6.3], 0.12)
        gate(seg(t, 1.3, 2.0) - seg(t, 5.2, 5.8))
        const g = [0, 1.0, 6.5],
          a = [TWP[0], 2.9, TWP[1]],
          b = IH(0.9)
        if (t > 2.0 && t < 5.4)
          for (let i = 0; i < 5; i++) {
            const ph = ((t - 2.0) * 0.5 + i * 0.2) % 1,
              q = ph < 0.5 ? ph * 2 : ph * 2 - 1,
              u = ph < 0.5 ? a : g,
              w = ph < 0.5 ? g : b,
              m = pk[i]
            m.visible = true
            m.scale.set(0.3, 0.3, 0.3)
            m.position.set(lerp(u[0], w[0], q), lerp(u[1], w[1], q), lerp(u[2], w[2], q))
          }
        ok(0, 4.1, 6.9, t, 5.8)
      },
    },
    // T1553 Subvert Trust Controls
    T1553: {
      hits: [3.6],
      run(t) {
        view.camT = [0.6, 3.2]
        view.camS = 10.5
        base(7) // Subvert Trust Controls
        const px = -1.4,
          pz = 2.4,
          st = [px, 2.3, pz]
        proc.visible = true
        proc.scale.set(1.6, 1.6, 1.6)
        proc.position.set(px, 0, pz)
        proc.rotation.y = 0.6
        procEye.visible = false // trusted, signed software
        if (t > 0.5 && t < 1.0) beam(links[0], IH(1.0), st, 0.07)
        if (t < 5.4) {
          check.visible = true
          check.scale.set(0.7, 0.7, 0.7)
          check.rotation.y = 0.6
          arc(check, st, IH(3.0), sm(seg(t, 0.9, 1.9)), 1.2)
          if (t < 0.9) check.position.y += Math.sin(t * 4) * 0.06
        } // its signature, stolen
        const dp = sm(seg(t, 2.2, 2.9)) * (1 - sm(seg(t, 3.6, 4.2)))
        sensor(lerp(0.5, H[0], dp), lerp(3.3, 4.7, dp) + Math.sin(view.T * 3) * 0.1, lerp(3.5, H[1], dp))
        if (t > 2.9 && t < 3.5) {
          const bm = beams[2]
          bm.visible = true
          bm.rotation.set(0, 0, 0)
          bm.position.set(H[0], 4.0, H[1])
          bm.scale.set(0.25, 0.7, 0.25)
        }
        deny(H[0], 3.1, H[1], t, 5.4)
      },
    },
    // T1690 Prevent Command History Logging
    T1690: {
      hits: [2.5],
      run(t) {
        view.camT = [1.0, 3.2]
        view.camS = 9.5
        base(7) // Prevent Command History Logging
        const L = [0, 1.7, 2.3],
          o = docs[0],
          f = sm(seg(t, 1.8, 2.4)) * (1 - sm(seg(t, 5.4, 6.0)))
        o.visible = true
        o.scale.set(1.7, 1.7, 1.7)
        o.position.set(L[0], lerp(L[1], 0.12, f), L[2])
        o.rotation.set((-f * Math.PI) / 2, 0.6 * (1 - f), 0)
        for (let i = 0; i < 2; i++) {
          const a = 0.3 + i * 0.6,
            p = seg(t, a, a + 0.8),
            m = pk[i]
          if (p > 0 && p < 1) {
            m.visible = true
            m.scale.set(0.2, 0.2, 0.2)
            arc(m, IH(1.6), L, p, 0.6)
          }
        }
        if (t > 1.5 && t < 1.9) beam(links[0], IH(1.0), L, 0.1)
        if (t > 2.6 && t < 4.6) {
          imp.position.y = Math.abs(Math.sin((t - 2.6) * 5)) * 0.4
          for (let i = 2; i < 6; i++) {
            const p = seg(t, 2.6 + (i - 2) * 0.4, 3.4 + (i - 2) * 0.4),
              m = pk[i],
              s = 0.2 * (1 - p) + 0.01
            if (p <= 0 || p >= 1) continue
            m.visible = true
            m.scale.set(s, s, s)
            arc(m, IH(1.6), [L[0] + 0.6, 1.2, L[2] + 0.3], p, 0.8)
          }
        }
      },
    },
    // T1688 Safe Mode Boot
    T1688: {
      hits: [2.7],
      run(t) {
        view.camT = [1.4, 3.8]
        view.camS = 10
        base(7) // Safe Mode Boot
        if (t > 0.6 && t < 1.2) beam(links[0], IH(0.9), [3.5, 0.9, 4.4], 0.1)
        emps[2].scale.y = 1 - 0.45 * (sm(seg(t, 1.2, 1.6)) - sm(seg(t, 2.2, 2.5)))
        if (t > 1.2 && t < 2.6)
          drings.forEach((g, j) => {
            const ph = ((t - 1.2) * 0.9 + j * 0.5) % 1,
              k = 1 + ph * 5
            g.visible = true
            g.scale.set(k, 0.02, k)
            g.position.set(3.5, 0.08, 4.4)
            g.material.opacity = 0.5 * (1 - ph)
          })
        const f = sm(seg(t, 1.6, 2.2)) * (1 - sm(seg(t, 5.2, 5.8))),
          d = drones[2]
        d.visible = true
        d.rotation.z = 0
        d.position.set(0.5, 3.3 + (f < 0.05 ? Math.sin(view.T * 3) * 0.1 : 0), 3.5)
        d.userData.rot.rotation.y = f > 0.5 ? 0.5 : view.T * 25
        if (f > 0.02) {
          field.visible = true
          field.scale.set(1.5 * f, 1.1 * f, 1.5 * f)
          field.position.set(0.5, 3.35, 3.5)
          field.material.opacity = 0.45
        } // the sensor never loads: frozen, boxed in
        if (t > 2.6 && t < 4.6) imp.position.y = Math.abs(Math.sin((t - 2.6) * 5)) * 0.4
      },
    },
  }
}
