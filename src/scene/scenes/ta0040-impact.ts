// TA0040 影響（Impact）の場面。
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

export default function impact(kit: Kit): SceneMap {
  const {
    wallMaterials,
    attacker,
    defender,
    alertMark,
    user,
    glass,
    hammer,
    pinkBeams,
    bots,
    truckA,
    RACK_Z,
    racks,
    ATTACKER_SPOT,
    SERVER_SPOT,
    rackMarks,
    padlock,
    database,
    view,
    standing,
    storyState,
    popIn,
    showCross,
    showCheck,
    hopInPlace,
    showAlert,
  } = kit
  return {
    // T1486 Data Encrypted for Impact（本編）
    T1486: {
      hits: [2.4],
      run(t) {
        view.target = [0, -3.2]
        view.height = 13.5
        storyState(14) // Impact
        applyPose(defender, standing(4.8, -3, -Math.PI / 2))
        for (let i = 0; i < 4; i++) {
          const rack = racks[i],
            start = 0.6 + i * 0.45,
            rt = 5.4 + i * 0.3
          if (t > start && t < rt) {
            rack.lights.color.setHex(0xff4a3d)
            rack.lock.visible = true
            const size = overshoot(progress(t, start, start + 0.3))
            rack.lock.scale.set(size, size, size)
          }
          if (t > rt - 0.5) {
            rack.backup.visible = true
            rack.backup.position.y = 2.72 + (1 - bounce(progress(t, rt - 0.5, rt + 0.2))) * 7
          }
        }
        if (t > 2.6 && t < 4.5) {
          alertMark.visible = true
          alertMark.position.set(4.8, 2.2 + Math.abs(Math.sin(t * 9)) * 0.2, -3)
          defender.position.y = Math.abs(Math.sin(t * 9)) * 0.15
        }
      },
    },
    // T1485 Data Destruction
    T1485: {
      hits: [2.9],
      run(t) {
        view.target = [0.5, -3.2]
        view.height = 14
        storyState(14)
        applyPose(defender, standing(4.8, -3, -Math.PI / 2)) // Data Destruction
        const ph = (t - 0.6) / 0.35,
          hi = Math.max(0, Math.min(5, ph))
        if (t > 0.2 && t < 2.9) {
          hammer.visible = true
          hammer.position.set(lerp(racks[0].x, racks[5].x, hi / 5), 3.3, RACK_Z + 0.9)
          hammer.rotation.x = -0.2 - Math.abs(Math.cos(Math.PI * ph)) * 1.2
        } // smashed one by one
        racks.forEach((rack, i) => {
          const start = 0.6 + i * 0.35,
            back0 = 5.2 + i * 0.18,
            p = progress(t, start, start + 0.4),
            q = progress(t, back0, back0 + 0.6),
            flash = rackMarks[i]
          if (t > start && t < back0 + 0.6) rack.lights.color.setHex(0x1a1d24)
          rack.data.position.set(rack.x, 2.72, RACK_Z)
          rack.data.scale.set(0.6, 0.6, 0.6)
          rack.data.visible = t < start
          if (p > 0 && p < 1) {
            const size = 1.1 * (1 - p)
            flash.visible = true
            flash.scale.set(size, size, size)
            flash.position.y = 2.9 + p * 0.8
            flash.rotation.y = t * 9
          }
          if (q > 0) {
            rack.backup.visible = true
            arcBetween(rack.backup, [7.6, 2.0, -1.2], [rack.x, 2.72, RACK_Z], smooth(q), 3)
          }
        })
        if (t > 2.8 && t < 4.5) {
          alertMark.visible = true
          alertMark.position.set(4.8, 2.2 + Math.abs(Math.sin(t * 9)) * 0.2, -3)
          defender.position.y = Math.abs(Math.sin(t * 9)) * 0.15
        }
        if (t > 4.6) {
          const scale = overshoot(progress(t, 4.6, 4.9))
          truckA.visible = true
          truckA.scale.set(scale, scale, scale)
          truckA.rotation.y = Math.PI / 2
          truckA.position.set(lerp(10.2, 7.8, smooth(progress(t, 4.6, 5.2))), 0, -1.2)
        }
      },
    },
    // T1498 Network Denial of Service
    T1498: {
      hits: [2.6],
      run(t) {
        view.target = [0.5, 9.4]
        view.height = 15
        storyState(14)
        view.actor = attacker
        applyPose(defender, standing(-2, 5, 0.4)) // Network Denial of Service
        for (let j = 0; j < 16; j++) {
          const bot = bots[j + 4],
            start = 0.3 + (j % 8) * 0.15,
            p = smooth(progress(t, start, start + 1.6)),
            size =
              overshoot(progress(t, start, start + 0.3)) *
              (1 - smooth(progress(t, 5.3 + j * 0.04, 5.8 + j * 0.04)))
          bot.visible = size > 0.01
          bot.scale.set(size, size, size)
          bot.position.set(
            lerp(-9 + j * 1.2, -2.2 + (j % 6) * 0.9, p),
            Math.abs(Math.sin(t * 7 + j)) * 0.3,
            lerp(14.6, 7.7 + Math.floor(j / 6) * 0.9, p),
          )
          bot.rotation.y = Math.PI
        }
        user.visible = true
        applyPose(user, standing(6.5, 10.4, -2.2))
        if (t < 5.6) showCross(6.5, 3.0, 10.4, t, 2.4)
        if (t > 5.0) {
          glass.visible = true
          glass.position.set(0, 1.4, 10.6)
          glass.scale.set(9, 2.8, 0.12)
          glass.material.opacity = 0.5 * smooth(progress(t, 5.0, 5.5))
        }
        if (t >= 5.6) showCheck(6.5, 3.0, 10.4, t, 6.0)
      },
    },
    // T1490 Inhibit System Recovery
    T1490: {
      hits: [2.3],
      run(t) {
        view.target = [-0.5, -3.0]
        view.height = 13.5
        storyState(14)
        applyPose(defender, standing(4.8, -3, -Math.PI / 2)) // Inhibit System Recovery
        const vault = [-5.4, -2.2],
          sq = smooth(progress(t, 1.6, 2.2)),
          bx = [6.6, 0.95, -2.6]
        database.visible = true
        database.position.set(vault[0], 0, vault[1])
        database.rotation.y = 0.6
        database.scale.set(1.3 * (1 + 0.25 * sq), 1.3 * (1 - 0.85 * sq), 1.3 * (1 + 0.25 * sq)) // the backup store, flattened
        for (let i = 0; i < 3; i++) {
          const backup = racks[i].backup,
            size = 0.5 * (1 - smooth(progress(t, 1.6 + i * 0.2, 2.1 + i * 0.2))),
            angle = view.time * 1.5 + i * 2.09
          backup.visible = size > 0.02
          backup.scale.set(size, size, size)
          backup.position.set(
            vault[0] + Math.cos(angle) * 1.3,
            2.7 + Math.sin(view.time * 3 + i) * 0.1,
            vault[1] + Math.sin(angle) * 1.3,
          )
        }
        if (t > 0.9 && t < 1.7)
          stretchBetween(pinkBeams[0], [SERVER_SPOT[0], 1.2, SERVER_SPOT[1]], [vault[0], 1.0, vault[1]], 0.1)
        showAlert(0, 4.8, 2.2, -3, t, 2.8, 4.5)
        hopInPlace(defender, t, 2.8, 4.5, 0.15)
        if (t > 3.0 && t < 4.6) showCross(vault[0], 2.4, vault[1], t, 3.0)
        if (t > 5.0) {
          const scale = overshoot(progress(t, 5.0, 5.4))
          glass.visible = true
          glass.scale.set(1.9 * scale, 1.9 * scale, 1.9 * scale)
          glass.position.set(bx[0], bx[1], bx[2])
          glass.material.opacity = 0.35 // a copy kept off the network
          ;[4, 5].forEach((ri, j) => {
            const backup = racks[ri].backup
            backup.visible = true
            backup.scale.set(0.5 * scale, 0.5 * scale, 0.5 * scale)
            backup.position.set(bx[0] - 0.4 + j * 0.8, 0.5, bx[2])
          })
          popIn(padlock, bx[0], 2.4, bx[2], t, 5.4, 0.7)
          padlock.rotation.y = 0.6
        }
      },
    },
    // T1491 Defacement
    T1491: {
      hits: [3],
      run(t) {
        view.target = [0.5, 8.5]
        view.height = 17
        storyState(14)
        view.actor = attacker
        applyPose(defender, standing(-2, 5, 0.4)) // Defacement
        applyPose(
          attacker,
          walk(
            [
              [0, ATTACKER_SPOT[0], ATTACKER_SPOT[1]],
              [0.2, ATTACKER_SPOT[0], ATTACKER_SPOT[1]],
              [1.0, 0.8, 9.2],
              [7, 0.8, 9.2],
            ],
            t,
          ),
        )
        for (let x = -10; x <= 10; x++) {
          if (!wallMaterials[x]) continue
          const distance = Math.abs(x) - 2,
            on = t > 0.9 + distance * 0.25 && t < 5.2 + distance * 0.12
          wallMaterials[x].color.setHex(on ? ((x + Math.floor(t * 4)) & 1 ? 0xff6fd8 : 0xd63f35) : 0xd9dde4)
        }
        showCheck(0, 4.1, 6.9, t, 6.2)
      },
    },
  }
}
