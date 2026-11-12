// TA0002 実行（Execution）の場面。
import type { Kit } from '../kit'
import { progress, smooth, lerp, overshoot, stretchBetween } from '../motion'
import type { SceneMap } from './types'

export default function execution(kit: Kit): SceneMap {
  const {
    employees,
    mail,
    token,
    glass,
    pinkBeams,
    bots,
    HOST_SPOT,
    MALWARE_SIZE,
    malware,
    pinkCubes,
    yellowCubes,
    documents,
    view,
    placeMalware,
    placeSensor,
    storyState,
    aboveHost,
    flyTo,
    hopInPlace,
    showAlert,
    jumpMalware,
    sensorArrives,
  } = kit
  return {
    // T1059 Command and Scripting Interpreter（本編）
    T1059: {
      hits: [3.2],
      run(t) {
        view.target = [1.5, 3.8]
        view.height = 10
        storyState(3) // Execution
        if (t < 4.4) {
          malware.position.y = Math.abs(Math.sin(t * 6)) * 0.25
          const size = MALWARE_SIZE * (1 + 0.12 * Math.sin(t * 12))
          malware.scale.set(size, size, size)
        }
        pinkCubes.forEach((cube, i) => {
          const start = 0.4 + i * 0.5,
            p = progress(t, start, start + 1.1)
          if (p <= 0 || p >= 1) return
          cube.visible = true
          cube.position.set(
            HOST_SPOT[0] + Math.sin(i * 2.1 + p * 5) * 0.55,
            0.8 + p * 2.3,
            HOST_SPOT[1] + Math.cos(i * 2.1 + p * 5) * 0.55,
          )
          const size = 0.32 * (1 - p * 0.6)
          cube.scale.set(size, size, size)
          cube.rotation.set(t * 4, t * 6, 0)
        })
        if (t > 4.6)
          placeSensor(0.5, lerp(8, 3.3, smooth(progress(t, 4.6, 5.6))) + Math.sin(view.time * 3) * 0.1, 3.5)
      },
    },
    // T1204 User Execution
    T1204: {
      hits: [3.1],
      run(t) {
        view.target = [2.6, 3.8]
        view.height = 9
        storyState(3) // User Execution
        if (t < 2.3) {
          mail.visible = true
          mail.position.set(2.9, 1.1 + Math.sin(t * 5) * 0.05, 4.5)
          mail.rotation.y = 0.3
          placeMalware(0, 0, 0, 0)
        } else {
          jumpMalware(
            t,
            2.3,
            3.1,
            [2.9, 1.0, 4.5],
            aboveHost(0),
            1.2,
            MALWARE_SIZE * overshoot(progress(t, 2.3, 2.6)),
          )
          if (t > 3.1 && t < 4.4) malware.position.y = Math.abs(Math.sin(t * 6)) * 0.25
        }
        showAlert(0, 3.5, 2.2, 3.5, t, 0.8, 2.0)
        hopInPlace(employees[2], t, 1.6, 2.4)
        pinkCubes.forEach((cube, i) => {
          const start = 3.1 + i * 0.25,
            p = progress(t, start, start + 1)
          if (i > 3 || p <= 0 || p >= 1) return
          cube.visible = true
          cube.position.set(
            HOST_SPOT[0] + Math.sin(i * 2.1 + p * 5) * 0.55,
            0.8 + p * 2.3,
            HOST_SPOT[1] + Math.cos(i * 2.1 + p * 5) * 0.55,
          )
          const size = 0.32 * (1 - p * 0.6)
          cube.scale.set(size, size, size)
        })
        sensorArrives(t)
      },
    },
    // T1072 Software Deployment Tools
    T1072: {
      hits: [3],
      run(t) {
        view.target = [0.5, 3.4]
        view.height = 12.5
        storyState(3) // Software Deployment Tools
        employees.forEach((employee, i) => {
          const seat = employee.position,
            cube = pinkCubes[i],
            start = 0.8 + i * 0.25,
            to = [seat.x + 0.95, 0.3, seat.z + 0.2]
          if (t > start && t < start + 1) {
            flyTo(cube, aboveHost(1.2), to, t, start, start + 1, 2.2, 6)
            cube.scale.set(0.3, 0.3, 0.3)
          }
          if (t >= start + 1) {
            const bot = bots[4 + i],
              size = overshoot(progress(t, start + 1, start + 1.3))
            bot.visible = true
            bot.scale.set(size, size, size)
            bot.position.set(to[0], Math.abs(Math.sin(t * 6 + i)) * 0.2, to[2])
            bot.rotation.y = 0.6
          }
        })
        sensorArrives(t)
      },
    },
    // T1203 Exploitation for Client Execution
    T1203: {
      hits: [3.1],
      run(t) {
        view.target = [2.6, 3.8]
        view.height = 9
        storyState(3) // Exploitation for Client Execution
        const point = [3.5, 1.9, 4.5],
          hit = t > 1.9,
          gone = smooth(progress(t, 2.3, 2.6)),
          doc = documents[0],
          cube = yellowCubes[0]
        if (t < 2.6) {
          glass.visible = true
          glass.scale.set(1.5 * (1 + 0.25 * gone), 1.1 * (1 - gone) + 0.02, 0.1)
          glass.position.set(point[0] + (hit ? Math.sin(t * 60) * 0.06 : 0), point[1], point[2])
          glass.material.opacity = hit && Math.sin(t * 40) > 0 ? 0.9 : 0.55
        }
        if (t < 1.9) {
          flyTo(doc, [1.2, 2.6, 5.6], point, t, 0.5, 1.6, 1.0, 0)
          doc.rotation.y = 0.3
          cube.visible = true
          cube.material.color.setHex(0xf6c531)
          cube.scale.set(0.2, 0.2, 0.2)
          cube.position.set(doc.position.x + 0.2, doc.position.y - 0.15, doc.position.z + 0.12)
        }
        if (t < 2.3) placeMalware(0, 0, 0, 0)
        else {
          jumpMalware(t, 2.3, 3.1, point, aboveHost(0), 0.8, MALWARE_SIZE * overshoot(progress(t, 2.3, 2.6)))
          const p = progress(t, 2.3, 3.1)
          if (p < 1)
            for (let i = 0; i < 5; i++) {
              const q = pinkCubes[i],
                angle = i * 1.26,
                size = 0.3 * (1 - p) + 0.01
              q.visible = true
              q.scale.set(size, size, size)
              q.position.set(
                point[0] + Math.cos(angle) * p * 1.6,
                point[1] + p * 0.8,
                point[2] + Math.sin(angle) * p * 1.6,
              )
            }
        }
        sensorArrives(t)
      },
    },
    // T1047 Windows Management Instrumentation
    T1047: {
      hits: [3],
      run(t) {
        view.target = [0.5, 3.2]
        view.height = 11
        storyState(3) // Windows Management Instrumentation
        const point = [0, 0.6, 2.2]
        token.visible = true
        token.scale.set(0.9, 0.9, 0.9)
        token.position.set(point[0], point[1] + Math.sin(view.time * 3) * 0.05, point[2])
        token.rotation.y = view.time * (t > 1.2 && t < 4.4 ? 3 : 0.5)
        if (t > 0.6 && t < 1.3) stretchBetween(pinkBeams[0], aboveHost(0.8), point, 0.1)
        ;[1, 2, 3].forEach((ei, j) => {
          const seat = employees[ei].position,
            start = 1.5 + j * 0.5,
            cube = pinkCubes[j],
            p = progress(t, start + 0.4, start + 1.6)
          if (t > start && t < start + 0.6)
            stretchBetween(pinkBeams[1 + j], point, [seat.x, 0.9, seat.z + 0.9], 0.07)
          if (p > 0 && p < 1) {
            const size = 0.3 * (1 - p * 0.6)
            cube.visible = true
            cube.scale.set(size, size, size)
            cube.position.set(
              seat.x + Math.sin(p * 5) * 0.4,
              1.3 + p * 1.8,
              seat.z + 0.9 + Math.cos(p * 5) * 0.4,
            )
          }
        })
        sensorArrives(t)
      },
    },
  }
}
