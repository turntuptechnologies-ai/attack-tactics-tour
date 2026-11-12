// TA0009 収集（Collection）の場面。
import type { Kit } from '../kit'
import { progress, smooth, lerp, overshoot, arcBetween, stretchBetween, walk, applyPose } from '../motion'
import type { SceneMap } from './types'

export default function collection(kit: Kit): SceneMap {
  const {
    employees,
    mails,
    token,
    glass,
    RACK_Z,
    racks,
    SERVER_SPOT,
    padlock,
    documents,
    view,
    pileSpot,
    storyState,
    flyTo,
    popIn,
    pinkBeams,
    database,
    scanPlane,
    pinkCubes,
    hopInPlace,
    user,
    bots,
    cyanBeams,
    yellowCubes,
    cloud,
    showCross,
    showAlert,
    DEFENDER_SPOT,
    defender,
    standing,
    showRipples,
    flyPaper,
  } = kit
  return {
    // T1005 Data from Local System（本編）
    T1005: {
      hits: [3.5],
      run(t) {
        view.target = [-1.5, -3.2]
        view.height = 10.5
        storyState(11) // Collection
        // いつもの立ち位置（事務室の右奥）はこの画角に入らないので、サーバー室の手前に立たせる
        applyPose(defender, standing(1.6, -1.2, -Math.PI / 2))
        for (let i = 0; i < 4; i++) {
          const rack = racks[i],
            start = 0.6 + i * 0.6,
            p = progress(t, start, start + 1)
          if (p <= 0) continue
          arcBetween(rack.data, [rack.x, 2.72, RACK_Z], pileSpot(i), smooth(p), 1.5)
          if (p < 1) rack.data.rotation.y = t * 5
        }
      },
    },
    // T1114 Email Collection
    T1114: {
      hits: [3.8],
      run(t) {
        view.target = [-0.5, 0.5]
        view.height = 14
        storyState(11) // Email Collection
        employees.forEach((employee, i) => {
          const seat = employee.position,
            start = 0.5 + i * 0.5,
            mailItem = mails[i]
          if (t < start) return
          flyTo(
            mailItem,
            [seat.x, 2.2, seat.z],
            [SERVER_SPOT[0] - 0.9 + i * 0.6, 0.35, SERVER_SPOT[1] + 1.4],
            t,
            start + 0.5,
            start + 1.7,
            3,
            5,
          )
          const scale = overshoot(progress(t, start, start + 0.3))
          mailItem.scale.set(scale, scale, scale)
          if (t >= start + 1.7) mailItem.rotation.y = 0.4
        })
      },
    },
    // T1560 Archive Collected Data
    T1560: {
      hits: [3.2],
      run(t) {
        view.target = [-1.5, -3.0]
        view.height = 9.5
        storyState(11) // Archive Collected Data
        // いつもの立ち位置（事務室の右奥）はこの画角に入らないので、サーバー室の手前に立たせる
        applyPose(defender, standing(1.6, -1.2, -Math.PI / 2))
        const centre = [-1.2, 0.5, -2.2],
          q = smooth(progress(t, 1.0, 2.2)),
          size = 0.6 * (1 - 0.9 * smooth(progress(t, 1.8, 2.4)))
        for (let i = 0; i < 4; i++) {
          const rack = racks[i],
            p0 = pileSpot(i)
          rack.data.position.set(lerp(p0[0], centre[0], q), lerp(p0[1], centre[1], q), p0[2])
          rack.data.scale.set(size, size, size)
          rack.data.visible = t < 2.4
        }
        if (t > 2.1) {
          const scale = 0.95 * overshoot(progress(t, 2.1, 2.5))
          token.visible = true
          token.scale.set(scale, scale, scale)
          token.position.set(centre[0], 0.5, centre[2])
          token.rotation.y = 0.3
        }
        popIn(padlock, centre[0], 1.3, centre[2], t, 2.9, 0.6)
        padlock.rotation.y = 0.6
      },
    },
    // T1113 Screen Capture
    T1113: {
      hits: [3.7],
      run(t) {
        view.target = [-2, 0.6]
        view.height = 12
        storyState(11) // Screen Capture
        const seat = employees[1].position,
          scr = [seat.x, 1.0, seat.z + 0.7]
        for (let i = 0; i < 3; i++) {
          const start = 0.5 + i * 0.9,
            doc = documents[i]
          if (t > start && t < start + 0.25) {
            glass.visible = true
            glass.scale.set(1.3, 1.0, 0.1)
            glass.position.set(scr[0], scr[1], scr[2] + 0.5)
            glass.material.opacity = 0.8
          }
          if (t > start + 0.1) {
            flyTo(
              doc,
              [scr[0], 1.6, scr[2]],
              [SERVER_SPOT[0] - 0.7 + i * 0.7, 0.5, SERVER_SPOT[1] + 1.5],
              t,
              start + 0.3,
              start + 1.3,
              2.5,
              5,
            )
            const size = overshoot(progress(t, start + 0.1, start + 0.4))
            doc.scale.set(size, size, size)
            if (t >= start + 1.3) doc.rotation.y = 0.6
          }
        }
      },
    },
    // T1074 Data Staged
    T1074: {
      hits: [3.7],
      run(t) {
        view.target = [-2, -0.5]
        view.height = 14
        storyState(11) // Data Staged
        const centre = [-3.2, 0.3, -2.0]
        showRipples(centre[0], centre[2], t * 0.5, 4)
        for (let i = 0; i < 2; i++) {
          const rack = racks[i],
            start = 0.5 + i * 1.2,
            p = progress(t, start, start + 1.1),
            seat = employees[1 - i].position,
            doc = documents[i],
            laterStart = 1.1 + i * 1.2
          if (p > 0) {
            arcBetween(
              rack.data,
              [rack.x, 2.72, RACK_Z],
              [centre[0] - 0.4 + i * 0.8, 0.3, centre[2] - 0.3],
              smooth(p),
              1.5,
            )
            if (p < 1) rack.data.rotation.y = t * 5
          }
          if (t > laterStart) {
            flyPaper(
              doc,
              [seat.x, 2.2, seat.z],
              [centre[0] - 0.4 + i * 0.8, 0.45, centre[2] + 0.5],
              t,
              laterStart + 0.2,
              laterStart + 1.3,
              3,
              laterStart,
              1,
            )
          }
        }
      },
    },
    // T1213 Data from Information Repositories
    T1213: {
      hits: [4.0],
      run(t) {
        view.target = [-1.6, 0.4]
        view.height = 13
        storyState(11)
        // 社内の情報共有の場（文書管理やWiki）。そこから価値のある文書を集める
        const wiki = [-4.6, 0.6]
        database.visible = true
        database.scale.set(1.1, 1.1, 1.1)
        database.position.set(wiki[0], 0, wiki[1])
        database.rotation.y = 0.6
        if (t > 0.5 && t < 1.2)
          stretchBetween(pinkBeams[0], [SERVER_SPOT[0], 1.2, SERVER_SPOT[1]], [wiki[0], 1.2, wiki[1]], 0.08)
        documents.forEach((doc, i) => {
          const start = 1.2 + i * 0.5
          if (t < start) return
          flyPaper(
            doc,
            [wiki[0], 2.2, wiki[1]],
            [SERVER_SPOT[0] - 1.0 + i * 0.65, 0.45, SERVER_SPOT[1] + 1.5],
            t,
            start + 0.2,
            start + 1.2,
            2.2,
            start,
            0.85,
          )
        })
      },
    },
    // T1119 Automated Collection
    T1119: {
      hits: [3.4],
      run(t) {
        view.target = [-0.5, -3.4]
        view.height = 12.5
        storyState(11)
        // 条件に合うデータを、仕組みで端から機械的に集めていく
        const sweep = progress(t, 0.5, 2.9)
        if (t > 0.5 && t < 2.9) {
          scanPlane.visible = true
          scanPlane.rotation.y = Math.PI / 2
          scanPlane.scale.set(2.0, 3.4, 0.08)
          scanPlane.position.set(lerp(racks[0].x - 1, racks[5].x + 1, sweep), 1.7, RACK_Z)
          scanPlane.material.opacity = 0.4
        }
        racks.forEach((rack, i) => {
          const start = 0.5 + ((rack.x + 7) / 14) * 2.4
          const p = progress(t, start, start + 0.6)
          if (p <= 0) return
          arcBetween(
            rack.data,
            [rack.x, 2.72, RACK_Z],
            [SERVER_SPOT[0] - 1.6 + i * 0.62, 0.3, SERVER_SPOT[1] + 1.5],
            smooth(p),
            1.2,
          )
          if (p < 1) rack.data.rotation.y = t * 6
        })
      },
    },
    // T1123 Audio Capture
    T1123: {
      hits: [3.6],
      run(t) {
        view.target = [-1.6, 1.2]
        view.height = 12
        storyState(11)
        // 乗っ取った端末のマイクで、周りの会話を録音する
        const mic = [-2.3, 0.8, 2.6]
        const talker = employees[1].position
        if (t > 0.4 && t < 4.4) showRipples(talker.x, talker.z, (t - 0.4) * 0.8, 6)
        hopInPlace(employees[1], t, 0.4, 4.4, 0.06)
        for (let i = 0; i < 4; i++) {
          const start = 1.0 + i * 0.5
          const p = progress(t, start, start + 1.1)
          if (p <= 0) continue
          const cube = pinkCubes[i]
          cube.visible = true
          cube.scale.set(0.24, 0.24, 0.24)
          arcBetween(cube, mic, [SERVER_SPOT[0] - 0.9 + i * 0.6, 0.3, SERVER_SPOT[1] + 1.5], smooth(p), 2.0)
        }
      },
    },
    // T1125 Video Capture
    T1125: {
      hits: [4.0],
      run(t) {
        view.target = [-2, 1.0]
        view.height = 12
        storyState(11)
        // 乗っ取った端末のカメラで、周りの様子を撮る
        const lens = [-2.3, 0.9, 2.6]
        const subject = employees[0].position
        if (t > 0.5 && t < 4.4) {
          const flash = [1.0, 1.8, 2.6].some((at) => t > at && t < at + 0.2)
          stretchBetween(glass, lens, [subject.x, 1.2, subject.z], 1.2)
          glass.material.opacity = flash ? 0.75 : 0.25
        }
        for (let i = 0; i < 3; i++) {
          const start = 1.0 + i * 0.8
          if (t < start + 0.1) continue
          const shot = documents[i]
          const size = 0.8 * overshoot(progress(t, start + 0.1, start + 0.4))
          flyTo(
            shot,
            [lens[0], 1.7, lens[2]],
            [SERVER_SPOT[0] - 0.7 + i * 0.7, 0.5, SERVER_SPOT[1] + 1.5],
            t,
            start + 0.3,
            start + 1.3,
            2.5,
            5,
          )
          shot.scale.set(size, size, size)
          if (t >= start + 1.3) shot.rotation.y = 0.6
        }
      },
    },
    // T1557 Adversary-in-the-Middle
    T1557: {
      hits: [3.6],
      run(t) {
        view.target = [0.5, -0.5]
        view.height = 15
        storyState(11)
        // 端末とサーバーのあいだの通信。その途中に割り込み、通り抜けるデータの写しを取る
        const seat = [employees[2].position.x, 1.0, employees[2].position.z + 0.9]
        const server = [racks[3].x, 1.6, RACK_Z + 0.6]
        const middle = [1.0, 0.9, -0.6]
        const relay = bots[6]
        const inPlace = t > 1.4 && t < 5.2
        if (inPlace) {
          stretchBetween(cyanBeams[0], seat, middle, 0.06)
          stretchBetween(cyanBeams[1], middle, server, 0.06)
        } else stretchBetween(cyanBeams[0], seat, server, 0.06)
        if (t > 0.9 && t < 5.2) {
          const size = overshoot(progress(t, 0.9, 1.3))
          relay.visible = true
          relay.scale.set(size, size, size)
          relay.position.set(middle[0], 0, middle[2])
          relay.rotation.y = 0.6
        }
        for (let i = 0; i < 3; i++) {
          const start = 1.8 + i * 0.6
          if (t < start) continue
          const copy = documents[i]
          const to = pileSpot(i)
          flyPaper(
            copy,
            [middle[0], 1.6, middle[2]],
            [to[0], 0.5, to[2] + 0.9],
            t,
            start + 0.2,
            start + 1.2,
            1.6,
            start,
          )
        }
        showCross(middle[0], 2.4, middle[2], t, 5.2)
      },
    },
    // T1185 Browser Session Hijacking
    T1185: {
      hits: [3.8],
      run(t) {
        view.target = [-2.6, 0.8]
        view.height = 12
        storyState(11)
        // 従業員のブラウザ（ガラスの板）は、業務のサイトにログインしたまま。そこへ入り込み、その画面を借りて情報を読む
        const seat = employees[1].position
        const browser = [seat.x, 1.7, seat.z + 1.1]
        const hook = pinkCubes[0]
        glass.visible = true
        glass.scale.set(1.7, 1.2, 0.1)
        glass.position.set(browser[0], browser[1], browser[2])
        glass.material.opacity = t > 1.6 && t < 4.6 ? 0.45 + 0.2 * Math.sin(t * 12) : 0.35
        // ログイン済みのしるし
        token.visible = true
        token.scale.set(0.3, 0.3, 0.3)
        token.position.set(browser[0] + 0.6, browser[1] + 0.85, browser[2])
        token.rotation.y = view.time * 2
        if (t > 0.6 && t < 4.6) {
          flyTo(hook, [-2.3, 0.9, 2.6], [browser[0] - 0.5, browser[1], browser[2] + 0.1], t, 0.6, 1.6, 0.9, 6)
          hook.scale.set(0.26, 0.26, 0.26)
        }
        for (let i = 0; i < 3; i++) {
          const start = 2.0 + i * 0.5
          if (t < start) continue
          const page = documents[i]
          const to = pileSpot(i)
          flyPaper(page, browser, [to[0], 0.5, to[2] + 0.9], t, start + 0.2, start + 1.3, 2.4, start)
        }
      },
    },
    // T1115 Clipboard Data
    T1115: {
      hits: [3.6],
      run(t) {
        view.target = [-2.6, 0.8]
        view.height = 12
        storyState(11)
        // 従業員がコピーした内容は、いったん置き場（クリップボード）に載る。そこを読み取る
        const seat = employees[1].position
        const board = [seat.x + 1.3, 1.9, seat.z + 0.6]
        const copied = yellowCubes[0]
        const tray = documents[3]
        tray.visible = true
        tray.scale.set(1.5, 1.5, 1.5)
        tray.position.set(board[0], board[1] - 0.45, board[2])
        tray.rotation.set(Math.PI / 2, 0, 0)
        for (let i = 0; i < 2; i++) {
          const start = 0.5 + i * 1.6
          if (t < start || t > start + 1.6) continue
          copied.visible = true
          copied.material.color.setHex(0xf6c531)
          copied.scale.set(0.3, 0.3, 0.3)
          arcBetween(copied, [seat.x, 1.1, seat.z + 0.9], board, smooth(progress(t, start, start + 0.6)), 0.7)
          if (t > start + 0.7 && t < start + 1.0) stretchBetween(pinkBeams[i], [-2.3, 0.9, 2.6], board, 0.07)
        }
        for (let i = 0; i < 2; i++) {
          const start = 1.5 + i * 1.6
          if (t < start) continue
          const copy = documents[i]
          const to = pileSpot(i + 1)
          flyPaper(copy, board, [to[0], 0.5, to[2] + 0.9], t, start + 0.1, start + 1.1, 2.2, start)
        }
      },
    },
    // T1530 Data from Cloud Storage
    T1530: {
      hits: [3.8],
      run(t) {
        view.target = [-4.2, -0.6]
        view.height = 16.5
        storyState(11)
        // 会社がクラウドに置いているデータ。手に入れた権限で、そこから取り出す
        const store = [-7.4, 4.6, -0.6]
        popIn(cloud, store[0], store[1], store[2], t, 0.1, 1.6)
        cloud.rotation.y = 0.6
        if (t > 0.6 && t < 1.5)
          stretchBetween(
            pinkBeams[0],
            [SERVER_SPOT[0], 1.4, SERVER_SPOT[1]],
            [store[0], store[1] - 0.4, store[2]],
            0.08,
          )
        documents.forEach((file, i) => {
          const start = 1.4 + i * 0.45
          const to = pileSpot(i)
          const hang = [store[0] - 0.5 + i * 0.6, store[1] - 1.8, store[2] + 1.2]
          file.visible = t > 0.3
          file.scale.set(0.8, 0.8, 0.8)
          flyTo(file, hang, [to[0], 0.5, to[2] + 0.9], t, start, start + 1.3, 1.2, 5)
          file.visible = t > 0.3
          if (t < start || t >= start + 1.3) file.rotation.y = 0.6
        })
      },
    },
    // T1602 Data from Configuration Repository
    T1602: {
      hits: [3.8],
      run(t) {
        view.target = [0.2, -0.8]
        view.height = 14
        storyState(11)
        // ネットワーク機器（小さな機械）の設定をまとめて管理する仕組み（台帳）。そこから、機器の設定を読み出す
        const hub = [1.0, 1.4, -1.0]
        database.visible = true
        database.scale.set(0.9, 0.9, 0.9)
        database.position.set(hub[0], 0, hub[2])
        database.rotation.y = 0.6
        for (let i = 0; i < 3; i++) {
          const device = bots[4 + i]
          const at = [4.5 + (i - 1) * 1.3, 0.5, -0.6 + (i === 1 ? 1.0 : 0)]
          const start = 1.6 + i * 0.6
          device.visible = true
          device.scale.set(0.8, 0.8, 0.8)
          device.position.set(at[0], 0, at[2])
          device.rotation.y = -0.6
          stretchBetween(cyanBeams[i], hub, at, 0.05)
          if (t < start) continue
          const config = documents[i]
          const to = pileSpot(i)
          flyPaper(
            config,
            [hub[0], 2.2, hub[2]],
            [to[0], 0.5, to[2] + 0.9],
            t,
            start + 0.2,
            start + 1.3,
            1.8,
            start,
          )
        }
        if (t > 0.6 && t < 1.5) stretchBetween(pinkBeams[0], [SERVER_SPOT[0], 1.4, SERVER_SPOT[1]], hub, 0.08)
      },
    },
    // T1039 Data from Network Shared Drive
    T1039: {
      hits: [3.8],
      run(t) {
        view.target = [-1.5, -1.2]
        view.height = 16
        storyState(11)
        // みんなが使う共有フォルダ（どの端末ともつながっているサーバー）。そこのファイルを集める
        const share = racks[1]
        const top = [share.x, 2.9, RACK_Z]
        employees.forEach((employee, i) => {
          if (i < 3)
            stretchBetween(
              cyanBeams[i],
              [employee.position.x, 1.0, employee.position.z + 0.9],
              [share.x, 1.6, RACK_Z + 0.6],
              0.05,
            )
        })
        share.lights.color.setHex(t > 0.8 && t < 4.6 ? 0xff6fd8 : 0x4dff9a)
        documents.forEach((file, i) => {
          const start = 1.0 + i * 0.5
          if (t < start) return
          const to = pileSpot(i)
          flyPaper(file, top, [to[0], 0.5, to[2] + 0.9], t, start + 0.2, start + 1.2, 1.4, start)
        })
        showAlert(0, DEFENDER_SPOT[0], 2.2, DEFENDER_SPOT[1], t, 5.2, 6.6)
      },
    },
    // T1025 Data from Removable Media
    T1025: {
      hits: [3.8],
      run(t) {
        view.target = [-2.4, 1.0]
        view.height = 12
        storyState(11)
        // 従業員が、乗っ取られた端末にUSBメモリ（水色の箱）を挿す。その中身を、挿されたそばから集める
        const port = [-2.3, 1.2, 2.6]
        const pose = walk(
          [
            [0, 0.6, 4.2],
            [0.3, 0.6, 4.2],
            [1.4, -1.4, 3.0],
            [7, -1.4, 3.0],
          ],
          t,
        )
        user.visible = true
        applyPose(user, pose)
        token.visible = true
        token.scale.set(0.35, 0.35, 0.35)
        token.rotation.y = view.time * 2
        if (t < 1.4) token.position.set(pose.x, 2.0, pose.z)
        else arcBetween(token, [-1.4, 2.0, 3.0], port, smooth(progress(t, 1.4, 1.9)), 0.4)
        for (let i = 0; i < 3; i++) {
          const start = 2.1 + i * 0.45
          if (t < start) continue
          const file = documents[i]
          const to = pileSpot(i)
          flyPaper(file, port, [to[0], 0.5, to[2] + 0.9], t, start + 0.2, start + 1.3, 2.4, start)
        }
      },
    },
    // T1056 Input Capture
    T1056: {
      hits: [3.8],
      run(t) {
        view.target = [-3.2, 1.2]
        view.height = 11
        storyState(11)
        // 従業員が打ち込む一文字ずつ（黄色い箱）を、横で写し取っていく
        const seat = employees[1].position
        const record = documents[0]
        yellowCubes.forEach((typed, i) => {
          const start = 0.6 + i * 0.6
          const at = [seat.x - 0.45 + i * 0.45, 1.5, seat.z + 0.95]
          if (t < start || t > 4.6) return
          const size = 0.26 * overshoot(progress(t, start, start + 0.25))
          typed.visible = true
          typed.material.color.setHex(0xf6c531)
          typed.scale.set(size, size, size)
          typed.position.set(at[0], at[1], at[2])
          const copy = pinkCubes[i]
          const p = progress(t, start + 0.15, start + 0.9)
          if (p > 0) {
            copy.visible = true
            copy.scale.set(0.22, 0.22, 0.22)
            arcBetween(copy, at, [-2.3 - 0.3 + i * 0.3, 1.3, 2.6], smooth(p), 0.6)
          }
        })
        hopInPlace(employees[1], t, 0.5, 2.4, 0.06)
        if (t > 2.8) {
          flyPaper(
            record,
            [-2.3, 1.6, 2.6],
            [SERVER_SPOT[0], 0.5, SERVER_SPOT[1] + 1.6],
            t,
            3.0,
            4.0,
            2.4,
            2.8,
            0.9,
          )
        }
      },
    },
  }
}
