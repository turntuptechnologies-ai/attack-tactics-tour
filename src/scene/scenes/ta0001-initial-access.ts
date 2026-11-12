// TA0001 初期アクセス（Initial Access）の場面。
import type { Kit } from '../kit'
import {
  progress,
  smooth,
  lerp,
  overshoot,
  bounce,
  walk,
  applyPose,
  arcBetween,
  stretchBetween,
} from '../motion'
import type { SceneMap } from './types'

export default function initialAccess(kit: Kit): SceneMap {
  const {
    wallMaterials,
    attacker,
    secondAttacker,
    employees,
    gateGuard,
    mails,
    mail,
    key,
    alertMark,
    glass,
    hammer,
    pinkBeams,
    crossMark,
    bots,
    truckB,
    checkpoint,
    scanPlane,
    ATTACKER_SPOT,
    HOST_SPOT,
    MALWARE_SIZE,
    malware,
    pinkCubes,
    yellowCubes,
    cloud,
    view,
    openGate,
    placeMalware,
    bobHeight,
    storyState,
    aboveAttacker,
    aboveHost,
    flyTo,
    showCross,
    showCheck,
    jumpMalware,
    user,
    token,
    showAlert,
  } = kit
  return {
    // T1566 Phishing（本編）
    T1566: {
      hits: [3.3],
      run(t) {
        view.target = [3, 8.4]
        view.height = 14
        storyState(2) // Initial Access
        const from = [ATTACKER_SPOT[0], 2.7, ATTACKER_SPOT[1]],
          to = [3.5, 1.7, 3.6],
          to2 = [6, 1.7, 2.2]
        mail.scale.set(1, 1, 1)
        if (t < 0.7) {
          const size = overshoot(progress(t, 0, 0.3))
          mail.visible = true
          mail.scale.set(size, size, size)
          mail.position.set(from[0], from[1], from[2])
        } else if (t < 2.1) {
          mail.visible = true
          arcBetween(mail, from, to, progress(t, 0.7, 2.1), 3.2)
          mail.rotation.set(0, t * 5, 0)
        }
        if (t > 2.1 && t < 3.3) {
          alertMark.visible = true
          alertMark.position.set(3.5, 2.1 + Math.abs(Math.sin(t * 9)) * 0.2, 3.5)
          employees[2].position.y = Math.abs(Math.sin(t * 9)) * 0.15
        }
        if (t > 2.9) {
          placeMalware(
            HOST_SPOT[0],
            bobHeight(),
            HOST_SPOT[1],
            MALWARE_SIZE * overshoot(progress(t, 2.9, 3.3)),
          )
          malware.rotation.y = 0.6
          view.actor = malware
        }
        if (t > 4.6) {
          gateGuard.visible = true
          gateGuard.position.y = 3.2 + (1 - bounce(progress(t, 4.6, 5.3))) * 6
          const p = progress(t, 5, 5.9),
            mailItem = mails[1],
            q = progress(t, 5.45, 6.2)
          if (p > 0 && q < 1) {
            mailItem.visible = true
            if (p < 0.5) arcBetween(mailItem, from, to2, p, 2.4)
            else mailItem.position.set(4.35, 4.6 - 4.2 * q * q, 7.55 + q * 1.2)
            mailItem.rotation.set(0, t * 5, q * 3)
          }
          if (t > 5.3 && t < 6.2) {
            glass.visible = true
            glass.position.set(4.35, 4.5, 7.1)
            glass.material.opacity = 0.6 * Math.sin(Math.PI * progress(t, 5.3, 6.2))
          }
          if (t > 5.45) {
            crossMark.visible = true
            crossMark.position.set(4.35, 5.5 + Math.sin(t * 6) * 0.08, 7.7)
            const scale = overshoot(progress(t, 5.45, 5.75))
            crossMark.scale.set(scale, scale, scale)
          }
        }
      },
    },
    // T1190 Exploit Public-Facing Application
    T1190: {
      hits: [3.4],
      run(t) {
        view.target = [3, 8]
        view.height = 13
        storyState(2) // Exploit Public-Facing Application
        applyPose(
          attacker,
          walk(
            [
              [0, ATTACKER_SPOT[0], ATTACKER_SPOT[1]],
              [0.3, ATTACKER_SPOT[0], ATTACKER_SPOT[1]],
              [1.5, 4.6, 8.4],
              [7, 4.6, 8.4],
            ],
            t,
          ),
        )
        const cube = yellowCubes[2]
        cube.visible = t < 5.4
        cube.material.color.setHex(0xf6c531)
        cube.scale.set(0.5, 0.5, 0.5)
        cube.position.y = 2.5 + Math.sin(view.time * 4) * 0.06
        cube.rotation.y = view.time
        if (t > 1.6 && t < 2.7) {
          hammer.visible = true
          hammer.position.set(4.2, 0.9, 7.9)
          hammer.rotation.x = -0.2 - Math.abs(Math.sin((t - 1.6) * 9)) * 1.1
        }
        if (t > 2.0 && t < 5.4)
          wallMaterials[4].color.setHex(t > 2.6 || Math.sin(t * 30) > 0 ? 0xff6a5e : 0xd9dde4)
        if (t > 2.6) {
          jumpMalware(t, 2.6, 3.4, [4, 0.2, 7.6], [4, 0, 4.6], 2.6, MALWARE_SIZE)
          malware.rotation.y = t < 3.4 ? Math.PI : 0.6
          view.actor = malware
        }
        showCheck(4, 3.3, 6.9, t, 5.4)
      },
    },
    // T1078 Valid Accounts
    T1078: {
      hits: [3.5],
      run(t) {
        view.target = [1.5, 8.2]
        view.height = 13
        storyState(2) // Valid Accounts
        const pose = walk(
          [
            [0, ATTACKER_SPOT[0], ATTACKER_SPOT[1]],
            [0.4, ATTACKER_SPOT[0], ATTACKER_SPOT[1]],
            [1.6, 0, 8.8],
            [2.6, 0, 8.8],
            [3.6, 0, 4.6],
            [7, 0, 4.6],
          ],
          t,
        )
        applyPose(attacker, pose)
        key.visible = true
        key.position.set(pose.x, pose.y + 2.9, pose.z)
        key.rotation.y = t * 3
        key.scale.set(0.8, 0.8, 0.8)
        openGate(progress(t, 2.0, 2.5) - progress(t, 4.6, 5.0))
        if (t < 4.4) showCheck(0, 4.1, 6.9, t, 1.9)
        if (t > 4.6) {
          gateGuard.visible = true
          gateGuard.position.y = 3.2 + (1 - bounce(progress(t, 4.6, 5.3))) * 6
          secondAttacker.visible = true
          applyPose(
            secondAttacker,
            walk(
              [
                [4.6, 6.5, 12.5],
                [5.6, 0.6, 8.8],
                [7, 0.6, 8.8],
              ],
              t,
            ),
          )
          showCross(0.6, 3.5, 8.8, t, 5.7)
        }
      },
    },
    // T1195 Supply Chain Compromise
    T1195: {
      hits: [4.3],
      run(t) {
        view.target = [1.5, 8.6]
        view.height = 14
        storyState(2) // Supply Chain Compromise
        const scale = overshoot(progress(t, 0, 0.3)),
          x = lerp(9, 0, smooth(progress(t, 0.2, 1.8))),
          z = lerp(10.2, 4.4, smooth(progress(t, 2.3, 3.4)))
        truckB.visible = true
        truckB.scale.set(scale, scale, scale)
        truckB.position.set(x, 0, z)
        truckB.rotation.y = lerp(Math.PI / 2, 0, smooth(progress(t, 1.8, 2.3)))
        openGate(progress(t, 2.0, 2.4) - progress(t, 3.6, 4.0))
        if (t < 3.4) showCheck(0, 4.1, 6.9, t, 2.0)
        if (t < 3.6) placeMalware(x, 1.9, z, 0.7 * overshoot(progress(t, 0.6, 0.9)))
        else {
          jumpMalware(
            t,
            3.6,
            4.3,
            [0, 1.9, 4.4],
            aboveHost(0),
            1.0,
            lerp(0.7, MALWARE_SIZE, progress(t, 3.6, 3.9)),
          )
          view.actor = malware
        }
      },
    },
    // T1189 Drive-by Compromise
    T1189: {
      hits: [3.5],
      run(t) {
        view.target = [-0.5, 7]
        view.height = 15
        storyState(2) // Drive-by Compromise
        const centre = [-4, 4.4, 10.5],
          seat = employees[1].position,
          cube = pinkCubes[0]
        cloud.visible = true
        cloud.scale.set(1.5, 1.5, 1.5)
        cloud.position.set(centre[0], centre[1] + Math.sin(view.time * 2) * 0.12, centre[2])
        cloud.rotation.y = 0.6
        flyTo(cube, aboveAttacker(), [centre[0], centre[1] + 1.1, centre[2]], t, 0.4, 1.3, 2, 6)
        cube.scale.set(0.4, 0.4, 0.4)
        if (t > 1.8 && t < 2.8) stretchBetween(pinkBeams[0], [seat.x, 1.4, seat.z], centre, 0.07)
        if (t > 2.6) {
          jumpMalware(t, 2.6, 3.5, centre, [seat.x + 0.95, 0, seat.z + 0.2], 1.0, MALWARE_SIZE)
          view.actor = malware
        }
        showCross(centre[0], centre[1] + 2.8, centre[2], t, 5.2)
      },
    },
    // T1133 External Remote Services
    T1133: {
      hits: [3.1],
      run(t) {
        view.target = [3.5, 7.5]
        view.height = 13
        storyState(2) // External Remote Services
        checkpoint.visible = true
        checkpoint.position.set(6.5, 0, 7.3)
        checkpoint.scale.set(0.55, 0.55, 0.55)
        scanPlane.visible = true
        scanPlane.position.set(6.5, 0.85, 7.3)
        scanPlane.scale.set(2.0, 1.6, 0.08)
        scanPlane.material.opacity = 0.3 + 0.15 * Math.sin(t * 8)
        const pose = walk(
          [
            [0, ATTACKER_SPOT[0], ATTACKER_SPOT[1]],
            [0.3, ATTACKER_SPOT[0], ATTACKER_SPOT[1]],
            [1.5, 6.5, 9.2],
            [7, 6.5, 9.2],
          ],
          t,
        )
        applyPose(attacker, pose)
        key.visible = t < 4.6
        key.position.set(pose.x, pose.y + 2.9, pose.z)
        key.rotation.y = t * 3
        key.scale.set(0.8, 0.8, 0.8)
        if (t < 4.4) showCheck(6.5, 2.7, 7.3, t, 1.9)
        if (t > 2.3 && t < 4.6) stretchBetween(pinkBeams[0], [6.5, 0.9, 7.3], [6.95, 0.6, 2.2], 0.08)
        if (t > 2.8) {
          const bot = bots[4],
            size = 1.3 * overshoot(progress(t, 2.8, 3.1)) * (1 - smooth(progress(t, 5.6, 6.0)))
          bot.visible = size > 0.01
          bot.scale.set(size, size, size)
          bot.position.set(6.95, bobHeight(), 2.2)
          bot.rotation.y = 0.6
        }
        if (t > 4.8) {
          gateGuard.visible = true
          gateGuard.position.set(6.5, 2.5 + (1 - bounce(progress(t, 4.8, 5.5))) * 6, 7.6)
        }
        showCross(6.5, 4.2, 7.6, t, 5.6)
      },
    },
    // T1091 Replication Through Removable Media
    T1091: {
      hits: [4.2],
      run(t) {
        view.target = [2.2, 7.0]
        view.height = 13
        storyState(2)
        // 門の外に落としておいたUSBメモリを、従業員が拾って持ち込み、自分の端末に挿す
        const usb = [1.4, 0.3, 8.6]
        const pose = walk(
          [
            [0, 0.6, 5.2],
            [0.5, 0.6, 5.2],
            [1.5, 1.2, 8.2],
            [2.0, 1.2, 8.2],
            [2.7, 0.8, 6.5],
            [3.4, 2.6, 4.4],
            [7, 2.6, 4.4],
          ],
          t,
          0,
        )
        user.visible = true
        applyPose(user, pose)
        openGate(progress(t, 0.3, 0.7) - progress(t, 2.9, 3.3))
        token.visible = t < 3.6
        token.scale.set(0.35, 0.35, 0.35)
        token.rotation.y = view.time * 2
        if (t < 1.8) token.position.set(usb[0], usb[1] + Math.sin(view.time * 4) * 0.05, usb[2])
        else token.position.set(pose.x, pose.y + 2.0, pose.z)
        showAlert(0, pose.x, 2.9, pose.z, t, 1.5, 2.0)
        if (t > 3.6) {
          jumpMalware(
            t,
            3.6,
            4.2,
            [2.9, 1.0, 4.5],
            aboveHost(0),
            0.9,
            MALWARE_SIZE * overshoot(progress(t, 3.6, 3.9)),
          )
          view.actor = malware
        }
      },
    },
    // T1199 Trusted Relationship
    T1199: {
      hits: [3.9],
      run(t) {
        view.target = [1.5, 7.6]
        view.height = 13
        storyState(2)
        // 出入りを許されている保守業者。その接続に相乗りして、門を通り抜ける
        const pose = walk(
          [
            [0, 5.5, 10.5],
            [0.4, 5.5, 10.5],
            [1.6, 0, 8.8],
            [2.3, 0, 8.8],
            [3.4, 0, 4.8],
            [7, 0, 4.8],
          ],
          t,
        )
        user.visible = true
        applyPose(user, pose)
        openGate(progress(t, 1.9, 2.3) - progress(t, 3.6, 4.0))
        if (t < 3.2) showCheck(0, 4.1, 6.9, t, 1.8)
        // マルウェアは業者のすぐ後ろについていき、中に入ってから端末へ移る
        if (t < 3.4)
          placeMalware(
            pose.x + 0.3,
            pose.y,
            pose.z + 1.1,
            MALWARE_SIZE * 0.75 * overshoot(progress(t, 0.2, 0.5)),
          )
        else {
          jumpMalware(
            t,
            3.4,
            3.9,
            [0.3, 0, 5.9],
            aboveHost(0),
            0.8,
            lerp(MALWARE_SIZE * 0.75, MALWARE_SIZE, progress(t, 3.4, 3.7)),
          )
          view.actor = malware
        }
      },
    },
  }
}
