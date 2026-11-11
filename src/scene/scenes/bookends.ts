// 本編の最初（導入）と最後（まとめ）の場面。
import type { Kit } from '../kit'
import { put, track } from '../motion'
import type { SceneDef } from './types'

export function bookends(kit: Kit): { intro: SceneDef; outro: SceneDef } {
  const { atk, def, mfa, A, view, base, sensor } = kit
  return {
    intro: {
      hits: [],
      run(t) {
        view.camT = [0, 6 - t * 0.1]
        view.camS = 23 - t * 0.2
        put(
          atk,
          track(
            [
              [0, 6, 17.5],
              [1, 6, 17.5],
              [3.5, A[0], A[1]],
              [5, A[0], A[1]],
            ],
            t,
          ),
        )
        put(
          def,
          track(
            [
              [0, -3, 4.6],
              [1.5, -3, 4.6],
              [4, 2, 4.6],
              [5, 2, 4.6],
            ],
            t,
            0,
          ),
        )
      },
    },
    outro: {
      hits: [],
      run(t) {
        view.camT = [0, 5.5]
        view.camS = 22 + t * 0.25
        base(2)
        view.actor = atk
        put(
          def,
          track(
            [
              [0, -3, 4.6],
              [1, -3, 4.6],
              [3.5, 3, 4.6],
              [7, 3, 4.6],
            ],
            t,
            0,
          ),
        )
        mfa.visible = true
        sensor(0.5, 3.3 + Math.sin(view.T * 3) * 0.1, 3.5)
      },
    },
  }
}
