// TA0007 探索（Discovery）の場面。
import type { Kit } from '../kit'
import { progress, lerp, overshoot, stretchBetween, smooth } from '../motion'
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
        view.target = [0, 3.2]
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
  }
}
