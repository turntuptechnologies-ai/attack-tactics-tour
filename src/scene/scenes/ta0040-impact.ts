// TA0040 影響（Impact）の場面。
import type { Kit } from '../kit'
import { seg, sm, lerp, back, bounce, track, put, arc, beam } from '../motion'
import type { SceneMap } from './types'

export default function impact(kit: Kit): SceneMap {
  const {
    wm,
    atk,
    def,
    bang,
    user,
    field,
    hammer,
    links,
    bots,
    truckA,
    RZ,
    racks,
    A,
    S,
    marks,
    plock,
    dbx,
    view,
    idle,
    base,
    pop,
    deny,
    ok,
    hop,
    alarm,
  } = kit
  return {
    // T1486 Data Encrypted for Impact（本編）
    T1486: {
      hits: [2.4],
      run(t) {
        view.camT = [0, -3.2]
        view.camS = 13.5
        base(14) // Impact
        put(def, idle(4.8, -3, -Math.PI / 2))
        for (let i = 0; i < 4; i++) {
          const r = racks[i],
            a = 0.6 + i * 0.45,
            rt = 5.4 + i * 0.3
          if (t > a && t < rt) {
            r.lm.color.setHex(0xff4a3d)
            r.lock.visible = true
            const s = back(seg(t, a, a + 0.3))
            r.lock.scale.set(s, s, s)
          }
          if (t > rt - 0.5) {
            r.bk.visible = true
            r.bk.position.y = 2.72 + (1 - bounce(seg(t, rt - 0.5, rt + 0.2))) * 7
          }
        }
        if (t > 2.6 && t < 4.5) {
          bang.visible = true
          bang.position.set(4.8, 2.2 + Math.abs(Math.sin(t * 9)) * 0.2, -3)
          def.position.y = Math.abs(Math.sin(t * 9)) * 0.15
        }
      },
    },
    // T1485 Data Destruction
    T1485: {
      hits: [2.9],
      run(t) {
        view.camT = [0.5, -3.2]
        view.camS = 14
        base(14)
        put(def, idle(4.8, -3, -Math.PI / 2)) // Data Destruction
        const ph = (t - 0.6) / 0.35,
          hi = Math.max(0, Math.min(5, ph))
        if (t > 0.2 && t < 2.9) {
          hammer.visible = true
          hammer.position.set(lerp(racks[0].x, racks[5].x, hi / 5), 3.3, RZ + 0.9)
          hammer.rotation.x = -0.2 - Math.abs(Math.cos(Math.PI * ph)) * 1.2
        } // smashed one by one
        racks.forEach((r, i) => {
          const a = 0.6 + i * 0.35,
            back0 = 5.2 + i * 0.18,
            p = seg(t, a, a + 0.4),
            q = seg(t, back0, back0 + 0.6),
            m = marks[i]
          if (t > a && t < back0 + 0.6) r.lm.color.setHex(0x1a1d24)
          r.cube.position.set(r.x, 2.72, RZ)
          r.cube.scale.set(0.6, 0.6, 0.6)
          r.cube.visible = t < a
          if (p > 0 && p < 1) {
            const s = 1.1 * (1 - p)
            m.visible = true
            m.scale.set(s, s, s)
            m.position.y = 2.9 + p * 0.8
            m.rotation.y = t * 9
          }
          if (q > 0) {
            r.bk.visible = true
            arc(r.bk, [7.6, 2.0, -1.2], [r.x, 2.72, RZ], sm(q), 3)
          }
        })
        if (t > 2.8 && t < 4.5) {
          bang.visible = true
          bang.position.set(4.8, 2.2 + Math.abs(Math.sin(t * 9)) * 0.2, -3)
          def.position.y = Math.abs(Math.sin(t * 9)) * 0.15
        }
        if (t > 4.6) {
          const k = back(seg(t, 4.6, 4.9))
          truckA.visible = true
          truckA.scale.set(k, k, k)
          truckA.rotation.y = Math.PI / 2
          truckA.position.set(lerp(10.2, 7.8, sm(seg(t, 4.6, 5.2))), 0, -1.2)
        }
      },
    },
    // T1498 Network Denial of Service
    T1498: {
      hits: [2.6],
      run(t) {
        view.camT = [0.5, 9.4]
        view.camS = 15
        base(14)
        view.actor = atk
        put(def, idle(-2, 5, 0.4)) // Network Denial of Service
        for (let j = 0; j < 16; j++) {
          const b = bots[j + 4],
            a = 0.3 + (j % 8) * 0.15,
            p = sm(seg(t, a, a + 1.6)),
            s = back(seg(t, a, a + 0.3)) * (1 - sm(seg(t, 5.3 + j * 0.04, 5.8 + j * 0.04)))
          b.visible = s > 0.01
          b.scale.set(s, s, s)
          b.position.set(
            lerp(-9 + j * 1.2, -2.2 + (j % 6) * 0.9, p),
            Math.abs(Math.sin(t * 7 + j)) * 0.3,
            lerp(14.6, 7.7 + Math.floor(j / 6) * 0.9, p),
          )
          b.rotation.y = Math.PI
        }
        user.visible = true
        put(user, idle(6.5, 10.4, -2.2))
        if (t < 5.6) deny(6.5, 3.0, 10.4, t, 2.4)
        if (t > 5.0) {
          field.visible = true
          field.position.set(0, 1.4, 10.6)
          field.scale.set(9, 2.8, 0.12)
          field.material.opacity = 0.5 * sm(seg(t, 5.0, 5.5))
        }
        if (t >= 5.6) ok(6.5, 3.0, 10.4, t, 6.0)
      },
    },
    // T1490 Inhibit System Recovery
    T1490: {
      hits: [2.3],
      run(t) {
        view.camT = [-0.5, -3.0]
        view.camS = 13.5
        base(14)
        put(def, idle(4.8, -3, -Math.PI / 2)) // Inhibit System Recovery
        const V = [-5.4, -2.2],
          sq = sm(seg(t, 1.6, 2.2)),
          bx = [6.6, 0.95, -2.6]
        dbx.visible = true
        dbx.position.set(V[0], 0, V[1])
        dbx.rotation.y = 0.6
        dbx.scale.set(1.3 * (1 + 0.25 * sq), 1.3 * (1 - 0.85 * sq), 1.3 * (1 + 0.25 * sq)) // the backup store, flattened
        for (let i = 0; i < 3; i++) {
          const b = racks[i].bk,
            s = 0.5 * (1 - sm(seg(t, 1.6 + i * 0.2, 2.1 + i * 0.2))),
            a = view.T * 1.5 + i * 2.09
          b.visible = s > 0.02
          b.scale.set(s, s, s)
          b.position.set(
            V[0] + Math.cos(a) * 1.3,
            2.7 + Math.sin(view.T * 3 + i) * 0.1,
            V[1] + Math.sin(a) * 1.3,
          )
        }
        if (t > 0.9 && t < 1.7) beam(links[0], [S[0], 1.2, S[1]], [V[0], 1.0, V[1]], 0.1)
        alarm(0, 4.8, 2.2, -3, t, 2.8, 4.5)
        hop(def, t, 2.8, 4.5, 0.15)
        if (t > 3.0 && t < 4.6) deny(V[0], 2.4, V[1], t, 3.0)
        if (t > 5.0) {
          const k = back(seg(t, 5.0, 5.4))
          field.visible = true
          field.scale.set(1.9 * k, 1.9 * k, 1.9 * k)
          field.position.set(bx[0], bx[1], bx[2])
          field.material.opacity = 0.35 // a copy kept off the network
          ;[4, 5].forEach((ri, j) => {
            const b = racks[ri].bk
            b.visible = true
            b.scale.set(0.5 * k, 0.5 * k, 0.5 * k)
            b.position.set(bx[0] - 0.4 + j * 0.8, 0.5, bx[2])
          })
          pop(plock, bx[0], 2.4, bx[2], t, 5.4, 0.7)
          plock.rotation.y = 0.6
        }
      },
    },
    // T1491 Defacement
    T1491: {
      hits: [3],
      run(t) {
        view.camT = [0.5, 8.5]
        view.camS = 17
        base(14)
        view.actor = atk
        put(def, idle(-2, 5, 0.4)) // Defacement
        put(
          atk,
          track(
            [
              [0, A[0], A[1]],
              [0.2, A[0], A[1]],
              [1.0, 0.8, 9.2],
              [7, 0.8, 9.2],
            ],
            t,
          ),
        )
        for (let x = -10; x <= 10; x++) {
          if (!wm[x]) continue
          const d = Math.abs(x) - 2,
            on = t > 0.9 + d * 0.25 && t < 5.2 + d * 0.12
          wm[x].color.setHex(on ? ((x + Math.floor(t * 4)) & 1 ? 0xff6fd8 : 0xd63f35) : 0xd9dde4)
        }
        ok(0, 4.1, 6.9, t, 6.2)
      },
    },
  }
}
