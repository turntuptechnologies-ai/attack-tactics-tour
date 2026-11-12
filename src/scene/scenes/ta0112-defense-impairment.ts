// TA0112 防御の妨害（Defense Impairment）の場面。
import type { Kit } from '../kit'
import {
  progress,
  smooth,
  lerp,
  arcBetween,
  stretchBetween,
  overshoot,
  bounce,
  walk,
  applyPose,
} from '../motion'
import type { SceneMap } from './types'

export default function defenseImpairment(kit: Kit): SceneMap {
  const {
    employees,
    checkMark,
    glass,
    pinkBeams,
    drones,
    cyanBeams,
    TOWER_SPOT,
    HOST_SPOT,
    malware,
    pinkCubes,
    pulseRings,
    documents,
    trustedProcess,
    trustedProcessEyes,
    view,
    openGate,
    placeSensor,
    storyState,
    aboveHost,
    showCross,
    showCheck,
    padlock,
    flyTo,
    showAlert,
    gateGuard,
    database,
    popIn,
    attacker,
    bots,
    relayBot,
    checkpoint,
    scanPlane,
    segmentWall,
    ATTACKER_SPOT,
    yellowCubes,
    cloud,
    DEFENDER_SPOT,
  } = kit
  return {
    // T1685 Disable or Modify Tools（本編）
    T1685: {
      hits: [2.2],
      run(t) {
        view.target = [1, 3.8]
        view.height = 10
        storyState(7) // Defense Impairment
        if (t > 1 && t < 1.5)
          stretchBetween(pinkBeams[0], [HOST_SPOT[0], 0.7, HOST_SPOT[1]], [0.5, 3.3, 3.5], 0.12)
        const amount = progress(t, 1.4, 2.2)
        if (amount > 0) placeSensor(0.5, lerp(3.3, 0.25, amount * amount), 3.5, 0.5 * amount)
        if (t > 2.2 && t < 4.4) malware.position.y = Math.abs(Math.sin((t - 2.2) * 5)) * 0.4
      },
    },
    // T1686 Disable or Modify System Firewall
    T1686: {
      hits: [2.4],
      run(t) {
        view.target = [1.5, 6.5]
        view.height = 13
        storyState(7) // Disable or Modify System Firewall
        if (t > 0.8 && t < 1.5) stretchBetween(pinkBeams[0], aboveHost(0.9), [0, 1.5, 6.3], 0.12)
        openGate(progress(t, 1.3, 2.0) - progress(t, 5.2, 5.8))
        const point = [0, 1.0, 6.5],
          from = [TOWER_SPOT[0], 2.9, TOWER_SPOT[1]],
          to = aboveHost(0.9)
        if (t > 2.0 && t < 5.4)
          for (let i = 0; i < 5; i++) {
            const ph = ((t - 2.0) * 0.5 + i * 0.2) % 1,
              q = ph < 0.5 ? ph * 2 : ph * 2 - 1,
              u = ph < 0.5 ? from : point,
              w = ph < 0.5 ? point : to,
              cube = pinkCubes[i]
            cube.visible = true
            cube.scale.set(0.3, 0.3, 0.3)
            cube.position.set(lerp(u[0], w[0], q), lerp(u[1], w[1], q), lerp(u[2], w[2], q))
          }
        showCheck(0, 4.1, 6.9, t, 5.8)
      },
    },
    // T1553 Subvert Trust Controls
    T1553: {
      hits: [3.6],
      run(t) {
        view.target = [0.6, 3.2]
        view.height = 10.5
        storyState(7) // Subvert Trust Controls
        const px = -1.4,
          pz = 2.4,
          st = [px, 2.3, pz]
        trustedProcess.visible = true
        trustedProcess.scale.set(1.6, 1.6, 1.6)
        trustedProcess.position.set(px, 0, pz)
        trustedProcess.rotation.y = 0.6
        trustedProcessEyes.visible = false // trusted, signed software
        if (t > 0.5 && t < 1.0) stretchBetween(pinkBeams[0], aboveHost(1.0), st, 0.07)
        if (t < 5.4) {
          checkMark.visible = true
          checkMark.scale.set(0.7, 0.7, 0.7)
          checkMark.rotation.y = 0.6
          arcBetween(checkMark, st, aboveHost(3.0), smooth(progress(t, 0.9, 1.9)), 1.2)
          if (t < 0.9) checkMark.position.y += Math.sin(t * 4) * 0.06
        } // its signature, stolen
        const dp = smooth(progress(t, 2.2, 2.9)) * (1 - smooth(progress(t, 3.6, 4.2)))
        placeSensor(
          lerp(0.5, HOST_SPOT[0], dp),
          lerp(3.3, 4.7, dp) + Math.sin(view.time * 3) * 0.1,
          lerp(3.5, HOST_SPOT[1], dp),
        )
        if (t > 2.9 && t < 3.5) {
          const bm = cyanBeams[2]
          bm.visible = true
          bm.rotation.set(0, 0, 0)
          bm.position.set(HOST_SPOT[0], 4.0, HOST_SPOT[1])
          bm.scale.set(0.25, 0.7, 0.25)
        }
        showCross(HOST_SPOT[0], 3.1, HOST_SPOT[1], t, 5.4)
      },
    },
    // T1690 Prevent Command History Logging
    T1690: {
      hits: [2.5],
      run(t) {
        view.target = [1.0, 3.2]
        view.height = 9.5
        storyState(7) // Prevent Command History Logging
        const logAt = [0, 1.7, 2.3],
          doc = documents[0],
          amount = smooth(progress(t, 1.8, 2.4)) * (1 - smooth(progress(t, 5.4, 6.0)))
        doc.visible = true
        doc.scale.set(1.7, 1.7, 1.7)
        doc.position.set(logAt[0], lerp(logAt[1], 0.12, amount), logAt[2])
        doc.rotation.set((-amount * Math.PI) / 2, 0.6 * (1 - amount), 0)
        for (let i = 0; i < 2; i++) {
          const start = 0.3 + i * 0.6,
            p = progress(t, start, start + 0.8),
            cube = pinkCubes[i]
          if (p > 0 && p < 1) {
            cube.visible = true
            cube.scale.set(0.2, 0.2, 0.2)
            arcBetween(cube, aboveHost(1.6), logAt, p, 0.6)
          }
        }
        if (t > 1.5 && t < 1.9) stretchBetween(pinkBeams[0], aboveHost(1.0), logAt, 0.1)
        if (t > 2.6 && t < 4.6) {
          malware.position.y = Math.abs(Math.sin((t - 2.6) * 5)) * 0.4
          for (let i = 2; i < 6; i++) {
            const p = progress(t, 2.6 + (i - 2) * 0.4, 3.4 + (i - 2) * 0.4),
              cube = pinkCubes[i],
              size = 0.2 * (1 - p) + 0.01
            if (p <= 0 || p >= 1) continue
            cube.visible = true
            cube.scale.set(size, size, size)
            arcBetween(cube, aboveHost(1.6), [logAt[0] + 0.6, 1.2, logAt[2] + 0.3], p, 0.8)
          }
        }
      },
    },
    // T1688 Safe Mode Boot
    T1688: {
      hits: [2.7],
      run(t) {
        view.target = [1.4, 3.8]
        view.height = 10
        storyState(7) // Safe Mode Boot
        if (t > 0.6 && t < 1.2) stretchBetween(pinkBeams[0], aboveHost(0.9), [3.5, 0.9, 4.4], 0.1)
        employees[2].scale.y = 1 - 0.45 * (smooth(progress(t, 1.2, 1.6)) - smooth(progress(t, 2.2, 2.5)))
        if (t > 1.2 && t < 2.6)
          pulseRings.forEach((ring, j) => {
            const ph = ((t - 1.2) * 0.9 + j * 0.5) % 1,
              scale = 1 + ph * 5
            ring.visible = true
            ring.scale.set(scale, 0.02, scale)
            ring.position.set(3.5, 0.08, 4.4)
            ring.material.opacity = 0.5 * (1 - ph)
          })
        const amount = smooth(progress(t, 1.6, 2.2)) * (1 - smooth(progress(t, 5.2, 5.8))),
          drone = drones[2]
        drone.visible = true
        drone.rotation.z = 0
        drone.position.set(0.5, 3.3 + (amount < 0.05 ? Math.sin(view.time * 3) * 0.1 : 0), 3.5)
        drone.userData.rot.rotation.y = amount > 0.5 ? 0.5 : view.time * 25
        if (amount > 0.02) {
          glass.visible = true
          glass.scale.set(1.5 * amount, 1.1 * amount, 1.5 * amount)
          glass.position.set(0.5, 3.35, 3.5)
          glass.material.opacity = 0.45
        } // the placeSensor never loads: frozen, boxed in
        if (t > 2.6 && t < 4.6) malware.position.y = Math.abs(Math.sin((t - 2.6) * 5)) * 0.4
      },
    },
    // T1222 File and Directory Permissions Modification
    T1222: {
      hits: [3.2],
      run(t) {
        view.target = [0.9, 3.0]
        view.height = 9.5
        storyState(7)
        // 鍵のかかったファイル。権限を書き換えて鍵を外し、読み書きできるようにする
        const at = [0, 1.7, 2.3]
        const file = documents[0]
        const open = smooth(progress(t, 1.6, 2.2))
        file.visible = true
        if (t < 2.4) {
          file.scale.set(1.6, 1.6, 1.6)
          file.position.set(at[0], at[1], at[2])
        } else {
          flyTo(file, at, aboveHost(2.7), t, 2.4, 3.2, 1.0)
          file.scale.set(1.2, 1.2, 1.2)
        }
        file.rotation.y = 0.6
        padlock.visible = open < 0.98
        padlock.scale.set(0.7, 0.7, 0.7)
        padlock.rotation.set(0, 0.6, open * 1.2)
        padlock.position.set(at[0] + open * 0.9, lerp(at[1] + 1.1, 0.3, open * open), at[2])
        if (t > 0.9 && t < 1.7) stretchBetween(pinkBeams[0], aboveHost(0.8), [at[0], at[1] + 1.1, at[2]], 0.1)
        showAlert(0, -2, 2.6, 5, t, 5.0, 7)
      },
    },
    // T1689 Downgrade Attack
    T1689: {
      hits: [3.3],
      run(t) {
        view.target = [1.2, 6.4]
        view.height = 13
        storyState(7)
        // 入口の守り（盾）を外させ、古くて弱い方式（薄い板）に切り替えさせる
        const down = smooth(progress(t, 1.4, 2.2)) * (1 - smooth(progress(t, 5.4, 6.0)))
        gateGuard.visible = true
        gateGuard.position.set(0, 3.2 + down * 6, 7.15)
        if (down > 0.05) {
          glass.visible = true
          glass.scale.set(2.6, 2.0, 0.1)
          glass.position.set(0, 1.2, 7.05)
          glass.material.opacity = 0.3 * down
        }
        if (t > 0.7 && t < 1.5) stretchBetween(pinkBeams[0], aboveHost(0.9), [0, 3.2, 7.0], 0.1)
        // 弱い方式なら、外からの通信が通り抜けてしまう
        if (t > 2.4 && t < 5.2)
          for (let i = 0; i < 4; i++) {
            const p = ((t - 2.4) * 0.6 + i * 0.25) % 1
            const cube = pinkCubes[i]
            cube.visible = true
            cube.scale.set(0.28, 0.28, 0.28)
            cube.position.set(
              lerp(TOWER_SPOT[0], HOST_SPOT[0], p),
              lerp(2.9, 0.9, p) + Math.sin(Math.PI * p) * 1.2,
              lerp(TOWER_SPOT[1], HOST_SPOT[1], p),
            )
          }
        if (t > 5.6) showCheck(0, 4.7, 7.0, t, 5.8)
      },
    },
    // T1207 Rogue Domain Controller
    T1207: {
      hits: [3.4],
      run(t) {
        view.target = [0.4, 2.4]
        view.height = 10.5
        storyState(7)
        // 本物の管理サーバー（左）のとなりに偽物を立て、仲間どうしのやり取りとして変更を流し込む
        const real = [-1.2, 2.4]
        const rogue = [0.2, 0.9]
        const mark = pinkCubes[0]
        database.visible = true
        database.scale.set(0.9, 0.9, 0.9)
        database.position.set(real[0], 0, real[1])
        database.rotation.y = 0.6
        // 偽物は、信頼されたプログラムの見た目で現れる
        popIn(trustedProcess, rogue[0], 0, rogue[1], t, 1.0, 1.5)
        trustedProcess.rotation.y = 0.6
        trustedProcessEyes.visible = t > 1.2
        if (t > 0.5 && t < 1.2) stretchBetween(pinkBeams[0], aboveHost(0.8), [rogue[0], 0.6, rogue[1]], 0.09)
        if (t > 2.0 && t < 3.2)
          stretchBetween(pinkBeams[1], [rogue[0], 0.8, rogue[1]], [real[0], 1.2, real[1]], 0.09)
        if (t > 3.0 && t < 5.6) {
          const size = 0.4 * overshoot(progress(t, 3.0, 3.3))
          mark.visible = true
          mark.scale.set(size, size, size)
          mark.position.set(real[0], 1.9 + Math.sin(view.time * 4) * 0.06, real[1])
          mark.rotation.y = view.time * 2
        }
        showCross(rogue[0], 2.2, rogue[1], t, 5.4)
      },
    },
    // T1484 Domain or Tenant Policy Modification
    T1484: {
      hits: [3.2],
      run(t) {
        view.target = [0.2, 3.0]
        view.height = 10.5
        storyState(7)
        // 守りの強さは、組織全体の方針（台帳）から配られている。方針のほうを書き換えると、見張りは決まりどおりに手をゆるめる
        const ledger = [-1.4, 2.4]
        const mark = pinkCubes[0]
        const weak = progress(t, 2.4, 3.2)
        database.visible = true
        database.scale.set(0.9, 0.9, 0.9)
        database.position.set(ledger[0], 0, ledger[1])
        database.rotation.y = 0.6
        stretchBetween(
          cyanBeams[0],
          [ledger[0], 1.7, ledger[1]],
          [0.5, lerp(3.3, 0.6, weak * weak), 3.5],
          0.05,
        )
        if (t > 0.6 && t < 1.4)
          stretchBetween(pinkBeams[0], aboveHost(0.8), [ledger[0], 1.6, ledger[1]], 0.09)
        if (t > 1.3 && t < 5.6) {
          const size = 0.4 * overshoot(progress(t, 1.3, 1.6))
          mark.visible = true
          mark.scale.set(size, size, size)
          mark.position.set(ledger[0], 1.95 + Math.sin(view.time * 4) * 0.06, ledger[1])
          mark.rotation.y = view.time * 2
        }
        if (weak > 0) placeSensor(0.5, lerp(3.3, 0.6, weak * weak), 3.5, 0.3 * weak)
        showAlert(0, DEFENDER_SPOT[0], 2.2, DEFENDER_SPOT[1], t, 5.2, 6.6)
      },
    },
    // T1687 Exploitation for Defense Impairment
    T1687: {
      hits: [2.6],
      run(t) {
        view.target = [1.2, 6.4]
        view.height = 13
        storyState(7)
        // 入口を守る機器（盾）にも、弱点はある。そこを突いて、機器ごと落とす
        const guardAt = [0, 3.2, 7.15]
        const exploit = pinkCubes[0]
        const fall = bounce(progress(t, 1.8, 2.6))
        const back = smooth(progress(t, 5.4, 6.0))
        gateGuard.visible = !(t > 1.7 && t < 1.8 + 0.5 && Math.sin(t * 50) > 0)
        gateGuard.position.set(
          guardAt[0] + (t > 1.7 && t < 1.9 ? Math.sin(t * 70) * 0.08 : 0),
          lerp(lerp(3.2, 0.5, fall), 3.2, back),
          7.15 + 1.1 * fall * (1 - back),
        )
        if (t > 0.7 && t < 1.7) {
          flyTo(exploit, aboveHost(0.9), guardAt, t, 0.7, 1.7, 2.0, 8)
          exploit.scale.set(0.34, 0.34, 0.34)
        }
        // 守りがなくなり、外からの通信が通り抜ける
        if (t > 2.6 && t < 5.2)
          for (let i = 1; i < 5; i++) {
            const p = ((t - 2.6) * 0.6 + i * 0.25) % 1
            const cube = pinkCubes[i]
            cube.visible = true
            cube.scale.set(0.28, 0.28, 0.28)
            cube.position.set(
              lerp(TOWER_SPOT[0], HOST_SPOT[0], p),
              lerp(2.9, 0.9, p) + Math.sin(Math.PI * p) * 1.2,
              lerp(TOWER_SPOT[1], HOST_SPOT[1], p),
            )
          }
        if (t > 5.8) showCheck(0, 4.7, 7.0, t, 5.9)
      },
    },
    // T1556 Modify Authentication Process
    T1556: {
      hits: [3.6],
      run(t) {
        view.target = [1.0, 8.8]
        view.height = 15
        storyState(7)
        // 入口の本人確認（門の検査）を書き換え、だれが来ても「通ってよし」と答えるようにする
        const pose = walk(
          [
            [0, ATTACKER_SPOT[0], ATTACKER_SPOT[1]],
            [1.8, ATTACKER_SPOT[0], ATTACKER_SPOT[1]],
            [2.6, 0, 10.8],
            [3.6, 0, 7.9],
            [7, 0, 7.9],
          ],
          t,
        )
        const fixed = t > 1.5 && t < 5.2
        applyPose(attacker, pose)
        view.actor = attacker
        checkpoint.visible = true
        scanPlane.visible = !fixed
        scanPlane.position.set(0, 1.45, 9.3)
        scanPlane.material.opacity = 0.3 + 0.15 * Math.sin(t * 8)
        if (t > 0.7 && t < 1.5) stretchBetween(pinkBeams[0], aboveHost(0.9), [0, 2.6, 9.3], 0.1)
        if (fixed) showCheck(0, 4.3, 9.3, t, 1.5)
        showCross(0, 4.3, 9.3, t, 5.4)
      },
    },
    // T1578 Modify Cloud Compute Infrastructure
    T1578: {
      hits: [3.4],
      run(t) {
        view.target = [-0.6, 2.6]
        view.height = 12
        storyState(7)
        // クラウドの上に、仮の機械をひとつ作る。そこで用を済ませたら、機械ごと消す。あとには何も残らない
        const sky = [-2.6, 5.0, 1.2]
        const spot = [-1.2, 2.3, 1.2]
        const temp = bots[6]
        const size = overshoot(progress(t, 1.0, 1.4)) * (1 - smooth(progress(t, 3.0, 3.4)))
        popIn(cloud, sky[0], sky[1], sky[2], t, 0.1, 1.6)
        cloud.rotation.y = 0.6
        for (let i = 0; i < 2; i++) {
          const machine = bots[4 + i]
          machine.visible = true
          machine.scale.set(0.8, 0.8, 0.8)
          machine.position.set(sky[0] - 1.6 + i * 1.3, 2.3 + Math.sin(view.time * 3 + i) * 0.06, sky[2])
          machine.rotation.y = 0.6
        }
        if (t > 0.5 && t < 1.1) stretchBetween(pinkBeams[0], aboveHost(0.9), spot, 0.08)
        if (size > 0.02) {
          temp.visible = true
          temp.scale.set(size, size, size)
          temp.position.set(spot[0], spot[1], spot[2])
          temp.rotation.y = t * 3
          for (let i = 0; i < 3; i++) {
            const angle = t * 5 + i * 2.09
            const cube = pinkCubes[i]
            cube.visible = t > 1.5 && t < 3.0
            cube.scale.set(0.2, 0.2, 0.2)
            cube.position.set(spot[0] + Math.cos(angle) * 0.9, spot[1] + 0.5, spot[2] + Math.sin(angle) * 0.9)
          }
        }
        // 見張りが調べに来ても、もう何もない
        if (t > 3.6 && t < 6.4) stretchBetween(cyanBeams[0], [0.5, 3.3, 3.5], spot, 0.05)
      },
    },
    // T1666 Modify Cloud Resource Hierarchy
    T1666: {
      hits: [2.8],
      run(t) {
        view.target = [-0.6, 2.6]
        view.height = 12
        storyState(7)
        // クラウドのアカウント（黄色い箱）には、上位の組織から制限と記録がかかっている（水色の線）。所属を組み替えて、その下から抜け出す
        const root = [-2.0, 5.0, 1.4]
        const moved = smooth(progress(t, 1.4, 2.4)) * (1 - smooth(progress(t, 5.4, 6.2)))
        popIn(cloud, root[0], root[1], root[2], t, 0.1, 1.5)
        cloud.rotation.y = 0.6
        yellowCubes.forEach((account, i) => {
          const mine = i === 2
          const at = [
            root[0] - 1.1 + i * 1.1 + (mine ? moved * 2.0 : 0),
            2.4 - (mine ? moved * 0.9 : 0),
            root[2],
          ]
          account.visible = true
          account.material.color.setHex(mine && moved > 0.5 ? 0xff6fd8 : 0xf6c531)
          account.scale.set(0.45, 0.45, 0.45)
          account.position.set(at[0], at[1], at[2])
          account.rotation.y = 0.6
          if (!mine || moved < 0.3) stretchBetween(cyanBeams[i], [root[0], root[1] - 0.6, root[2]], at, 0.05)
        })
        if (t > 0.6 && t < 1.4)
          stretchBetween(pinkBeams[0], aboveHost(0.9), [root[0] + 1.1, 2.4, root[2]], 0.08)
        showAlert(0, DEFENDER_SPOT[0], 2.2, DEFENDER_SPOT[1], t, 5.0, 6.4)
      },
    },
    // T1112 Modify Registry
    T1112: {
      hits: [3.2],
      run(t) {
        view.target = [0.2, 3.0]
        view.height = 10.5
        storyState(7)
        // 守りの機能の「入」「切」は、設定の一覧（箱の列）に書かれている。ひとつずつ「切」に書き換える
        const off = (i: number) => 0.9 + i * 0.6
        const weak = progress(t, off(2) + 0.2, off(2) + 1.0)
        yellowCubes.forEach((setting, i) => {
          const flipped = smooth(progress(t, off(i), off(i) + 0.3))
          setting.visible = true
          setting.material.color.setHex(flipped > 0.5 ? 0x4a4f5c : 0xf6c531)
          setting.scale.set(0.4, 0.4, 0.4)
          setting.position.set(-1.9 + i * 0.75, 1.5 - flipped * 0.6, 2.4)
          setting.rotation.y = 0.6
          if (t > off(i) - 0.3 && t < off(i) + 0.2)
            stretchBetween(pinkBeams[i], aboveHost(0.9), [-1.9 + i * 0.75, 1.5, 2.4], 0.07)
        })
        if (weak > 0) placeSensor(0.5, lerp(3.3, 0.25, weak * weak), 3.5, 0.5 * weak)
      },
    },
    // T1601 Modify System Image
    T1601: {
      hits: [3.0],
      run(t) {
        view.target = [0.2, 3.0]
        view.height = 10.5
        storyState(7)
        // ネットワーク機器を動かしているOS（上に載った紙）を、細工したものに差し替える。機器は、攻撃者の都合どおりに動くようになる
        const device = [-1.2, 2.6]
        const original = documents[0]
        const patched = pinkCubes[0]
        const out = smooth(progress(t, 1.4, 2.2))
        relayBot.visible = true
        relayBot.scale.set(1.3, 1.3, 1.3)
        relayBot.position.set(device[0], 0, device[1])
        relayBot.rotation.y = t > 2.4 && t < 3.0 ? t * 10 : 0.6
        original.visible = out < 0.98
        original.scale.set(0.9, 0.9, 0.9)
        original.position.set(device[0] - out * 1.6, lerp(2.2, 0.4, out * out), device[1])
        original.rotation.set(0, 0.6, out * 1.2)
        if (t > 0.6) {
          flyTo(patched, aboveHost(0.9), [device[0], 2.2, device[1]], t, 0.8, 2.2, 1.4, 6)
          patched.scale.set(0.4, 0.4, 0.4)
          if (t >= 2.2) patched.rotation.y = view.time * 2
        }
        if (t > 3.0 && t < 5.2)
          stretchBetween(pinkBeams[0], aboveHost(0.9), [device[0], 1.0, device[1]], 0.07)
        showAlert(0, DEFENDER_SPOT[0], 2.2, DEFENDER_SPOT[1], t, 5.2, 6.6)
      },
    },
    // T1599 Network Boundary Bridging
    T1599: {
      hits: [3.2],
      run(t) {
        view.target = [1.6, -1.6]
        view.height = 16
        storyState(7)
        // 区画を分けている壁。その境目の機器を乗っ取って設定を変えると、止められていたはずの通信が通るようになる
        const edge = [2.4, 0.9, -0.7]
        const down = smooth(progress(t, 1.6, 2.4)) * (1 - smooth(progress(t, 5.4, 6.2)))
        segmentWall.visible = true
        segmentWall.position.y = 1.5 - down * 2.9
        relayBot.visible = true
        relayBot.scale.set(1.1, 1.1, 1.1)
        relayBot.position.set(edge[0], 0, edge[2])
        relayBot.rotation.y = 0.6
        if (t > 0.6 && t < 1.6) stretchBetween(pinkBeams[0], aboveHost(0.9), edge, 0.09)
        if (t > 2.4 && t < 5.2)
          for (let i = 0; i < 4; i++) {
            const p = ((t - 2.4) * 0.6 + i * 0.25) % 1
            const cube = pinkCubes[i]
            cube.visible = true
            cube.scale.set(0.28, 0.28, 0.28)
            cube.position.set(lerp(0.2, 4.8, p), 1.0 + Math.sin(Math.PI * p) * 0.4, -3.6)
          }
        showAlert(0, DEFENDER_SPOT[0], 2.2, DEFENDER_SPOT[1], t, 5.0, 6.4)
      },
    },
    // T1647 Plist File Modification
    T1647: {
      hits: [3.2],
      run(t) {
        view.target = [0.4, 3.0]
        view.height = 10.5
        storyState(7)
        // アプリの動き方を決めている設定ファイル（紙）。書き換えると、攻撃者のアプリ（小さな機械）は画面に現れずに動くようになる
        const app = [-0.9, 2.5]
        const sheet = documents[0]
        const mine = bots[6]
        const hidden = smooth(progress(t, 2.2, 3.0)) * (1 - smooth(progress(t, 5.6, 6.2)))
        mine.visible = true
        mine.scale.set(1, lerp(1, 0.08, hidden), 1)
        mine.position.set(app[0], 0, app[1])
        mine.rotation.y = 0.6
        sheet.visible = true
        sheet.scale.set(1.1, 1.1, 1.1)
        sheet.position.set(app[0], 2.3, app[1])
        sheet.rotation.set(0, 0.6 + smooth(progress(t, 1.3, 2.0)) * Math.PI, 0)
        if (t > 0.6 && t < 1.5) stretchBetween(pinkBeams[0], aboveHost(0.9), [app[0], 2.3, app[1]], 0.08)
        if (t > 1.6 && t < 5.6) {
          const stain = pinkCubes[0]
          stain.visible = true
          stain.scale.set(0.2, 0.2, 0.2)
          stain.position.set(app[0] + 0.3, 2.7, app[1] + 0.1)
        }
        // 見張りが見ても、何も動いていないように見える
        if (t > 3.2 && t < 5.6) stretchBetween(cyanBeams[0], [0.5, 3.3, 3.5], [app[0], 0.4, app[1]], 0.05)
      },
    },
    // T1600 Weaken Encryption
    T1600: {
      hits: [3.4],
      run(t) {
        view.target = [0.6, 3.2]
        view.height = 11.5
        storyState(7)
        // 通信は、途中の機器が暗号（錠）で守っている。機器に手を入れて暗号を弱めると、中身が読めるようになる
        const device = [-0.8, 2.2]
        const from = [3.5, 1.2, 4.4]
        const to = [-3.5, 1.2, 2.9]
        const off = smooth(progress(t, 1.5, 2.2)) * (1 - smooth(progress(t, 5.4, 6.0)))
        relayBot.visible = true
        relayBot.scale.set(1.2, 1.2, 1.2)
        relayBot.position.set(device[0], 0, device[1])
        relayBot.rotation.y = 0.6
        stretchBetween(cyanBeams[0], from, [device[0], 1.2, device[1]], 0.06)
        stretchBetween(cyanBeams[1], [device[0], 1.2, device[1]], to, 0.06)
        padlock.visible = true
        padlock.scale.set(0.7, 0.7, 0.7)
        padlock.rotation.set(0, 0.6, off * 1.2)
        padlock.position.set(device[0] + off * 0.9, lerp(2.4, 0.3, off * off), device[1])
        if (t > 0.7 && t < 1.5)
          stretchBetween(pinkBeams[0], aboveHost(0.9), [device[0], 1.2, device[1]], 0.09)
        for (let i = 0; i < 2; i++) {
          const start = 2.4 + i * 0.6
          if (t < start || t > 5.4) continue
          const page = documents[i]
          const size = 0.8 * overshoot(progress(t, start, start + 0.3))
          flyTo(
            page,
            [device[0], 1.8, device[1]],
            aboveHost(2.6 + i * 0.6),
            t,
            start + 0.2,
            start + 1.0,
            0.9,
            5,
          )
          page.scale.set(size, size, size)
          if (t >= start + 1.0) page.rotation.y = 0.6
        }
      },
    },
  }
}
