// TA0043 偵察（Reconnaissance）の場面。
import type { Kit } from '../kit'
import { progress, smooth, overshoot, walk, applyPose, stretchBetween, lerp } from '../motion'
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
    secondAttacker,
    truckB,
    relayBot,
    flyPaper,
  } = kit
  return {
    // T1595 Active Scanning（本編）
    T1595: {
      hits: [3.9],
      run(t) {
        view.target = [-1.0, 7.3]
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
        view.target = [-0.7, 8.7]
        view.height = 14
        applyPose(attacker, standing(ATTACKER_SPOT[0], ATTACKER_SPOT[1], -1.2))
        applyPose(defender, standing(-3, 4.6, 0.4)) // Search Open Websites/Domains
        const centre = [-3.5, 4.2, 11.5]
        popIn(cloud, centre[0], centre[1] + Math.sin(view.time * 2) * 0.12, centre[2], t, 0.2, 1.5)
        cloud.rotation.y = 0.6
        documents.forEach((doc, i) => {
          const start = 1.0 + i * 0.55
          if (t < start) return
          flyPaper(
            doc,
            [centre[0] - 0.9 + i * 0.6, centre[1] - 0.2, centre[2]],
            [ATTACKER_SPOT[0] - 0.9 + i * 0.6, 2.9 + (i & 1) * 0.5, ATTACKER_SPOT[1]],
            t,
            start + 0.3,
            start + 1.3,
            1.5,
            start,
            1,
          )
        })
      },
    },
    // T1596 Search Open Technical Databases
    T1596: {
      hits: [3.1],
      run(t) {
        view.target = [-1.5, 7.3]
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
          flyPaper(
            doc,
            [site[0], 2.0, site[1]],
            [pose.x - 0.6 + i * 0.6, 3.0 + (i & 1) * 0.45, pose.z],
            t,
            start + 0.2,
            start + 1.0,
            1.2,
            start,
            0.9,
          )
        })
      },
    },
    // T1590 Gather Victim Network Information
    T1590: {
      hits: [3.6],
      run(t) {
        view.target = [-1.0, 7.0]
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
          flyPaper(map, [YELLOW_CUBE_X[1], 3.3, 6.5], aboveAttacker(), t, 2.7, 3.6, 2.0, 2.6, 1)
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
          flyPaper(chart, [0, 3.4, 3.0], aboveAttacker(), t, 2.6, 3.6, 3.0, 2.4, 1.1)
        }
      },
    },
    // T1592 Gather Victim Host Information
    T1592: {
      hits: [3.9],
      run(t) {
        view.target = [-1.5, 8.6]
        view.height = 13
        // 外に面した1台（黄色い箱）を詳しく調べ、機種やOS、入っているソフトを書き出す
        const host = [YELLOW_CUBE_X[1], 2.5, 6.5]
        const target = yellowCubes[1]
        const pose = walk(
          [
            [0, ATTACKER_SPOT[0], ATTACKER_SPOT[1]],
            [0.3, ATTACKER_SPOT[0], ATTACKER_SPOT[1]],
            [1.5, -1.6, 9.2],
            [7, -1.6, 9.2],
          ],
          t,
        )
        applyPose(attacker, pose)
        applyPose(defender, standing(-3, 4.6, 0.4))
        target.visible = true
        target.material.color.setHex(t > 1.5 ? 0xff6fd8 : 0xf6c531)
        target.scale.set(0.5, 0.5, 0.5)
        target.position.y = 2.5 + Math.sin(view.time * 4) * 0.06
        target.rotation.y = view.time
        if (t > 1.5 && t < 3.4) {
          attackerScan.visible = true
          attackerScan.position.set(host[0] + Math.sin(t * 4) * 0.7, 2.4, host[2])
          attackerScan.material.opacity = 0.35 + 0.2 * Math.sin(t * 20)
        }
        documents.slice(0, 3).forEach((doc, i) => {
          const start = 1.9 + i * 0.5
          if (t < start) return
          flyPaper(
            doc,
            host,
            [pose.x - 0.6 + i * 0.6, 3.0 + (i & 1) * 0.45, pose.z],
            t,
            start + 0.2,
            start + 1.0,
            1.0,
            start,
            0.85,
          )
        })
      },
    },
    // T1597 Search Closed Sources
    T1597: {
      hits: [3.6],
      run(t) {
        view.target = [0.8, 11]
        view.height = 13
        applyPose(attacker, standing(ATTACKER_SPOT[0], ATTACKER_SPOT[1], -1.2))
        applyPose(defender, standing(2, 5, 0.4))
        // 一般には出回らない情報を扱う売り手（トラック）。お金を払って、標的の情報を買う
        const stall = [-1.4, 2.2, 12.6]
        const open = overshoot(progress(t, 0.2, 0.6))
        const fee = pinkCubes[0]
        truckB.visible = open > 0.01
        truckB.scale.set(open, open, open)
        truckB.position.set(stall[0], 0, stall[2])
        truckB.rotation.y = Math.PI / 2
        if (t > 0.9 && t < 1.9) {
          flyTo(fee, [ATTACKER_SPOT[0], 2.6, ATTACKER_SPOT[1]], stall, t, 0.9, 1.9, 1.2, 6)
          fee.scale.set(0.34, 0.34, 0.34)
        }
        for (let i = 0; i < 2; i++) {
          const start = 2.0 + i * 0.5
          if (t < start) continue
          const doc = documents[i]
          flyPaper(
            doc,
            stall,
            [ATTACKER_SPOT[0] - 0.4 + i * 0.8, 3.0, ATTACKER_SPOT[1]],
            t,
            start + 0.2,
            start + 1.0,
            1.2,
            start,
            0.9,
          )
        }
      },
    },
    // T1682 Query Public AI Services
    T1682: {
      hits: [4.2],
      run(t) {
        view.target = [0.5, 11]
        view.height = 13
        applyPose(attacker, standing(ATTACKER_SPOT[0], ATTACKER_SPOT[1], -1.2))
        applyPose(defender, standing(2, 5, 0.4))
        // 公開されているAIサービス（左のロボット）に調べさせ、ばらばらの公開情報を整理させる
        const ai = [-1.6, 12.2]
        popIn(relayBot, ai[0], 0, ai[1], t, 0.3, 2.0)
        relayBot.rotation.y = t > 1.2 && t < 2.6 ? t * 8 : 0.6
        if (t > 0.8 && t < 1.4)
          stretchBetween(pinkBeams[0], [ATTACKER_SPOT[0], 1.6, ATTACKER_SPOT[1]], [ai[0], 1.2, ai[1]], 0.07)
        // 考えている間、公開情報（粒）が四方から吸い寄せられる
        for (let i = 0; i < 4; i++) {
          const p = progress(t, 1.2 + i * 0.15, 2.2 + i * 0.15)
          if (p <= 0 || p >= 1) continue
          const cube = pinkCubes[i]
          const angle = i * 1.57
          cube.visible = true
          cube.scale.set(0.22, 0.22, 0.22)
          cube.position.set(
            lerp(ai[0] + Math.cos(angle) * 4, ai[0], p),
            lerp(3.2, 1.6, p),
            lerp(ai[1] + Math.sin(angle) * 2.5, ai[1], p),
          )
        }
        documents.slice(0, 3).forEach((doc, i) => {
          const start = 2.4 + i * 0.4
          if (t < start) return
          flyPaper(
            doc,
            [ai[0], 2.6, ai[1]],
            [ATTACKER_SPOT[0] - 0.7 + i * 0.7, 3.0 + (i & 1) * 0.4, ATTACKER_SPOT[1]],
            t,
            start + 0.2,
            start + 1.0,
            1.0,
            start,
            0.85,
          )
        })
      },
    },
    // T1681 Search Threat Vendor Data
    T1681: {
      hits: [3.2],
      run(t) {
        view.target = [2.6, 10.6]
        view.height = 13
        // セキュリティ企業が公開した報告書（右の台帳）を読み、自分たちの手口がどこまで知られているかを確かめて、装いを変える
        const vendor = [6.6, 10.2]
        const changed = t > 2.8
        const who = changed ? secondAttacker : attacker
        const report = documents[0]
        database.visible = true
        database.scale.set(0.9, 0.9, 0.9)
        database.position.set(vendor[0], 0, vendor[1])
        database.rotation.y = 0.6
        attacker.visible = !changed
        secondAttacker.visible = changed
        applyPose(who, standing(ATTACKER_SPOT[0], ATTACKER_SPOT[1], Math.PI / 2))
        who.position.y = Math.sin(Math.PI * progress(t, 2.8, 3.3)) * 0.5
        view.actor = who
        applyPose(defender, standing(2, 5, 0.4))
        if (t > 0.6) {
          flyPaper(report, [vendor[0], 2.2, vendor[1]], aboveAttacker(), t, 0.9, 2.0, 1.4, 0.6, 1)
        }
      },
    },
  }
}
