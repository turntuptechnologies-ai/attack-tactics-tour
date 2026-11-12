// TA0002 実行（Execution）の場面。
import type { Kit } from '../kit'
import { progress, smooth, lerp, overshoot, stretchBetween, arcBetween } from '../motion'
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
    cyanBeams,
    trustedProcess,
    trustedProcessEyes,
    clock,
    clockHand,
    popIn,
    hammer,
    truckB,
    relayBot,
    padlock,
    cloud,
    database,
    showCheck,
    showSparks,
    showRipples,
    showCross,
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
    // T1610 Deploy Container
    T1610: {
      hits: [3.2],
      run(t) {
        view.target = [0.9, 3.2]
        view.height = 10
        storyState(3)
        // となりに新しいコンテナ（箱）を立ち上げ、その中で不正な処理を動かす
        const box = [-0.4, 2.6]
        const up = overshoot(progress(t, 1.0, 1.5))
        if (t > 0.5 && t < 1.1) stretchBetween(pinkBeams[0], aboveHost(0.8), [box[0], 0.8, box[1]], 0.09)
        if (up > 0.02) {
          glass.visible = true
          glass.scale.set(1.8 * up, 1.8 * up, 1.8 * up)
          glass.position.set(box[0], 0.92 * up, box[1])
          glass.material.opacity = 0.4
        }
        if (t > 1.7) {
          const bot = bots[4]
          const size = 1.2 * overshoot(progress(t, 1.7, 2.0))
          bot.visible = true
          bot.scale.set(size, size, size)
          bot.position.set(box[0], t > 2.2 ? Math.abs(Math.sin((t - 2.2) * 6)) * 0.25 : 0, box[1])
          bot.rotation.y = 0.6
        }
        for (let i = 0; i < 4; i++) {
          const p = progress(t, 2.4 + i * 0.2, 3.4 + i * 0.2)
          if (p <= 0 || p >= 1) continue
          const cube = pinkCubes[i]
          const size = 0.26 * (1 - p * 0.6)
          cube.visible = true
          cube.scale.set(size, size, size)
          cube.position.set(
            box[0] + Math.sin(i * 2.1 + p * 5) * 0.45,
            0.7 + p * 1.9,
            box[1] + Math.cos(i * 2.1 + p * 5) * 0.45,
          )
        }
        sensorArrives(t)
      },
    },
    // T1574 Hijack Execution Flow
    T1574: {
      hits: [3.4],
      run(t) {
        view.target = [0.8, 3.0]
        view.height = 10
        storyState(3)
        // 正規のプログラムは、動くときに部品を読み込む。先に見つかる場所へ、偽の部品を置いておく
        const px = -0.9
        const pz = 2.4
        const planted = [-0.9, 1.4, 1.4]
        const real = documents[0]
        const fakePart = pinkCubes[0]
        trustedProcess.visible = true
        trustedProcess.scale.set(1.5, 1.5, 1.5)
        trustedProcess.position.set(px, 0, pz)
        trustedProcess.rotation.y = 0.6
        trustedProcessEyes.visible = t > 3.2
        real.visible = true
        real.scale.set(0.9, 0.9, 0.9)
        real.position.set(-0.9, 1.4, 0.3)
        real.rotation.y = 0.6
        if (t > 0.5 && t < 3.2) {
          if (t < 2.4) flyTo(fakePart, aboveHost(1.2), planted, t, 0.5, 1.5, 1.4, 6)
          else flyTo(fakePart, planted, [px, 1.3, pz], t, 2.6, 3.2, 0.4)
          fakePart.scale.set(0.34, 0.34, 0.34)
        }
        // プログラムが部品を探しにいき（水色の線）、手前にある偽物のほうを先に読み込む
        if (t > 2.0 && t < 2.7) stretchBetween(cyanBeams[0], [px, 1.0, pz], planted, 0.06)
        for (let i = 1; i < 5; i++) {
          const p = progress(t, 3.0 + i * 0.2, 4.0 + i * 0.2)
          if (p <= 0 || p >= 1) continue
          const spark = pinkCubes[i]
          const size = 0.28 * (1 - p * 0.6)
          spark.visible = true
          spark.scale.set(size, size, size)
          spark.position.set(
            px + Math.sin(i * 2.1 + p * 5) * 0.5,
            1.2 + p * 2.0,
            pz + Math.cos(i * 2.1 + p * 5) * 0.5,
          )
        }
        sensorArrives(t)
      },
    },
    // T1053 Scheduled Task/Job
    T1053: {
      hits: [3.0],
      run(t) {
        view.target = [1.6, 3.6]
        view.height = 10
        storyState(3)
        // OSの予約実行に登録しておく。針が上に来るたびに、決めておいたコードが動く
        const turns = Math.max(0, (t - 1.0) / 1.6)
        popIn(clock, HOST_SPOT[0] + 0.1, 3.3 + Math.sin(view.time * 3) * 0.05, HOST_SPOT[1], t, 0.5, 1.0)
        clock.rotation.y = 0.6
        clockHand.rotation.z = -turns * Math.PI * 2
        for (let n = 1; n <= 2; n++) {
          const fire = 1.0 + n * 1.6
          if (t > fire && t < fire + 0.6) malware.position.y = Math.abs(Math.sin((t - fire) * 8)) * 0.3
          for (let i = 0; i < 3; i++) {
            const p = progress(t, fire + i * 0.12, fire + 0.9 + i * 0.12)
            if (p <= 0 || p >= 1) continue
            const cube = pinkCubes[(n - 1) * 3 + i]
            const size = 0.28 * (1 - p * 0.6)
            cube.visible = true
            cube.scale.set(size, size, size)
            cube.position.set(
              HOST_SPOT[0] + Math.sin(i * 2.1 + p * 5) * 0.6,
              0.8 + p * 1.8,
              HOST_SPOT[1] + Math.cos(i * 2.1 + p * 5) * 0.6,
            )
          }
        }
        sensorArrives(t)
      },
    },
    // T1197 BITS Jobs
    T1197: {
      hits: [3.4],
      run(t) {
        view.target = [0.2, 3.2]
        view.height = 11
        storyState(3)
        // OSに備わっている、ファイルを運ぶ係（トラック）。仕事を頼むと、取ってきて、そのまま動かしてくれる
        const stop = [-0.6, 2.8]
        const away = smooth(progress(t, 1.5, 2.1)) - smooth(progress(t, 2.3, 2.9))
        const slip = documents[0]
        const load = pinkCubes[0]
        truckB.visible = true
        truckB.scale.set(0.45, 0.45, 0.45)
        truckB.position.set(stop[0] - away * 3.4, 0, stop[1])
        truckB.rotation.y = Math.PI / 2
        if (t > 0.5 && t < 1.5) {
          flyTo(slip, aboveHost(0.9), [stop[0], 1.4, stop[1]], t, 0.5, 1.3, 0.8, 5)
          slip.scale.set(0.7, 0.7, 0.7)
        }
        if (t > 2.2 && t < 3.3) {
          load.visible = true
          load.scale.set(0.36, 0.36, 0.36)
          if (t < 2.9) load.position.set(stop[0] - away * 3.4, 1.3, stop[1])
          else
            arcBetween(
              load,
              [stop[0], 1.3, stop[1]],
              [0.6, 0.4, stop[1] + 0.6],
              smooth(progress(t, 2.9, 3.3)),
              0.6,
            )
        }
        showSparks(0.6, 0.5, stop[1] + 0.6, t, 3.3, 1)
        sensorArrives(t)
      },
    },
    // T1651 Cloud Administration Command
    T1651: {
      hits: [2.8],
      run(t) {
        view.target = [0.2, 3.0]
        view.height = 11
        storyState(3)
        // クラウドの管理画面（雲）には、仮想マシンの中でコマンドを動かす正規の機能がある。管理の権限があれば、上から命令できる
        const console = [-1.2, 3.8, 1.8]
        const machine = [-0.9, 3.4]
        const vm = bots[4]
        popIn(cloud, console[0], console[1], console[2], t, 0.1, 1.3)
        cloud.rotation.y = 0.6
        vm.visible = true
        vm.scale.set(1.1, 1.1, 1.1)
        vm.position.set(
          machine[0],
          t > 2.4 && t < 4.4 ? Math.abs(Math.sin((t - 2.4) * 6)) * 0.2 : 0,
          machine[1],
        )
        vm.rotation.y = 0.6
        if (t > 0.6 && t < 1.5)
          stretchBetween(pinkBeams[0], aboveHost(0.9), [console[0], console[1] - 0.4, console[2]], 0.08)
        if (t > 1.6 && t < 2.6)
          stretchBetween(
            cyanBeams[0],
            [console[0], console[1] - 0.6, console[2]],
            [machine[0], 1.0, machine[1]],
            0.08,
          )
        showSparks(machine[0], 0.8, machine[1], t, 2.5)
        sensorArrives(t)
      },
    },
    // T1609 Container Administration Command
    T1609: {
      hits: [3.0],
      run(t) {
        view.target = [0.2, 3.0]
        view.height = 10.5
        storyState(3)
        // コンテナ（箱の列）を束ねている管理係。管理係に命令させれば、動いているコンテナの中でコマンドを動かせる
        const manager = [-2.0, 2.2]
        const box = (i: number) => [-0.9 + i * 0.8, 0.4, 3.6 - i * 0.5]
        trustedProcess.visible = true
        trustedProcess.scale.set(1.4, 1.4, 1.4)
        trustedProcess.position.set(manager[0], 0, manager[1])
        trustedProcess.rotation.y = 0.9
        yellowCubes.forEach((container, i) => {
          const at = box(i)
          container.visible = true
          container.material.color.setHex(i === 1 && t > 2.6 && t < 4.6 ? 0xff6fd8 : 0xf6c531)
          container.scale.set(0.6, 0.6, 0.6)
          container.position.set(at[0], at[1], at[2])
          container.rotation.y = 0.6
        })
        if (t > 0.6 && t < 1.4)
          stretchBetween(pinkBeams[0], aboveHost(0.9), [manager[0], 1.0, manager[1]], 0.08)
        if (t > 1.6 && t < 2.7) stretchBetween(cyanBeams[0], [manager[0], 1.0, manager[1]], box(1), 0.07)
        showSparks(box(1)[0], 0.7, box(1)[2], t, 2.6)
        sensorArrives(t)
        showCross(manager[0], 2.6, manager[1], t, 5.5)
      },
    },
    // T1699 Direct Prompt Injection
    T1699: {
      hits: [3.0],
      run(t) {
        view.target = [0.2, 3.0]
        view.height = 10.5
        storyState(3)
        // AI（ロボット）には、してはいけないことの歯止め（錠）がある。入力欄に細工した指示を打ち込んで、歯止めを外させる
        const ai = [-1.0, 2.8]
        const off = smooth(progress(t, 1.6, 2.3))
        const prompt = documents[0]
        relayBot.visible = true
        relayBot.scale.set(1.3, 1.3, 1.3)
        relayBot.position.set(ai[0], 0, ai[1])
        relayBot.rotation.y = t > 2.4 && t < 4.4 ? t * 9 : 0.6
        padlock.visible = off < 0.98 || t > 5.4
        padlock.scale.set(0.7, 0.7, 0.7)
        padlock.rotation.set(0, 0.6, t > 5.4 ? 0 : off * 1.2)
        if (t > 5.4) padlock.position.set(ai[0], 2.5, ai[1])
        else padlock.position.set(ai[0] - off * 1.1, lerp(2.5, 0.3, off * off), ai[1])
        if (t > 0.5 && t < 1.8) {
          flyTo(prompt, aboveHost(0.9), [ai[0] + 0.5, 1.5, ai[1] + 0.3], t, 0.5, 1.4, 0.8, 5)
          prompt.scale.set(0.8, 0.8, 0.8)
        }
        showSparks(ai[0], 1.2, ai[1], t, 2.5)
        sensorArrives(t)
      },
    },
    // T1675 ESXi Administration Command
    T1675: {
      hits: [3.0],
      run(t) {
        view.target = [0.2, 3.0]
        view.height = 10.5
        storyState(3)
        // 仮想マシン（上の機械）は、土台の仮想化基盤の上で動いている。土台の管理機能から、上のマシンの中へ命令を送り込む
        const base = [-1.2, 2.6]
        database.visible = true
        database.scale.set(1.2, 0.5, 1.2)
        database.position.set(base[0], 0, base[1])
        database.rotation.y = 0.6
        for (let i = 0; i < 2; i++) {
          const vm = bots[4 + i]
          const start = 1.8 + i * 0.5
          const at = [base[0] - 0.35 + i * 0.7, 0.85, base[1] - 0.2 + i * 0.4]
          vm.visible = true
          vm.scale.set(0.7, 0.7, 0.7)
          vm.position.set(
            at[0],
            at[1] + (t > start + 0.4 && t < 4.4 ? Math.abs(Math.sin((t - start) * 6)) * 0.15 : 0),
            at[2],
          )
          vm.rotation.y = 0.6
          if (t > start && t < start + 0.6)
            stretchBetween(cyanBeams[i], [at[0], 0.3, at[2]], [at[0], 1.3, at[2]], 0.1)
          showSparks(at[0], 1.4, at[2], t, start + 0.5, i * 3, 3)
        }
        if (t > 0.6 && t < 1.6)
          stretchBetween(pinkBeams[0], aboveHost(0.9), [base[0] + 0.7, 0.4, base[1] + 0.4], 0.09)
        sensorArrives(t)
      },
    },
    // T1698 Indirect Prompt Injection
    T1698: {
      hits: [3.2],
      run(t) {
        view.target = [0.2, 3.0]
        view.height = 10.5
        storyState(3)
        // AI（ロボット）が読むことになる文書に、指示を隠しておく。読み込んだAIは、それを自分への指示だと思って従ってしまう
        const ai = [-1.4, 2.4]
        const page = [-0.2, 1.3, 3.6]
        const sheet = documents[0]
        const hidden = pinkCubes[6]
        relayBot.visible = true
        relayBot.scale.set(1.3, 1.3, 1.3)
        relayBot.position.set(ai[0], 0, ai[1])
        relayBot.rotation.y = t > 2.9 && t < 4.4 ? t * 9 : 0.9
        if (t > 0.4) {
          flyTo(sheet, aboveHost(0.9), page, t, 0.4, 1.2, 0.7, 5)
          sheet.scale.set(1.1, 1.1, 1.1)
          if (t >= 1.2) sheet.rotation.y = 0.6
        }
        if (t > 0.4 && t < 2.9) {
          hidden.visible = true
          hidden.scale.set(0.16, 0.16, 0.16)
          if (t < 2.2)
            hidden.position.set(sheet.position.x + 0.1, sheet.position.y - 0.3, sheet.position.z + 0.1)
          else arcBetween(hidden, page, [ai[0], 1.3, ai[1]], smooth(progress(t, 2.2, 2.9)), 0.3)
        }
        // 読む
        if (t > 1.5 && t < 2.9)
          stretchBetween(
            cyanBeams[0],
            [ai[0], 1.3, ai[1]],
            [page[0], lerp(page[1] + 0.4, page[1] - 0.3, progress(t, 1.5, 2.3)), page[2]],
            0.06,
          )
        showSparks(ai[0], 1.2, ai[1], t, 3.0)
        sensorArrives(t)
      },
    },
    // T1674 Input Injection
    T1674: {
      hits: [2.8],
      run(t) {
        view.target = [2.4, 3.6]
        view.height = 10.5
        storyState(3)
        // キーボードのふりをする機器（水色の箱）を挿す。人には打てない速さで、コマンドが勝手に打ち込まれていく
        const desk = [3.5, 1.0, 4.4]
        const typing = t > 1.2 && t < 2.6
        token.visible = true
        token.scale.set(0.3, 0.3, 0.3)
        arcBetween(token, aboveHost(1.0), [desk[0] + 0.7, 0.9, desk[2]], smooth(progress(t, 0.4, 1.1)), 0.8)
        token.rotation.y = t < 1.1 ? t * 5 : 0.6
        yellowCubes.forEach((typed, i) => {
          if (!typing) return
          const phase = ((t - 1.2) * 4 + i / 3) % 1
          typed.visible = true
          typed.material.color.setHex(0xf6c531)
          typed.scale.set(0.2, 0.2, 0.2)
          typed.position.set(desk[0] - 0.4 + i * 0.4, desk[1] + 0.3 + phase * 0.9, desk[2])
        })
        // 本人は、手を触れていない
        employees[2].position.y = typing ? 0.12 : 0
        showSparks(desk[0], 1.2, desk[2], t, 2.5)
        sensorArrives(t)
      },
    },
    // T1559 Inter-Process Communication
    T1559: {
      hits: [3.0],
      run(t) {
        view.target = [0.0, 3.0]
        view.height = 10.5
        storyState(3)
        // 正規のプログラムどうしは、決まった通り道（水色の線）でやり取りしている。そこへ頼みごとを流すと、相手のプログラムが代わりに動かしてくれる
        const from = [0.4, 0.9, 1.4]
        const to = [-1.8, 0.9, 2.2]
        const sender = bots[4]
        const request = pinkCubes[6]
        sender.visible = true
        sender.scale.set(1, 1, 1)
        sender.position.set(from[0], 0, from[2])
        sender.rotation.y = 0.6
        trustedProcess.visible = true
        trustedProcess.scale.set(1.5, 1.5, 1.5)
        trustedProcess.position.set(to[0], 0, to[2])
        trustedProcess.rotation.y = 0.9
        stretchBetween(cyanBeams[0], from, to, 0.07)
        if (t > 0.6 && t < 2.7) {
          if (t < 1.5) flyTo(request, aboveHost(0.9), from, t, 0.6, 1.5, 0.8, 6)
          else flyTo(request, from, to, t, 1.7, 2.7)
          request.scale.set(0.3, 0.3, 0.3)
        }
        showSparks(to[0], 1.1, to[2], t, 2.7)
        sensorArrives(t)
      },
    },
    // T1106 Native API
    T1106: {
      hits: [2.8],
      run(t) {
        view.target = [0.2, 3.0]
        view.height = 10.5
        storyState(3)
        // ふつうは、窓口のプログラムを通してOSに頼む。窓口を通さず、OSの奥の機能（台帳）を直接呼び出して動かす
        const core = [-1.8, 2.0]
        const desk = [-0.2, 2.6]
        database.visible = true
        database.scale.set(0.9, 0.9, 0.9)
        database.position.set(core[0], 0, core[1])
        database.rotation.y = 0.6
        trustedProcess.visible = true
        trustedProcess.scale.set(1.2, 1.2, 1.2)
        trustedProcess.position.set(desk[0], 0, desk[1])
        trustedProcess.rotation.y = 0.6
        // 窓口の頭ごしに
        if (t > 0.8 && t < 4.4) stretchBetween(pinkBeams[0], aboveHost(1.0), [core[0], 1.9, core[1]], 0.09)
        if (t > 1.6 && t < 4.4) showRipples(core[0], core[1], (t - 1.6) * 0.9, 4)
        showSparks(core[0], 1.6, core[1], t, 2.2)
        sensorArrives(t)
      },
    },
    // T1677 Poisoned Pipeline Execution
    T1677: {
      hits: [3.2],
      run(t) {
        view.target = [-0.4, 3.2]
        view.height = 11
        storyState(3)
        // 部品（紙）を流すと、自動で組み立てて動かしてくれる仕組み。流れの中に不正なコードをひとつ紛れ込ませると、いっしょに組み込まれて動く
        const station = [-0.6, 2.8]
        const items = [documents[0], pinkCubes[6], documents[1]]
        const built = bots[4]
        items.forEach((item, i) => {
          const start = 0.4 + i * 0.6
          const p = progress(t, start, start + 1.3)
          if (p <= 0 || p >= 1) return
          item.visible = true
          if (i === 1) item.scale.set(0.3, 0.3, 0.3)
          else {
            item.scale.set(0.7, 0.7, 0.7)
            item.rotation.y = 0.6
          }
          item.position.set(lerp(-3.6, station[0], p), 0.9, lerp(4.2, station[1], p))
        })
        if (t > 0.6 && t < 3.0) {
          hammer.visible = true
          hammer.position.set(station[0] + 0.6, 0.9, station[1] + 0.2)
          hammer.rotation.z = 0.3 + Math.abs(Math.cos(((t - 0.6) * Math.PI) / 0.6))
        }
        if (t > 2.9) {
          const size = overshoot(progress(t, 2.9, 3.2))
          built.visible = true
          built.scale.set(size, size, size)
          built.position.set(station[0], Math.abs(Math.sin((t - 2.9) * 6)) * 0.2, station[1])
          built.rotation.y = 0.6
        }
        showSparks(station[0], 0.9, station[1], t, 3.1)
        sensorArrives(t)
      },
    },
    // T1648 Serverless Execution
    T1648: {
      hits: [2.8],
      run(t) {
        view.target = [0.2, 3.0]
        view.height = 11
        storyState(3)
        // クラウドに、小さな処理（ピンクの箱）を登録しておく。きっかけの出来事（黄色い箱）が届くたびに、クラウドがそれを動かしてくれる
        const sky = [-1.2, 3.8, 1.8]
        const slot = [sky[0], sky[1] - 0.9, sky[2] + 0.4]
        const fn = pinkCubes[6]
        const trigger = yellowCubes[0]
        popIn(cloud, sky[0], sky[1], sky[2], t, 0.1, 1.3)
        cloud.rotation.y = 0.6
        if (t > 0.5) {
          flyTo(fn, aboveHost(0.9), slot, t, 0.5, 1.4, 0.8, 6)
          fn.scale.set(0.34, 0.34, 0.34)
          if (t > 2.5 && t < 4.4) fn.rotation.y = t * 8
        }
        if (t > 1.7 && t < 2.6) {
          trigger.visible = true
          trigger.material.color.setHex(0xf6c531)
          trigger.scale.set(0.26, 0.26, 0.26)
          arcBetween(trigger, [-3.5, 1.2, 2.9], slot, smooth(progress(t, 1.7, 2.5)), 0.8)
        }
        showSparks(slot[0], slot[1], slot[2], t, 2.5)
        sensorArrives(t)
      },
    },
    // T1129 Shared Modules
    T1129: {
      hits: [2.8],
      run(t) {
        view.target = [0.6, 3.2]
        view.height = 10.5
        storyState(3)
        // プログラムは、動いている途中でも部品を読み込んで機能を足せる。正規の棚（紙の列）からではなく、見慣れない場所に置いた不正な部品を読み込む
        const from = [-2.2, 0.4, 5.0]
        const part = pinkCubes[6]
        const attached = progress(t, 2.2, 2.5)
        for (let i = 0; i < 3; i++) {
          const book = documents[i]
          book.visible = true
          book.scale.set(0.8, 0.8, 0.8)
          book.position.set(-1.6 + i * 0.6, 1.2, 1.8)
          book.rotation.y = 0.6
        }
        part.visible = true
        part.scale.set(0.4, 0.4, 0.4)
        arcBetween(part, from, aboveHost(1.15), smooth(progress(t, 1.0, 2.2)), 1.4)
        if (t > 1.0 && t < 2.2) part.rotation.y = t * 6
        if (t > 0.5 && t < 1.2) stretchBetween(pinkBeams[0], aboveHost(0.8), from, 0.07)
        if (attached > 0 && t < 4.4) {
          const size = MALWARE_SIZE * (1 + 0.15 * Math.sin(t * 12))
          malware.scale.set(size, size, size)
        }
        showSparks(HOST_SPOT[0], 1.5, HOST_SPOT[1], t, 2.4)
        sensorArrives(t)
      },
    },
    // T1569 System Services
    T1569: {
      hits: [3.0],
      run(t) {
        view.target = [0.0, 3.0]
        view.height = 10.5
        storyState(3)
        // OSには、サービス（機械の列）を起こして動かす係がいる。係に頼んで、自分のプログラムをサービスとして起こしてもらう
        const manager = [-2.2, 2.0]
        const spot = [-0.2, 3.4]
        const up = overshoot(progress(t, 2.0, 2.5))
        const mine = bots[6]
        trustedProcess.visible = true
        trustedProcess.scale.set(1.4, 1.4, 1.4)
        trustedProcess.position.set(manager[0], 0, manager[1])
        trustedProcess.rotation.y = 0.9
        for (let i = 0; i < 2; i++) {
          const service = bots[4 + i]
          service.visible = true
          service.scale.set(0.9, 0.9, 0.9)
          service.position.set(-1.9 + i * 0.85, Math.abs(Math.sin(view.time * 4 + i)) * 0.08, 3.4 - i * 0.25)
          service.rotation.y = 0.6
        }
        if (t > 0.5) {
          mine.visible = true
          mine.scale.set(0.9, lerp(0.15, 0.9, up), 0.9)
          mine.position.set(
            spot[0],
            t > 2.5 && t < 4.4 ? Math.abs(Math.sin((t - 2.5) * 6)) * 0.2 : 0,
            spot[1],
          )
          mine.rotation.y = 0.6
        }
        if (t > 0.8 && t < 1.6)
          stretchBetween(pinkBeams[0], aboveHost(0.9), [manager[0], 1.0, manager[1]], 0.08)
        if (t > 1.6 && t < 2.5)
          stretchBetween(cyanBeams[0], [manager[0], 1.0, manager[1]], [spot[0], 0.5, spot[1]], 0.08)
        showSparks(spot[0], 0.9, spot[1], t, 2.6)
        sensorArrives(t)
      },
    },
    // T1127 Trusted Developer Utilities Proxy Execution
    T1127: {
      hits: [3.0],
      run(t) {
        view.target = [0.4, 3.2]
        view.height = 10.5
        storyState(3)
        // 開発用の正規の道具（かなづち）は、信頼されていて止められない。その道具に不正なコードを渡して、代わりに動かしてもらう
        const bench = [-0.6, 0.5, 3.0]
        const code = pinkCubes[6]
        hammer.visible = true
        hammer.position.set(bench[0] + 0.7, 0.9, bench[2] + 0.2)
        hammer.rotation.z = t > 1.6 && t < 4.4 ? 0.3 + Math.abs(Math.cos(((t - 1.6) * Math.PI) / 0.5)) : 1.2
        if (t < 5.2) showCheck(bench[0] + 0.7, 2.6, bench[2] + 0.2, t, 0.2)
        if (t > 0.6 && t < 2.6) {
          flyTo(code, aboveHost(0.9), bench, t, 0.6, 1.5, 0.8, 6)
          code.scale.set(0.34, 0.34, 0.34)
        }
        showSparks(bench[0], 0.6, bench[2], t, 2.5)
        sensorArrives(t)
      },
    },
  }
}
