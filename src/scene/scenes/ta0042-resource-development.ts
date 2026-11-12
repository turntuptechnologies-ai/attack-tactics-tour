// TA0042 リソース開発（Resource Development）の場面。
import type { Kit } from '../kit'
import {
  progress,
  smooth,
  overshoot,
  keyframes,
  applyPose,
  stretchBetween,
  lerp,
  arcBetween,
} from '../motion'
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
    jumpMalware,
    pinkBeams,
    pinkCubes,
    TOWER_SPOT,
    scanPlane,
    showAlert,
    documents,
    database,
    secondAttacker,
    showCheck,
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
        // 借りたサーバー（塔）に続いて、偽ドメインの置き場（雲）も確保し、どちらも手もとから操れるようにする
        const hand = [ATTACKER_SPOT[0], 1.6, ATTACKER_SPOT[1]]
        const domain = [-0.6, 3.0, 12.4]
        if (t > 1.6 && t < 2.2) stretchBetween(pinkBeams[0], hand, [TOWER_SPOT[0], 2.6, TOWER_SPOT[1]], 0.08)
        popIn(cloud, domain[0], domain[1], domain[2], t, 2.0, 1.3)
        cloud.rotation.y = 0.6
        if (t > 2.6 && t < 3.2) stretchBetween(pinkBeams[1], hand, domain, 0.08)
        if (t > 3.1) {
          const cube = pinkCubes[0]
          const size = 0.4 * overshoot(progress(t, 3.1, 3.4))
          cube.visible = true
          cube.scale.set(size, size, size)
          cube.position.set(domain[0], domain[1] + 1.1 + Math.sin(t * 4) * 0.06, domain[2])
          cube.rotation.y = t * 2
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
        // 防御側は止められないが、置かれた偽サイトをネット上で探し当て、入口での検知に生かす
        if (t > 5.0 && t < 6.4) {
          scanPlane.visible = true
          scanPlane.rotation.y = Math.PI / 2
          scanPlane.scale.set(3.2, 2.8, 0.08)
          scanPlane.position.set(
            lerp(centre[0] - 2.4, centre[0] + 2.4, progress(t, 5.0, 6.4)),
            centre[1] + 0.6,
            centre[2],
          )
          scanPlane.material.opacity = 0.4
        }
        showAlert(0, centre[0], centre[1] + 2.6, centre[2], t, 6.0, 7)
      },
    },
    // T1585 Establish Accounts
    T1585: {
      hits: [2.8],
      run(t) {
        view.target = [0.6, 11.2]
        view.height = 12
        applyPose(attacker, standing(ATTACKER_SPOT[0], ATTACKER_SPOT[1], -1.2))
        applyPose(defender, standing(2, 5, 0.4))
        // 作り物の人物（アカウント）を次々に用意し、それぞれにもっともらしい経歴（書類）を持たせる
        const personas = [user, impostor]
        personas.forEach((figure, i) => {
          const start = 0.6 + i * 1.1
          const x = -0.4 - i * 1.7
          const z = 12.4 - i * 0.5
          const size = overshoot(progress(t, start, start + 0.35))
          figure.visible = size > 0.01
          applyPose(figure, standing(x, z, 0.6))
          figure.scale.multiplyScalar(size)
          if (t > start && t < start + 0.5)
            stretchBetween(pinkBeams[i], [ATTACKER_SPOT[0], 1.6, ATTACKER_SPOT[1]], [x, 1.0, z], 0.06)
          popIn(documents[i], x, 2.6 + Math.sin(view.time * 4 + i) * 0.06, z, t, start + 0.5, 0.8)
          documents[i].rotation.y = 0.6
        })
      },
    },
    // T1584 Compromise Infrastructure
    T1584: {
      hits: [2.8],
      run(t) {
        view.target = [0.2, 11.2]
        view.height = 12.5
        applyPose(attacker, standing(ATTACKER_SPOT[0], ATTACKER_SPOT[1], -1.2))
        applyPose(defender, standing(2, 5, 0.4))
        // よその人が運営しているサーバー。これを乗っ取って、自分の攻撃の拠点にする
        const server = [-1.6, 12.0]
        const owner = [server[0] - 1.7, server[1] + 0.4]
        database.visible = true
        database.scale.set(1, 1, 1)
        database.position.set(server[0], 0, server[1])
        database.rotation.y = 0.6
        user.visible = true
        applyPose(user, standing(owner[0], owner[1], 0.6))
        if (t > 0.8 && t < 2.4)
          stretchBetween(
            pinkBeams[0],
            [ATTACKER_SPOT[0], 1.6, ATTACKER_SPOT[1]],
            [server[0], 1.2, server[1]],
            0.08,
          )
        if (t > 2.3) {
          const flag = pinkCubes[0]
          const size = 0.45 * overshoot(progress(t, 2.3, 2.6))
          flag.visible = true
          flag.scale.set(size, size, size)
          flag.position.set(server[0], 2.2 + Math.sin(view.time * 4) * 0.06, server[1])
          flag.rotation.y = view.time * 2
        }
        // 持ち主は、自分のサーバーが使われていることに気づきにくい
        showAlert(0, owner[0], 2.4, owner[1], t, 5.0, 7)
      },
    },
    // T1650 Acquire Access
    T1650: {
      hits: [3.2],
      run(t) {
        view.target = [1.2, 10.4]
        view.height = 13
        applyPose(attacker, standing(ATTACKER_SPOT[0], ATTACKER_SPOT[1], -1.2))
        applyPose(defender, standing(2, 5, 0.4))
        // すでに中へ入れる鍵を持っている仲介者から、その入口を買い取る
        const broker = [-0.8, 12.2]
        const fee = pinkCubes[0]
        secondAttacker.visible = true
        applyPose(secondAttacker, standing(broker[0], broker[1], 1.2))
        key.visible = true
        key.scale.set(0.8, 0.8, 0.8)
        key.rotation.y = view.time * 2
        if (t < 2.2) key.position.set(broker[0], 2.9 + Math.sin(view.time * 4) * 0.06, broker[1])
        else arcBetween(key, [broker[0], 2.9, broker[1]], aboveAttacker(), smooth(progress(t, 2.2, 3.2)), 1.2)
        if (t > 0.8 && t < 2.0) {
          flyTo(
            fee,
            [ATTACKER_SPOT[0], 2.6, ATTACKER_SPOT[1]],
            [broker[0], 2.2, broker[1]],
            t,
            0.8,
            1.9,
            1.2,
            6,
          )
          fee.scale.set(0.34, 0.34, 0.34)
        }
        // 買った鍵は、そのまま門を開けられる
        if (t > 3.4 && t < 4.6) showCheck(0, 4.1, 6.9, t, 3.4)
      },
    },
  }
}
