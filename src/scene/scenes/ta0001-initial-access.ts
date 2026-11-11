// TA0001 初期アクセス（Initial Access）の場面。
import type { Kit } from '../kit'
import { seg, sm, lerp, back, bounce, track, put, arc, beam } from '../motion'
import type { SceneMap } from './types'

export default function initialAccess(kit: Kit): SceneMap {
  const {
    wm,
    atk,
    clone,
    emps,
    mfa,
    letters,
    letter,
    key,
    bang,
    field,
    hammer,
    links,
    cross,
    bots,
    truckB,
    arch,
    scan,
    A,
    H,
    IS,
    imp,
    pk,
    exps,
    cloud,
    view,
    gate,
    impAt,
    bob,
    base,
    TOP,
    IH,
    fly,
    deny,
    ok,
    lands,
  } = kit
  return {
    // T1566 Phishing（本編）
    T1566: {
      hits: [3.3],
      run(t) {
        view.camT = [3, 8.4]
        view.camS = 14
        base(2) // Initial Access
        const from = [A[0], 2.7, A[1]],
          to = [3.5, 1.7, 3.6],
          to2 = [6, 1.7, 2.2]
        letter.scale.set(1, 1, 1)
        if (t < 0.7) {
          impAt(0.2, 0, 12.6, IS * (1 - sm(seg(t, 0.2, 0.7))))
          imp.rotation.y = Math.PI
          letter.visible = true
          letter.position.set(from[0], from[1], from[2])
        } else if (t < 2.1) {
          letter.visible = true
          arc(letter, from, to, seg(t, 0.7, 2.1), 3.2)
          letter.rotation.set(0, t * 5, 0)
        }
        if (t > 2.1 && t < 3.3) {
          bang.visible = true
          bang.position.set(3.5, 2.1 + Math.abs(Math.sin(t * 9)) * 0.2, 3.5)
          emps[2].position.y = Math.abs(Math.sin(t * 9)) * 0.15
        }
        if (t > 2.9) {
          impAt(H[0], bob(), H[1], IS * back(seg(t, 2.9, 3.3)))
          imp.rotation.y = 0.6
          view.actor = imp
        }
        if (t > 4.6) {
          mfa.visible = true
          mfa.position.y = 3.2 + (1 - bounce(seg(t, 4.6, 5.3))) * 6
          const p = seg(t, 5, 5.9),
            l = letters[1],
            q = seg(t, 5.45, 6.2)
          if (p > 0 && q < 1) {
            l.visible = true
            if (p < 0.5) arc(l, from, to2, p, 2.4)
            else l.position.set(4.35, 4.6 - 4.2 * q * q, 7.55 + q * 1.2)
            l.rotation.set(0, t * 5, q * 3)
          }
          if (t > 5.3 && t < 6.2) {
            field.visible = true
            field.position.set(4.35, 4.5, 7.1)
            field.material.opacity = 0.6 * Math.sin(Math.PI * seg(t, 5.3, 6.2))
          }
          if (t > 5.45) {
            cross.visible = true
            cross.position.set(4.35, 5.5 + Math.sin(t * 6) * 0.08, 7.7)
            const k = back(seg(t, 5.45, 5.75))
            cross.scale.set(k, k, k)
          }
        }
      },
    },
    // T1190 Exploit Public-Facing Application
    T1190: {
      hits: [3.4],
      run(t) {
        view.camT = [3, 8]
        view.camS = 13
        base(2) // Exploit Public-Facing Application
        put(
          atk,
          track(
            [
              [0, A[0], A[1]],
              [0.3, A[0], A[1]],
              [1.5, 4.6, 8.4],
              [7, 4.6, 8.4],
            ],
            t,
          ),
        )
        const e = exps[2]
        e.visible = t < 5.4
        e.material.color.setHex(0xf6c531)
        e.scale.set(0.5, 0.5, 0.5)
        e.position.y = 2.5 + Math.sin(view.T * 4) * 0.06
        e.rotation.y = view.T
        if (t > 1.6 && t < 2.7) {
          hammer.visible = true
          hammer.position.set(4.2, 0.9, 7.9)
          hammer.rotation.x = -0.2 - Math.abs(Math.sin((t - 1.6) * 9)) * 1.1
        }
        if (t > 2.0 && t < 5.4) wm[4].color.setHex(t > 2.6 || Math.sin(t * 30) > 0 ? 0xff6a5e : 0xd9dde4)
        if (t > 2.6) {
          lands(t, 2.6, 3.4, [4, 0.2, 7.6], [4, 0, 4.6], 2.6, IS)
          imp.rotation.y = t < 3.4 ? Math.PI : 0.6
          view.actor = imp
        }
        ok(4, 3.3, 6.9, t, 5.4)
      },
    },
    // T1078 Valid Accounts
    T1078: {
      hits: [3.5],
      run(t) {
        view.camT = [1.5, 8.2]
        view.camS = 13
        base(2) // Valid Accounts
        const r = track(
          [
            [0, A[0], A[1]],
            [0.4, A[0], A[1]],
            [1.6, 0, 8.8],
            [2.6, 0, 8.8],
            [3.6, 0, 4.6],
            [7, 0, 4.6],
          ],
          t,
        )
        put(atk, r)
        key.visible = true
        key.position.set(r.x, r.y + 2.9, r.z)
        key.rotation.y = t * 3
        key.scale.set(0.8, 0.8, 0.8)
        gate(seg(t, 2.0, 2.5) - seg(t, 4.6, 5.0))
        if (t < 4.4) ok(0, 4.1, 6.9, t, 1.9)
        if (t > 4.6) {
          mfa.visible = true
          mfa.position.y = 3.2 + (1 - bounce(seg(t, 4.6, 5.3))) * 6
          clone.visible = true
          put(
            clone,
            track(
              [
                [4.6, 6.5, 12.5],
                [5.6, 0.6, 8.8],
                [7, 0.6, 8.8],
              ],
              t,
            ),
          )
          deny(0.6, 3.5, 8.8, t, 5.7)
        }
      },
    },
    // T1195 Supply Chain Compromise
    T1195: {
      hits: [4.3],
      run(t) {
        view.camT = [1.5, 8.6]
        view.camS = 14
        base(2) // Supply Chain Compromise
        const k = back(seg(t, 0, 0.3)),
          x = lerp(9, 0, sm(seg(t, 0.2, 1.8))),
          z = lerp(10.2, 4.4, sm(seg(t, 2.3, 3.4)))
        truckB.visible = true
        truckB.scale.set(k, k, k)
        truckB.position.set(x, 0, z)
        truckB.rotation.y = lerp(Math.PI / 2, 0, sm(seg(t, 1.8, 2.3)))
        gate(seg(t, 2.0, 2.4) - seg(t, 3.6, 4.0))
        if (t < 3.4) ok(0, 4.1, 6.9, t, 2.0)
        if (t < 3.6) impAt(x, 1.9, z, 0.7 * back(seg(t, 0.6, 0.9)))
        else {
          lands(t, 3.6, 4.3, [0, 1.9, 4.4], IH(0), 1.0, lerp(0.7, IS, seg(t, 3.6, 3.9)))
          view.actor = imp
        }
      },
    },
    // T1189 Drive-by Compromise
    T1189: {
      hits: [3.5],
      run(t) {
        view.camT = [-0.5, 7]
        view.camS = 15
        base(2) // Drive-by Compromise
        const C = [-4, 4.4, 10.5],
          e = emps[1].position,
          m = pk[0]
        cloud.visible = true
        cloud.scale.set(1.5, 1.5, 1.5)
        cloud.position.set(C[0], C[1] + Math.sin(view.T * 2) * 0.12, C[2])
        cloud.rotation.y = 0.6
        fly(m, TOP(), [C[0], C[1] + 1.1, C[2]], t, 0.4, 1.3, 2, 6)
        m.scale.set(0.4, 0.4, 0.4)
        if (t > 1.8 && t < 2.8) beam(links[0], [e.x, 1.4, e.z], C, 0.07)
        if (t > 2.6) {
          lands(t, 2.6, 3.5, C, [e.x + 0.95, 0, e.z + 0.2], 1.0, IS)
          view.actor = imp
        }
        deny(C[0], C[1] + 2.8, C[2], t, 5.2)
      },
    },
    // T1133 External Remote Services
    T1133: {
      hits: [3.1],
      run(t) {
        view.camT = [3.5, 7.5]
        view.camS = 13
        base(2) // External Remote Services
        arch.visible = true
        arch.position.set(6.5, 0, 7.3)
        arch.scale.set(0.55, 0.55, 0.55)
        scan.visible = true
        scan.position.set(6.5, 0.85, 7.3)
        scan.scale.set(2.0, 1.6, 0.08)
        scan.material.opacity = 0.3 + 0.15 * Math.sin(t * 8)
        const r = track(
          [
            [0, A[0], A[1]],
            [0.3, A[0], A[1]],
            [1.5, 6.5, 9.2],
            [7, 6.5, 9.2],
          ],
          t,
        )
        put(atk, r)
        key.visible = t < 4.6
        key.position.set(r.x, r.y + 2.9, r.z)
        key.rotation.y = t * 3
        key.scale.set(0.8, 0.8, 0.8)
        if (t < 4.4) ok(6.5, 2.7, 7.3, t, 1.9)
        if (t > 2.3 && t < 4.6) beam(links[0], [6.5, 0.9, 7.3], [6.95, 0.6, 2.2], 0.08)
        if (t > 2.8) {
          const b = bots[4],
            s = 1.3 * back(seg(t, 2.8, 3.1)) * (1 - sm(seg(t, 5.6, 6.0)))
          b.visible = s > 0.01
          b.scale.set(s, s, s)
          b.position.set(6.95, bob(), 2.2)
          b.rotation.y = 0.6
        }
        if (t > 4.8) {
          mfa.visible = true
          mfa.position.set(6.5, 2.5 + (1 - bounce(seg(t, 4.8, 5.5))) * 6, 7.6)
        }
        deny(6.5, 4.2, 7.6, t, 5.6)
      },
    },
  }
}
