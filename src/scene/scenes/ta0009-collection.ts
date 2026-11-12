// TA0009 収集（Collection）の場面。
import type { Kit } from '../kit'
import { progress, smooth, lerp, overshoot, arcBetween, stretchBetween } from '../motion'
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
    pulseRings,
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
  } = kit
  return {
    // T1005 Data from Local System（本編）
    T1005: {
      hits: [3.5],
      run(t) {
        view.target = [-1.5, -3.2]
        view.height = 10.5
        storyState(11) // Collection
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
        pulseRings.forEach((ring, j) => {
          const ph = (t * 0.5 + j * 0.5) % 1,
            scale = 1 + ph * 4
          ring.visible = true
          ring.scale.set(scale, 0.02, scale)
          ring.position.set(centre[0], 0.08, centre[2])
          ring.material.opacity = 0.5 * (1 - ph)
        })
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
            flyTo(
              doc,
              [seat.x, 2.2, seat.z],
              [centre[0] - 0.4 + i * 0.8, 0.45, centre[2] + 0.5],
              t,
              laterStart + 0.2,
              laterStart + 1.3,
              3,
              5,
            )
            const size = overshoot(progress(t, laterStart, laterStart + 0.3))
            doc.scale.set(size, size, size)
            if (t >= laterStart + 1.3) doc.rotation.y = 0.6
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
          const size = 0.85 * overshoot(progress(t, start, start + 0.3))
          flyTo(
            doc,
            [wiki[0], 2.2, wiki[1]],
            [SERVER_SPOT[0] - 1.0 + i * 0.65, 0.45, SERVER_SPOT[1] + 1.5],
            t,
            start + 0.2,
            start + 1.2,
            2.2,
            5,
          )
          doc.scale.set(size, size, size)
          if (t >= start + 1.2) doc.rotation.y = 0.6
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
        if (t > 0.4 && t < 4.4)
          pulseRings.forEach((ring, j) => {
            const phase = ((t - 0.4) * 0.8 + j * 0.5) % 1
            const scale = 1 + phase * 6
            ring.visible = true
            ring.scale.set(scale, 0.02, scale)
            ring.position.set(talker.x, 0.08, talker.z)
            ring.material.opacity = 0.5 * (1 - phase)
          })
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
  }
}
