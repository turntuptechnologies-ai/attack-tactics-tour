// TA0008 水平展開（Lateral Movement）の場面。
import type { Kit } from '../kit'
import { seg, sm, lerp, back, track, put, arc } from '../motion'
import type { SceneMap } from './types'

export default function lateralMovement(kit: Kit): SceneMap {
  const {
    emps,
    letters,
    key,
    grant,
    field,
    hammer,
    bots,
    arch,
    scan,
    RZ,
    racks,
    segMat,
    segW,
    H,
    S,
    IC,
    imp,
    pk,
    view,
    cp,
    base,
    IH,
    fly,
    deny,
    ok,
    alarm,
  } = kit
  return {
    // T1021 Remote Services（本編）
    T1021: {
      hits: [3.7],
      run(t) {
        view.camT = [-1, 0.6]
        view.camS = 14
        base(10) // Lateral Movement
        const r = track(
          [
            [0, H[0], H[1]],
            [0.4, H[0], H[1]],
            [1.4, -2.3, 2.6],
            [1.9, -2.3, 2.6],
            [3.6, S[0], S[1]],
            [7, S[0], S[1]],
          ],
          t,
        )
        put(imp, r)
        imp.scale.multiplyScalar(IC)
        if (t >= 3.6) imp.rotation.y = 0.6
        key.visible = true
        key.position.set(r.x, r.y + 2.3, r.z)
        key.rotation.y = t * 3
        key.scale.set(0.8, 0.8, 0.8)
        if (t > 1.7) cp(1, -2.3, 2.6, back(seg(t, 1.7, 2.0)))
        if (t > 2.0) {
          put(
            bots[2],
            track(
              [
                [2.0, -2.3, 2.6],
                [3.0, -4.8, 3.9],
                [7, -4.8, 3.9],
              ],
              t,
            ),
          )
          bots[2].visible = true
          if (t >= 3) bots[2].rotation.y = 0.6
        }
        if (t > 4.6) {
          segW.visible = true
          segW.position.y = lerp(-1.6, 1.5, back(seg(t, 4.6, 5.3)))
          if (t > 5.2) {
            put(
              bots[3],
              track(
                [
                  [5.2, -0.2, S[1]],
                  [5.9, 1.7, S[1]],
                  [6.2, 1.7, S[1]],
                  [6.6, 0.8, S[1]],
                  [7, 0.8, S[1]],
                ],
                t,
              ),
            )
            bots[3].visible = true
          }
          if (t > 5.9 && t < 6.3) segMat.color.setHex(Math.sin(t * 30) > 0 ? 0xffffff : 0x6f9dff)
        }
      },
    },
    // T1570 Lateral Tool Transfer
    T1570: {
      hits: [3.3],
      run(t) {
        view.camT = [-1, 2.6]
        view.camS = 12
        base(10) // Lateral Tool Transfer
        ;[
          [-2.3, 2.6],
          [-4.8, 3.9],
        ].forEach((q, j) => {
          const a = 0.6 + j * 1.3,
            m = pk[j],
            p = seg(t, a, a + 1),
            src = j ? [-2.3, 0.9, 2.6] : IH(1.2)
          if (t > a && p < 1) {
            m.visible = true
            m.scale.set(0.34, 0.34, 0.34)
            arc(m, src, [q[0], 0.6, q[1]], sm(p), 2.2)
            m.rotation.set(t * 5, t * 4, 0)
          }
          if (t >= a + 1) cp(1 + j, q[0], q[1], back(seg(t, a + 1, a + 1.3)))
        })
        if (t > 5.0) {
          field.visible = true
          field.rotation.y = Math.PI / 2
          field.scale.set(3.5, 2.2, 0.12)
          field.position.set(-0.4, 1.1, 3.0)
          field.material.opacity = 0.5 * sm(seg(t, 5.0, 5.5))
        }
      },
    },
    // T1534 Internal Spearphishing
    T1534: {
      hits: [3.4],
      run(t) {
        view.camT = [0, 3.2]
        view.camS = 12.5
        base(10) // Internal Spearphishing
        const to = [
          [-3.5, 1.9, 2.1],
          [-6, 1.9, 3.6],
        ]
        ;[1, 0].forEach((who, j) => {
          const a = 0.5 + j * 0.6,
            e = emps[who].position
          if (t < a) return
          if (t < a + 1.7) fly(letters[j], [3.5, 2.0, 3.6], to[j], t, a, a + 1.3, 3, 5)
          alarm(j, e.x, 2.2, e.z, t, a + 1.3, a + 2.3)
          if (t > a + 1.9) cp(1 + j, e.x + 0.95, e.z + 0.2, back(seg(t, a + 1.9, a + 2.2)))
        })
      },
    },
    // T1210 Exploitation of Remote Services
    T1210: {
      hits: [3.4],
      run(t) {
        view.camT = [-0.5, 1]
        view.camS = 13.5
        base(10) // Exploitation of Remote Services
        const h1 = [-2.3, 0.8, 2.6],
          h2 = [racks[2].x, 1.4, RZ + 0.7]
        const from = [IH(1.2), h1],
          dest = [h1, h2]
        ;[0.6, 2.3].forEach((t0, j) => {
          const p = seg(t, t0, t0 + 1.0),
            b = dest[j]
          if (p > 0 && p < 1) {
            hammer.visible = true
            arc(hammer, from[j], b, p, 2.0)
            hammer.rotation.z = t * 12
          }
          alarm(j, b[0], b[1] + 1.3, b[2], t, t0 + 1.0, t0 + 1.5)
        })
        if (t > 1.6) cp(1, -2.3, 2.6, back(seg(t, 1.6, 1.9)))
        if (t > 3.3 && t < 5.6) racks[2].lm.color.setHex(0xff6fd8)
        ok(racks[2].x, 3.9, RZ, t, 5.6)
      },
    },
    // T1550 Use Alternate Authentication Material
    T1550: {
      hits: [3.8],
      run(t) {
        view.camT = [-0.5, 0.6]
        view.camS = 13
        base(10) // Use Alternate Authentication Material
        arch.visible = true
        arch.position.set(S[0], 0, -0.9)
        arch.scale.set(0.6, 0.6, 0.6)
        scan.visible = true
        scan.position.set(S[0], 0.95, -0.9)
        scan.scale.set(2.2, 1.7, 0.08)
        scan.material.opacity = 0.3 + 0.15 * Math.sin(t * 8)
        const r = track(
          [
            [0, H[0], H[1]],
            [0.5, H[0], H[1]],
            [1.8, S[0], 0.4],
            [2.8, S[0], 0.4],
            [3.8, S[0], S[1]],
            [7, S[0], S[1]],
          ],
          t,
        )
        put(imp, r)
        imp.scale.multiplyScalar(IC)
        if (t >= 3.8) imp.rotation.y = 0.6
        grant.visible = true
        grant.position.set(r.x, r.y + 2.6, r.z)
        grant.rotation.y = t * 3
        if (t > 2.0 && t < 3.6) ok(S[0], 2.9, -0.9, t, 2.0)
        deny(S[0], 2.9, -0.9, t, 5.2)
      },
    },
  }
}
