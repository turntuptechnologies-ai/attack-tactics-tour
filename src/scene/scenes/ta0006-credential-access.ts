// TA0006 認証情報アクセス（Credential Access）の場面。
import type { Kit } from '../kit'
import { progress, smooth, lerp, overshoot, walk, applyPose, arcBetween, stretchBetween } from '../motion'
import type { SceneMap } from './types'

export default function credentialAccess(kit: Kit): SceneMap {
  const {
    employees,
    key,
    alertMarks,
    pinkBeams,
    cyanBeams,
    RACK_Z,
    HOST_SPOT,
    ADMIN_MALWARE_SIZE,
    malware,
    spareKeys,
    pinkCubes,
    padlock,
    view,
    storyState,
    aboveHost,
    flyTo,
    showCross,
    showCheck,
    hopInPlace,
    database,
    token,
    cloud,
    popIn,
    racks,
    user,
    hammer,
    bots,
    checkpoint,
    TOWER_SPOT,
    yellowCubes,
    attackerScan,
    documents,
    trustedProcess,
  } = kit
  return {
    // T1003 OS Credential Dumping（本編）
    T1003: {
      hits: [3.8],
      run(t) {
        view.target = [0, 3.6]
        view.height = 12.5
        storyState(8) // Credential Access
        ;[0, 1, 3].forEach((ei, j) => {
          const seat = employees[ei].position,
            start = 0.5 + j * 0.4,
            laterStart = 1.9 + j * 0.5,
            spareKey = spareKeys[j]
          if (t < start) return
          spareKey.visible = true
          spareKey.rotation.set(0, t * 3 + j, 0)
          const size = 0.8 * overshoot(progress(t, start, start + 0.3))
          spareKey.scale.set(size, size, size)
          const ang = t * 2 + j * 2.09,
            point = [HOST_SPOT[0] + Math.cos(ang) * 1.0, 2.3, HOST_SPOT[1] + Math.sin(ang) * 1.0]
          if (t < laterStart) spareKey.position.set(seat.x, 2.4 + Math.sin(t * 5 + j) * 0.08, seat.z)
          else if (t < laterStart + 0.9)
            arcBetween(
              spareKey,
              [seat.x, 2.4, seat.z],
              point,
              smooth(progress(t, laterStart, laterStart + 0.9)),
              1.5,
            )
          else spareKey.position.set(point[0], point[1], point[2])
        })
      },
    },
    // T1110 Brute Force
    T1110: {
      hits: [3.2],
      run(t) {
        view.target = [1.0, 3.0]
        view.height = 10
        storyState(8) // Brute Force
        const lockAt = [-0.4, 1.5, 2.2]
        padlock.visible = true
        padlock.position.set(lockAt[0], lockAt[1], lockAt[2])
        padlock.rotation.y = 0.6
        spareKeys.forEach((spareKey, j) => {
          const start = 0.6 + j * 0.9,
            p = progress(t, start, start + 0.7)
          if (t < start) return
          const size = 0.7 * (j < 2 ? 1 - progress(t, start + 0.7, start + 0.95) : 1 - progress(t, 5.0, 5.3))
          spareKey.visible = size > 0.01
          spareKey.scale.set(size, size, size)
          arcBetween(spareKey, aboveHost(1.8), lockAt, smooth(p), 1.0)
          spareKey.rotation.y = t * 6
        })
        if (t > 3.1 && t < 5.0) {
          showCheck(lockAt[0], 2.8, lockAt[2], t, 3.1)
          padlock.position.y = lockAt[1] + Math.abs(Math.sin((t - 3.1) * 8)) * 0.2 * (1 - progress(t, 3.1, 4))
        }
        showCross(lockAt[0], 2.8, lockAt[2], t, 5.0)
      },
    },
    // T1056 Input Capture
    T1056: {
      hits: [3.4],
      run(t) {
        view.target = [2.4, 3.6]
        view.height = 9.5
        storyState(8) // Input Capture
        const desk = [3.5, 1.0, 4.3]
        if (t < 4.6) employees[2].position.y = Math.abs(Math.sin(t * 14)) * 0.05
        for (let i = 0; i < 6; i++) {
          const cube = pinkCubes[i],
            start = 0.5 + i * 0.4,
            p = progress(t, start, start + 0.9)
          if (p <= 0 || p >= 1) continue
          cube.visible = true
          arcBetween(cube, desk, aboveHost(1.8), p, 0.9)
          cube.scale.set(0.2, 0.2, 0.2)
        }
        if (t > 3.2) {
          const size = 0.8 * overshoot(progress(t, 3.2, 3.5))
          key.visible = true
          key.scale.set(size, size, size)
          key.position.set(HOST_SPOT[0], 3.0 + Math.sin(t * 5) * 0.08, HOST_SPOT[1])
          key.rotation.y = t * 3
        }
      },
    },
    // T1621 Multi-Factor Authentication Request Generation
    T1621: {
      hits: [4.2],
      run(t) {
        view.target = [3.6, 3.0]
        view.height = 10
        storyState(8) // Multi-Factor Authentication Request Generation
        const seat = employees[3].position
        for (let i = 0; i < 4; i++) {
          const start = 0.5 + i * 0.6
          if (t > start && t < start + 0.5) {
            const mark = alertMarks[i]
            mark.visible = true
            mark.position.set(
              seat.x + (i % 2 ? 0.35 : -0.35),
              2.2 + 0.5 * overshoot(progress(t, start, start + 0.25)),
              seat.z,
            )
          }
          if (t > start && t < start + 0.25)
            stretchBetween(pinkBeams[i], aboveHost(1.4), [seat.x, 1.6, seat.z], 0.05)
        }
        hopInPlace(employees[3], t, 2.9, 3.4, 0.15)
        if (t > 2.9 && t < 4.4) showCheck(seat.x, 2.9, seat.z, t, 2.9)
        if (t > 3.3) {
          flyTo(key, [seat.x, 2.3, seat.z], aboveHost(3.0), t, 3.3, 4.2, 1.5, 6)
          key.scale.set(0.8, 0.8, 0.8)
          if (t >= 4.2) key.rotation.y = t * 3
          if (t > 5.4) key.visible = false
        }
        showCross(seat.x, 2.9, seat.z, t, 5.4)
      },
    },
    // T1557 Adversary-in-the-Middle
    T1557: {
      hits: [2.9],
      run(t) {
        view.target = [-1.5, 0.5]
        view.height = 13
        storyState(8) // Adversary-in-the-Middle
        const from = [-3.5, 1.2, 2.0],
          to = [-3.6, 1.6, RACK_Z + 0.6],
          middle = [-3.55, 1.2, -1.2],
          mid = t >= 2.2
        applyPose(
          malware,
          walk(
            [
              [0, HOST_SPOT[0], HOST_SPOT[1]],
              [0.8, HOST_SPOT[0], HOST_SPOT[1]],
              [2.2, middle[0], middle[2]],
              [7, middle[0], middle[2]],
            ],
            t,
          ),
        )
        malware.scale.multiplyScalar(ADMIN_MALWARE_SIZE)
        if (mid) malware.rotation.y = 0.6
        if (!mid) stretchBetween(cyanBeams[0], from, to, 0.07)
        else {
          stretchBetween(pinkBeams[0], from, middle, 0.07)
          stretchBetween(pinkBeams[1], middle, to, 0.07)
        }
        for (let i = 0; i < 3; i++) {
          const ph = (t * 0.6 + i / 3) % 1,
            spareKey = spareKeys[i]
          spareKey.visible = true
          spareKey.scale.set(0.35, 0.35, 0.35)
          spareKey.rotation.y = t * 3
          spareKey.position.set(
            lerp(from[0], to[0], ph),
            lerp(from[1], to[1], ph) + 0.35,
            lerp(from[2], to[2], ph),
          )
        }
        if (t > 2.6) {
          const size = 0.8 * overshoot(progress(t, 2.6, 2.9))
          key.visible = true
          key.scale.set(size, size, size)
          key.position.set(middle[0], 3.2 + Math.sin(t * 5) * 0.08, middle[2])
          key.rotation.y = t * 3
        }
      },
    },
    // T1555 Credentials from Password Stores
    T1555: {
      hits: [3.4],
      run(t) {
        view.target = [1.0, 3.0]
        view.height = 10
        storyState(8)
        // パスワードの保管庫。こじ開けて、中に保存されていた鍵をまとめて取り出す
        const vault = [-0.6, 2.4]
        const open = smooth(progress(t, 1.2, 1.8))
        database.visible = true
        database.scale.set(0.9, 0.9, 0.9)
        database.position.set(vault[0], 0, vault[1])
        database.rotation.y = 0.6
        padlock.visible = open < 0.98
        padlock.scale.set(0.7, 0.7, 0.7)
        padlock.rotation.set(0, 0.6, open * 1.2)
        padlock.position.set(vault[0] + open * 0.9, lerp(2.0, 0.3, open * open), vault[1])
        if (t > 0.6 && t < 1.3) stretchBetween(pinkBeams[0], aboveHost(0.8), [vault[0], 2.0, vault[1]], 0.1)
        spareKeys.forEach((spareKey, j) => {
          const start = 1.8 + j * 0.4
          if (t < start) return
          const angle = t * 2 + j * 2.09
          const size = 0.75 * overshoot(progress(t, start, start + 0.3))
          flyTo(
            spareKey,
            [vault[0], 1.7, vault[1]],
            [HOST_SPOT[0] + Math.cos(angle), 2.4, HOST_SPOT[1] + Math.sin(angle)],
            t,
            start,
            start + 0.8,
            1.4,
            6,
          )
          spareKey.scale.set(size, size, size)
          if (t >= start + 0.8) spareKey.rotation.y = t * 3 + j
        })
      },
    },
    // T1539 Steal Web Session Cookie
    T1539: {
      hits: [3.2],
      run(t) {
        view.target = [1.8, 3.2]
        view.height = 10.5
        storyState(8)
        // ログイン済みのしるし（クッキー）。これを盗めば、パスワードなしでその人としてサービスに入れる
        const screen = [3.5, 2.0, 4.4]
        const service = [0.2, 4.6, 0.6]
        popIn(cloud, service[0], service[1], service[2], t, 0.2, 1.2)
        cloud.rotation.y = 0.6
        if (t > 0.4 && t < 4.6) stretchBetween(cyanBeams[0], screen, service, 0.05)
        token.visible = true
        token.scale.set(0.4, 0.4, 0.4)
        token.rotation.y = view.time * 2
        if (t < 1.4) token.position.set(screen[0], screen[1], screen[2])
        else arcBetween(token, screen, aboveHost(2.9), smooth(progress(t, 1.4, 2.4)), 1.0)
        // 盗んだしるしを出すと、マルウェアも同じサービスに通されてしまう
        if (t > 2.6 && t < 4.6) stretchBetween(pinkBeams[0], aboveHost(2.9), service, 0.06)
        if (t > 3.0 && t < 4.6) showCheck(service[0], service[1] + 1.7, service[2], t, 3.0)
        showCross(service[0], service[1] + 1.7, service[2], t, 5.4)
      },
    },
    // T1040 Network Sniffing
    T1040: {
      hits: [3.2],
      run(t) {
        view.target = [-1.2, 0.8]
        view.height = 13
        storyState(8)
        // 従業員とサーバーのあいだを流れる通信（水色の線）を、横からのぞき見る
        const from = [-3.5, 1.2, 2.9]
        const to = [racks[1].x, 1.6, RACK_Z + 0.6]
        const tap = [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2, (from[2] + to[2]) / 2]
        stretchBetween(cyanBeams[0], from, to, 0.07)
        if (t > 0.6 && t < 4.6) stretchBetween(pinkBeams[0], aboveHost(1.0), tap, 0.06)
        spareKeys.forEach((spareKey, i) => {
          // 鍵は本来の相手へ流れ続け、のぞき見た写しだけがマルウェアに届く
          const p = (t * 0.5 + i / 3) % 1
          spareKey.visible = true
          spareKey.scale.set(0.35, 0.35, 0.35)
          spareKey.rotation.y = t * 3
          spareKey.position.set(
            lerp(from[0], to[0], p),
            lerp(from[1], to[1], p) + 0.35,
            lerp(from[2], to[2], p),
          )
        })
        if (t > 1.6) {
          const copy = progress(t, 1.6, 3.0)
          key.visible = true
          key.scale.set(0.7, 0.7, 0.7)
          key.rotation.y = t * 3
          arcBetween(key, tap, aboveHost(3.0), smooth(copy), 1.0)
        }
      },
    },
    // T1212 Exploitation for Credential Access
    T1212: {
      hits: [3.2],
      run(t) {
        view.target = [1.0, 3.0]
        view.height = 10
        storyState(8)
        // 認証の仕組み（錠）そのものに弱点がある。そこを突くと、中から認証情報（鍵）がこぼれ出る
        const lockAt = [-0.6, 1.5, 2.3]
        const exploit = pinkCubes[0]
        const broken = t > 1.7
        padlock.visible = true
        padlock.scale.set(1.3, 1.3, 1.3)
        padlock.position.set(
          lockAt[0] + (broken && t < 2.3 ? Math.sin(t * 60) * 0.06 : 0),
          lockAt[1] - (broken ? 0.25 : 0),
          lockAt[2],
        )
        padlock.rotation.set(0, 0.6, broken ? 0.35 : 0)
        if (t > 0.7 && t < 1.7) {
          flyTo(exploit, aboveHost(0.9), lockAt, t, 0.7, 1.7, 1.6, 8)
          exploit.scale.set(0.34, 0.34, 0.34)
        }
        spareKeys.forEach((spareKey, j) => {
          const start = 1.9 + j * 0.4
          if (t < start) return
          const angle = t * 2 + j * 2.09
          const size = 0.75 * overshoot(progress(t, start, start + 0.3))
          flyTo(
            spareKey,
            [lockAt[0], 1.0, lockAt[2]],
            [HOST_SPOT[0] + Math.cos(angle), 2.4, HOST_SPOT[1] + Math.sin(angle)],
            t,
            start,
            start + 0.9,
            1.4,
            6,
          )
          spareKey.scale.set(size, size, size)
          if (t >= start + 0.9) spareKey.rotation.y = t * 3 + j
        })
      },
    },
    // T1187 Forced Authentication
    T1187: {
      hits: [3.6],
      run(t) {
        view.target = [2.6, 8.0]
        view.height = 17
        storyState(8)
        // 従業員の端末に、仕掛け（紙）を置く。開くと、端末が攻撃者のサーバーへ自動で認証しに行き、認証情報（鍵）を送ってしまう
        const desk = [3.5, 1.2, 4.4]
        const outside = [TOWER_SPOT[0], 2.9, TOWER_SPOT[1]]
        const lure = documents[0]
        const sent = spareKeys[0]
        if (t > 0.5) {
          flyTo(lure, aboveHost(0.9), [desk[0] - 0.6, desk[1] + 0.5, desk[2]], t, 0.5, 1.4, 0.8, 5)
          lure.scale.set(0.8, 0.8, 0.8)
          if (t >= 1.4) lure.rotation.y = 0.6
        }
        hopInPlace(employees[2], t, 1.5, 2.0, 0.12)
        if (t > 2.0 && t < 5.0) stretchBetween(cyanBeams[0], desk, outside, 0.06)
        if (t > 2.3 && t < 5.0) {
          flyTo(sent, desk, outside, t, 2.3, 3.5, 2.0, 6)
          sent.scale.set(0.8, 0.8, 0.8)
          if (t >= 3.5) sent.rotation.y = t * 3
        }
        showCross((desk[0] + outside[0]) / 2, 4.2, (desk[2] + outside[2]) / 2, t, 5.2)
      },
    },
    // T1606 Forge Web Credentials
    T1606: {
      hits: [3.6],
      run(t) {
        view.target = [1.0, 3.0]
        view.height = 11
        storyState(8)
        // 盗んだ署名用の鍵で、ログイン済みのしるし（水色の箱）を自分で作る。サービスは、本物と見分けられない
        const anvil = [0.3, 0.9, 3.6]
        const service = [-0.6, 3.7, 1.6]
        popIn(cloud, service[0], service[1], service[2], t, 0.2, 1.2)
        cloud.rotation.y = 0.6
        key.visible = true
        key.position.set(anvil[0], 2.3 + Math.sin(view.time * 4) * 0.06, anvil[2])
        key.rotation.y = view.time * 2
        if (t > 0.6 && t < 2.2) {
          hammer.visible = true
          hammer.position.set(anvil[0] + 0.8, 0.9, anvil[2] + 0.3)
          hammer.rotation.z = 0.3 + Math.abs(Math.cos(((t - 0.6) * Math.PI) / 0.55))
        }
        if (t > 2.0) {
          const size = 0.4 * overshoot(progress(t, 2.0, 2.3))
          flyTo(token, anvil, [service[0], service[1] - 1.0, service[2]], t, 2.5, 3.4, 1.0, 6)
          token.scale.set(size, size, size)
        }
        if (t > 3.4 && t < 5.2) showCheck(service[0], service[1] + 1.15, service[2], t, 3.4)
        showCross(service[0], service[1] + 1.15, service[2], t, 5.4)
      },
    },
    // T1556 Modify Authentication Process
    T1556: {
      hits: [3.4],
      run(t) {
        view.target = [-0.2, 3.0]
        view.height = 11
        storyState(8)
        // ログインの確認をする仕組み（小さな門）に、細工を仕込む。そこを通る人のパスワードが、そのまま写し取られる
        const gate = [-1.0, 3.2]
        const pose = walk(
          [
            [0, -2.9, gate[1]],
            [1.7, -2.9, gate[1]],
            [3.3, 0.3, gate[1]],
            [7, 0.3, gate[1]],
          ],
          t,
        )
        const bug = pinkCubes[0]
        const copied = spareKeys[0]
        checkpoint.visible = true
        checkpoint.position.set(gate[0], 0, gate[1])
        checkpoint.rotation.y = Math.PI / 2
        checkpoint.scale.set(0.6, 0.6, 0.6)
        if (t > 0.5 && t < 5.2) {
          flyTo(bug, aboveHost(0.9), [gate[0], 2.0, gate[1]], t, 0.5, 1.4, 0.9, 6)
          bug.scale.set(0.26, 0.26, 0.26)
        }
        user.visible = true
        applyPose(user, pose)
        if (t > 2.5) {
          const angle = t * 2
          const size = 0.75 * overshoot(progress(t, 2.5, 2.8))
          flyTo(
            copied,
            [gate[0], 2.0, gate[1]],
            [HOST_SPOT[0] + Math.cos(angle), 2.4, HOST_SPOT[1] + Math.sin(angle)],
            t,
            2.6,
            3.4,
            1.2,
            6,
          )
          copied.scale.set(size, size, size)
          if (t >= 3.4) copied.rotation.y = t * 3
        }
      },
    },
    // T1111 Multi-Factor Authentication Interception
    T1111: {
      hits: [3.6],
      run(t) {
        view.target = [1.8, 3.2]
        view.height = 10.5
        storyState(8)
        // 多要素認証の確認コード（黄色い箱）が、従業員に届く。打ち込むところを横取りして、先に使ってしまう
        const screen = [3.5, 1.5, 4.4]
        const service = [0.0, 3.7, 1.6]
        const code = yellowCubes[0]
        const copy = pinkCubes[0]
        popIn(cloud, service[0], service[1], service[2], t, 0.2, 1.2)
        cloud.rotation.y = 0.6
        if (t > 0.6 && t < 4.6) {
          code.visible = true
          code.material.color.setHex(0xf6c531)
          code.scale.set(0.3, 0.3, 0.3)
          arcBetween(code, service, screen, smooth(progress(t, 0.6, 1.6)), 0.8)
          code.rotation.y = t * 2
        }
        hopInPlace(employees[2], t, 1.7, 2.3, 0.1)
        if (t > 1.9 && t < 4.6) {
          flyTo(copy, screen, aboveHost(2.9), t, 1.9, 2.7, 0.8, 6)
          copy.scale.set(0.3, 0.3, 0.3)
        }
        if (t > 2.8 && t < 4.6) stretchBetween(pinkBeams[0], aboveHost(2.9), service, 0.06)
        if (t > 3.3 && t < 4.6) showCheck(service[0], service[1] + 1.15, service[2], t, 3.3)
      },
    },
    // T1528 Steal Application Access Token
    T1528: {
      hits: [3.4],
      run(t) {
        view.target = [2.6, 3.0]
        view.height = 11
        storyState(8)
        // 攻撃者のアプリ（小さな機械）が、従業員に「連携を許可しますか」と求める。許可すると、サービスがアプリに通行証（水色の箱）を渡してしまう
        const app = [2.3, 0, 5.2]
        const service = [4.6, 4.8, 0.8]
        const rogue = bots[6]
        const size = overshoot(progress(t, 0.5, 0.9))
        popIn(cloud, service[0], service[1], service[2], t, 0.2, 1.2)
        cloud.rotation.y = 0.6
        if (t > 0.5) {
          rogue.visible = true
          rogue.scale.set(size, size, size)
          rogue.position.set(app[0], Math.abs(Math.sin(t * 6)) * 0.12, app[2])
          rogue.rotation.y = -0.6
        }
        if (t > 0.9 && t < 1.6) stretchBetween(pinkBeams[0], [app[0], 0.8, app[2]], [3.5, 1.2, 4.4], 0.06)
        hopInPlace(employees[2], t, 1.5, 2.0, 0.12)
        if (t > 2.0 && t < 5.2) {
          flyTo(token, [service[0], service[1] - 1.0, service[2]], [app[0], 1.7, app[2]], t, 2.0, 3.0, 1.0, 6)
          token.scale.set(0.38, 0.38, 0.38)
          if (t >= 3.0) token.rotation.y = view.time * 2
        }
        if (t > 3.2 && t < 5.2) stretchBetween(pinkBeams[1], [app[0], 1.7, app[2]], service, 0.06)
        showCross(app[0], 3.0, app[2], t, 5.4)
      },
    },
    // T1697 Application-Specific Passwords
    T1697: {
      hits: [3.4],
      run(t) {
        view.target = [1.4, 3.0]
        view.height = 11
        storyState(8)
        // サービスの正面には、多要素認証（錠）がかかっている。でも、古いアプリ用の専用パスワード（鍵）は、その確認なしで通れる
        const service = [-0.4, 3.7, 1.6]
        const desk = [3.5, 1.4, 4.4]
        const appKey = spareKeys[0]
        popIn(cloud, service[0], service[1], service[2], t, 0.2, 1.3)
        cloud.rotation.y = 0.6
        padlock.visible = true
        padlock.scale.set(0.8, 0.8, 0.8)
        padlock.position.set(service[0] + 0.5, service[1] - 1.4, service[2] + 1.2)
        padlock.rotation.y = 0.6
        if (t > 0.6) {
          const size = 0.8 * overshoot(progress(t, 0.6, 0.9))
          appKey.visible = true
          appKey.scale.set(size, size, size)
          if (t < 2.0) flyTo(appKey, desk, aboveHost(2.6), t, 1.0, 1.9, 0.8, 6)
          else
            flyTo(
              appKey,
              aboveHost(2.6),
              [service[0] - 1.3, service[1] - 0.3, service[2]],
              t,
              2.2,
              3.2,
              1.6,
              6,
            )
        }
        if (t > 3.2 && t < 5.2) showCheck(service[0], service[1] + 1.15, service[2], t, 3.2)
        showCross(service[0], service[1] + 1.15, service[2], t, 5.4)
      },
    },
    // T1649 Steal or Forge Authentication Certificates
    T1649: {
      hits: [3.6],
      run(t) {
        view.target = [1.0, 3.0]
        view.height = 10
        storyState(8)
        // 証明書を発行する仕組み（台帳）。設定のすきを突いて、他人の名前の証明書（印の付いた紙）を発行させる
        const issuer = [-0.6, 2.4]
        const certificate = documents[0]
        const seal = yellowCubes[0]
        database.visible = true
        database.scale.set(0.9, 0.9, 0.9)
        database.position.set(issuer[0], 0, issuer[1])
        database.rotation.y = 0.6
        if (t > 0.6 && t < 1.4)
          stretchBetween(pinkBeams[0], aboveHost(0.8), [issuer[0], 1.6, issuer[1]], 0.09)
        if (t > 1.4) {
          const size = overshoot(progress(t, 1.4, 1.7))
          flyTo(certificate, [issuer[0], 2.3, issuer[1]], aboveHost(2.7), t, 2.0, 3.0, 0.9)
          certificate.scale.set(size, size, size)
          certificate.rotation.y = 0.6
          seal.visible = true
          seal.material.color.setHex(0xf6c531)
          seal.scale.set(0.2 * size, 0.2 * size, 0.2 * size)
          seal.position.set(
            certificate.position.x + 0.12,
            certificate.position.y - 0.28,
            certificate.position.z + 0.12,
          )
        }
        // 本人として通る
        if (t > 3.3 && t < 5.2) showCheck(HOST_SPOT[0], 3.9, HOST_SPOT[1], t, 3.3)
        showCross(issuer[0], 2.9, issuer[1], t, 5.4)
      },
    },
    // T1558 Steal or Forge Kerberos Tickets
    T1558: {
      hits: [3.8],
      run(t) {
        view.target = [0.8, 3.0]
        view.height = 10.5
        storyState(8)
        // 社内の認証は、発行係が出すチケット（紙）で回っている。チケットを取り寄せ、手元で時間をかけて割ると、鍵が出てくる
        const issuer = [-1.2, 2.4]
        const bench = [0.5, 0.9, 4.0]
        const cracked = spareKeys[0]
        trustedProcess.visible = true
        trustedProcess.scale.set(1.6, 1.6, 1.6)
        trustedProcess.position.set(issuer[0], 0, issuer[1])
        trustedProcess.rotation.y = 0.6
        if (t > 0.5 && t < 1.2)
          stretchBetween(pinkBeams[0], aboveHost(0.8), [issuer[0], 1.0, issuer[1]], 0.08)
        for (let i = 0; i < 2; i++) {
          const start = 1.1 + i * 0.4
          if (t < start) continue
          const ticket = documents[i]
          const size = 0.8 * overshoot(progress(t, start, start + 0.3))
          flyTo(
            ticket,
            [issuer[0], 1.8, issuer[1]],
            [bench[0] - 0.3 + i * 0.6, bench[1], bench[2]],
            t,
            start + 0.1,
            start + 0.9,
            1.0,
            5,
          )
          ticket.scale.set(size, size, size)
          if (t >= start + 0.9) ticket.rotation.y = 0.6
          if (i === 0 && t > 3.4) ticket.visible = false
        }
        if (t > 2.3 && t < 3.5) {
          hammer.visible = true
          hammer.position.set(bench[0] + 0.5, 1.0, bench[2] + 0.3)
          hammer.rotation.z = 0.3 + Math.abs(Math.cos(((t - 2.3) * Math.PI) / 0.4))
        }
        if (t > 3.4) {
          const angle = t * 2
          const size = 0.8 * overshoot(progress(t, 3.4, 3.7))
          flyTo(
            cracked,
            [bench[0] - 0.3, bench[1], bench[2]],
            [HOST_SPOT[0] + Math.cos(angle), 2.4, HOST_SPOT[1] + Math.sin(angle)],
            t,
            3.6,
            4.3,
            1.0,
            6,
          )
          cracked.scale.set(size, size, size)
          if (t >= 4.3) cracked.rotation.y = t * 3
        }
      },
    },
    // T1552 Unsecured Credentials
    T1552: {
      hits: [3.6],
      run(t) {
        view.target = [0.6, 3.2]
        view.height = 11.5
        storyState(8)
        // ファイルや設定の中に、パスワードが平文のまま書かれている。探して回るだけで、鍵が見つかる
        const spots = [
          [-1.6, 0.5, 2.2],
          [-0.2, 0.5, 4.4],
          [3.4, 0.5, 1.6],
        ]
        const sweep = progress(t, 0.6, 3.0)
        if (t > 0.6 && t < 3.0) {
          attackerScan.visible = true
          attackerScan.scale.set(0.4, 1.4, 4.4)
          attackerScan.position.set(lerp(-2.4, 4.2, sweep), 0.8, 3.0)
          attackerScan.material.opacity = 0.35
        }
        spots.forEach((spot, i) => {
          const found = 0.6 + ((spot[0] + 2.4) / 6.6) * 2.4
          const file = documents[i]
          const spareKey = spareKeys[i]
          file.visible = true
          file.scale.set(0.9, 0.9, 0.9)
          file.position.set(spot[0], spot[1] + (t > found ? 0.25 : 0), spot[2])
          file.rotation.set(t > found ? 0 : Math.PI / 2, 0.6, 0)
          if (t < found) return
          const angle = t * 2 + i * 2.09
          const size = 0.7 * overshoot(progress(t, found, found + 0.3))
          flyTo(
            spareKey,
            [spot[0], 1.3, spot[2]],
            [HOST_SPOT[0] + Math.cos(angle), 2.4, HOST_SPOT[1] + Math.sin(angle)],
            t,
            found + 0.2,
            found + 1.0,
            1.2,
            6,
          )
          spareKey.scale.set(size, size, size)
          if (t >= found + 1.0) spareKey.rotation.y = t * 3 + i
        })
      },
    },
  }
}
