// TA0009 収集（Collection）の場面。
import type { Kit } from '../kit'
import { progress, smooth, lerp, overshoot, arcBetween } from '../motion'
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
  }
}
