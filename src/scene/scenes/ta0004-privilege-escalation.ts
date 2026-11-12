// TA0004 権限昇格（Privilege Escalation）の場面。
import type { Kit } from '../kit'
import { progress, smooth, lerp, overshoot, walk, applyPose, arcBetween, stretchBetween } from '../motion'
import type { SceneMap } from './types'

export default function privilegeEscalation(kit: Kit): SceneMap {
  const {
    token,
    glass,
    pinkBeams,
    checkpoint,
    scanPlane,
    HOST_SPOT,
    MALWARE_SIZE,
    ADMIN_MALWARE_SIZE,
    malware,
    crown,
    stairs,
    trustedProcess,
    trustedProcessEyes,
    view,
    placeMalware,
    bobHeight,
    storyState,
    aboveHost,
    flyTo,
    showCross,
    jumpMalware,
    documents,
    database,
    impostor,
    standing,
    employees,
    cyanBeams,
    pinkCubes,
    hopInPlace,
    showAlert,
    key,
    hammer,
    bots,
    yellowCubes,
    clock,
    clockHand,
    showCheck,
    DEFENDER_SPOT,
    showRipples,
    defenderApproves,
    defenderLocks,
    defenderScans,
    defenderSendsSensor,
  } = kit
  return {
    // T1068 Exploitation for Privilege Escalation（本編）
    T1068: {
      hits: [3.8],
      run(t) {
        view.target = [0.4, 2.4]
        view.height = 10.5
        storyState(5) // Privilege Escalation
        stairs.visible = true
        stairs.scale.y = Math.max(0.01, overshoot(progress(t, 0.2, 0.7)))
        const points = [
            [HOST_SPOT[0], 0, HOST_SPOT[1]],
            [0.9, 0.5, 3.0],
            [0.1, 1.0, 3.0],
            [-0.7, 1.5, 3.0],
          ],
          T0 = [0.9, 1.8, 2.7]
        let pos: number[] | null = points[0]
        malware.rotation.y = -0.9
        for (let i = 0; i < 3; i++) {
          if (t >= T0[i]) {
            const p = progress(t, T0[i], T0[i] + 0.7)
            arcBetween(malware, points[i], points[i + 1], smooth(p), 0.8)
            pos = null
          }
        }
        if (pos) malware.position.set(pos[0], pos[1] + bobHeight(), pos[2])
        if (t > 3.4) {
          malware.rotation.y = 0.6
          crown.visible = t > 3.6
          const size = lerp(MALWARE_SIZE, ADMIN_MALWARE_SIZE, overshoot(progress(t, 3.6, 4.0)))
          malware.scale.set(size, size, size)
          malware.position.y = 1.5 + bobHeight()
        }
        defenderApproves(t, [0.1, 2.0, 3.0])
      },
    },
    // T1548 Abuse Elevation Control Mechanism
    T1548: {
      hits: [3.8],
      run(t) {
        view.target = [0.6, 2.8]
        view.height = 10.5
        storyState(5) // Abuse Elevation Control Mechanism
        checkpoint.visible = true
        checkpoint.position.set(0.3, 0, 3.0)
        checkpoint.rotation.y = Math.PI / 2
        checkpoint.scale.set(0.6, 0.6, 0.6)
        scanPlane.visible = true
        scanPlane.position.set(0.3, 0.95, 3.0)
        scanPlane.rotation.y = Math.PI / 2
        scanPlane.scale.set(2.2, 1.7, 0.08)
        scanPlane.material.opacity = 0.3 + 0.2 * Math.sin(t * 10)
        applyPose(
          malware,
          walk(
            [
              [0, HOST_SPOT[0], HOST_SPOT[1]],
              [0.6, HOST_SPOT[0], HOST_SPOT[1]],
              [1.1, 1.3, 3.0],
              [1.8, 1.3, 3.0],
              [2.4, 1.0, 0.9],
              [3.0, -0.6, 0.9],
              [3.6, -1.0, 3.0],
              [7, -1.0, 3.0],
            ],
            t,
          ),
        )
        malware.scale.multiplyScalar(lerp(MALWARE_SIZE, ADMIN_MALWARE_SIZE, overshoot(progress(t, 3.7, 4.1))))
        crown.visible = t > 3.7
        if (t >= 3.6) malware.rotation.y = 0.6
        if (t > 5.0) {
          glass.visible = true
          glass.rotation.y = Math.PI / 2
          glass.scale.set(1.6, 1.8, 0.12)
          glass.position.set(0.3, 0.9, 1.0)
          glass.material.opacity = 0.55 * smooth(progress(t, 5.0, 5.5))
        }
      },
    },
    // T1134 Access Token Manipulation
    T1134: {
      hits: [3.2],
      run(t) {
        view.target = [0.8, 2.8]
        view.height = 10
        storyState(5) // Access Token Manipulation
        const ux = -0.8,
          uz = 2.6
        // 高い権限で動いている正規のプロセス。その頭上のトークンを盗む
        trustedProcess.visible = true
        trustedProcess.scale.set(1.6, 1.6, 1.6)
        trustedProcess.position.set(ux, 0, uz)
        trustedProcess.rotation.y = 0.6
        trustedProcessEyes.visible = false
        if (t > 0.7 && t < 1.6) stretchBetween(pinkBeams[0], aboveHost(0.8), [ux, 1.0, uz], 0.08)
        if (t < 3.0) {
          flyTo(token, [ux, 2.4, uz], aboveHost(2.2), t, 1.6, 2.8, 1.2, 5)
          if (t < 1.6) {
            token.position.y += Math.sin(t * 4) * 0.08
            token.rotation.y = t * 2
          }
        } else {
          crown.visible = true
          const size = lerp(MALWARE_SIZE, ADMIN_MALWARE_SIZE, overshoot(progress(t, 3.0, 3.4)))
          malware.scale.set(size, size, size)
        }
        defenderSendsSensor(t, trustedProcess)
      },
    },
    // T1055 Process Injection
    T1055: {
      hits: [2.8],
      run(t) {
        view.target = [0.8, 2.8]
        view.height = 9.5
        storyState(5) // Process Injection
        const px = -0.4,
          pz = 2.6
        trustedProcess.visible = true
        trustedProcess.scale.set(ADMIN_MALWARE_SIZE, ADMIN_MALWARE_SIZE, ADMIN_MALWARE_SIZE)
        trustedProcess.position.set(
          px,
          t > 2.6 ? Math.abs(Math.sin((t - 2.6) * 6)) * 0.2 * (1 - progress(t, 2.6, 3.6)) : 0,
          pz,
        )
        trustedProcess.rotation.y = 0.6
        trustedProcessEyes.visible = t > 2.6 && t < 5.6
        // ねらいを付ける
        if (t > 0.5 && t < 1.4) stretchBetween(pinkBeams[0], aboveHost(0.8), [px, 1.0, pz], 0.08)
        if (t >= 1.4 && t < 2.6) {
          const p = smooth(progress(t, 1.4, 2.6))
          placeMalware(
            lerp(HOST_SPOT[0], px, p),
            Math.sin(Math.PI * p) * 1.6 + 0.4 * p,
            lerp(HOST_SPOT[1], pz, p),
            MALWARE_SIZE * (1 - 0.85 * p),
          )
        }
        if (t >= 2.6) {
          placeMalware(0, 0, 0, 0)
          view.actor = trustedProcess
        }
        showCross(px, 2.7, pz, t, 5.6)
      },
    },
    // T1611 Escape to Host
    T1611: {
      hits: [3.2],
      run(t) {
        view.target = [1.0, 3.0]
        view.height = 9.5
        storyState(5) // Escape to Host
        glass.visible = true
        glass.scale.set(1.7, 1.7, 1.7)
        glass.position.set(HOST_SPOT[0], 0.86, HOST_SPOT[1])
        glass.material.opacity = t > 2.2 && t < 2.9 && Math.sin(t * 40) > 0 ? 0.12 : 0.4
        if (t < 2.2) malware.position.x = HOST_SPOT[0] + Math.sin(t * 9) * 0.25 * progress(t, 0.6, 1.0)
        else {
          jumpMalware(
            t,
            2.2,
            3.0,
            aboveHost(0),
            [-0.2, 0, 2.8],
            1.4,
            lerp(MALWARE_SIZE, ADMIN_MALWARE_SIZE, overshoot(progress(t, 3.1, 3.5))),
          )
          crown.visible = t > 3.1
        }
        defenderLocks(t, glass)
      },
    },
    // T1484 Domain or Tenant Policy Modification
    T1484: {
      hits: [3.4],
      run(t) {
        view.target = [0.4, 2.6]
        view.height = 11
        storyState(5)
        // 組織全体の決まり（ポリシー）を収めた台帳を書き換え、自分に強い権限が配られるようにする
        const book = [-1.0, 2.2]
        const rule = documents[0]
        database.visible = true
        database.scale.set(0.9, 0.9, 0.9)
        database.position.set(book[0], 0, book[1])
        database.rotation.y = 0.6
        rule.visible = true
        rule.scale.set(1.2, 1.2, 1.2)
        rule.position.set(book[0], 2.2 + Math.sin(view.time * 3) * 0.05, book[1])
        rule.rotation.set(0, 0.6 + smooth(progress(t, 1.6, 2.4)) * Math.PI * 2, 0)
        if (t > 0.8 && t < 1.7) stretchBetween(pinkBeams[0], aboveHost(0.8), [book[0], 2.2, book[1]], 0.09)
        // 書き換えられた決まりが、こんどは正規の仕組みとして配られてくる
        if (t > 2.4 && t < 3.2) stretchBetween(pinkBeams[1], [book[0], 2.2, book[1]], aboveHost(1.6), 0.07)
        if (t > 3.0) {
          const size = lerp(MALWARE_SIZE, ADMIN_MALWARE_SIZE, overshoot(progress(t, 3.0, 3.4)))
          crown.visible = true
          malware.scale.set(size, size, size)
        }
        showCross(book[0], 3.3, book[1], t, 5.4)
      },
    },
    // T1098 Account Manipulation
    T1098: {
      hits: [3.4],
      run(t) {
        view.target = [0.4, 2.4]
        view.height = 10.5
        storyState(5)
        // 攻撃者が使えるアカウント（人形）に、管理者の役割（水色の札）を付け足す
        const who = [-1.6, 1.6]
        const roles = [-0.2, 0.9]
        impostor.visible = true
        applyPose(impostor, standing(who[0], who[1], 0.6))
        database.visible = true
        database.scale.set(0.8, 0.8, 0.8)
        database.position.set(roles[0], 0, roles[1])
        database.rotation.y = 0.6
        if (t > 0.7 && t < 1.5) stretchBetween(pinkBeams[0], aboveHost(0.8), [roles[0], 1.0, roles[1]], 0.09)
        if (t > 1.3) {
          flyTo(token, [roles[0], 1.7, roles[1]], [who[0], 2.4, who[1]], t, 1.6, 2.6, 1.2, 5)
          if (t >= 2.6) token.rotation.y = view.time * 2
        }
        // 役割を得たアカウントの権限を、マルウェアが使う
        if (t > 2.7 && t < 3.3) stretchBetween(pinkBeams[1], [who[0], 1.2, who[1]], aboveHost(1.4), 0.07)
        if (t > 3.0) {
          const size = lerp(MALWARE_SIZE, ADMIN_MALWARE_SIZE, overshoot(progress(t, 3.0, 3.4)))
          crown.visible = true
          malware.scale.set(size, size, size)
        }
        showCross(who[0], 3.4, who[1], t, 5.4)
      },
    },
    // T1546 Event Triggered Execution
    T1546: {
      hits: [3.6],
      run(t) {
        view.target = [1.0, 3.0]
        view.height = 10
        storyState(5)
        // 高い権限のプログラムは、決まった出来事に反応して動く。その反応先に、自分のコードを結び付けておく
        const px = -0.6
        const pz = 2.4
        const hook = pinkCubes[0]
        trustedProcess.visible = true
        trustedProcess.scale.set(1.5, 1.5, 1.5)
        trustedProcess.position.set(
          px,
          t > 2.6 && t < 3.2 ? Math.abs(Math.sin((t - 2.6) * 10)) * 0.25 : 0,
          pz,
        )
        trustedProcess.rotation.y = 0.6
        trustedProcessEyes.visible = false
        flyTo(hook, aboveHost(1.2), [px + 0.75, 0.6, pz], t, 0.5, 1.4, 1.2, 6)
        hook.scale.set(0.3, 0.3, 0.3)
        // 出来事（従業員の操作）が起きると…
        showAlert(0, 3.5, 2.2, 3.5, t, 1.8, 2.6)
        hopInPlace(employees[2], t, 1.8, 2.4, 0.15)
        if (t > 2.2 && t < 2.8) stretchBetween(cyanBeams[0], [3.5, 1.2, 3.6], [px, 1.0, pz], 0.06)
        // …プログラムが反応し、その権限で結び付けたコードが動く
        if (t > 2.8 && t < 3.4) stretchBetween(pinkBeams[0], [px + 0.75, 0.6, pz], aboveHost(1.0), 0.08)
        if (t > 3.2) {
          const size = lerp(MALWARE_SIZE, ADMIN_MALWARE_SIZE, overshoot(progress(t, 3.2, 3.6)))
          crown.visible = true
          malware.scale.set(size, size, size)
        }
        defenderLocks(t, trustedProcess)
      },
    },
    // T1547 Boot or Logon Autostart Execution
    T1547: {
      hits: [3.6],
      run(t) {
        view.target = [0.4, 2.6]
        view.height = 10.5
        storyState(5)
        // 起動のたびに、高い権限で順番に立ち上がるもの（黄色い箱の列）。その列の最後に、自分を並べておく
        const slot = (i: number) => [-1.6 + i * 0.7, 1.3, 2.4]
        const mine = pinkCubes[0]
        const boot = 2.4
        yellowCubes.forEach((cube, i) => {
          const at = slot(i)
          cube.visible = true
          cube.material.color.setHex(0xf6c531)
          cube.scale.set(0.38, 0.38, 0.38)
          const started = boot + i * 0.3
          const hop = t > started && t < started + 0.35 ? Math.abs(Math.sin((t - started) * 9)) * 0.5 : 0
          cube.position.set(at[0], at[1] + hop, at[2])
        })
        if (t > 0.6) {
          flyTo(mine, aboveHost(0.9), slot(3), t, 0.6, 1.6, 1.0, 6)
          mine.scale.set(0.38, 0.38, 0.38)
          if (t > boot + 0.9 && t < boot + 1.25)
            mine.position.y += Math.abs(Math.sin((t - boot - 0.9) * 9)) * 0.5
        }
        // 起動の合図
        if (t > boot - 0.4 && t < boot + 1.2) showRipples(-0.6, 2.4, (t - boot + 0.4) * 0.9, 6)
        if (t > boot + 1.1) {
          const size = lerp(MALWARE_SIZE, ADMIN_MALWARE_SIZE, overshoot(progress(t, boot + 1.1, boot + 1.5)))
          crown.visible = true
          malware.scale.set(size, size, size)
        }
        defenderScans(t, yellowCubes[0], pinkCubes[0])
      },
    },
    // T1037 Boot or Logon Initialization Scripts
    T1037: {
      hits: [3.6],
      run(t) {
        view.target = [0.2, 2.6]
        view.height = 10.5
        storyState(5)
        // 高い権限のプログラムが、起動のときに読み上げる手順書。そこへ、自分の一行を書き足す
        const script = documents[0]
        const page = [-1.0, 1.7, 3.3]
        const line = pinkCubes[0]
        script.visible = true
        script.scale.set(1.6, 1.6, 1.6)
        script.position.set(page[0], page[1], page[2])
        script.rotation.y = 0.6
        trustedProcess.visible = true
        trustedProcess.scale.set(1.5, 1.5, 1.5)
        trustedProcess.position.set(-2.2, 0, 2.6)
        trustedProcess.rotation.y = 0.9
        if (t > 0.6) {
          flyTo(line, aboveHost(0.9), [page[0] + 0.05, page[1] - 0.45, page[2] + 0.12], t, 0.6, 1.5, 0.8)
          line.scale.set(0.5, 0.09, 0.09)
          line.rotation.y = 0.6
        }
        // 読み上げる
        if (t > 2.2 && t < 3.4)
          stretchBetween(
            cyanBeams[0],
            [-2.2, 1.0, 2.6],
            [page[0], lerp(page[1] + 0.5, page[1] - 0.45, progress(t, 2.2, 3.2)), page[2]],
            0.06,
          )
        if (t > 3.2 && t < 3.8) stretchBetween(pinkBeams[0], [-2.2, 1.0, 2.6], aboveHost(0.8), 0.08)
        if (t > 3.4) {
          const size = lerp(MALWARE_SIZE, ADMIN_MALWARE_SIZE, overshoot(progress(t, 3.4, 3.8)))
          crown.visible = true
          malware.scale.set(size, size, size)
        }
        defenderLocks(t, documents[0])
      },
    },
    // T1543 Create or Modify System Process
    T1543: {
      hits: [3.8],
      run(t) {
        view.target = [0.2, 2.6]
        view.height = 10.5
        storyState(5)
        // システムの権限で動くサービス（奥の列）。その並びに、自分のサービスを作って加える
        const spot = [-0.2, 2.4]
        const mine = bots[6]
        for (let i = 0; i < 2; i++) {
          const service = bots[4 + i]
          service.visible = true
          service.scale.set(1, 1, 1)
          service.position.set(-2.6 + i * 1.2, Math.abs(Math.sin(view.time * 4 + i)) * 0.08, 2.4)
          service.rotation.y = 0.6
        }
        if (t > 0.5 && t < 2.4) {
          hammer.visible = true
          hammer.position.set(spot[0] + 0.8, 0.9, spot[1] + 0.3)
          hammer.rotation.z = 0.3 + Math.abs(Math.cos(((t - 0.5) * Math.PI) / 0.6))
        }
        if (t > 0.9) {
          const built = t < 2.4 ? progress(t, 0.9, 2.4) * 0.9 + 0.1 : 1
          mine.visible = true
          mine.scale.set(1, built, 1)
          mine.position.set(spot[0], 0, spot[1])
          mine.rotation.y = 0.6
        }
        if (t > 2.8) {
          jumpMalware(
            t,
            2.8,
            3.6,
            aboveHost(0),
            [spot[0], 1.15, spot[1]],
            1.0,
            lerp(MALWARE_SIZE, ADMIN_MALWARE_SIZE, overshoot(progress(t, 3.6, 4.0))),
          )
          crown.visible = t > 3.6
        }
        defenderScans(t, bots[4], bots[6])
      },
    },
    // T1053 Scheduled Task/Job
    T1053: {
      hits: [3.6],
      run(t) {
        view.target = [0.2, 2.6]
        view.height = 10.5
        storyState(5)
        // 高い権限のプログラムが、時刻になると予約された処理を動かす。その予約に、自分の処理を入れておく
        const turns = progress(t, 1.8, 3.2)
        const job = pinkCubes[0]
        const tray = [-1.0, 1.0, 2.5]
        trustedProcess.visible = true
        trustedProcess.scale.set(1.5, 1.5, 1.5)
        trustedProcess.position.set(-2.2, 0, 2.6)
        trustedProcess.rotation.y = 0.9
        clock.visible = true
        clock.scale.set(0.9, 0.9, 0.9)
        clock.position.set(-2.2, 2.6, 2.6)
        clock.rotation.y = 0.6
        clockHand.rotation.z = Math.PI / 2 - turns * (Math.PI / 2)
        if (t > 0.5) {
          flyTo(job, aboveHost(0.9), tray, t, 0.5, 1.4, 0.9, 6)
          job.scale.set(0.34, 0.34, 0.34)
        }
        // 時刻が来ると、高い権限の側が取り上げて動かす
        if (t > 3.2) {
          stretchBetween(cyanBeams[0], [-2.2, 1.0, 2.6], tray, 0.07)
          job.position.y = tray[1] + Math.abs(Math.sin((t - 3.2) * 8)) * 0.3
          job.rotation.y = t * 6
        }
        if (t > 3.4) {
          const size = lerp(MALWARE_SIZE, ADMIN_MALWARE_SIZE, overshoot(progress(t, 3.4, 3.8)))
          crown.visible = true
          malware.scale.set(size, size, size)
        }
      },
    },
    // T1078 Valid Accounts
    T1078: {
      hits: [3.4],
      run(t) {
        view.target = [0.4, 2.8]
        view.height = 10.5
        storyState(5)
        // 管理者の正規のアカウント（鍵）を手に入れた。弱点を突かなくても、正面の門を鍵で開けて通れる
        const pose = walk(
          [
            [0, HOST_SPOT[0], HOST_SPOT[1]],
            [1.2, HOST_SPOT[0], HOST_SPOT[1]],
            [2.4, 0.9, 3.0],
            [3.2, -1.2, 3.0],
            [7, -1.2, 3.0],
          ],
          t,
        )
        checkpoint.visible = true
        checkpoint.position.set(0.1, 0, 3.0)
        checkpoint.rotation.y = Math.PI / 2
        checkpoint.scale.set(0.6, 0.6, 0.6)
        applyPose(malware, pose)
        malware.scale.multiplyScalar(lerp(MALWARE_SIZE, ADMIN_MALWARE_SIZE, overshoot(progress(t, 3.3, 3.7))))
        crown.visible = t > 3.3
        if (t >= 3.2) malware.rotation.y = 0.6
        if (t < 3.3) {
          flyTo(key, [3.4, 3.4, 4.2], [pose.x, 1.5, pose.z], t, 0.2, 1.1, 0.6, 6)
          if (t >= 1.1) key.rotation.y = 0.6
        }
        showCheck(-0.9, 2.9, 3.0, t, 2.5)
        showAlert(0, DEFENDER_SPOT[0], 2.2, DEFENDER_SPOT[1], t, 5.4, 6.8)
      },
    },
  }
}
