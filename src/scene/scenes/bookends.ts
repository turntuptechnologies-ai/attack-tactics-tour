// 本編の最初（導入）と最後（まとめ）の場面。
import type { Kit } from '../kit'
import { applyPose, walk } from '../motion'
import type { SceneDef } from './types'

export function bookends(kit: Kit): { intro: SceneDef; outro: SceneDef } {
  const { attacker, defender, gateGuard, ATTACKER_SPOT, view, storyState, placeSensor } = kit
  return {
    intro: {
      hits: [],
      run(t) {
        view.target = [0, 6 - t * 0.1]
        view.height = 23 - t * 0.2
        applyPose(
          attacker,
          walk(
            [
              [0, 6, 17.5],
              [1, 6, 17.5],
              [3.5, ATTACKER_SPOT[0], ATTACKER_SPOT[1]],
              [5, ATTACKER_SPOT[0], ATTACKER_SPOT[1]],
            ],
            t,
          ),
        )
        applyPose(
          defender,
          walk(
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
        view.target = [0, 5.5]
        view.height = 22 + t * 0.25
        storyState(2)
        view.actor = attacker
        applyPose(
          defender,
          walk(
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
        gateGuard.visible = true
        placeSensor(0.5, 3.3 + Math.sin(view.time * 3) * 0.1, 3.5)
      },
    },
  }
}
