// TA0007 探索（Discovery）の場面。
import type { Kit } from '../kit'
import { progress, lerp, overshoot, stretchBetween, smooth, bounce } from '../motion'
import type { SceneMap } from './types'

export default function discovery(kit: Kit): SceneMap {
  const {
    employees,
    key,
    pinkBeams,
    drones,
    RACK_Z,
    racks,
    HOST_SPOT,
    rackMarks,
    pinkCubes,
    attackerScan,
    pulseRings,
    documents,
    database,
    trustedProcess,
    trustedProcessEyes,
    view,
    storyState,
    aboveHost,
    popIn,
    showAlert,
    scanPlane,
    flyTo,
    glass,
    clock,
    clockHand,
    token,
    hammer,
    bots,
    cyanBeams,
    relayBot,
    malware,
    implant,
    spareKeys,
    yellowCubes,
    padlock,
    cloud,
    showCheck,
    hopInPlace,
    probeFromHost,
    takeNote,
    DEFENDER_SPOT,
  } = kit
  return {
    // T1046 Network Service Discovery（本編）
    T1046: {
      hits: [3.5],
      run(t) {
        view.target = [0, -0.5]
        view.height = 15.5
        storyState(9) // Discovery
        if (t < 4.6)
          pulseRings.forEach((ring, j) => {
            const ph = (t * 0.55 + j * 0.5) % 1,
              scale = 1 + ph * 26
            ring.visible = true
            ring.scale.set(scale, 0.02, scale)
            ring.position.set(HOST_SPOT[0], 0.08, HOST_SPOT[1])
            ring.material.opacity = 0.5 * (1 - ph)
          })
        rackMarks.forEach((m, i) => {
          const start = 1.4 + i * 0.35
          if (t < start) return
          m.visible = true
          const size = (i === 2 ? 0.6 : 0.35) * overshoot(progress(t, start, start + 0.3))
          m.scale.set(size, size, size)
          m.position.y = 3.7 + Math.sin(view.time * 4 + i) * 0.08
          m.rotation.y = view.time * 2
        })
      },
    },
    // T1087 Account Discovery
    T1087: {
      hits: [2.9],
      run(t) {
        view.target = [0, 3.2]
        view.height = 12.5
        storyState(9) // Account Discovery
        const D0 = [0.2, 2.0]
        popIn(database, D0[0], 0, D0[1], t, 0.3, 0.8)
        database.rotation.y = 0.6 // the directory that lists every account
        if (t > 0.5 && t < 1.0) stretchBetween(pinkBeams[4], aboveHost(0.9), [D0[0], 0.9, D0[1]], 0.08)
        employees.forEach((employee, i) => {
          const seat = employee.position,
            start = 1.0 + i * 0.45
          if (t < start) return
          const size = overshoot(progress(t, start, start + 0.3)),
            y = Math.sin(view.time * 4 + i) * 0.08
          if (t < start + 0.4) stretchBetween(pinkBeams[i], [D0[0], 1.2, D0[1]], [seat.x, 1.6, seat.z], 0.05)
          if (i === 1) {
            key.visible = true
            key.scale.set(0.8 * size, 0.8 * size, 0.8 * size)
            key.position.set(seat.x, 2.8 + y, seat.z)
            key.rotation.y = view.time * 2
          } else {
            const cube = pinkCubes[i]
            cube.visible = true
            cube.scale.set(0.34 * size, 0.34 * size, 0.34 * size)
            cube.position.set(seat.x, 2.4 + y, seat.z)
            cube.rotation.y = view.time * 2
          }
        })
      },
    },
    // T1083 File and Directory Discovery
    T1083: {
      hits: [3.6],
      run(t) {
        view.target = [0, 3.4]
        view.height = 12.5
        storyState(9) // File and Directory Discovery
        const sx = lerp(7.5, -7.5, progress(t, 0.6, 3.4))
        if (t > 0.6 && t < 3.4) {
          attackerScan.visible = true
          attackerScan.scale.set(0.5, 1.8, 3.4)
          attackerScan.position.set(sx, 1.1, 3.4)
          attackerScan.material.opacity = 0.35 + 0.2 * Math.sin(t * 20)
        }
        employees.forEach((employee, i) => {
          const seat = employee.position
          popIn(
            documents[i],
            seat.x,
            2.3 + Math.sin(view.time * 4 + i) * 0.08,
            seat.z + 0.6,
            t,
            0.6 + ((7.5 - seat.x) / 15) * 2.8,
          )
          documents[i].rotation.y = 0.6
        })
        showAlert(0, -6, 3.1, 4.1, t, 3.5, 4.6)
      },
    },
    // T1018 Remote System Discovery
    T1018: {
      hits: [3.5],
      run(t) {
        view.target = [0, 1.5]
        view.height = 15
        storyState(9) // Remote System Discovery
        employees
          .map((employee) => [employee.position.x, 0.9, employee.position.z + 0.9])
          .concat([
            [racks[2].x, 1.2, RACK_Z + 0.6],
            [racks[3].x, 1.2, RACK_Z + 0.6],
          ])
          .forEach((p, i) => {
            const start = 0.6 + i * 0.45
            if (t > start && t < start + 0.4) stretchBetween(pinkBeams[i], aboveHost(1.0), p, 0.06)
            if (t > start + 0.3) {
              const cube = pinkCubes[i],
                size = 0.3 * overshoot(progress(t, start + 0.3, start + 0.6))
              cube.visible = true
              cube.scale.set(size, size, size)
              cube.position.set(p[0], p[1] + 1.6 + Math.sin(view.time * 4 + i) * 0.08, p[2])
              cube.rotation.y = view.time * 2
            }
          })
      },
    },
    // T1057 Process Discovery
    T1057: {
      hits: [3.6],
      run(t) {
        view.target = [1.6, 3.0]
        view.height = 9.5
        storyState(9) // Process Discovery
        const ang = t * 2.2,
          th = 6.0
        if (t > 0.5 && t < 3.6) {
          attackerScan.visible = true
          attackerScan.scale.set(0.15, 1.2, 1.7)
          attackerScan.position.set(
            HOST_SPOT[0] + Math.sin(ang) * 0.95,
            0.7,
            HOST_SPOT[1] + Math.cos(ang) * 0.95,
          )
          attackerScan.rotation.y = ang
          attackerScan.material.opacity = 0.4
        }
        ;[0, 1, 3, 4].forEach((di, j) => {
          const drone = drones[di],
            size = 0.7 * overshoot(progress(t, 0.8 + j * 0.6, 1.1 + j * 0.6)),
            q = 1.0 + j * 1.25
          drone.visible = size > 0.01
          drone.scale.set(size, size, size)
          drone.rotation.set(0, 0, 0)
          drone.position.set(
            HOST_SPOT[0] + Math.sin(q) * 1.9,
            0.9 + Math.sin(view.time * 3 + j) * 0.08,
            HOST_SPOT[1] + Math.cos(q) * 1.9,
          )
          drone.userData.rot.rotation.y = view.time * 20
        })
        popIn(
          trustedProcess,
          HOST_SPOT[0] + Math.sin(th) * 1.9,
          0,
          HOST_SPOT[1] + Math.cos(th) * 1.9,
          t,
          3.2,
          1.3,
        )
        trustedProcess.rotation.y = 0.6
        trustedProcessEyes.visible = false
        showAlert(0, trustedProcess.position.x, 2.0, trustedProcess.position.z, t, 3.7, 4.6)
      },
    },
    // T1082 System Information Discovery
    T1082: {
      hits: [3.4],
      run(t) {
        view.target = [2.2, 3.4]
        view.height = 9.5
        storyState(9)
        // 入り込んだ端末そのものを調べ、OSや機器の構成を書き出す
        const pc = [3.5, 1.0, 4.4]
        if (t > 0.6 && t < 2.8) {
          scanPlane.visible = true
          scanPlane.scale.set(1.8, 1.6, 0.08)
          scanPlane.position.set(pc[0], pc[1] + 0.2, lerp(5.2, 3.6, (progress(t, 0.6, 2.8) * 2) % 1))
          scanPlane.material.opacity = 0.4
        }
        documents.slice(0, 3).forEach((doc, i) => {
          const start = 1.2 + i * 0.6
          if (t < start) return
          const size = 0.8 * overshoot(progress(t, start, start + 0.3))
          flyTo(
            doc,
            [pc[0], 1.6, pc[2]],
            [HOST_SPOT[0] - 0.7 + i * 0.7, 2.7 + (i & 1) * 0.4, HOST_SPOT[1]],
            t,
            start + 0.2,
            start + 1.0,
            1.0,
            5,
          )
          doc.scale.set(size, size, size)
          if (t >= start + 1.0) doc.rotation.y = 0.6
        })
      },
    },
    // T1069 Permission Groups Discovery
    T1069: {
      hits: [3.0],
      run(t) {
        view.target = [-1.0, 2.2]
        view.height = 12.5
        storyState(9)
        // だれがどの権限のグループに入っているかを調べる。左の二人が管理者のグループ（囲み）
        const a = employees[0].position
        const b = employees[1].position
        const middle = [(a.x + b.x) / 2, (a.z + b.z) / 2]
        const shown = smooth(progress(t, 1.0, 1.6))
        if (t > 0.5 && t < 1.1) stretchBetween(pinkBeams[0], aboveHost(0.9), [b.x, 1.2, b.z], 0.07)
        if (shown > 0.02) {
          glass.visible = true
          glass.scale.set(4.4 * shown, 2.4, 3.4 * shown)
          glass.position.set(middle[0], 1.2, middle[1] + 0.4)
          glass.material.opacity = 0.3
        }
        if (t > 1.6) {
          const size = 0.9 * overshoot(progress(t, 1.6, 1.9))
          key.visible = true
          key.scale.set(size, size, size)
          key.position.set(middle[0], 3.4 + Math.sin(view.time * 4) * 0.08, middle[1])
          key.rotation.y = view.time * 2
        }
        // それ以外の人には、ふつうの利用者のしるしが付く
        for (let i = 0; i < 2; i++) {
          const seat = employees[2 + i].position
          const start = 2.2 + i * 0.4
          if (t < start) continue
          const cube = pinkCubes[i]
          const size = 0.3 * overshoot(progress(t, start, start + 0.3))
          cube.visible = true
          cube.scale.set(size, size, size)
          cube.position.set(seat.x, 2.4 + Math.sin(view.time * 4 + i) * 0.08, seat.z)
          cube.rotation.y = view.time * 2
        }
      },
    },
    // T1124 System Time Discovery
    T1124: {
      hits: [2.6],
      run(t) {
        view.target = [1.8, 3.4]
        view.height = 9.5
        storyState(9)
        // 端末の時計を読み、いまの時刻と時間帯を知る。動く時刻を決めたり、どの地域かの手がかりにしたりする
        const at = [3.5, 2.6, 4.2]
        popIn(clock, at[0], at[1] + Math.sin(view.time * 3) * 0.05, at[2], t, 0.5, 1.1)
        clock.rotation.y = 0.6
        clockHand.rotation.z = -1.1 - view.time * 0.4
        if (t > 1.0 && t < 1.8) stretchBetween(pinkBeams[0], aboveHost(1.0), at, 0.07)
        if (t > 1.6) {
          const note = documents[0]
          const size = 0.8 * overshoot(progress(t, 1.6, 1.9))
          flyTo(note, [at[0], at[1] - 0.9, at[2]], aboveHost(2.8), t, 1.8, 2.6, 0.8, 5)
          note.scale.set(size, size, size)
          if (t >= 2.6) note.rotation.y = 0.6
        }
      },
    },
    // T1010 Application Window Discovery
    T1010: {
      hits: [3.2],
      run(t) {
        view.target = [2.4, 3.6]
        view.height = 10
        storyState(9)
        // 従業員の画面に、いまどんなウィンドウ（黄色い板）が開いているか。その一覧から、何の仕事に何を使っているかが分かる
        const desk = [3.5, 1.9, 4.5]
        yellowCubes.forEach((pane, i) => {
          const at = [desk[0] - 0.7 + i * 0.5, desk[1] + i * 0.25, desk[2] + i * 0.12]
          const found = 1.0 + i * 0.6
          pane.visible = true
          pane.material.color.setHex(t > found && t < 4.6 ? 0xff6fd8 : 0xf6c531)
          pane.scale.set(0.7, 0.5, 0.06)
          pane.position.set(at[0], at[1], at[2])
          probeFromHost(i, at, t, found - 0.3, 0.5)
          if (i < 2) takeNote(i, at, t, found + 0.3)
        })
      },
    },
    // T1217 Browser Information Discovery
    T1217: {
      hits: [3.2],
      run(t) {
        view.target = [2.2, 2.4]
        view.height = 12.5
        storyState(9)
        // ブラウザ（ガラスの板）のブックマークや履歴（黄色い箱）を読む。その先（水色の線）に、この人がふだん使う社内のシステムがある
        const page = [3.5, 1.8, 4.5]
        glass.visible = true
        glass.scale.set(1.7, 1.2, 0.1)
        glass.position.set(page[0], page[1], page[2])
        glass.material.opacity = 0.35
        probeFromHost(0, page, t, 0.6, 0.7)
        yellowCubes.forEach((mark, i) => {
          const found = 1.2 + i * 0.5
          const at = [page[0] - 0.5 + i * 0.5, page[1] + 0.85, page[2]]
          if (t < found) return
          const size = 0.24 * overshoot(progress(t, found, found + 0.3))
          mark.visible = true
          mark.material.color.setHex(0xf6c531)
          mark.scale.set(size, size, size)
          mark.position.set(at[0], at[1], at[2])
          if (t > found + 0.3 && t < 4.6)
            stretchBetween(cyanBeams[i], at, [racks[2 + i].x, 2.4, RACK_Z], 0.04)
          if (i < 2) takeNote(i, at, t, found + 0.5)
        })
      },
    },
    // T1580 Cloud Infrastructure Discovery
    T1580: {
      hits: [3.4],
      run(t) {
        view.target = [0.0, 3.0]
        view.height = 12
        storyState(9)
        // クラウドの上に、何が建っているか。仮想マシン、記憶装置、ネットワークの機器を、管理の機能でひとつずつ一覧にする
        const sky = [-1.8, 5.0, 1.6]
        const parts = [bots[4], database, relayBot]
        popIn(cloud, sky[0], sky[1], sky[2], t, 0.1, 1.6)
        cloud.rotation.y = 0.6
        probeFromHost(0, [sky[0], sky[1] - 0.5, sky[2]], t, 0.5, 0.7)
        parts.forEach((part, i) => {
          const found = 1.1 + i * 0.6
          const at = [sky[0] - 1.4 + i * 1.4, 2.2, sky[2] + 0.6]
          if (t < found) return
          const size = (i === 1 ? 0.5 : 0.8) * overshoot(progress(t, found, found + 0.3))
          part.visible = true
          part.scale.set(size, size, size)
          part.position.set(at[0], at[1] + Math.sin(view.time * 3 + i) * 0.06, at[2])
          part.rotation.y = 0.6
          stretchBetween(cyanBeams[i], [sky[0], sky[1] - 0.6, sky[2]], [at[0], at[1] + 0.8, at[2]], 0.04)
          takeNote(i, at, t, found + 0.4)
        })
      },
    },
    // T1538 Cloud Service Dashboard
    T1538: {
      hits: [3.2],
      run(t) {
        view.target = [0.2, 3.0]
        view.height = 11.5
        storyState(9)
        // 盗んだ鍵で、クラウドの管理画面（ガラスの板）を正面から開く。コマンドを打たなくても、構成や設定がひと目で見える
        const sky = [-1.6, 4.6, 1.6]
        const screen = [-1.0, 1.8, 3.2]
        const open = overshoot(progress(t, 1.6, 2.0))
        popIn(cloud, sky[0], sky[1], sky[2], t, 0.1, 1.5)
        cloud.rotation.y = 0.6
        if (t > 0.5 && t < 1.7) {
          flyTo(key, aboveHost(2.4), [sky[0], sky[1] - 0.8, sky[2]], t, 0.5, 1.5, 0.8, 6)
          key.scale.set(0.8, 0.8, 0.8)
        }
        if (open > 0.02) {
          glass.visible = true
          glass.scale.set(2.2 * open, 1.5 * open, 0.1)
          glass.position.set(screen[0], screen[1], screen[2])
          glass.material.opacity = 0.4
          yellowCubes.forEach((gauge, i) => {
            gauge.visible = true
            gauge.material.color.setHex(0xf6c531)
            gauge.scale.set(0.3 * open, (0.3 + i * 0.25) * open, 0.08)
            gauge.position.set(
              screen[0] - 0.6 + i * 0.6,
              screen[1] - 0.4 + (0.3 + i * 0.25) / 2,
              screen[2] + 0.1,
            )
          })
        }
        takeNote(0, screen, t, 2.4)
        takeNote(1, screen, t, 2.9)
      },
    },
    // T1526 Cloud Service Discovery
    T1526: {
      hits: [3.4],
      run(t) {
        view.target = [0.0, 3.0]
        view.height = 12
        storyState(9)
        // このクラウドでは、どんなサービス（まわりを回る箱）が使われているのか。ひとつずつ問い合わせて、使われているものを見つけていく
        const sky = [-1.6, 4.4, 1.8]
        popIn(cloud, sky[0], sky[1], sky[2], t, 0.1, 1.5)
        cloud.rotation.y = 0.6
        yellowCubes.forEach((service, i) => {
          const found = 1.0 + i * 0.7
          const angle = view.time * 0.8 + i * 2.09
          const at = [sky[0] + Math.cos(angle) * 1.9, sky[1] - 1.7, sky[2] + 1.0 + Math.sin(angle) * 0.6]
          service.visible = true
          service.material.color.setHex(t > found && t < 4.6 ? 0xff6fd8 : 0xf6c531)
          service.scale.set(0.36, 0.36, 0.36)
          service.position.set(at[0], at[1], at[2])
          probeFromHost(i, at, t, found - 0.3, 0.5)
          takeNote(i, at, t, found + 0.2)
        })
      },
    },
    // T1619 Cloud Storage Object Discovery
    T1619: {
      hits: [3.4],
      run(t) {
        view.target = [0.0, 3.0]
        view.height = 12
        storyState(9)
        // クラウドの保管庫（台帳）には、何が入っているか。中身はまだ取り出さず、まず入っているものの一覧（箱の列）だけを出させる
        const sky = [-1.8, 5.0, 1.6]
        const store = [-1.8, 1.9, 2.4]
        popIn(cloud, sky[0], sky[1], sky[2], t, 0.1, 1.5)
        cloud.rotation.y = 0.6
        database.visible = true
        database.scale.set(0.7, 0.7, 0.7)
        database.position.set(store[0], store[1], store[2])
        database.rotation.y = 0.6
        probeFromHost(0, [store[0], store[1] + 0.5, store[2]], t, 0.6, 0.7)
        for (let i = 0; i < 5; i++) {
          const found = 1.3 + i * 0.3
          if (t < found || t > 4.6) continue
          const item = pinkCubes[i]
          const size = 0.2 * overshoot(progress(t, found, found + 0.25))
          item.visible = true
          item.scale.set(size * 2.4, size, size)
          item.position.set(store[0] + 1.6, store[1] + 1.4 - i * 0.32, store[2] + 0.6)
        }
        takeNote(0, [store[0] + 1.6, store[1] + 0.8, store[2] + 0.6], t, 2.8)
      },
    },
    // T1613 Container and Resource Discovery
    T1613: {
      hits: [3.4],
      run(t) {
        view.target = [0.2, 3.0]
        view.height = 10.5
        storyState(9)
        // コンテナを束ねる管理係に聞けば、どんなコンテナ（箱）がどこで動いているかを、まとめて教えてくれる
        const manager = [-2.0, 2.2]
        trustedProcess.visible = true
        trustedProcess.scale.set(1.4, 1.4, 1.4)
        trustedProcess.position.set(manager[0], 0, manager[1])
        trustedProcess.rotation.y = 0.9
        trustedProcessEyes.visible = false
        probeFromHost(0, [manager[0], 1.0, manager[1]], t, 0.5, 0.7)
        yellowCubes.forEach((container, i) => {
          const found = 1.3 + i * 0.5
          const at = [-0.9 + i * 0.8, 0.4, 3.8 - i * 0.5]
          container.visible = true
          container.material.color.setHex(t > found && t < 4.6 ? 0xff6fd8 : 0xf6c531)
          container.scale.set(0.6, 0.6, 0.6)
          container.position.set(
            at[0],
            at[1] + (t > found && t < found + 0.4 ? Math.abs(Math.sin((t - found) * 8)) * 0.3 : 0),
            at[2],
          )
          container.rotation.y = 0.6
          if (t > found - 0.2 && t < found + 0.3)
            stretchBetween(cyanBeams[i], [manager[0], 1.0, manager[1]], at, 0.05)
          if (i > 0) takeNote(i - 1, at, t, found + 0.3)
        })
      },
    },
    // T1622 Debugger Evasion
    T1622: {
      hits: [3.2],
      run(t) {
        view.target = [1.6, 3.2]
        view.height = 9.5
        storyState(9)
        // 自分に、解析の道具がつながれていないか。動き出す前に、自分のまわりをぐるりと確かめる。何もつながっていなければ、先へ進む
        const angle = t * 3
        if (t > 0.5 && t < 2.9) {
          attackerScan.visible = true
          attackerScan.scale.set(0.15, 1.6, 1.4)
          attackerScan.position.set(
            HOST_SPOT[0] + Math.sin(angle) * 0.9,
            0.9,
            HOST_SPOT[1] + Math.cos(angle) * 0.9,
          )
          attackerScan.rotation.y = angle
          attackerScan.material.opacity = 0.4
          pulseRings.forEach((ring, j) => {
            const phase = ((t - 0.5) * 0.7 + j * 0.5) % 1
            const scale = 1 + phase * 3
            ring.visible = true
            ring.scale.set(scale, 0.02, scale)
            ring.position.set(HOST_SPOT[0], 0.08, HOST_SPOT[1])
            ring.material.opacity = 0.4 * (1 - phase)
          })
        }
        if (t > 2.9 && t < 4.6) {
          showCheck(HOST_SPOT[0], 3.6, HOST_SPOT[1], t, 2.9)
          malware.position.y = Math.abs(Math.sin((t - 2.9) * 6)) * 0.25
        }
      },
    },
    // T1652 Device Driver Discovery
    T1652: {
      hits: [3.4],
      run(t) {
        view.target = [0.6, 3.0]
        view.height = 10.5
        storyState(9)
        // 機器を動かすための部品（ドライバー。積み重なった板）を、上から順に調べる。何がつながる端末か、守りの製品が入っているかが、ここから分かる
        const stack = [-0.9, 2.8]
        const level = (i: number) => 1.9 - i * 0.55
        const scanAt = lerp(2.4, 0.2, progress(t, 0.8, 2.8))
        yellowCubes.forEach((driver, i) => {
          const found = 0.8 + ((2.4 - level(i)) / 2.2) * 2.0
          driver.visible = true
          driver.material.color.setHex(i === 1 && t > found && t < 4.6 ? 0xff6fd8 : 0xf6c531)
          driver.scale.set(1.1, 0.16, 1.1)
          driver.position.set(stack[0], level(i), stack[1])
          driver.rotation.y = 0.6
          if (i !== 0) takeNote(i - 1, [stack[0], level(i), stack[1]], t, found)
        })
        probeFromHost(0, [stack[0], scanAt, stack[1]], t, 0.8, 2.0)
        // まん中の板は、守りの製品のもの
        showAlert(0, stack[0], 2.6, stack[1], t, 1.9, 2.8)
      },
    },
    // T1482 Domain Trust Discovery
    T1482: {
      hits: [3.4],
      run(t) {
        view.target = [-0.8, 2.8]
        view.height = 12.5
        storyState(9)
        // この組織の台帳（手前）は、別の組織の台帳（奥）と信頼でつながっている（水色の線）。そのつながりをたどれば、向こうへ渡る道が見つかる
        const ours = [-0.6, 1.2, 3.2]
        const theirs = [-5.0, 1.2, 1.0]
        const tracer = pinkCubes[0]
        database.visible = true
        database.scale.set(0.8, 0.8, 0.8)
        database.position.set(ours[0], 0, ours[2])
        database.rotation.y = 0.6
        trustedProcess.visible = true
        trustedProcess.scale.set(1.9, 1.9, 1.9)
        trustedProcess.position.set(theirs[0], 0, theirs[2])
        trustedProcess.rotation.y = 0.9
        trustedProcessEyes.visible = false
        stretchBetween(cyanBeams[0], ours, theirs, 0.06)
        probeFromHost(0, ours, t, 0.5, 0.7)
        if (t > 1.2 && t < 4.6) {
          flyTo(tracer, ours, theirs, t, 1.2, 2.6)
          tracer.scale.set(0.3, 0.3, 0.3)
          if (t >= 2.6) tracer.position.y = theirs[1] + 1.2 + Math.sin(view.time * 4) * 0.06
        }
        takeNote(0, theirs, t, 2.6)
      },
    },
    // T1615 Group Policy Discovery
    T1615: {
      hits: [3.4],
      run(t) {
        view.target = [0.2, 3.2]
        view.height = 14
        storyState(9)
        // どの端末にどんな決まりが配られているか（台帳から伸びる水色の線）。その中身を読めば、守りの方針と、悪用できる設定が分かる
        const ledger = [-0.8, 1.6, 1.8]
        database.visible = true
        database.scale.set(0.9, 0.9, 0.9)
        database.position.set(ledger[0], 0, ledger[2])
        database.rotation.y = 0.6
        employees.forEach((employee, i) => {
          stretchBetween(cyanBeams[i], ledger, [employee.position.x, 1.0, employee.position.z + 0.9], 0.04)
        })
        probeFromHost(0, ledger, t, 0.6, 2.4)
        for (let i = 0; i < 3; i++) takeNote(i, [ledger[0], 2.2, ledger[2]], t, 1.2 + i * 0.6)
      },
    },
    // T1680 Local Storage Discovery
    T1680: {
      hits: [3.4],
      run(t) {
        view.target = [0.6, 3.0]
        view.height = 10.5
        storyState(9)
        // 端末につながっている記録装置（大きさの違う箱）と、それぞれの容量を調べる。どれを暗号化するか、どれを持ち出すかを、ここで見定める
        const sizes = [0.4, 0.75, 0.55]
        yellowCubes.forEach((drive, i) => {
          const found = 1.0 + i * 0.6
          const at = [-2.0 + i * 1.1, sizes[i] / 2, 2.8]
          drive.visible = true
          drive.material.color.setHex(i === 1 && t > found + 0.3 && t < 4.6 ? 0xff6fd8 : 0xf6c531)
          drive.scale.set(sizes[i], sizes[i], sizes[i])
          drive.position.set(at[0], at[1], at[2])
          drive.rotation.y = 0.6
          probeFromHost(i, at, t, found - 0.3, 0.5)
          if (t > found && t < found + 0.6) {
            const ring = pulseRings[i % 2]
            const grow = 1 + progress(t, found, found + 0.6) * sizes[i] * 4
            ring.visible = true
            ring.scale.set(grow, 0.02, grow)
            ring.position.set(at[0], 0.08, at[2])
            ring.material.opacity = 0.5
          }
          if (i > 0) takeNote(i - 1, at, t, found + 0.3)
        })
      },
    },
    // T1654 Log Enumeration
    T1654: {
      hits: [3.4],
      run(t) {
        view.target = [0.6, 3.6]
        view.height = 10.5
        storyState(9)
        // 見張りが書きためた記録（台帳）を読む。だれがいつ入ったか、何が検知されたか、防御側がどこまで気づいているかが、ここに書いてある
        const store = [-1.0, 1.4, 4.4]
        database.visible = true
        database.scale.set(0.8, 0.8, 0.8)
        database.position.set(store[0], 0, store[2])
        database.rotation.y = 0.6
        stretchBetween(cyanBeams[0], [0.5, 0.4, 3.5], [store[0], 0.6, store[2]], 0.04)
        probeFromHost(0, store, t, 0.6, 2.4)
        for (let i = 0; i < 3; i++) takeNote(i, [store[0], 2.0, store[2]], t, 1.2 + i * 0.6)
        // 防御側の様子をうかがう
        if (t > 3.0 && t < 4.4)
          stretchBetween(pinkBeams[1], aboveHost(2.8), [DEFENDER_SPOT[0], 1.6, DEFENDER_SPOT[1]], 0.03)
      },
    },
    // T1135 Network Share Discovery
    T1135: {
      hits: [3.6],
      run(t) {
        view.target = [0.6, -0.6]
        view.height = 17
        storyState(9)
        // ネットワークの中で、フォルダを共有している機器はどれか。端から順に問い合わせて、共有のある機器（ピンクに光る）を一覧にする
        const sweep = progress(t, 0.6, 3.2)
        let notes = 0
        racks.forEach((rack, i) => {
          const asked = 0.6 + (i / 5) * 2.6
          const shared = i === 1 || i === 3 || i === 4
          if (t > asked - 0.15 && t < asked + 0.3)
            stretchBetween(pinkBeams[i], aboveHost(0.9), [rack.x, 1.6, RACK_Z + 0.6], 0.06)
          if (shared && t > asked + 0.2 && t < 5.6) rack.lights.color.setHex(0xff6fd8)
          if (shared) takeNote(notes++, [rack.x, 2.9, RACK_Z], t, asked + 0.3)
        })
        if (sweep > 0 && sweep < 1) {
          attackerScan.visible = true
          attackerScan.scale.set(0.3, 2.6, 1.6)
          attackerScan.position.set(lerp(racks[0].x, racks[5].x, sweep), 1.5, RACK_Z)
          attackerScan.material.opacity = 0.3
        }
      },
    },
    // T1040 Network Sniffing
    T1040: {
      hits: [3.4],
      run(t) {
        view.target = [0.8, 0.6]
        view.height = 16
        storyState(9)
        // 流れている通信（水色の線）に耳をすます。だれがどこと話しているかを聞いているだけで、ネットワークの地図ができあがっていく
        const tap = [1.0, 1.2, 0.6]
        const pairs = [
          [0, 1],
          [2, 3],
          [3, 5],
        ]
        pairs.forEach(([e, r], i) => {
          const from = [employees[e].position.x, 1.0, employees[e].position.z + 0.9]
          const to = [racks[r].x, 1.6, RACK_Z + 0.6]
          const heard = 1.2 + i * 0.6
          stretchBetween(cyanBeams[i], from, to, t > heard && t < 4.6 ? 0.09 : 0.05)
          takeNote(i, [(from[0] + to[0]) / 2, 1.6, (from[2] + to[2]) / 2], t, heard)
        })
        if (t > 0.6 && t < 4.6) {
          glass.visible = true
          glass.scale.set(9, 1.6, 0.12)
          glass.position.set(tap[0], tap[1], tap[2])
          glass.material.opacity = 0.25 + 0.1 * Math.sin(t * 8)
        }
        probeFromHost(0, tap, t, 0.5, 0.6)
      },
    },
    // T1201 Password Policy Discovery
    T1201: {
      hits: [3.2],
      run(t) {
        view.target = [0.6, 3.0]
        view.height = 10.5
        storyState(9)
        // パスワードの決まりを読む。何文字以上か（箱の数）、何回まちがえると締め出されるか。決まりが分かれば、締め出されない範囲で総当たりできる
        const lockAt = [-0.8, 2.3, 2.6]
        padlock.visible = true
        padlock.scale.set(1.1, 1.1, 1.1)
        padlock.position.set(lockAt[0], lockAt[1], lockAt[2])
        padlock.rotation.y = 0.6
        probeFromHost(0, lockAt, t, 0.6, 0.7)
        yellowCubes.forEach((rule, i) => {
          const shown = 1.3 + i * 0.35
          if (t < shown) return
          const size = 0.3 * overshoot(progress(t, shown, shown + 0.25))
          rule.visible = true
          rule.material.color.setHex(0xf6c531)
          rule.scale.set(size, size, size)
          rule.position.set(lockAt[0] - 0.45 + i * 0.45, 1.0, lockAt[2] + 0.4)
        })
        takeNote(0, [lockAt[0], 1.0, lockAt[2] + 0.4], t, 2.4)
        // 決まりに合わせた鍵を用意する
        if (t > 3.0 && t < 4.6) {
          const fitted = spareKeys[0]
          const size = 0.7 * overshoot(progress(t, 3.0, 3.3))
          fitted.visible = true
          fitted.scale.set(size, size, size)
          fitted.position.set(HOST_SPOT[0] + 0.9, 2.2, HOST_SPOT[1])
          fitted.rotation.y = t * 3
        }
      },
    },
    // T1120 Peripheral Device Discovery
    T1120: {
      hits: [3.2],
      run(t) {
        view.target = [2.6, 3.6]
        view.height = 10
        storyState(9)
        // 端末に、何がつながっているか。USBメモリ（水色の箱）、プリンター（小さな機械）。つながっている機器から、この端末の使われ方が見えてくる
        const usb = [4.4, 1.0, 4.9]
        const printer = [2.1, 0, 3.9]
        token.visible = true
        token.scale.set(0.3, 0.3, 0.3)
        token.position.set(usb[0], usb[1], usb[2])
        token.rotation.y = t > 1.0 && t < 4.6 ? view.time * 3 : 0.6
        relayBot.visible = true
        relayBot.scale.set(0.7, 0.7, 0.7)
        relayBot.position.set(
          printer[0],
          t > 1.8 && t < 2.3 ? Math.abs(Math.sin((t - 1.8) * 8)) * 0.2 : 0,
          printer[2],
        )
        relayBot.rotation.y = 0.6
        stretchBetween(cyanBeams[0], [3.5, 1.0, 4.4], usb, 0.04)
        stretchBetween(cyanBeams[1], [3.5, 1.0, 4.4], [printer[0], 0.6, printer[2]], 0.04)
        probeFromHost(0, usb, t, 0.7, 0.5)
        probeFromHost(1, [printer[0], 0.6, printer[2]], t, 1.5, 0.5)
        takeNote(0, usb, t, 1.2)
        takeNote(1, [printer[0], 0.9, printer[2]], t, 2.0)
      },
    },
    // T1012 Query Registry
    T1012: {
      hits: [3.4],
      run(t) {
        view.target = [0.6, 3.0]
        view.height = 10.5
        storyState(9)
        // OSやソフトの設定がまとめて書かれている場所（箱の列）を、端から読んでいく。入っているソフトも、守りの設定も、ここを読めば分かる
        const sweep = progress(t, 0.7, 2.9)
        yellowCubes.forEach((setting, i) => {
          const read = 0.7 + ((i + 0.5) / 3) * 2.2
          const at = [-2.0 + i * 0.8, 1.4, 2.5]
          setting.visible = true
          setting.material.color.setHex(0xf6c531)
          setting.scale.set(0.42, 0.42, 0.42)
          setting.position.set(at[0], at[1] + (t > read && t < read + 0.3 ? 0.2 : 0), at[2])
          setting.rotation.y = 0.6
          takeNote(i, at, t, read)
        })
        if (sweep > 0 && sweep < 1) {
          attackerScan.visible = true
          attackerScan.scale.set(0.2, 1.2, 1.2)
          attackerScan.position.set(lerp(-2.5, 0.1, sweep), 1.4, 2.5)
          attackerScan.material.opacity = 0.4
        }
      },
    },
    // T1518 Software Discovery
    T1518: {
      hits: [3.4],
      run(t) {
        view.target = [0.4, 3.2]
        view.height = 10.5
        storyState(9)
        // 端末に入っているソフトを、ひとつずつ調べる。業務のソフト、開発の道具、そして守りの製品（錠）。古い版のまま残っているものが、次のねらい目になる
        const shelf = [
          [-2.4, 3.4],
          [-1.3, 2.2],
          [0.0, 3.4],
        ]
        trustedProcess.visible = true
        trustedProcess.scale.set(1.2, 1.2, 1.2)
        trustedProcess.position.set(shelf[0][0], 0, shelf[0][1])
        trustedProcess.rotation.y = 0.6
        trustedProcessEyes.visible = false
        hammer.visible = true
        hammer.position.set(shelf[1][0], 0.7, shelf[1][1])
        hammer.rotation.z = 1.2
        padlock.visible = true
        padlock.scale.set(0.8, 0.8, 0.8)
        padlock.position.set(shelf[2][0], 0.7, shelf[2][1])
        padlock.rotation.y = 0.6
        shelf.forEach((at, i) => {
          const found = 0.9 + i * 0.7
          probeFromHost(i, [at[0], 0.8, at[1]], t, found - 0.3, 0.5)
          takeNote(i, [at[0], 1.2, at[1]], t, found)
        })
        // 古い版のまま
        if (t > 1.2 && t < 5.4) {
          const old = pinkCubes[0]
          old.visible = true
          old.scale.set(0.22, 0.22, 0.22)
          old.position.set(shelf[0][0], 1.4 + Math.sin(view.time * 4) * 0.06, shelf[0][1])
          old.rotation.y = view.time * 2
        }
        showAlert(0, shelf[2][0], 2.0, shelf[2][1], t, 2.4, 3.2)
      },
    },
    // T1614 System Location Discovery
    T1614: {
      hits: [3.2],
      run(t) {
        view.target = [0.4, 3.2]
        view.height = 11
        storyState(9)
        // この端末は、世界のどこにあるのか。言葉や時間帯の設定を読んで、候補（黄色い箱）の中から、ここだと見当を付ける
        const settings = aboveHost(2.6)
        const decided = t > 2.6 && t < 5.4
        const sheet = documents[3]
        if (t > 0.5 && t < 4.6) {
          popIn(sheet, settings[0] - 0.4, settings[1], settings[2], t, 0.5, 0.8)
          sheet.rotation.y = 0.6
          popIn(clock, settings[0] + 0.5, settings[1] + 0.1, settings[2], t, 0.9, 0.5)
          clock.rotation.y = 0.6
          clockHand.rotation.z = -1.0
        }
        yellowCubes.forEach((region, i) => {
          const at = [-2.6 + i * 1.3, 0.3, 1.9 + i * 0.5]
          region.visible = true
          region.material.color.setHex(i === 1 && decided ? 0xff6fd8 : 0xf6c531)
          region.scale.set(0.9, 0.12, 0.9)
          region.position.set(at[0], 0.08, at[2])
          region.rotation.y = 0.6
          if (t > 1.4 + i * 0.4 && t < 1.8 + i * 0.4) stretchBetween(pinkBeams[i], settings, at, 0.05)
        })
        if (decided) {
          const pin = pinkCubes[0]
          pin.visible = true
          pin.scale.set(0.24, 0.5, 0.24)
          pin.position.set(-1.3, 0.5 + (1 - bounce(progress(t, 2.6, 3.2))) * 3, 2.4)
        }
      },
    },
    // T1016 System Network Configuration Discovery
    T1016: {
      hits: [3.4],
      run(t) {
        view.target = [1.0, 4.6]
        view.height = 12.5
        storyState(9)
        // この端末は、ネットワークのどこにいるのか。自分の住所、外へ出る出口（小さな機械）、名前を引く先（台帳）を、端末の設定から読み取る
        const exit = [-0.6, 0.8, 3.6]
        const names = [-2.2, 1.4, 2.2]
        relayBot.visible = true
        relayBot.scale.set(0.9, 0.9, 0.9)
        relayBot.position.set(exit[0], 0, exit[2])
        relayBot.rotation.y = 0.6
        database.visible = true
        database.scale.set(0.7, 0.7, 0.7)
        database.position.set(names[0], 0, names[2])
        database.rotation.y = 0.6
        // まず自分の住所
        if (t > 0.5 && t < 4.6)
          pulseRings.forEach((ring, j) => {
            const phase = ((t - 0.5) * 0.7 + j * 0.5) % 1
            const scale = 1 + phase * 3
            ring.visible = true
            ring.scale.set(scale, 0.02, scale)
            ring.position.set(HOST_SPOT[0], 0.08, HOST_SPOT[1])
            ring.material.opacity = 0.4 * (1 - phase)
          })
        if (t > 1.2 && t < 4.6) stretchBetween(cyanBeams[0], aboveHost(0.6), exit, 0.05)
        if (t > 1.9 && t < 4.6) stretchBetween(cyanBeams[1], aboveHost(0.6), names, 0.05)
        takeNote(0, aboveHost(0.6), t, 0.9)
        takeNote(1, exit, t, 1.5)
        takeNote(2, names, t, 2.2)
      },
    },
    // T1049 System Network Connections Discovery
    T1049: {
      hits: [3.4],
      run(t) {
        view.target = [1.0, 1.4]
        view.height = 16
        storyState(9)
        // この端末は、いまどこと通信しているのか（水色の線）。つながっている先をひとつずつたどれば、関わりのある機器が分かる
        const ends = [
          [racks[2].x, 1.6, RACK_Z + 0.6],
          [employees[1].position.x, 1.0, employees[1].position.z + 0.9],
          [racks[4].x, 1.6, RACK_Z + 0.6],
        ]
        ends.forEach((end, i) => {
          const traced = 0.8 + i * 0.7
          const tracer = pinkCubes[i]
          stretchBetween(cyanBeams[i], aboveHost(0.8), end, 0.05)
          if (t > traced && t < 4.6) {
            flyTo(tracer, aboveHost(0.8), end, t, traced, traced + 0.7)
            tracer.scale.set(0.26, 0.26, 0.26)
          }
          takeNote(i, end, t, traced + 0.7)
        })
      },
    },
    // T1033 System Owner/User Discovery
    T1033: {
      hits: [3.2],
      run(t) {
        view.target = [2.4, 3.6]
        view.height = 9.5
        storyState(9)
        // この端末を使っているのは、だれか。いまログオンしている人の名札（水色の箱）を読む。管理者なら、ねらう価値がある
        const seat = employees[2].position
        const badge = [seat.x, 2.5, seat.z]
        if (t > 0.6 && t < 2.2) {
          scanPlane.visible = true
          scanPlane.scale.set(1.6, 2.2, 0.08)
          scanPlane.position.set(
            seat.x,
            1.2,
            lerp(seat.z + 1.2, seat.z - 0.8, (progress(t, 0.6, 2.2) * 2) % 1),
          )
          scanPlane.material.opacity = 0.4
        }
        if (t > 1.4) {
          const size = 0.34 * overshoot(progress(t, 1.4, 1.7))
          token.visible = true
          token.scale.set(size, size, size)
          token.position.set(badge[0], badge[1] + Math.sin(view.time * 4) * 0.06, badge[2])
          token.rotation.y = view.time * 2
        }
        probeFromHost(0, badge, t, 1.8, 0.6)
        takeNote(0, badge, t, 2.2)
      },
    },
    // T1007 System Service Discovery
    T1007: {
      hits: [3.4],
      run(t) {
        view.target = [0.4, 3.2]
        view.height = 10.5
        storyState(9)
        // 裏で動き続けているサービス（機械の列）を、端から一覧にする。守りの製品のサービスも、乗っ取れそうなサービスも、この中にいる
        const sweep = progress(t, 0.7, 2.9)
        for (let i = 0; i < 3; i++) {
          const listed = 0.7 + ((i + 0.5) / 3) * 2.2
          const at = [-2.3 + i * 1.0, 0, 2.4 + i * 0.5]
          const service = bots[4 + i]
          service.visible = true
          service.scale.set(0.9, 0.9, 0.9)
          service.position.set(
            at[0],
            Math.abs(Math.sin(view.time * 4 + i)) * 0.08 + (t > listed && t < listed + 0.3 ? 0.25 : 0),
            at[2],
          )
          service.rotation.y = 0.6
          takeNote(i, [at[0], 1.0, at[2]], t, listed)
        }
        if (sweep > 0 && sweep < 1) {
          attackerScan.visible = true
          attackerScan.scale.set(0.2, 1.4, 1.6)
          attackerScan.position.set(lerp(-2.9, 0.3, sweep), 0.8, lerp(2.2, 3.6, sweep))
          attackerScan.material.opacity = 0.4
        }
      },
    },
    // T1673 Virtual Machine Discovery
    T1673: {
      hits: [3.4],
      run(t) {
        view.target = [0.2, 3.0]
        view.height = 10.5
        storyState(9)
        // 仮想化の土台の上で、どんな仮想マシン（上の機械）が動いているかを一覧にする。あとで止めたり暗号化したりする相手を、ここで見定める
        const base = [-1.2, 2.8]
        database.visible = true
        database.scale.set(1.5, 0.5, 1.2)
        database.position.set(base[0], 0, base[1])
        database.rotation.y = 0.6
        probeFromHost(0, [base[0] + 0.9, 0.4, base[1] + 0.4], t, 0.5, 0.7)
        for (let i = 0; i < 3; i++) {
          const found = 1.2 + i * 0.5
          const at = [base[0] - 0.7 + i * 0.7, 0.85, base[1] - 0.3 + i * 0.3]
          const vm = bots[4 + i]
          vm.visible = true
          vm.scale.set(0.6, 0.6, 0.6)
          vm.position.set(at[0], at[1], at[2])
          vm.rotation.y = 0.6
          if (t > found && t < 5.4) {
            const mark = pinkCubes[i]
            const size = 0.2 * overshoot(progress(t, found, found + 0.25))
            mark.visible = true
            mark.scale.set(size, size, size)
            mark.position.set(at[0], at[1] + 1.0 + Math.sin(view.time * 4 + i) * 0.05, at[2])
            mark.rotation.y = view.time * 2
          }
          if (i < 2) takeNote(i, [at[0], 1.6, at[2]], t, found + 0.2)
        }
      },
    },
    // T1497 Virtualization/Sandbox Evasion
    T1497: {
      hits: [3.4],
      run(t) {
        view.target = [2.0, 3.4]
        view.height = 10.5
        storyState(9)
        // ここは本物の端末か、それとも調べるための作り物の環境か。人が使っている気配、つながっている機器、動いてきた時間を確かめて見きわめる
        const signs = [
          [3.5, 1.4, 4.4],
          [3.2, 0.4, 1.6],
          [0.5, 0.4, 3.5],
        ]
        signs.forEach((sign, i) => probeFromHost(i, sign, t, 0.7 + i * 0.6, 0.5))
        hopInPlace(employees[2], t, 0.9, 1.4, 0.1)
        if (t > 1.5 && t < 2.0) implant.scale.set(1.3, 1.3, 1.3)
        if (t > 2.0 && t < 3.2) {
          popIn(clock, HOST_SPOT[0], 3.9, HOST_SPOT[1], t, 2.0, 0.9)
          clock.rotation.y = 0.6
          clockHand.rotation.z = -progress(t, 2.1, 3.0) * Math.PI * 2
        }
        // 本物だと分かった
        if (t > 3.1 && t < 4.6) {
          showCheck(HOST_SPOT[0], 3.8, HOST_SPOT[1], t, 3.1)
          malware.position.y = Math.abs(Math.sin((t - 3.1) * 6)) * 0.25
        }
      },
    },
  }
}
