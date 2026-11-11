// TA0043 偵察（Reconnaissance）の場面。
import type { Kit } from '../kit'
import { seg, sm, back, track, put, beam } from '../motion'
import type { SceneMap } from './types'

export default function reconnaissance(kit: Kit): SceneMap {
  const {
    atk,
    def,
    emps,
    letters,
    letter,
    links,
    A,
    pk,
    EX,
    exps,
    ascan,
    cloud,
    docs,
    dbx,
    view,
    idle,
    TOP,
    fly,
    pop,
    deny,
    alarm,
  } = kit
  return {
    // T1595 Active Scanning（本編）
    T1595: {
      hits: [3.9],
      run(t) {
        view.camT = [0.5, 9.5]
        view.camS = 15 // Reconnaissance
        const r = track(
          [
            [0, A[0], A[1]],
            [0.9, 6, 9.3],
            [3.9, -7.5, 9.3],
            [7, -7.5, 9.3],
          ],
          t,
        )
        put(atk, r)
        if (t > 0.9 && t < 3.9) {
          ascan.visible = true
          ascan.position.set(r.x, 1.1, 8.1)
          ascan.material.opacity = 0.35 + 0.2 * Math.sin(t * 20)
        }
        exps.forEach((m, i) => {
          const seen = t > 0.9 && r.x < EX[i] + 0.3
          let s = seen ? 0.55 : 0.42
          if (t > 4.6 && i !== 1) s *= 1 - sm(seg(t, 5 + i * 0.2, 5.6 + i * 0.2))
          m.visible = s > 0.02
          m.material.color.setHex(seen ? 0xff6fd8 : 0xf6c531)
          m.scale.set(s, s, s)
          m.position.y = 2.5 + Math.sin(view.T * 4 + i) * 0.06
          m.rotation.y = view.T
        })
        put(
          def,
          track(
            [
              [0, -3, 4.6],
              [4.6, -3, 4.6],
              [5.4, -5, 5.2],
              [7, -5, 5.2],
            ],
            t,
            0,
          ),
        )
      },
    },
    // T1598 Phishing for Information
    T1598: {
      hits: [3.6],
      run(t) {
        view.camT = [2.5, 8]
        view.camS = 14
        put(atk, idle(A[0], A[1]))
        put(def, idle(-3, 4.6, 0.4)) // Phishing for Information
        const e = [3.5, 1.9, 3.6]
        if (t < 1.7) fly(letter, TOP(), e, t, 0.4, 1.6, 3, 5)
        alarm(0, 3.5, 2.3, 3.5, t, 1.6, 2.6)
        if (t > 2.4) {
          const m = pk[0]
          fly(m, e, [A[0] - 0.8, 2.9, A[1]], t, 2.4, 3.6, 3, 6)
          m.scale.set(0.4, 0.4, 0.4)
          if (t >= 3.6) m.rotation.y = view.T * 2
        }
        if (t > 4.8) {
          fly(letters[1], TOP(), [6, 1.9, 2.2], t, 4.9, 5.9, 3, 5)
          deny(6, 3.1, 2.2, t, 5.9)
        }
      },
    },
    // T1589 Gather Victim Identity Information
    T1589: {
      hits: [3.9],
      run(t) {
        view.camT = [1.5, 7.5]
        view.camS = 15
        put(atk, idle(A[0], A[1]))
        put(def, idle(-1, 4.6, 0.4)) // Gather Victim Identity Information
        emps.forEach((g, i) => {
          const e = g.position,
            m = pk[i],
            a = 0.5 + i * 0.5
          if (t < a) return
          fly(
            m,
            [e.x, 2.4, e.z],
            [A[0] - 0.9 + i * 0.6, 2.9 + (i & 1) * 0.5, A[1]],
            t,
            a + 0.8,
            a + 1.9,
            3.5,
            4,
          )
          const s = 0.36 * back(seg(t, a, a + 0.3))
          m.scale.set(s, s, s)
        })
      },
    },
    // T1593 Search Open Websites/Domains
    T1593: {
      hits: [4],
      run(t) {
        view.camT = [0.5, 10.5]
        view.camS = 14
        put(atk, idle(A[0], A[1], -1.2))
        put(def, idle(-3, 4.6, 0.4)) // Search Open Websites/Domains
        const C = [-3.5, 4.2, 11.5]
        pop(cloud, C[0], C[1] + Math.sin(view.T * 2) * 0.12, C[2], t, 0.2, 1.5)
        cloud.rotation.y = 0.6
        docs.forEach((d, i) => {
          const a = 1.0 + i * 0.55
          if (t < a) return
          fly(
            d,
            [C[0] - 0.9 + i * 0.6, C[1] - 0.2, C[2]],
            [A[0] - 0.9 + i * 0.6, 2.9 + (i & 1) * 0.5, A[1]],
            t,
            a + 0.3,
            a + 1.3,
            1.5,
            5,
          )
          const s = back(seg(t, a, a + 0.3))
          d.scale.set(s, s, s)
          if (t >= a + 1.3) d.rotation.y = 0.6
        })
      },
    },
    // T1596 Search Open Technical Databases
    T1596: {
      hits: [3.1],
      run(t) {
        view.camT = [0, 9.5]
        view.camS = 15
        put(atk, idle(A[0], A[1], -1.2))
        put(def, idle(-3, 4.6, 0.4)) // Search Open Technical Databases
        pop(dbx, -2.5, 0, 12.2, t, 0.2)
        dbx.rotation.y = 0.6
        if (t > 0.9 && t < 1.5) beam(links[4], [A[0], 1.5, A[1]], [-2.5, 1.0, 12.2], 0.08)
        exps.forEach((m, i) => {
          const a = 1.6 + i * 0.6,
            on = t > a
          m.visible = true
          m.material.color.setHex(on ? 0xff6fd8 : 0xf6c531)
          let s = on ? 0.55 : 0.42
          if (t > 5 && i !== 1) s *= 1 - sm(seg(t, 5 + i * 0.2, 5.6 + i * 0.2))
          m.visible = s > 0.02
          m.scale.set(s, s, s)
          m.position.y = 2.5 + Math.sin(view.T * 4 + i) * 0.06
          m.rotation.y = view.T
          if (on && t < 4.6) beam(links[i], [-2.5, 1.4, 12.2], [EX[i], 2.5, 6.5], 0.06)
        })
      },
    },
  }
}
