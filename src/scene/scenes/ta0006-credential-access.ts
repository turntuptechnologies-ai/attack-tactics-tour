// TA0006 認証情報アクセス（Credential Access）の場面。
import type { Kit } from '../kit'
import { seg, sm, lerp, back, track, put, arc, beam } from '../motion'
import type { SceneMap } from './types'

export default function credentialAccess(kit: Kit): SceneMap {
  const {
    emps,
    key,
    bangs,
    links,
    beams,
    RZ,
    H,
    IC,
    imp,
    keys3,
    pk,
    plock,
    view,
    base,
    IH,
    fly,
    deny,
    ok,
    hop,
  } = kit
  return {
    // T1003 OS Credential Dumping（本編）
    T1003: {
      hits: [3.8],
      run(t) {
        view.camT = [0, 3.6]
        view.camS = 12.5
        base(8) // Credential Access
        ;[0, 1, 3].forEach((ei, j) => {
          const e = emps[ei].position,
            a = 0.5 + j * 0.4,
            b = 1.9 + j * 0.5,
            k = keys3[j]
          if (t < a) return
          k.visible = true
          k.rotation.set(0, t * 3 + j, 0)
          const s = 0.8 * back(seg(t, a, a + 0.3))
          k.scale.set(s, s, s)
          const ang = t * 2 + j * 2.09,
            o = [H[0] + Math.cos(ang) * 1.0, 2.3, H[1] + Math.sin(ang) * 1.0]
          if (t < b) k.position.set(e.x, 2.4 + Math.sin(t * 5 + j) * 0.08, e.z)
          else if (t < b + 0.9) arc(k, [e.x, 2.4, e.z], o, sm(seg(t, b, b + 0.9)), 1.5)
          else k.position.set(o[0], o[1], o[2])
        })
      },
    },
    // T1110 Brute Force
    T1110: {
      hits: [3.2],
      run(t) {
        view.camT = [1.0, 3.0]
        view.camS = 10
        base(8) // Brute Force
        const L = [-0.4, 1.5, 2.2]
        plock.visible = true
        plock.position.set(L[0], L[1], L[2])
        plock.rotation.y = 0.6
        keys3.forEach((k, j) => {
          const a = 0.6 + j * 0.9,
            p = seg(t, a, a + 0.7)
          if (t < a) return
          const s = 0.7 * (j < 2 ? 1 - seg(t, a + 0.7, a + 0.95) : 1 - seg(t, 5.0, 5.3))
          k.visible = s > 0.01
          k.scale.set(s, s, s)
          arc(k, IH(1.8), L, sm(p), 1.0)
          k.rotation.y = t * 6
        })
        if (t > 3.1 && t < 5.0) {
          ok(L[0], 2.8, L[2], t, 3.1)
          plock.position.y = L[1] + Math.abs(Math.sin((t - 3.1) * 8)) * 0.2 * (1 - seg(t, 3.1, 4))
        }
        deny(L[0], 2.8, L[2], t, 5.0)
      },
    },
    // T1056 Input Capture
    T1056: {
      hits: [3.4],
      run(t) {
        view.camT = [2.4, 3.6]
        view.camS = 9.5
        base(8) // Input Capture
        const d = [3.5, 1.0, 4.3]
        if (t < 4.6) emps[2].position.y = Math.abs(Math.sin(t * 14)) * 0.05
        for (let i = 0; i < 6; i++) {
          const m = pk[i],
            a = 0.5 + i * 0.4,
            p = seg(t, a, a + 0.9)
          if (p <= 0 || p >= 1) continue
          m.visible = true
          arc(m, d, IH(1.8), p, 0.9)
          m.scale.set(0.2, 0.2, 0.2)
        }
        if (t > 3.2) {
          const s = 0.8 * back(seg(t, 3.2, 3.5))
          key.visible = true
          key.scale.set(s, s, s)
          key.position.set(H[0], 3.0 + Math.sin(t * 5) * 0.08, H[1])
          key.rotation.y = t * 3
        }
      },
    },
    // T1621 Multi-Factor Authentication Request Generation
    T1621: {
      hits: [4.2],
      run(t) {
        view.camT = [3.6, 3.0]
        view.camS = 10
        base(8) // Multi-Factor Authentication Request Generation
        const e = emps[3].position
        for (let i = 0; i < 4; i++) {
          const a = 0.5 + i * 0.6
          if (t > a && t < a + 0.5) {
            const b = bangs[i]
            b.visible = true
            b.position.set(e.x + (i % 2 ? 0.35 : -0.35), 2.2 + 0.5 * back(seg(t, a, a + 0.25)), e.z)
          }
          if (t > a && t < a + 0.25) beam(links[i], IH(1.4), [e.x, 1.6, e.z], 0.05)
        }
        hop(emps[3], t, 2.9, 3.4, 0.15)
        if (t > 2.9 && t < 4.4) ok(e.x, 2.9, e.z, t, 2.9)
        if (t > 3.3) {
          fly(key, [e.x, 2.3, e.z], IH(3.0), t, 3.3, 4.2, 1.5, 6)
          key.scale.set(0.8, 0.8, 0.8)
          if (t >= 4.2) key.rotation.y = t * 3
          if (t > 5.4) key.visible = false
        }
        deny(e.x, 2.9, e.z, t, 5.4)
      },
    },
    // T1557 Adversary-in-the-Middle
    T1557: {
      hits: [2.9],
      run(t) {
        view.camT = [-1.5, 0.5]
        view.camS = 13
        base(8) // Adversary-in-the-Middle
        const a = [-3.5, 1.2, 2.0],
          b = [-3.6, 1.6, RZ + 0.6],
          m = [-3.55, 1.2, -1.2],
          mid = t >= 2.2
        put(
          imp,
          track(
            [
              [0, H[0], H[1]],
              [0.8, H[0], H[1]],
              [2.2, m[0], m[2]],
              [7, m[0], m[2]],
            ],
            t,
          ),
        )
        imp.scale.multiplyScalar(IC)
        if (mid) imp.rotation.y = 0.6
        if (!mid) beam(beams[0], a, b, 0.07)
        else {
          beam(links[0], a, m, 0.07)
          beam(links[1], m, b, 0.07)
        }
        for (let i = 0; i < 3; i++) {
          const ph = (t * 0.6 + i / 3) % 1,
            k = keys3[i]
          k.visible = true
          k.scale.set(0.35, 0.35, 0.35)
          k.rotation.y = t * 3
          k.position.set(lerp(a[0], b[0], ph), lerp(a[1], b[1], ph) + 0.35, lerp(a[2], b[2], ph))
        }
        if (t > 2.6) {
          const s = 0.8 * back(seg(t, 2.6, 2.9))
          key.visible = true
          key.scale.set(s, s, s)
          key.position.set(m[0], 3.2 + Math.sin(t * 5) * 0.08, m[2])
          key.rotation.y = t * 3
        }
      },
    },
  }
}
