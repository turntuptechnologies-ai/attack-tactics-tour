// TA0011 コマンド＆コントロール（Command and Control）の場面。
import type { Kit } from '../kit'
import { seg, sm, lerp, back, arc, beam } from '../motion'
import type { SceneMap } from './types'

export default function commandAndControl(kit: Kit): SceneMap {
  const {
    atk,
    emps,
    letters,
    field,
    orb,
    links,
    bots,
    beams,
    botB,
    racks,
    A,
    TWP,
    S,
    imp,
    pk,
    c2,
    cloud,
    view,
    bob,
    base,
    c2beam,
    deny,
    ORB,
  } = kit
  return {
    // T1071 Application Layer Protocol（本編）
    T1071: {
      hits: [1.5],
      run(t) {
        view.camT = [1.5, 4.5]
        view.camS = 21
        base(12) // Command and Control
        const e = c2beam(t)
        view.actor = atk
        orb.visible = true
        orb.position.set(A[0], 2.9 + Math.sin(t * 5) * 0.1, A[1])
        orb.rotation.set(t * 2, t * 3, 0)
        for (let i = 0; i < 4; i++) {
          const ph = (t * 0.6 + i * 0.25) % 1,
            m = pk[i]
          m.visible = true
          m.scale.set(0.3, 0.3, 0.3)
          m.position.set(lerp(e[0][0], e[1][0], ph), lerp(e[0][1], e[1][1], ph), lerp(e[0][2], e[1][2], ph))
        }
      },
    },
    // T1090 Proxy
    T1090: {
      hits: [2.8],
      run(t) {
        view.camT = [-1.5, 5]
        view.camS = 22
        base(12)
        view.actor = atk // Proxy
        const N = [
            [TWP[0], 2.9, TWP[1]],
            [-4, 0.7, 13.6],
            [-8.6, 0.7, 9.6],
            [S[0], 0.7, S[1]],
          ],
          on = seg(t, 0.4, 1.6) * 3,
          cut = t > 5.2
        ;[c2, links[0], links[1]].forEach((m, j) => {
          if (on > j && !(cut && j === 2)) {
            beam(m, N[j], N[j + 1], 0.1)
            m.material.opacity = 0.45 + 0.25 * Math.sin(t * 8)
          }
        })
        ;[botB, bots[5]].forEach((b, j) => {
          const s = 1.3 * back(seg(t, 0.2 + j * 0.3, 0.5 + j * 0.3))
          b.visible = s > 0.01
          b.scale.set(s, s, s)
          b.position.set(N[j + 1][0], bob(), N[j + 1][2])
          b.rotation.y = 0.6
        })
        if (t > 1.6)
          for (let i = 0; i < 4; i++) {
            const ph = (((t - 1.6) * 0.3 + i * 0.25) % 1) * 3,
              j = Math.min(2, Math.floor(ph)),
              q = ph - j,
              m = pk[i]
            if (cut && j === 2) continue
            m.visible = true
            m.scale.set(0.3, 0.3, 0.3)
            m.position.set(
              lerp(N[j][0], N[j + 1][0], q),
              lerp(N[j][1], N[j + 1][1], q),
              lerp(N[j][2], N[j + 1][2], q),
            )
          }
        orb.visible = true
        orb.position.set(A[0], 2.9 + Math.sin(t * 5) * 0.1, A[1])
        orb.rotation.set(t * 2, t * 3, 0)
        deny(-8.6, 2.6, 9.6, t, 5.2)
      },
    },
    // T1573 Encrypted Channel
    T1573: {
      hits: [2],
      run(t) {
        view.camT = [1.5, 4.5]
        view.camS = 21
        base(12)
        const e = c2beam(t)
        view.actor = atk
        ORB(t) // Encrypted Channel
        racks.slice(0, 4).forEach((r, i) => {
          const ph = (t * 0.45 + i / 4) % 1,
            l = r.lock,
            s = 0.95 * seg(t, 0.3, 0.8)
          l.visible = s > 0.01
          l.scale.set(s, s, s)
          l.rotation.y = 0.6
          l.position.set(
            lerp(e[0][0], e[1][0], ph),
            lerp(e[0][1], e[1][1], ph) + 0.45,
            lerp(e[0][2], e[1][2], ph),
          )
        })
      },
    },
    // T1102 Web Service
    T1102: {
      hits: [3.1],
      run(t) {
        view.camT = [-0.5, 5]
        view.camS = 22
        base(12)
        view.actor = atk
        ORB(t) // Web Service
        const C = [-6, 5.2, 9.5],
          k = 1.7 * back(seg(t, 0.2, 0.6)),
          a = [TWP[0], 2.9, TWP[1]],
          b = [S[0], 1.4, S[1]]
        cloud.visible = k > 0.01
        cloud.scale.set(k, k, k)
        cloud.position.set(C[0], C[1] - 0.4 + Math.sin(view.T * 2) * 0.1, C[2])
        cloud.rotation.y = 0.6
        if (t > 0.6 && t < 5.2)
          emps.forEach((g, i) => {
            if ((t * 1.2 + i * 0.6) % 2 < 1.2)
              beam(beams[i], [g.position.x, 1.2, g.position.z + 0.9], C, 0.05)
          }) // everyone uses the same service
        for (let i = 0; i < 2; i++) {
          const a0 = 1.0 + i * 1.6,
            l = letters[i],
            p1 = seg(t, a0, a0 + 0.9),
            p2 = seg(t, a0 + 1.1, a0 + 2.0)
          if (t < a0 || p2 >= 1) continue
          l.visible = true
          if (p2 <= 0) arc(l, a, [C[0], C[1] + 0.9, C[2]], sm(p1), 2.5)
          else arc(l, [C[0], C[1] + 0.9, C[2]], b, sm(p2), 2.5)
          l.rotation.y = t * 4
        }
        if (t > 3.0 && t < 4.6) imp.position.y = Math.abs(Math.sin((t - 3.0) * 6)) * 0.4
        deny(C[0], C[1] + 2.8, C[2], t, 5.4)
      },
    },
    // T1572 Protocol Tunneling
    T1572: {
      hits: [2.4],
      run(t) {
        view.camT = [1.5, 4.5]
        view.camS = 21
        base(12)
        view.actor = atk
        ORB(t) // Protocol Tunneling
        const a = [TWP[0], 2.9, TWP[1]],
          b = [S[0], 0.7, S[1]],
          g = Math.max(0.02, seg(t, 0.4, 1.4))
        beam(field, a, [lerp(a[0], b[0], g), lerp(a[1], b[1], g), lerp(a[2], b[2], g)], 0.7)
        field.material.opacity = 0.35
        if (t > 1.4)
          for (let i = 0; i < 4; i++) {
            const ph = ((t - 1.4) * 0.5 + i * 0.25) % 1,
              m = pk[i]
            m.visible = true
            m.scale.set(0.28, 0.28, 0.28)
            m.position.set(lerp(a[0], b[0], ph), lerp(a[1], b[1], ph), lerp(a[2], b[2], ph))
          }
      },
    },
  }
}
