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
  }
}
