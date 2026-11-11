// TA0007 探索（Discovery）の場面。
import type { Kit } from '../kit'
import { seg, lerp, back, beam } from '../motion'
import type { SceneMap } from './types'

export default function discovery(kit: Kit): SceneMap {
  const {
    emps,
    key,
    links,
    drones,
    RZ,
    racks,
    H,
    marks,
    pk,
    ascan,
    drings,
    docs,
    dbx,
    proc,
    procEye,
    view,
    base,
    IH,
    pop,
    alarm,
  } = kit
  return {
    // T1046 Network Service Discovery（本編）
    T1046: {
      hits: [3.5],
      run(t) {
        view.camT = [0, -0.5]
        view.camS = 15.5
        base(9) // Discovery
        if (t < 4.6)
          drings.forEach((g, j) => {
            const ph = (t * 0.55 + j * 0.5) % 1,
              k = 1 + ph * 26
            g.visible = true
            g.scale.set(k, 0.02, k)
            g.position.set(H[0], 0.08, H[1])
            g.material.opacity = 0.5 * (1 - ph)
          })
        marks.forEach((m, i) => {
          const a = 1.4 + i * 0.35
          if (t < a) return
          m.visible = true
          const s = (i === 2 ? 0.6 : 0.35) * back(seg(t, a, a + 0.3))
          m.scale.set(s, s, s)
          m.position.y = 3.7 + Math.sin(view.T * 4 + i) * 0.08
          m.rotation.y = view.T * 2
        })
      },
    },
    // T1087 Account Discovery
    T1087: {
      hits: [2.9],
      run(t) {
        view.camT = [0, 3.2]
        view.camS = 12.5
        base(9) // Account Discovery
        const D0 = [0.2, 2.0]
        pop(dbx, D0[0], 0, D0[1], t, 0.3, 0.8)
        dbx.rotation.y = 0.6 // the directory that lists every account
        if (t > 0.5 && t < 1.0) beam(links[4], IH(0.9), [D0[0], 0.9, D0[1]], 0.08)
        emps.forEach((g, i) => {
          const e = g.position,
            a = 1.0 + i * 0.45
          if (t < a) return
          const s = back(seg(t, a, a + 0.3)),
            y = Math.sin(view.T * 4 + i) * 0.08
          if (t < a + 0.4) beam(links[i], [D0[0], 1.2, D0[1]], [e.x, 1.6, e.z], 0.05)
          if (i === 1) {
            key.visible = true
            key.scale.set(0.8 * s, 0.8 * s, 0.8 * s)
            key.position.set(e.x, 2.8 + y, e.z)
            key.rotation.y = view.T * 2
          } else {
            const m = pk[i]
            m.visible = true
            m.scale.set(0.34 * s, 0.34 * s, 0.34 * s)
            m.position.set(e.x, 2.4 + y, e.z)
            m.rotation.y = view.T * 2
          }
        })
      },
    },
    // T1083 File and Directory Discovery
    T1083: {
      hits: [3.6],
      run(t) {
        view.camT = [0, 3.4]
        view.camS = 12.5
        base(9) // File and Directory Discovery
        const sx = lerp(7.5, -7.5, seg(t, 0.6, 3.4))
        if (t > 0.6 && t < 3.4) {
          ascan.visible = true
          ascan.scale.set(0.5, 1.8, 3.4)
          ascan.position.set(sx, 1.1, 3.4)
          ascan.material.opacity = 0.35 + 0.2 * Math.sin(t * 20)
        }
        emps.forEach((g, i) => {
          const e = g.position
          pop(
            docs[i],
            e.x,
            2.3 + Math.sin(view.T * 4 + i) * 0.08,
            e.z + 0.6,
            t,
            0.6 + ((7.5 - e.x) / 15) * 2.8,
          )
          docs[i].rotation.y = 0.6
        })
        alarm(0, -6, 3.1, 4.1, t, 3.5, 4.6)
      },
    },
    // T1018 Remote System Discovery
    T1018: {
      hits: [3.5],
      run(t) {
        view.camT = [0, 1.5]
        view.camS = 15
        base(9) // Remote System Discovery
        emps
          .map((g) => [g.position.x, 0.9, g.position.z + 0.9])
          .concat([
            [racks[2].x, 1.2, RZ + 0.6],
            [racks[3].x, 1.2, RZ + 0.6],
          ])
          .forEach((p, i) => {
            const a = 0.6 + i * 0.45
            if (t > a && t < a + 0.4) beam(links[i], IH(1.0), p, 0.06)
            if (t > a + 0.3) {
              const m = pk[i],
                s = 0.3 * back(seg(t, a + 0.3, a + 0.6))
              m.visible = true
              m.scale.set(s, s, s)
              m.position.set(p[0], p[1] + 1.6 + Math.sin(view.T * 4 + i) * 0.08, p[2])
              m.rotation.y = view.T * 2
            }
          })
      },
    },
    // T1057 Process Discovery
    T1057: {
      hits: [3.6],
      run(t) {
        view.camT = [1.6, 3.0]
        view.camS = 9.5
        base(9) // Process Discovery
        const ang = t * 2.2,
          th = 6.0
        if (t > 0.5 && t < 3.6) {
          ascan.visible = true
          ascan.scale.set(0.15, 1.2, 1.7)
          ascan.position.set(H[0] + Math.sin(ang) * 0.95, 0.7, H[1] + Math.cos(ang) * 0.95)
          ascan.rotation.y = ang
          ascan.material.opacity = 0.4
        }
        ;[0, 1, 3, 4].forEach((di, j) => {
          const d = drones[di],
            s = 0.7 * back(seg(t, 0.8 + j * 0.6, 1.1 + j * 0.6)),
            q = 1.0 + j * 1.25
          d.visible = s > 0.01
          d.scale.set(s, s, s)
          d.rotation.set(0, 0, 0)
          d.position.set(
            H[0] + Math.sin(q) * 1.9,
            0.9 + Math.sin(view.T * 3 + j) * 0.08,
            H[1] + Math.cos(q) * 1.9,
          )
          d.userData.rot.rotation.y = view.T * 20
        })
        pop(proc, H[0] + Math.sin(th) * 1.9, 0, H[1] + Math.cos(th) * 1.9, t, 3.2, 1.3)
        proc.rotation.y = 0.6
        procEye.visible = false
        alarm(0, proc.position.x, 2.0, proc.position.z, t, 3.7, 4.6)
      },
    },
  }
}
