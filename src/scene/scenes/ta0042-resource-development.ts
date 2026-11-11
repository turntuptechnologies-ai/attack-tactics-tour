// TA0042 リソース開発（Resource Development）の場面。
import type { Kit } from '../kit'
import { seg, sm, back, path, put } from '../motion'
import type { SceneMap } from './types'

export default function resourceDevelopment(kit: Kit): SceneMap {
  const {
    atk,
    def,
    letter,
    key,
    user,
    fake,
    hammer,
    truckA,
    A,
    IS,
    tower,
    imp,
    cloud,
    view,
    idle,
    impAt,
    bob,
    TOP,
    fly,
    pop,
    deny,
    lands,
  } = kit
  return {
    // T1583 Acquire Infrastructure（本編）
    T1583: {
      hits: [3.5],
      run(t) {
        view.camT = [2.5, 10.2]
        view.camS = 12.5 // Resource Development
        put(atk, idle(A[0], A[1]))
        put(def, idle(2, 5, 0.4))
        tower.visible = t > 0.4
        tower.scale.y = Math.max(0.01, back(seg(t, 0.4, 1.6)))
        if (t > 2) {
          const k = back(seg(t, 2, 2.3))
          letter.visible = true
          letter.position.set(A[0], 2.7 + Math.sin(t * 4) * 0.08, A[1])
          letter.rotation.set(0, t * 3, 0)
          letter.scale.set(k, k, k)
        }
        if (t > 3.1) {
          impAt(0.2, bob(), 12.6, IS * back(seg(t, 3.1, 3.5)))
          imp.rotation.y = Math.PI
        }
      },
    },
    // T1588 Obtain Capabilities
    T1588: {
      hits: [2.8],
      run(t) {
        view.camT = [1.5, 11.4]
        view.camS = 12.5
        put(atk, idle(A[0], A[1]))
        put(def, idle(2, 5, 0.4)) // Obtain Capabilities
        const k = back(seg(t, 0, 0.3)) * (1 - sm(seg(t, 4.0, 4.5)))
        truckA.visible = k > 0.01
        truckA.scale.set(k, k, k)
        truckA.position.set(
          path(t, [
            [0, 5.5],
            [1.7, 0.6],
            [3.0, 0.6],
            [4.4, -5.5],
            [7, -5.5],
          ]),
          0,
          14.4,
        )
        truckA.rotation.y = Math.PI / 2
        if (t > 1.9) {
          lands(t, 1.9, 2.7, [0.6, 1.9, 14.4], [1.0, 0, 12.4], 0.8, IS)
          imp.rotation.y = Math.PI
        }
      },
    },
    // T1586 Compromise Accounts
    T1586: {
      hits: [2.7],
      run(t) {
        view.camT = [1.2, 10.8]
        view.camS = 12.5
        put(atk, idle(A[0], A[1], -1.2))
        put(def, idle(2, 5, 0.4)) // Compromise Accounts
        const ux = -0.8,
          uz = 12.2,
          o = t >= 2.6 ? fake : user
        o.visible = true
        put(o, idle(ux, uz, 0.6))
        o.position.y = Math.sin(Math.PI * seg(t, 2.6, 3.1)) * 0.5
        fly(key, TOP(), [ux, 2.7, uz], t, 1.0, 2.4, 1.5, 6)
        key.scale.set(0.8, 0.8, 0.8)
        if (t >= 2.4) key.rotation.y = t * 3
      },
    },
    // T1587 Develop Capabilities
    T1587: {
      hits: [3.5],
      run(t) {
        view.camT = [2, 11.2]
        view.camS = 11
        put(atk, idle(A[0], A[1], -1.2))
        put(def, idle(2, 5, 0.4)) // Develop Capabilities
        const n = Math.min(4, Math.floor(seg(t, 0.6, 3.4) * 4.001))
        if (t > 0.4 && t < 3.6) {
          hammer.visible = true
          hammer.position.set(1.7, 0.9, 12.5)
          hammer.rotation.z = 0.3 + Math.abs(Math.cos(((t - 0.6) * Math.PI) / 0.7)) * 1.0
        }
        impAt(0.6, n >= 4 ? bob() : 0, 12.4, n ? IS * (0.25 + (0.75 * n) / 4) : 0)
      },
    },
    // T1608 Stage Capabilities
    T1608: {
      hits: [2.7],
      run(t) {
        view.camT = [0.5, 11]
        view.camS = 13
        put(atk, idle(A[0], A[1], -1.2))
        put(def, idle(2, 5, 0.4)) // Stage Capabilities
        const C = [-2.5, 3.2, 12]
        pop(cloud, C[0], C[1], C[2], t, 0.2, 1.5)
        cloud.rotation.y = 0.6
        if (t < 1.4) impAt(1.0, bob(), 12.4, IS)
        else lands(t, 1.4, 2.6, [1.0, 0, 12.4], [C[0], C[1] + 0.6, C[2]], 2.5, IS)
        pop(letter, C[0] + 1.3, C[1] + 1.0, C[2], t, 2.9)
        deny(C[0], C[1] + 3.0, C[2], t, 5.4)
      },
    },
  }
}
