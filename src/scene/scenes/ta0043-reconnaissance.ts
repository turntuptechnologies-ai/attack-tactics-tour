// TA0043 偵察（Reconnaissance）の場面。
import type { Kit } from '../kit'
import { progress, smooth, overshoot, walk, applyPose, stretchBetween } from '../motion'
import type { SceneMap } from './types'

export default function reconnaissance(kit: Kit): SceneMap {
  const {
    attacker,
    defender,
    employees,
    mails,
    mail,
    pinkBeams,
    ATTACKER_SPOT,
    pinkCubes,
    YELLOW_CUBE_X,
    yellowCubes,
    attackerScan,
    cloud,
    documents,
    database,
    view,
    standing,
    aboveAttacker,
    flyTo,
    popIn,
    showCross,
    showAlert,
  } = kit
  return {
    // T1595 Active Scanning（本編）
    T1595: {
      hits: [3.9],
      run(t) {
        view.target = [0.5, 9.5]
        view.height = 15 // Reconnaissance
        const pose = walk(
          [
            [0, ATTACKER_SPOT[0], ATTACKER_SPOT[1]],
            [0.9, 6, 9.3],
            [3.9, -7.5, 9.3],
            [7, -7.5, 9.3],
          ],
          t,
        )
        applyPose(attacker, pose)
        if (t > 0.9 && t < 3.9) {
          attackerScan.visible = true
          attackerScan.position.set(pose.x, 1.1, 8.1)
          attackerScan.material.opacity = 0.35 + 0.2 * Math.sin(t * 20)
        }
        yellowCubes.forEach((cube, i) => {
          const seen = t > 0.9 && pose.x < YELLOW_CUBE_X[i] + 0.3
          let size = seen ? 0.55 : 0.42
          if (t > 4.6 && i !== 1) size *= 1 - smooth(progress(t, 5 + i * 0.2, 5.6 + i * 0.2))
          cube.visible = size > 0.02
          cube.material.color.setHex(seen ? 0xff6fd8 : 0xf6c531)
          cube.scale.set(size, size, size)
          cube.position.y = 2.5 + Math.sin(view.time * 4 + i) * 0.06
          cube.rotation.y = view.time
        })
        applyPose(
          defender,
          walk(
            [
              [0, -3, 4.6],
              [4.6, -3, 4.6],
              [5.4, -5, 5.2],
              [7, -5, 5.2],
            ],
            t,
            0,
          ),
        )
      },
    },
    // T1598 Phishing for Information
    T1598: {
      hits: [3.6],
      run(t) {
        view.target = [2.5, 8]
        view.height = 14
        applyPose(attacker, standing(ATTACKER_SPOT[0], ATTACKER_SPOT[1]))
        applyPose(defender, standing(-3, 4.6, 0.4)) // Phishing for Information
        const point = [3.5, 1.9, 3.6]
        if (t < 1.7) flyTo(mail, aboveAttacker(), point, t, 0.4, 1.6, 3, 5)
        showAlert(0, 3.5, 2.3, 3.5, t, 1.6, 2.6)
        if (t > 2.4) {
          const cube = pinkCubes[0]
          flyTo(cube, point, [ATTACKER_SPOT[0] - 0.8, 2.9, ATTACKER_SPOT[1]], t, 2.4, 3.6, 3, 6)
          cube.scale.set(0.4, 0.4, 0.4)
          if (t >= 3.6) cube.rotation.y = view.time * 2
        }
        if (t > 4.8) {
          flyTo(mails[1], aboveAttacker(), [6, 1.9, 2.2], t, 4.9, 5.9, 3, 5)
          showCross(6, 3.1, 2.2, t, 5.9)
        }
      },
    },
    // T1589 Gather Victim Identity Information
    T1589: {
      hits: [3.9],
      run(t) {
        view.target = [1.5, 7.5]
        view.height = 15
        applyPose(attacker, standing(ATTACKER_SPOT[0], ATTACKER_SPOT[1]))
        applyPose(defender, standing(-1, 4.6, 0.4)) // Gather Victim Identity Information
        employees.forEach((employee, i) => {
          const seat = employee.position,
            cube = pinkCubes[i],
            start = 0.5 + i * 0.5
          if (t < start) return
          flyTo(
            cube,
            [seat.x, 2.4, seat.z],
            [ATTACKER_SPOT[0] - 0.9 + i * 0.6, 2.9 + (i & 1) * 0.5, ATTACKER_SPOT[1]],
            t,
            start + 0.8,
            start + 1.9,
            3.5,
            4,
          )
          const size = 0.36 * overshoot(progress(t, start, start + 0.3))
          cube.scale.set(size, size, size)
        })
      },
    },
    // T1593 Search Open Websites/Domains
    T1593: {
      hits: [4],
      run(t) {
        view.target = [0.5, 10.5]
        view.height = 14
        applyPose(attacker, standing(ATTACKER_SPOT[0], ATTACKER_SPOT[1], -1.2))
        applyPose(defender, standing(-3, 4.6, 0.4)) // Search Open Websites/Domains
        const centre = [-3.5, 4.2, 11.5]
        popIn(cloud, centre[0], centre[1] + Math.sin(view.time * 2) * 0.12, centre[2], t, 0.2, 1.5)
        cloud.rotation.y = 0.6
        documents.forEach((doc, i) => {
          const start = 1.0 + i * 0.55
          if (t < start) return
          flyTo(
            doc,
            [centre[0] - 0.9 + i * 0.6, centre[1] - 0.2, centre[2]],
            [ATTACKER_SPOT[0] - 0.9 + i * 0.6, 2.9 + (i & 1) * 0.5, ATTACKER_SPOT[1]],
            t,
            start + 0.3,
            start + 1.3,
            1.5,
            5,
          )
          const size = overshoot(progress(t, start, start + 0.3))
          doc.scale.set(size, size, size)
          if (t >= start + 1.3) doc.rotation.y = 0.6
        })
      },
    },
    // T1596 Search Open Technical Databases
    T1596: {
      hits: [3.1],
      run(t) {
        view.target = [0, 9.5]
        view.height = 15
        applyPose(attacker, standing(ATTACKER_SPOT[0], ATTACKER_SPOT[1], -1.2))
        applyPose(defender, standing(-3, 4.6, 0.4)) // Search Open Technical Databases
        popIn(database, -2.5, 0, 12.2, t, 0.2)
        database.rotation.y = 0.6
        if (t > 0.9 && t < 1.5)
          stretchBetween(pinkBeams[4], [ATTACKER_SPOT[0], 1.5, ATTACKER_SPOT[1]], [-2.5, 1.0, 12.2], 0.08)
        yellowCubes.forEach((cube, i) => {
          const start = 1.6 + i * 0.6,
            on = t > start
          cube.visible = true
          cube.material.color.setHex(on ? 0xff6fd8 : 0xf6c531)
          let size = on ? 0.55 : 0.42
          if (t > 5 && i !== 1) size *= 1 - smooth(progress(t, 5 + i * 0.2, 5.6 + i * 0.2))
          cube.visible = size > 0.02
          cube.scale.set(size, size, size)
          cube.position.y = 2.5 + Math.sin(view.time * 4 + i) * 0.06
          cube.rotation.y = view.time
          if (on && t < 4.6)
            stretchBetween(pinkBeams[i], [-2.5, 1.4, 12.2], [YELLOW_CUBE_X[i], 2.5, 6.5], 0.06)
        })
      },
    },
    // T1594 Search Victim-Owned Websites
    T1594: {
      hits: [3.9],
      run(t) {
        view.target = [0, 9.5]
        view.height = 14
        // 標的が公開しているWebサイト（外に面したサーバー）を読みに行き、載っている情報を持ち帰る
        const site = [-3.2, 8.0]
        database.visible = true
        database.scale.set(1, 1, 1)
        database.position.set(site[0], 0, site[1])
        database.rotation.y = 0.6
        const pose = walk(
          [
            [0, ATTACKER_SPOT[0], ATTACKER_SPOT[1]],
            [0.3, ATTACKER_SPOT[0], ATTACKER_SPOT[1]],
            [1.5, site[0] + 1.6, site[1] + 1.2],
            [7, site[0] + 1.6, site[1] + 1.2],
          ],
          t,
        )
        applyPose(attacker, pose)
        applyPose(defender, standing(-3, 4.6, 0.4))
        documents.slice(0, 3).forEach((doc, i) => {
          const start = 1.7 + i * 0.6
          if (t < start) return
          const size = 0.9 * overshoot(progress(t, start, start + 0.3))
          flyTo(
            doc,
            [site[0], 2.0, site[1]],
            [pose.x - 0.6 + i * 0.6, 3.0 + (i & 1) * 0.45, pose.z],
            t,
            start + 0.2,
            start + 1.0,
            1.2,
            5,
          )
          doc.scale.set(size, size, size)
          if (t >= start + 1.0) doc.rotation.y = 0.6
        })
      },
    },
    // T1590 Gather Victim Network Information
    T1590: {
      hits: [3.6],
      run(t) {
        view.target = [0.5, 9.2]
        view.height = 15
        applyPose(attacker, standing(ATTACKER_SPOT[0], ATTACKER_SPOT[1]))
        applyPose(defender, standing(-3, 4.6, 0.4))
        // 外から見える機器（黄色い箱）と、そのつながりを一つずつ描き出して、ネットワークの地図を作る
        yellowCubes.forEach((node, i) => {
          const start = 0.6 + i * 0.7
          const found = t > start
          const size = found ? 0.55 : 0.42
          const at = [YELLOW_CUBE_X[i], 2.5, 6.5]
          node.visible = true
          node.material.color.setHex(found ? 0xff6fd8 : 0xf6c531)
          node.scale.set(size, size, size)
          node.position.y = 2.5 + Math.sin(view.time * 4 + i) * 0.06
          node.rotation.y = view.time
          if (found && i > 0) stretchBetween(pinkBeams[i], [YELLOW_CUBE_X[i - 1], 2.5, 6.5], at, 0.07)
          if (t > start && t < start + 0.5)
            stretchBetween(pinkBeams[4 + i], [ATTACKER_SPOT[0], 1.6, ATTACKER_SPOT[1]], at, 0.05)
        })
        if (t > 2.6) {
          const map = documents[0]
          const size = overshoot(progress(t, 2.6, 2.9))
          flyTo(map, [YELLOW_CUBE_X[1], 3.3, 6.5], aboveAttacker(), t, 2.7, 3.6, 2.0, 5)
          map.scale.set(size, size, size)
          if (t >= 3.6) map.rotation.y = 0.6
        }
      },
    },
    // T1591 Gather Victim Org Information
    T1591: {
      hits: [3.6],
      run(t) {
        view.target = [0.5, 7.2]
        view.height = 15
        applyPose(attacker, standing(ATTACKER_SPOT[0], ATTACKER_SPOT[1]))
        applyPose(defender, standing(-1, 4.6, 0.4))
        // だれがだれの上司で、どの部署がどうつながっているか。組織の形（線）を外から描き出す
        const heads = employees.map((employee) => [employee.position.x, 2.3, employee.position.z])
        for (let i = 0; i < 3; i++) {
          const start = 0.6 + i * 0.6
          if (t > start) stretchBetween(pinkBeams[i], heads[i], heads[i + 1], 0.07)
        }
        if (t > 2.4) {
          const chart = documents[0]
          const size = 1.1 * overshoot(progress(t, 2.4, 2.7))
          flyTo(chart, [0, 3.4, 3.0], aboveAttacker(), t, 2.6, 3.6, 3.0, 5)
          chart.scale.set(size, size, size)
          if (t >= 3.6) chart.rotation.y = 0.6
        }
      },
    },
  }
}
