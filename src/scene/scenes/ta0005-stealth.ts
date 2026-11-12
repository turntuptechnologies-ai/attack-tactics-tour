// TA0005 ステルス（Stealth）の場面。
import type { Kit } from '../kit'
import { progress, smooth, lerp, walk, applyPose, overshoot, stretchBetween, arcBetween } from '../motion'
import type { SceneMap } from './types'

export default function stealth(kit: Kit): SceneMap {
  const {
    defender,
    glass,
    scanPlane,
    HOST_SPOT,
    ADMIN_MALWARE_SIZE,
    malware,
    crown,
    disguise,
    pinkCubes,
    clock,
    clockHand,
    view,
    storyState,
    popIn,
    showAlert,
    documents,
    trustedProcess,
    trustedProcessEyes,
    placeSensor,
    aboveHost,
    flyTo,
    cyanBeams,
    pinkBeams,
    bots,
    cloud,
    attacker,
    employees,
    key,
    user,
    token,
    impostor,
    hammer,
    truckB,
    relayBot,
    checkpoint,
    ATTACKER_SPOT,
    TOWER_SPOT,
    YELLOW_CUBE_X,
    yellowCubes,
    database,
    openGate,
    standing,
    placeMalware,
    aboveAttacker,
    showCross,
    showCheck,
    hopInPlace,
    jumpMalware,
    showSparks,
    sensorVisits,
    DEFENDER_SPOT,
    showRipples,
    flyPaper,
    defenderBlocks,
    defenderNotices,
  } = kit
  return {
    // T1036 Masquerading（本編）
    T1036: {
      hits: [3.6],
      run(t) {
        view.target = [1.5, 4]
        view.height = 10
        storyState(6) // Stealth
        malware.rotation.y = 0.6 + smooth(progress(t, 0.5, 1.4)) * Math.PI * 4
        disguise.visible = t > 0.95
        crown.visible = t <= 0.95
        if (t > 1.4) malware.position.y = 0
        applyPose(
          defender,
          walk(
            [
              [0, -5, 5.0],
              [1.6, -5, 5.0],
              [4.4, 6, 5.0],
              [7, 6, 5.0],
            ],
            t,
            0,
          ),
        )
        defenderNotices(t)
      },
    },
    // T1070 Indicator Removal
    T1070: {
      hits: [3.8],
      run(t) {
        view.target = [0.8, 3.8]
        view.height = 10
        storyState(6) // Indicator Removal
        applyPose(
          malware,
          walk(
            [
              [0, HOST_SPOT[0], HOST_SPOT[1]],
              [0.8, HOST_SPOT[0], HOST_SPOT[1]],
              [2.4, -1.2, 3.5],
              [2.7, -1.2, 3.5],
              [3.7, HOST_SPOT[0], HOST_SPOT[1]],
              [7, HOST_SPOT[0], HOST_SPOT[1]],
            ],
            t,
          ),
        )
        malware.scale.multiplyScalar(ADMIN_MALWARE_SIZE)
        if (t >= 3.7) malware.rotation.y = 0.6
        for (let i = 0; i < 6; i++) {
          const amount = (i + 0.5) / 6,
            cube = pinkCubes[i],
            scale = 1 - smooth(progress(t, 0.7 + amount * 1.6, 1.0 + amount * 1.6))
          cube.visible = scale > 0.01
          cube.scale.set(0.34 * scale, 0.06, 0.34 * scale)
          cube.position.set(
            lerp(HOST_SPOT[0], -1.2, amount) + (i & 1 ? 0.2 : -0.2),
            0.04,
            lerp(HOST_SPOT[1], 3.5, amount),
          )
        }
        applyPose(
          defender,
          walk(
            [
              [0, -5, 5.0],
              [4.6, -5, 5.0],
              [6.2, -2.8, 4.8],
              [7, -2.8, 4.8],
            ],
            t,
            0,
          ),
        )
      },
    },
    // T1027 Obfuscated Files or Information
    T1027: {
      hits: [3.9],
      run(t) {
        view.target = [1.5, 3.8]
        view.height = 9.5
        storyState(6) // Obfuscated Files or Information
        const scrambled = smooth(progress(t, 0.6, 1.3)) * (1 - smooth(progress(t, 3.3, 3.8))),
          scale = ADMIN_MALWARE_SIZE * (1 - scrambled),
          n = Math.floor(t * 6) // scrambled=1: scrambled into pieces
        malware.scale.set(scale, scale, scale)
        malware.visible = scale > 0.2
        crown.visible = scrambled < 0.3
        for (let i = 0; i < 7; i++) {
          const cube = pinkCubes[i],
            q = 0.36 * scrambled,
            angle = i * 0.9 + n * 1.7 * (i + 1),
            radius = 0.25 + (0.7 * scrambled * ((i * 37 + n * 13) % 5)) / 4
          cube.visible = q > 0.01
          cube.scale.set(q, q, q)
          cube.position.set(
            HOST_SPOT[0] + Math.cos(angle) * radius,
            0.3 + ((i * 53 + n * 31) % 7) * 0.3 * scrambled,
            HOST_SPOT[1] + Math.sin(angle) * radius,
          )
          cube.rotation.set(i, n * 0.8, 0)
        }
        if (t > 1.7 && t < 3.2) {
          scanPlane.visible = true
          scanPlane.rotation.y = Math.PI / 2
          scanPlane.scale.set(2.8, 2.8, 0.08)
          scanPlane.position.set(lerp(3.9, -0.1, progress(t, 1.7, 3.2)), 1.4, HOST_SPOT[1])
          scanPlane.material.opacity = 0.4
        }
        if (t > 3.8 && t < 4.6) malware.position.y = Math.abs(Math.sin((t - 3.8) * 7)) * 0.35
        defenderNotices(t)
      },
    },
    // T1564 Hide Artifacts
    T1564: {
      hits: [2.6],
      run(t) {
        view.target = [1.2, 3.0]
        view.height = 9.5
        storyState(6) // Hide Artifacts
        // 隠し場所。見る人から見て壁や机の陰にならない、開けた床の上にする
        const spot = [0.3, 1.7]
        applyPose(
          malware,
          walk(
            [
              [0, HOST_SPOT[0], HOST_SPOT[1]],
              [0.6, HOST_SPOT[0], HOST_SPOT[1]],
              [1.6, spot[0], spot[1]],
              [7, spot[0], spot[1]],
            ],
            t,
          ),
        )
        malware.scale.multiplyScalar(ADMIN_MALWARE_SIZE)
        if (t >= 1.6) malware.rotation.y = 0.6
        // hide が 1 のとき、隠れきっている。防御側が戻ってくる 5.6 秒から元に戻す
        const hide = smooth(progress(t, 1.7, 2.4)) * (1 - smooth(progress(t, 5.6, 6.2)))
        malware.scale.y *= 1 - 0.82 * hide
        crown.visible = hide < 0.5
        // 持っているファイルも一緒に運び、小さくして隠す
        const doc = documents[0]
        const carried = smooth(progress(t, 0.6, 1.6))
        const size = 1 - 0.6 * hide
        doc.visible = true
        doc.rotation.y = 0.6
        doc.scale.set(size, size, size)
        doc.position.set(
          lerp(HOST_SPOT[0] + 0.9, spot[0] + 1.0, carried),
          lerp(1.5, 0.4, hide),
          lerp(HOST_SPOT[1] + 0.3, spot[1] + 0.3, carried),
        )
        // 隠し属性の覆い。見る人には中が透けて見えるが、通りかかる防御側は気づかない
        if (hide > 0.02) {
          glass.visible = true
          glass.scale.set(2.6 * hide, 1.1, 1.8 * hide)
          glass.position.set(spot[0] + 0.5, 0.55, spot[1] + 0.15)
          glass.material.opacity = 0.4 * hide
        }
        applyPose(
          defender,
          walk(
            [
              [0, -5, 5.0],
              [2.4, -5, 5.0],
              [4.4, 5.5, 5.0],
              [4.6, 5.5, 5.0],
              [5.6, 2.6, 4.9],
              [7, 2.6, 4.9],
            ],
            t,
            0,
          ),
        )
        showAlert(0, 2.6, 2.6, 4.9, t, 5.6, 7)
      },
    },
    // T1497 Virtualization/Sandbox Evasion
    T1497: {
      hits: [3.8],
      run(t) {
        view.target = [1.5, 3.8]
        view.height = 9.5
        storyState(6) // Virtualization/Sandbox Evasion
        const up = 1 - smooth(progress(t, 0.4, 1.0)) + smooth(progress(t, 3.2, 3.7))
        if (up < 0.99) {
          glass.visible = true
          glass.scale.set(2.2, 2.2, 2.2)
          glass.position.set(HOST_SPOT[0], 1.12 + up * 5, HOST_SPOT[1])
          glass.material.opacity = 0.35
        }
        if (t > 1.0 && t < 3.3) {
          const size = ADMIN_MALWARE_SIZE * 0.8
          malware.position.y = 0
          malware.scale.set(size, size * 0.5, size)
          crown.visible = false
        } // lies flat until the analysis time runs out
        if (t > 0.9 && t < 3.5) {
          popIn(clock, HOST_SPOT[0], 3.9, HOST_SPOT[1], t, 0.9, 1.1)
          clock.rotation.y = 0.6
          clockHand.rotation.z = -progress(t, 1.1, 3.2) * Math.PI * 2
        }
        if (t > 3.7 && t < 4.6) {
          malware.position.y = Math.abs(Math.sin((t - 3.7) * 7)) * 0.4
          for (let i = 0; i < 5; i++) {
            const p = progress(t, 3.7 + i * 0.12, 4.4 + i * 0.12),
              cube = pinkCubes[i],
              size = 0.3 * (1 - p * 0.6)
            if (p <= 0 || p >= 1) continue
            cube.visible = true
            cube.scale.set(size, size, size)
            cube.position.set(
              HOST_SPOT[0] + Math.sin(i * 2.1 + p * 5) * 0.6,
              1.0 + p * 2.3,
              HOST_SPOT[1] + Math.cos(i * 2.1 + p * 5) * 0.6,
            )
          }
        }
        defenderNotices(t)
      },
    },
    // T1218 System Binary Proxy Execution
    T1218: {
      hits: [3.6],
      run(t) {
        view.target = [0.8, 3.2]
        view.height = 10
        storyState(6)
        // OSに付属する署名済みのプログラム。これに不正な処理を渡して、代わりに実行させる
        const px = -0.8
        const pz = 2.6
        const cube = pinkCubes[0]
        trustedProcess.visible = true
        trustedProcess.scale.set(1.6, 1.6, 1.6)
        trustedProcess.position.set(px, t > 2.2 && t < 4.4 ? Math.abs(Math.sin((t - 2.2) * 6)) * 0.2 : 0, pz)
        trustedProcess.rotation.y = 0.6
        trustedProcessEyes.visible = false
        if (t < 2.2) {
          flyTo(cube, aboveHost(2.2), [px, 1.6, pz], t, 0.8, 2.0, 1.3, 6)
          cube.scale.set(0.34, 0.34, 0.34)
        }
        for (let i = 1; i < 5; i++) {
          const p = progress(t, 2.2 + i * 0.2, 3.2 + i * 0.2)
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
        // 見張りが調べに来ても、動いているのは信頼されたプログラムなので、通り過ぎる
        const near = smooth(progress(t, 2.6, 3.2)) * (1 - smooth(progress(t, 3.9, 4.4)))
        placeSensor(
          lerp(0.5, px, near),
          lerp(3.3, 3.9, near) + Math.sin(view.time * 3) * 0.1,
          lerp(3.5, pz, near),
        )
        defenderBlocks(t)
      },
    },
    // T1014 Rootkit
    T1014: {
      hits: [3.6],
      run(t) {
        view.target = [1.5, 3.6]
        view.height = 9.5
        storyState(6)
        // OSの深いところへ沈み込み、一覧や検査から見えなくなる
        const sunk = smooth(progress(t, 0.8, 1.8)) * (1 - smooth(progress(t, 5.6, 6.2)))
        malware.position.y = -1.9 * sunk
        crown.visible = sunk < 0.3
        // 沈んだ場所には、うっすら跡だけが残る
        if (sunk > 0.05) {
          const mark = pinkCubes[0]
          mark.visible = true
          mark.scale.set(0.9 * sunk, 0.03, 0.9 * sunk)
          mark.position.set(HOST_SPOT[0], 0.03, HOST_SPOT[1])
        }
        // 見張りが真上から調べても、何も見つからない
        const near = smooth(progress(t, 2.2, 2.8)) * (1 - smooth(progress(t, 4.0, 4.5)))
        placeSensor(
          lerp(0.5, HOST_SPOT[0], near),
          lerp(3.3, 2.6, near) + Math.sin(view.time * 3) * 0.1,
          lerp(3.5, HOST_SPOT[1], near),
        )
        if (t > 2.8 && t < 3.8) {
          const ray = cyanBeams[2]
          ray.visible = true
          ray.rotation.set(0, 0, 0)
          ray.position.set(HOST_SPOT[0], 1.3, HOST_SPOT[1])
          ray.scale.set(0.3, 2.2, 0.3)
        }
      },
    },
    // T1535 Unused/Unsupported Cloud Regions
    T1535: {
      hits: [3.0],
      run(t) {
        view.target = [-2.5, 6.5]
        view.height = 19
        storyState(6)
        // 標的がふだん使っていないクラウドの地域（遠くの雲）。だれも見ていないそこで活動する
        const far = [-8.5, 4.6, 12.5]
        popIn(cloud, far[0], far[1] + Math.sin(view.time * 2) * 0.1, far[2], t, 0.4, 1.5)
        cloud.rotation.y = 0.6
        if (t > 0.9 && t < 1.8) stretchBetween(pinkBeams[0], aboveHost(1.0), far, 0.07)
        for (let i = 0; i < 3; i++) {
          const start = 1.6 + i * 0.4
          if (t < start) continue
          const bot = bots[4 + i]
          const size = 0.9 * overshoot(progress(t, start, start + 0.3))
          bot.visible = true
          bot.scale.set(size, size, size)
          bot.position.set(
            far[0] - 0.8 + i * 0.8,
            far[1] + 0.9 + Math.abs(Math.sin(t * 6 + i)) * 0.25,
            far[2],
          )
          bot.rotation.y = 0.6
        }
        // 防御側の見回りは、ふだん使う場所だけ
        applyPose(
          defender,
          walk(
            [
              [0, -5, 5.4],
              [1.6, -5, 5.4],
              [4.4, 6, 5.4],
              [7, 6, 5.4],
            ],
            t,
            0,
          ),
        )
      },
    },
    // T1134 Access Token Manipulation
    T1134: {
      hits: [3.4],
      run(t) {
        view.target = [0.8, 3.4]
        view.height = 10.5
        storyState(6)
        // 別の利用者（人形）の身分のしるし（水色の箱）を借りて動く。記録には、その利用者がやったこととして残る
        const owner = [-0.6, 3.8]
        const worn = t > 2.2
        user.visible = true
        applyPose(user, standing(owner[0], owner[1], 0.6))
        token.visible = true
        token.scale.set(0.4, 0.4, 0.4)
        token.rotation.y = view.time * 2
        if (t < 1.2) token.position.set(owner[0], 2.3 + Math.sin(view.time * 4) * 0.06, owner[1])
        else arcBetween(token, [owner[0], 2.3, owner[1]], aboveHost(2.5), smooth(progress(t, 1.2, 2.2)), 0.8)
        if (t > 0.6 && t < 1.3) stretchBetween(pinkBeams[0], aboveHost(0.9), [owner[0], 2.3, owner[1]], 0.07)
        crown.visible = !worn
        sensorVisits(t, 2.4, 4.4, HOST_SPOT[0], HOST_SPOT[1], true)
        if (t > 3.3 && t < 4.4) showCheck(HOST_SPOT[0], 4.4, HOST_SPOT[1], t, 3.3)
        defenderNotices(t)
      },
    },
    // T1696 Anti-Automation Evasion
    T1696: {
      hits: [3.0],
      run(t) {
        view.target = [0.6, 9.6]
        view.height = 15
        storyState(6)
        view.actor = attacker
        // 入口には「人間かどうか」を確かめる検査がある。問題を解く係（左のロボット）に答えを出させて、自動の機械を人として通す
        const solver = [-2.6, 11.2]
        checkpoint.visible = true
        scanPlane.visible = true
        scanPlane.position.set(0, 1.45, 9.3)
        scanPlane.material.opacity = 0.3 + 0.15 * Math.sin(t * 8)
        relayBot.visible = true
        relayBot.scale.set(1.1, 1.1, 1.1)
        relayBot.position.set(solver[0], 0, solver[1])
        relayBot.rotation.y = t > 0.8 && t < 4.4 ? t * 6 : 0.6
        for (let i = 0; i < 3; i++) {
          const start = 1.0 + i * 0.9
          const p = progress(t, start, start + 1.8)
          const robot = bots[4 + i]
          if (t > 5.2) continue
          robot.visible = p < 1
          robot.scale.set(0.9, 0.9, 0.9)
          robot.position.set(
            lerp(2.0 - i * 0.2, 0, Math.min(1, p * 2)),
            Math.abs(Math.sin(t * 8 + i)) * 0.12,
            lerp(12.2 + i * 0.5, 7.4, p),
          )
          robot.rotation.y = Math.PI
          if (p > 0.3 && p < 0.6)
            stretchBetween(
              pinkBeams[i],
              [solver[0], 1.0, solver[1]],
              [robot.position.x, 0.8, robot.position.z],
              0.06,
            )
        }
        if (t > 2.2 && t < 5.2) showCheck(0, 4.3, 9.3, t, 2.2)
        showCross(0, 4.3, 9.3, t, 5.4)
      },
    },
    // T1197 BITS Jobs
    T1197: {
      hits: [3.2],
      run(t) {
        view.target = [0.8, 5.8]
        view.height = 14
        storyState(6)
        // OSに備わっている正規の運び役（トラック）。その荷台に載せてしまえば、門でも見張りにも、いつもの配送にしか見えない
        const z = lerp(11.5, 3.4, smooth(progress(t, 0.6, 2.6)))
        const load = pinkCubes[0]
        truckB.visible = true
        truckB.scale.set(0.5, 0.5, 0.5)
        truckB.position.set(0, 0, z)
        load.visible = t < 4.6
        load.scale.set(0.3, 0.3, 0.3)
        load.position.set(0, 1.25, z)
        openGate(progress(t, 1.0, 1.5) - progress(t, 2.8, 3.3))
        sensorVisits(t, 2.6, 4.4, 0, 3.4, true)
        if (t > 3.2 && t < 4.4) showCheck(0, 4.4, 3.4, t, 3.2)
        if (t > 4.6) {
          load.visible = true
          arcBetween(load, [0, 1.25, 3.4], aboveHost(2.6), smooth(progress(t, 4.6, 5.2)), 0.8)
        }
      },
    },
    // T1612 Build Image on Host
    T1612: {
      hits: [3.2],
      run(t) {
        view.target = [0.6, 3.2]
        view.height = 10.5
        storyState(6)
        // 持ち込むのは、検査を通る無害なひな形（ガラスの箱）だけ。不正な部分は、持ち込んだあとで、その場で組み足す
        const box = [-0.6, 2.9]
        const base = bots[4]
        const added = pinkCubes[6]
        glass.visible = true
        glass.scale.set(1.5, 1.6, 1.5)
        glass.position.set(box[0], 0.8, box[1])
        glass.material.opacity = 0.35
        base.visible = true
        base.scale.set(0.9, 0.9, 0.9)
        base.position.set(box[0], t > 3.1 && t < 4.4 ? Math.abs(Math.sin((t - 3.1) * 6)) * 0.2 : 0, box[1])
        base.rotation.y = 0.6
        if (t < 1.5) showCheck(box[0], 2.7, box[1], t, 0.2)
        if (t > 1.5 && t < 3.0) {
          hammer.visible = true
          hammer.position.set(box[0] + 1.0, 0.9, box[1] + 0.3)
          hammer.rotation.z = 0.3 + Math.abs(Math.cos(((t - 1.5) * Math.PI) / 0.5))
        }
        if (t > 1.8) {
          flyTo(added, aboveHost(2.2), [box[0], 1.15, box[1]], t, 1.8, 2.6, 0.8, 6)
          added.scale.set(0.28, 0.28, 0.28)
        }
        showSparks(box[0], 1.0, box[1], t, 3.1)
        defenderBlocks(t)
      },
    },
    // T1622 Debugger Evasion
    T1622: {
      hits: [3.9],
      run(t) {
        view.target = [1.2, 3.8]
        view.height = 10
        storyState(6)
        // 調べる人が、解析の道具（水色の線）をつないでくる。つながれていると気づいたら、おとなしいふりをして、離れるまで待つ
        const pose = walk(
          [
            [0, DEFENDER_SPOT[0], DEFENDER_SPOT[1]],
            [0.6, DEFENDER_SPOT[0], DEFENDER_SPOT[1]],
            [1.5, 3.6, 2.6],
            [3.1, 3.6, 2.6],
            [3.9, DEFENDER_SPOT[0], DEFENDER_SPOT[1]],
            [7, DEFENDER_SPOT[0], DEFENDER_SPOT[1]],
          ],
          t,
          0.4,
        )
        const watched = t > 1.5 && t < 3.2
        applyPose(defender, pose)
        if (watched) {
          stretchBetween(cyanBeams[0], [3.6, 1.4, 2.6], aboveHost(0.7), 0.07)
          malware.position.y = 0
          malware.scale.y *= 0.55
          crown.visible = false
        }
        if (t > 1.4 && t < 1.9) showAlert(0, HOST_SPOT[0], 2.6, HOST_SPOT[1], t, 1.4, 1.9)
        if (t > 3.6 && t < 4.6) malware.position.y = Math.abs(Math.sin((t - 3.6) * 7)) * 0.4
        showSparks(HOST_SPOT[0], 1.0, HOST_SPOT[1], t, 3.6)
      },
    },
    // T1678 Delay Execution
    T1678: {
      hits: [3.6],
      run(t) {
        view.target = [1.4, 3.6]
        view.height = 10
        storyState(6)
        // 見張りが観察している間は、意味のない動きをぐるぐる繰り返すだけ。観察の時間が切れて見張りが離れてから、本当の動きを始める
        const idle = t > 0.6 && t < 3.2
        if (idle) {
          const angle = (t - 0.6) * 4
          malware.position.set(HOST_SPOT[0] + Math.cos(angle) * 0.6, 0, HOST_SPOT[1] + Math.sin(angle) * 0.6)
          malware.rotation.y = -angle
        }
        sensorVisits(t, 0.4, 3.4, HOST_SPOT[0], HOST_SPOT[1])
        if (t > 0.9 && t < 3.3) {
          popIn(clock, HOST_SPOT[0], 4.6, HOST_SPOT[1], t, 0.9, 0.9)
          clock.rotation.y = 0.6
          clockHand.rotation.z = -progress(t, 1.0, 3.0) * Math.PI * 2
        }
        if (t > 3.4 && t < 4.6) malware.position.y = Math.abs(Math.sin((t - 3.4) * 7)) * 0.4
        showSparks(HOST_SPOT[0], 1.0, HOST_SPOT[1], t, 3.4)
      },
    },
    // T1140 Deobfuscate/Decode Files or Information
    T1140: {
      hits: [3.4],
      run(t) {
        view.target = [0.6, 3.2]
        view.height = 10.5
        storyState(6)
        // ばらばらにして隠しておいた断片は、見張りが見ても意味が分からない。使う直前に、元の形に組み立て直す
        const spot = [-0.6, 3.0]
        const scattered = [
          [-2.0, 0.25, 2.2],
          [-1.4, 0.25, 3.6],
          [0.4, 0.25, 1.8],
          [0.4, 0.25, 1.2],
        ]
        const joined = smooth(progress(t, 2.4, 3.0))
        const whole = bots[6]
        scattered.forEach((at, i) => {
          const piece = pinkCubes[i]
          if (joined >= 1) return
          piece.visible = true
          piece.scale.set(0.24, 0.24, 0.24)
          piece.position.set(
            lerp(at[0], spot[0], joined),
            lerp(at[1], 0.6, joined),
            lerp(at[2], spot[1], joined),
          )
          piece.rotation.set(i, i * 2, 0)
        })
        sensorVisits(t, 0.5, 2.3, -0.6, 3.2, true)
        if (t > 3.0) {
          const size = overshoot(progress(t, 3.0, 3.3))
          whole.visible = true
          whole.scale.set(size, size, size)
          whole.position.set(spot[0], Math.abs(Math.sin((t - 3.0) * 6)) * 0.2, spot[1])
          whole.rotation.y = 0.6
        }
        showSparks(spot[0], 0.9, spot[1], t, 3.3, 4, 3)
      },
    },
    // T1006 Direct Volume Access
    T1006: {
      hits: [3.2],
      run(t) {
        view.target = [0.2, 3.0]
        view.height = 10.5
        storyState(6)
        // ファイルは、ふつう受付（小さな門）を通して読む。そこで権限が確かめられ、記録も残る。受付を通らず、記録装置（台帳）の中身を直接読む
        const disk = [-2.0, 2.2]
        const desk = [-0.9, 4.0]
        database.visible = true
        database.scale.set(0.9, 0.9, 0.9)
        database.position.set(disk[0], 0, disk[1])
        database.rotation.y = 0.6
        checkpoint.visible = true
        checkpoint.position.set(desk[0], 0, desk[1])
        checkpoint.rotation.y = Math.PI / 2
        checkpoint.scale.set(0.55, 0.55, 0.55)
        scanPlane.visible = true
        scanPlane.position.set(desk[0], 0.85, desk[1])
        scanPlane.rotation.y = Math.PI / 2
        scanPlane.scale.set(2.0, 1.6, 0.08)
        scanPlane.material.opacity = 0.3 + 0.15 * Math.sin(t * 8)
        if (t > 0.8 && t < 4.4)
          stretchBetween(pinkBeams[0], [HOST_SPOT[0], 0.2, HOST_SPOT[1] - 0.6], [disk[0], 0.2, disk[1]], 0.08)
        for (let i = 0; i < 3; i++) {
          const start = 1.6 + i * 0.5
          if (t < start) continue
          const page = documents[i]
          flyPaper(
            page,
            [disk[0], 0.5, disk[1]],
            aboveHost(2.4 + i * 0.5),
            t,
            start + 0.1,
            start + 1.0,
            0.6,
            start,
          )
        }
        defenderNotices(t)
      },
    },
    // T1480 Execution Guardrails
    T1480: {
      hits: [3.4],
      run(t) {
        view.target = [0.8, 3.2]
        view.height = 10.5
        storyState(6)
        // ここは本当に、ねらった相手の環境か。目じるし（黄色い箱）をひとつずつ確かめ、全部そろったときだけ動く。調べる人の環境では、何も起きない
        const armed = t > 2.8
        yellowCubes.forEach((fact, i) => {
          const checked = 0.9 + i * 0.6
          fact.visible = true
          fact.material.color.setHex(t > checked + 0.3 ? 0xff6fd8 : 0xf6c531)
          fact.scale.set(0.4, 0.4, 0.4)
          fact.position.set(-1.8 + i * 0.75, 1.4, 2.4)
          fact.rotation.y = 0.6
          if (t > checked && t < checked + 0.4)
            stretchBetween(pinkBeams[i], aboveHost(0.9), [-1.8 + i * 0.75, 1.4, 2.4], 0.07)
        })
        if (!armed) {
          malware.position.y = 0
          malware.scale.y *= 0.55
          crown.visible = false
        } else if (t < 4.4) malware.position.y = Math.abs(Math.sin((t - 2.8) * 7)) * 0.35
        showSparks(HOST_SPOT[0], 1.0, HOST_SPOT[1], t, 3.0)
        defenderNotices(t)
      },
    },
    // T1211 Exploitation for Stealth
    T1211: {
      hits: [2.8],
      run(t) {
        view.target = [1.0, 3.6]
        view.height = 10
        storyState(6)
        // 見張りは、見たことを記録（紙）に書き続けている。見張りの弱点を突くと、浮かんだまま固まって、記録が止まる
        const eye = [0.5, 3.3, 3.5]
        const frozen = t > 1.8 && t < 5.4
        const exploit = pinkCubes[6]
        if (frozen) placeSensor(eye[0], eye[1], eye[2], 0.18)
        for (let i = 0; i < 2; i++) {
          const start = 0.2 + i * 0.7
          if (t < start) continue
          const log = documents[i]
          flyPaper(log, eye, [-1.9 + i * 0.7, 0.5, 3.4], t, start + 0.1, start + 0.8, 0.5, start, 0.7)
        }
        if (t > 0.9 && t < 1.8) {
          flyTo(exploit, aboveHost(1.2), eye, t, 0.9, 1.8, 1.2, 8)
          exploit.scale.set(0.3, 0.3, 0.3)
        }
        // 記録されないまま動く
        if (t > 2.4 && t < 4.6) malware.position.y = Math.abs(Math.sin((t - 2.4) * 6)) * 0.3
        showSparks(HOST_SPOT[0], 1.0, HOST_SPOT[1], t, 2.6)
        showAlert(0, DEFENDER_SPOT[0], 2.2, DEFENDER_SPOT[1], t, 5.4, 6.8)
      },
    },
    // T1574 Hijack Execution Flow
    T1574: {
      hits: [3.4],
      run(t) {
        view.target = [0.6, 3.0]
        view.height = 10.5
        storyState(6)
        // 正規のプログラムが読み込む部品を、自分のものにすり替えておく。動いているのは正規のプログラムなので、見張りは通り過ぎる
        const program = [-1.0, 2.6]
        const planted = [-1.0, 1.4, 4.0]
        const fakePart = pinkCubes[6]
        trustedProcess.visible = true
        trustedProcess.scale.set(1.5, 1.5, 1.5)
        trustedProcess.position.set(
          program[0],
          t > 2.4 && t < 4.4 ? Math.abs(Math.sin((t - 2.4) * 6)) * 0.15 : 0,
          program[1],
        )
        trustedProcess.rotation.y = 0.6
        trustedProcessEyes.visible = false
        if (t > 0.5 && t < 2.4) {
          if (t < 1.6) flyTo(fakePart, aboveHost(2.2), planted, t, 0.5, 1.4, 1.0, 6)
          else flyTo(fakePart, planted, [program[0], 1.3, program[1]], t, 1.9, 2.4, 0.3)
          fakePart.scale.set(0.32, 0.32, 0.32)
        }
        if (t > 1.4 && t < 2.0) stretchBetween(cyanBeams[0], [program[0], 1.0, program[1]], planted, 0.06)
        showSparks(program[0], 1.2, program[1], t, 2.4)
        sensorVisits(t, 2.6, 4.4, program[0], program[1], true)
        if (t > 3.4 && t < 4.4) showCheck(program[0], 4.6, program[1], t, 3.4)
        defenderBlocks(t)
      },
    },
    // T1202 Indirect Command Execution
    T1202: {
      hits: [3.0],
      run(t) {
        view.target = [0.6, 3.2]
        view.height = 10.5
        storyState(6)
        // 見張りは、マルウェアが自分でコマンドを動かさないかを見ている。だから自分では動かさず、別の正規の道具（小さな機械）にことづけて、動かしてもらう
        const helper = [-1.4, 3.2]
        const tool = bots[4]
        const message = pinkCubes[6]
        tool.visible = true
        tool.scale.set(1, 1, 1)
        tool.position.set(
          helper[0],
          t > 2.4 && t < 4.4 ? Math.abs(Math.sin((t - 2.4) * 6)) * 0.2 : 0,
          helper[1],
        )
        tool.rotation.y = 0.6
        sensorVisits(t, 0.4, 4.6, HOST_SPOT[0], HOST_SPOT[1], true)
        // マルウェア自身は、じっとしている
        malware.position.y = 0
        if (t > 1.2 && t < 2.4) {
          message.visible = true
          message.scale.set(0.22, 0.14, 0.22)
          message.position.set(
            lerp(HOST_SPOT[0], helper[0], smooth(progress(t, 1.2, 2.4))),
            0.12,
            lerp(HOST_SPOT[1], helper[1], smooth(progress(t, 1.2, 2.4))),
          )
        }
        showSparks(helper[0], 0.9, helper[1], t, 2.5)
        defenderNotices(t)
      },
    },
    // T1542 Pre-OS Boot
    T1542: {
      hits: [2.4],
      run(t) {
        view.target = [1.2, 3.6]
        view.height = 10
        storyState(6)
        // 電源が入ってから、OSと見張りが動き出すまでの、わずかな時間。その「OSより前」にひそんでおけば、見張りが来たときには、もう用は済んでいる
        const arrive = smooth(progress(t, 2.8, 3.6))
        placeSensor(0.5, lerp(9, 3.3, arrive) + Math.sin(view.time * 3) * 0.1, 3.5)
        // 電源が入る
        if (t > 0.4 && t < 2.6) showRipples(HOST_SPOT[0], HOST_SPOT[1], (t - 0.4) * 0.8, 7)
        if (t < 0.6) placeMalware(HOST_SPOT[0], 0, HOST_SPOT[1], 0)
        else if (t < 2.8) malware.position.y = Math.abs(Math.sin((t - 0.6) * 6)) * 0.3
        else {
          // OSが立ち上がったあとは、床の下にいる
          malware.position.y = -1.9 * arrive
          crown.visible = arrive < 0.3
        }
        if (t < 0.6) crown.visible = false
        showSparks(HOST_SPOT[0], 1.0, HOST_SPOT[1], t, 1.2)
        if (t > 3.8 && t < 4.6) sensorVisits(t, 3.6, 5.0, HOST_SPOT[0], HOST_SPOT[1], true)
        defenderNotices(t)
      },
    },
    // T1055 Process Injection
    T1055: {
      hits: [3.2],
      run(t) {
        view.target = [0.6, 3.0]
        view.height = 10.5
        storyState(6)
        // 動いている正規のプログラムの中へ、自分ごと入り込む。外から見えるのは、いつもの正規のプログラムだけ
        const host = [-0.9, 2.8]
        const inside = t > 2.0 && t < 5.6
        trustedProcess.visible = true
        trustedProcess.scale.set(1.9, 1.9, 1.9)
        trustedProcess.position.set(host[0], 0, host[1])
        trustedProcess.rotation.y = 0.6
        trustedProcessEyes.visible = inside
        if (t > 1.0 && t < 5.6) {
          const shrink = t < 2.0 ? 1 - smooth(progress(t, 1.6, 2.0)) : 0
          jumpMalware(t, 1.0, 2.0, aboveHost(0), [host[0], 0.6, host[1]], 1.2, ADMIN_MALWARE_SIZE * shrink)
          crown.visible = false
        }
        sensorVisits(t, 2.4, 4.4, host[0], host[1], true)
        if (t > 3.2 && t < 4.4) showCheck(host[0], 4.8, host[1], t, 3.2)
        showCross(host[0], 2.8, host[1], t, 5.6)
      },
    },
    // T1620 Reflective Code Loading
    T1620: {
      hits: [3.0],
      run(t) {
        view.target = [0.8, 3.2]
        view.height = 10.5
        storyState(6)
        // 見張りが調べるのは、ディスクに置かれたファイル（床の紙）。コードをファイルにせず、メモリ（宙）に直接読み込んで動かせば、床には何も残らない
        const memory = aboveHost(2.8)
        const code = pinkCubes[6]
        for (let i = 0; i < 3; i++) {
          const file = documents[i]
          file.visible = true
          file.scale.set(0.9, 0.9, 0.9)
          file.position.set(-1.8 + i * 0.8, 0.12, 2.6 + (i & 1) * 0.8)
          file.rotation.set(Math.PI / 2, 0, 0.3 * i)
        }
        sensorVisits(t, 0.6, 4.4, -1.0, 3.0, true)
        if (t > 1.2 && t < 4.6) {
          flyTo(code, [TOWER_SPOT[0], 2.9, TOWER_SPOT[1]], memory, t, 1.2, 2.4, 2.4, 6)
          code.scale.set(0.34, 0.34, 0.34)
          if (t >= 2.4) code.rotation.set(t * 4, t * 6, 0)
        }
        showSparks(memory[0], memory[1], memory[2], t, 2.6)
        defenderNotices(t)
      },
    },
    // T1679 Selective Exclusion
    T1679: {
      hits: [3.0],
      run(t) {
        view.target = [0.4, 3.0]
        view.height = 10.5
        storyState(6)
        // 手当たり次第に壊すと、機械が止まってすぐ気づかれる。動かすのに必要なファイル（黄色い印）はわざと避けて、目立たないものだけに手を付ける
        const at = (i: number) => [-2.5 + i * 0.8, 1.0, 3.0]
        for (let i = 0; i < 4; i++) {
          const file = documents[i]
          const vital = i % 2 === 1
          const touched = 0.9 + i * 0.5
          const spot = at(i)
          file.visible = true
          file.scale.set(0.9, 0.9, 0.9)
          file.position.set(spot[0], spot[1], spot[2])
          file.rotation.y = 0.6
          if (vital) {
            const badge = yellowCubes[(i - 1) / 2]
            badge.visible = true
            badge.material.color.setHex(0xf6c531)
            badge.scale.set(0.2, 0.2, 0.2)
            badge.position.set(spot[0], spot[1] + 0.6, spot[2])
            continue
          }
          if (t > touched && t < touched + 0.4) stretchBetween(pinkBeams[i], aboveHost(0.9), spot, 0.07)
          if (t > touched + 0.3 && t < 5.6) {
            const mark = pinkCubes[i]
            mark.visible = true
            mark.scale.set(0.24, 0.24, 0.24)
            mark.position.set(spot[0], spot[1] + 0.6, spot[2])
            mark.rotation.y = view.time * 2
          }
        }
        // 機械は動き続けているので、見張りは気づかない
        showAlert(0, DEFENDER_SPOT[0], 2.2, DEFENDER_SPOT[1], t, 5.6, 6.8)
      },
    },
    // T1684 Social Engineering
    T1684: {
      hits: [3.2],
      run(t) {
        view.target = [2.8, 7.6]
        view.height = 16
        storyState(6)
        view.actor = attacker
        // 機械ではなく、人をだます。それらしい話（外からの線）で急がせて、従業員自身の手で承認させる。機械の側には、ほとんど跡が残らない
        const desk = [3.5, 1.4, 4.4]
        const caller = [ATTACKER_SPOT[0], 1.6, ATTACKER_SPOT[1]]
        const given = key
        if (t > 0.6 && t < 2.6) stretchBetween(pinkBeams[0], caller, desk, 0.05 + 0.02 * Math.sin(t * 20))
        hopInPlace(employees[2], t, 1.4, 2.4, 0.1)
        if (t > 2.2 && t < 5.2) {
          flyTo(given, desk, aboveAttacker(), t, 2.2, 3.2, 2.4, 6)
          given.scale.set(0.8, 0.8, 0.8)
          if (t >= 3.2) given.rotation.y = view.time * 2
        }
        if (t > 2.2 && t < 3.4) showCheck(desk[0], 3.0, desk[2], t, 2.2)
        showCross(desk[0], 3.0, desk[2], t, 5.4)
      },
    },
    // T1216 System Script Proxy Execution
    T1216: {
      hits: [3.2],
      run(t) {
        view.target = [0.6, 3.0]
        view.height = 10.5
        storyState(6)
        // OSに付属する、署名の付いた正規のスクリプト（印のある紙）。これに不正な処理をことづけて、スクリプトの動作として動かす
        const page = [-0.9, 1.6, 2.8]
        const script = documents[0]
        const seal = yellowCubes[0]
        const payload = pinkCubes[6]
        script.visible = true
        script.scale.set(1.5, 1.5, 1.5)
        script.position.set(
          page[0],
          page[1] + (t > 2.2 && t < 4.4 ? Math.abs(Math.sin((t - 2.2) * 6)) * 0.12 : 0),
          page[2],
        )
        script.rotation.y = 0.6
        seal.visible = true
        seal.material.color.setHex(0xf6c531)
        seal.scale.set(0.2, 0.2, 0.2)
        seal.position.set(page[0] + 0.25, script.position.y - 0.4, page[2] + 0.15)
        if (t > 0.8 && t < 2.2) {
          flyTo(payload, aboveHost(2.2), page, t, 0.8, 2.0, 1.0, 6)
          payload.scale.set(0.3, 0.3, 0.3)
        }
        showSparks(page[0], 1.4, page[2], t, 2.2)
        sensorVisits(t, 2.6, 4.4, page[0], page[2], true)
        if (t > 3.3 && t < 4.4) showCheck(page[0], 4.6, page[2], t, 3.3)
        defenderBlocks(t)
      },
    },
    // T1221 Template Injection
    T1221: {
      hits: [3.0],
      run(t) {
        view.target = [2.8, 7.6]
        view.height = 16
        storyState(6)
        // 届いた文書そのものには、不正なものは何も入っていない。開いたときに、文書が外へ「ひな形」を取りに行き、そこで初めて不正な中身が入ってくる
        const desk = [2.7, 1.4, 4.7]
        const outside = [TOWER_SPOT[0], 2.9, TOWER_SPOT[1]]
        const opened = smooth(progress(t, 1.0, 1.4))
        const file = documents[0]
        const fetched = pinkCubes[6]
        file.visible = true
        file.scale.set(1.0, 1.0, 1.0)
        file.position.set(desk[0], desk[1] + opened * 0.5, desk[2])
        file.rotation.set((1 - opened) * (Math.PI / 2), 0.6, 0)
        if (t < 1.0) showCheck(desk[0], 3.0, desk[2], t, 0.2)
        hopInPlace(employees[2], t, 0.9, 1.3, 0.12)
        if (t > 1.4 && t < 2.9) stretchBetween(cyanBeams[0], [desk[0], desk[1] + 0.5, desk[2]], outside, 0.05)
        if (t > 1.8 && t < 2.9) {
          flyTo(fetched, outside, [desk[0], desk[1] + 0.5, desk[2]], t, 1.8, 2.8, 2.0, 6)
          fetched.scale.set(0.3, 0.3, 0.3)
        }
        showSparks(desk[0], desk[1] + 0.5, desk[2], t, 2.8)
        showCross((desk[0] + outside[0]) / 2, 4.4, (desk[2] + outside[2]) / 2, t, 5.4)
      },
    },
    // T1205 Traffic Signaling
    T1205: {
      hits: [3.0],
      run(t) {
        view.target = [0.8, 6.2]
        view.height = 15
        storyState(6)
        // 通信の口（黄色い箱）は、ふだん閉じている（灰色）。外から調べても、何も開いていない。決めた合図が届いたときだけ、少しのあいだ開く
        const port = [YELLOW_CUBE_X[1], 2.5, 6.6]
        const open = t > 2.6 && t < 4.4
        const entry = yellowCubes[1]
        const knock = pinkCubes[6]
        entry.visible = true
        entry.material.color.setHex(open ? 0xff6fd8 : 0x4a4f5c)
        entry.scale.set(0.5, 0.5, 0.5)
        // 見張りが調べる
        if (t > 0.5 && t < 1.6) stretchBetween(cyanBeams[0], [0.5, 3.3, 3.5], port, 0.06)
        if (t > 1.0 && t < 1.8) showCheck(port[0], 4.2, port[2], t, 1.0)
        if (t > 2.0 && t < 2.6) {
          flyTo(knock, [TOWER_SPOT[0], 2.9, TOWER_SPOT[1]], port, t, 2.0, 2.6, 2.0, 6)
          knock.scale.set(0.3, 0.3, 0.3)
        }
        if (open) {
          stretchBetween(pinkBeams[0], [TOWER_SPOT[0], 2.9, TOWER_SPOT[1]], port, 0.08)
          stretchBetween(pinkBeams[1], port, aboveHost(1.0), 0.08)
        }
        defenderBlocks(t)
      },
    },
    // T1127 Trusted Developer Utilities Proxy Execution
    T1127: {
      hits: [3.0],
      run(t) {
        view.target = [0.6, 3.2]
        view.height = 10.5
        storyState(6)
        // 開発用の正規の道具（かなづち）は、署名もあって信頼されている。これに組み立てさせれば、できあがるまで、見張りには不正なものが見えない
        const bench = [-0.8, 0.5, 3.0]
        const built = bots[6]
        for (let i = 0; i < 2; i++) {
          const start = 0.5 + i * 0.5
          if (t < start || t > 2.6) continue
          const source = documents[i]
          flyTo(
            source,
            aboveHost(2.2),
            [bench[0] - 0.3 + i * 0.6, bench[1], bench[2]],
            t,
            start,
            start + 0.8,
            0.9,
            5,
          )
          source.scale.set(0.7, 0.7, 0.7)
          if (t >= start + 0.8) source.rotation.set(Math.PI / 2, 0, 0)
        }
        hammer.visible = true
        hammer.position.set(bench[0] + 0.8, 0.9, bench[2] + 0.2)
        hammer.rotation.z = t > 1.5 && t < 2.7 ? 0.3 + Math.abs(Math.cos(((t - 1.5) * Math.PI) / 0.4)) : 1.2
        sensorVisits(t, 0.8, 2.8, bench[0], bench[2], true)
        if (t > 1.6 && t < 2.8) showCheck(bench[0], 4.6, bench[2], t, 1.6)
        if (t > 2.6) {
          const size = overshoot(progress(t, 2.6, 2.9))
          built.visible = true
          built.scale.set(size, size, size)
          built.position.set(bench[0], Math.abs(Math.sin((t - 2.6) * 6)) * 0.2, bench[2])
          built.rotation.y = 0.6
        }
        showSparks(bench[0], 0.9, bench[2], t, 2.9)
      },
    },
    // T1078 Valid Accounts
    T1078: {
      hits: [3.4],
      run(t) {
        view.target = [0.5, 3.4]
        view.height = 15
        storyState(6)
        // 正規のアカウント（人形）で、ふつうの利用者と同じように操作する。見張りが端から順に見て回っても、従業員のひとりにしか見えない
        const seat = [0.2, 4.2]
        const sweep = progress(t, 1.6, 4.2)
        const x = lerp(-6.5, 6.5, sweep)
        const gone = smooth(progress(t, 0.4, 1.0)) * (1 - smooth(progress(t, 5.6, 6.2)))
        placeMalware(HOST_SPOT[0], 0, HOST_SPOT[1], ADMIN_MALWARE_SIZE * (1 - gone))
        crown.visible = gone < 0.3
        if (gone > 0.3) {
          impostor.visible = true
          applyPose(impostor, standing(seat[0], seat[1], 0))
          impostor.scale.multiplyScalar(overshoot(progress(t, 0.8, 1.2)))
          impostor.scale.y *= 1 + Math.sin(view.time * 3 + 1) * 0.03
        }
        if (t > 1.6 && t < 4.2) {
          const beam = cyanBeams[0]
          placeSensor(x, 3.4 + Math.sin(view.time * 3) * 0.1, 3.4)
          beam.visible = true
          beam.rotation.set(0, 0, 0)
          beam.position.set(x, 1.7, 3.4)
          beam.scale.set(0.3, 2.8, 0.3)
        }
        if (t > 3.2 && t < 4.6) showCheck(seat[0], 2.6, seat[1], t, 3.2)
        showAlert(0, DEFENDER_SPOT[0], 2.2, DEFENDER_SPOT[1], t, 5.4, 6.8)
      },
    },
    // T1220 XSL Script Processing
    T1220: {
      hits: [3.2],
      run(t) {
        view.target = [0.4, 3.2]
        view.height = 10.5
        storyState(6)
        // データの形を整える正規の道具は、「変換の手順書」を読んで働く。その手順書にスクリプトを埋め込んでおくと、変換のついでに動かしてくれる
        const tool = [-1.0, 2.8]
        const data = documents[0]
        const recipe = documents[1]
        const result = documents[2]
        const hidden = pinkCubes[6]
        trustedProcess.visible = true
        trustedProcess.scale.set(1.5, 1.5, 1.5)
        trustedProcess.position.set(
          tool[0],
          t > 2.3 && t < 4.4 ? Math.abs(Math.sin((t - 2.3) * 6)) * 0.15 : 0,
          tool[1],
        )
        trustedProcess.rotation.y = 0.6
        trustedProcessEyes.visible = false
        if (t > 0.4 && t < 2.3) {
          flyTo(data, [-3.4, 1.2, 4.2], [tool[0], 1.2, tool[1]], t, 0.4, 2.2, 0.4, 0)
          data.scale.set(0.8, 0.8, 0.8)
          data.rotation.y = 0.6
          flyTo(recipe, aboveHost(2.2), [tool[0], 1.6, tool[1]], t, 0.8, 2.2, 0.9, 0)
          recipe.scale.set(0.8, 0.8, 0.8)
          recipe.rotation.y = 0.6
          hidden.visible = true
          hidden.scale.set(0.16, 0.16, 0.16)
          hidden.position.set(recipe.position.x + 0.1, recipe.position.y - 0.25, recipe.position.z + 0.1)
        }
        if (t > 2.4) {
          flyTo(result, [tool[0], 1.2, tool[1]], [tool[0] - 1.5, 0.5, tool[1] + 0.6], t, 2.4, 3.2, 0.8, 5)
          result.scale.set(0.8, 0.8, 0.8)
          if (t >= 3.2) result.rotation.y = 0.6
        }
        showSparks(tool[0], 1.2, tool[1], t, 2.4)
        sensorVisits(t, 2.8, 4.6, tool[0], tool[1], true)
        defenderNotices(t)
      },
    },
  }
}
