// TA0042 リソース開発（Resource Development）の場面。
import type { Kit } from '../kit'
import { progress, smooth, overshoot, keyframes, applyPose } from '../motion'
import type { SceneMap } from './types'

export default function resourceDevelopment(kit: Kit): SceneMap {
  const {
    attacker,
    defender,
    mail,
    key,
    user,
    impostor,
    hammer,
    truckA,
    ATTACKER_SPOT,
    MALWARE_SIZE,
    c2Tower,
    malware,
    cloud,
    view,
    standing,
    placeMalware,
    bobHeight,
    aboveAttacker,
    flyTo,
    popIn,
    showCross,
    jumpMalware,
  } = kit
  return {
    // T1583 Acquire Infrastructure（本編）
    T1583: {
      hits: [3.5],
      run(t) {
        view.target = [2.5, 10.2]
        view.height = 12.5 // Resource Development
        applyPose(attacker, standing(ATTACKER_SPOT[0], ATTACKER_SPOT[1]))
        applyPose(defender, standing(2, 5, 0.4))
        c2Tower.visible = t > 0.4
        c2Tower.scale.y = Math.max(0.01, overshoot(progress(t, 0.4, 1.6)))
        if (t > 2) {
          const scale = overshoot(progress(t, 2, 2.3))
          mail.visible = true
          mail.position.set(ATTACKER_SPOT[0], 2.7 + Math.sin(t * 4) * 0.08, ATTACKER_SPOT[1])
          mail.rotation.set(0, t * 3, 0)
          mail.scale.set(scale, scale, scale)
        }
        if (t > 3.1) {
          placeMalware(0.2, bobHeight(), 12.6, MALWARE_SIZE * overshoot(progress(t, 3.1, 3.5)))
          malware.rotation.y = Math.PI
        }
      },
    },
    // T1588 Obtain Capabilities
    T1588: {
      hits: [2.8],
      run(t) {
        view.target = [1.5, 11.4]
        view.height = 12.5
        applyPose(attacker, standing(ATTACKER_SPOT[0], ATTACKER_SPOT[1]))
        applyPose(defender, standing(2, 5, 0.4)) // Obtain Capabilities
        const scale = overshoot(progress(t, 0, 0.3)) * (1 - smooth(progress(t, 4.0, 4.5)))
        truckA.visible = scale > 0.01
        truckA.scale.set(scale, scale, scale)
        truckA.position.set(
          keyframes(t, [
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
          jumpMalware(t, 1.9, 2.7, [0.6, 1.9, 14.4], [1.0, 0, 12.4], 0.8, MALWARE_SIZE)
          malware.rotation.y = Math.PI
        }
      },
    },
    // T1586 Compromise Accounts
    T1586: {
      hits: [2.7],
      run(t) {
        view.target = [1.2, 10.8]
        view.height = 12.5
        applyPose(attacker, standing(ATTACKER_SPOT[0], ATTACKER_SPOT[1], -1.2))
        applyPose(defender, standing(2, 5, 0.4)) // Compromise Accounts
        const ux = -0.8,
          uz = 12.2,
          figure = t >= 2.6 ? impostor : user
        figure.visible = true
        applyPose(figure, standing(ux, uz, 0.6))
        figure.position.y = Math.sin(Math.PI * progress(t, 2.6, 3.1)) * 0.5
        flyTo(key, aboveAttacker(), [ux, 2.7, uz], t, 1.0, 2.4, 1.5, 6)
        key.scale.set(0.8, 0.8, 0.8)
        if (t >= 2.4) key.rotation.y = t * 3
      },
    },
    // T1587 Develop Capabilities
    T1587: {
      hits: [3.5],
      run(t) {
        view.target = [2, 11.2]
        view.height = 11
        applyPose(attacker, standing(ATTACKER_SPOT[0], ATTACKER_SPOT[1], -1.2))
        applyPose(defender, standing(2, 5, 0.4)) // Develop Capabilities
        const n = Math.min(4, Math.floor(progress(t, 0.6, 3.4) * 4.001))
        if (t > 0.4 && t < 3.6) {
          hammer.visible = true
          hammer.position.set(1.7, 0.9, 12.5)
          hammer.rotation.z = 0.3 + Math.abs(Math.cos(((t - 0.6) * Math.PI) / 0.7)) * 1.0
        }
        placeMalware(0.6, n >= 4 ? bobHeight() : 0, 12.4, n ? MALWARE_SIZE * (0.25 + (0.75 * n) / 4) : 0)
      },
    },
    // T1608 Stage Capabilities
    T1608: {
      hits: [2.7],
      run(t) {
        view.target = [0.5, 11]
        view.height = 13
        applyPose(attacker, standing(ATTACKER_SPOT[0], ATTACKER_SPOT[1], -1.2))
        applyPose(defender, standing(2, 5, 0.4)) // Stage Capabilities
        const centre = [-2.5, 3.2, 12]
        popIn(cloud, centre[0], centre[1], centre[2], t, 0.2, 1.5)
        cloud.rotation.y = 0.6
        if (t < 1.4) placeMalware(1.0, bobHeight(), 12.4, MALWARE_SIZE)
        else
          jumpMalware(t, 1.4, 2.6, [1.0, 0, 12.4], [centre[0], centre[1] + 0.6, centre[2]], 2.5, MALWARE_SIZE)
        popIn(mail, centre[0] + 1.3, centre[1] + 1.0, centre[2], t, 2.9)
        showCross(centre[0], centre[1] + 3.0, centre[2], t, 5.4)
      },
    },
  }
}
