import { type Material, type Mesh, type Object3D, Raycaster, Vector3 } from 'three'
import { describe, expect, it } from 'vitest'
import { TACTICS } from '../../data/tactics'
import { buildTimeline, DEFENSE_AT, type TimelineScene } from '../../player/timeline'
import { createKit } from '../kit'
import { createWorld } from '../world'
import { createScenes, LATEST_SUCCESS } from './index'

// 画面に描かずに、舞台と場面だけを組み立てて動かす
const kit = createKit(createWorld())
const scenes = createScenes(kit)
const timeline = buildTimeline()
/** データにあるすべての技術を、「戦術ID/技術ID」の形で並べたもの */
const detailed = TACTICS.flatMap((t) => t.examples.map((e) => `${t.id}/${e.id}`))

const sceneDefOf = (s: TimelineScene) =>
  s.kind === 'intro'
    ? scenes.intro
    : s.kind === 'outro'
      ? scenes.outro
      : scenes.technique(TACTICS[s.tactic].id, s.techniqueId!)!

/** 見えている物の一覧と、その位置・大きさ・向き。攻撃者と防御者は場面が毎回置き直すので、位置は比べない */
const snapshot = () => {
  const out: number[] = []
  const visit = (o: (typeof kit.scene)['children'][number], i: number) => {
    if (!o.visible) return
    out.push(i)
    if (o !== kit.attacker && o !== kit.defender)
      out.push(...o.position.toArray(), ...o.scale.toArray(), o.rotation.x, o.rotation.y, o.rotation.z)
    o.children.forEach(visit)
  }
  kit.scene.children.forEach(visit)
  return out
}

describe('場面の対応', () => {
  it('データにあるすべての技術に、場面がある', () => {
    for (const key of detailed) {
      const [tacticId, techniqueId] = key.split('/')
      expect(scenes.technique(tacticId, techniqueId), key).toBeDefined()
    }
  })

  it('データに無い技術の場面は残っていない', () => {
    const have = Object.entries(scenes.byTactic).flatMap(([tacticId, map]) =>
      Object.keys(map).map((techniqueId) => `${tacticId}/${techniqueId}`),
    )
    expect(have.sort()).toEqual([...detailed].sort())
  })
})

describe('場面の実行', () => {
  const all = timeline.map((s) => ({
    name: `${s.kind} ${s.tactic >= 0 ? TACTICS[s.tactic].id : ''} ${s.title ?? ''}`.trim(),
    duration: s.duration,
    captions: s.captions,
    sceneDef: sceneDefOf(s),
  }))

  it.each(all)('$name は最初から最後までエラーなく動く', ({ duration, sceneDef }) => {
    for (let t = 0; t <= duration; t += 0.05) {
      kit.view.time = 3 + t
      kit.reset()
      sceneDef.run(t)
      expect(Number.isFinite(kit.view.height)).toBe(true)
      expect(kit.view.target.every(Number.isFinite)).toBe(true)
    }
  })

  it('成功の合図は、攻撃側の字幕の時間内にある', () => {
    for (const s of all)
      for (const hit of s.sceneDef.hits) {
        const caption = s.captions.find((c) => hit >= c[0] && hit < c[1])
        expect(caption?.[2], `${s.name} hit ${hit}`).toBe('a')
      }
  })

  it('本編以外の技術は、防御側の番までに成功の合図が出る', () => {
    for (const s of timeline.filter((x) => x.kind === 'extra'))
      expect(sceneDefOf(s).hits[0], s.title).toBeLessThan(DEFENSE_AT)
  })
})

describe('間合い', () => {
  const techniques = timeline.filter((s) => s.techniqueId)

  it('成功の合図（ドクロ）は、防御側の番までに 0.8 秒は見えている', () => {
    for (const s of techniques) {
      const hits = sceneDefOf(s).hits
      // 成功が 2 回ある場面（消されて戻ってくる本編の永続化）は、1 回目だけを見る
      expect(hits[0], `${TACTICS[s.tactic].id} ${s.title}`).toBeLessThanOrEqual(LATEST_SUCCESS + 1e-9)
    }
  })

  it('防御側の番には、絵のどこかが変わる（字幕だけが防御の話をしている、という場面を作らない）', () => {
    for (const s of techniques) {
      const sceneDef = sceneDefOf(s)
      // ゆらゆらした動きは止めて（view.time を固定）、場面が自分の時刻で起こす変化だけを見る
      const at = (t: number) => {
        kit.view.time = 3
        kit.reset()
        sceneDef.run(t)
        return JSON.stringify(snapshot())
      }
      const before = at(DEFENSE_AT + 0.1)
      const changed = [5.2, 5.7, 6.2, 6.7].some((t) => at(t) !== before)
      expect(changed, `${TACTICS[s.tactic].id} ${s.title}`).toBe(true)
    }
  })
})

describe('画面への収まり', () => {
  // 舞台は 16:9。再生機（player.ts）と同じ手順でカメラを合わせる
  const aim = () => {
    const { camera, view } = kit
    const aspect = 16 / 9
    camera.left = (-view.height * aspect) / 2
    camera.right = (view.height * aspect) / 2
    camera.top = view.height / 2
    camera.bottom = -view.height / 2
    camera.updateProjectionMatrix()
    camera.position.set(
      view.target[0] + kit.CAMERA_OFFSET.x,
      kit.CAMERA_OFFSET.y,
      view.target[1] + kit.CAMERA_OFFSET.z,
    )
    camera.lookAt(view.target[0], 0, view.target[1])
    camera.updateMatrixWorld()
    kit.scene.updateMatrixWorld(true)
  }
  const toCamera = kit.CAMERA_OFFSET.clone().normalize()
  const ray = new Raycaster()
  /** その点が、カメラから見て、ほかの不透明な物の陰になっているか */
  const hidden = (point: Vector3, self: Object3D) => {
    const meshes: Object3D[] = []
    const collect = (o: Object3D) => {
      if (!o.visible || o === self) return
      if ((o as Mesh).isMesh) meshes.push(o)
      o.children.forEach(collect)
    }
    kit.scene.children.forEach(collect)
    ray.set(point.clone().addScaledVector(toCamera, 150), toCamera.clone().negate())
    return ray.intersectObjects(meshes, false).some((hit) => {
      const material = (hit.object as Mesh).material as Material
      return hit.distance < 150 - 0.25 && !material.transparent && material.opacity >= 1
    })
  }
  const techniques = timeline.filter((s) => s.techniqueId)

  it('成功の合図（ドクロ）は、画面の中に出る', () => {
    for (const s of techniques) {
      const sceneDef = sceneDefOf(s)
      const t = sceneDef.hits[0] + 0.4
      kit.view.time = 3 + t
      kit.reset()
      sceneDef.run(t)
      aim()
      const actor = kit.view.actor
      if (!actor.visible) continue // 攻撃側の主役が姿を消す場面（別物の中に入り込む、など）では、ドクロは出ない
      const above = actor === kit.attacker ? 4.1 : 1.1 * actor.scale.y + 1.4
      const skull = actor.position
        .clone()
        .setY(actor.position.y + above)
        .project(kit.camera)
      expect(Math.abs(skull.x), `${TACTICS[s.tactic].id} ${s.title}`).toBeLessThan(0.97)
      expect(Math.abs(skull.y), `${TACTICS[s.tactic].id} ${s.title}`).toBeLessThan(0.95)
    }
  })

  it('防御側の番には、防御者が画面の中にいて、建物の陰に隠れていない', () => {
    for (const s of techniques) {
      const sceneDef = sceneDefOf(s)
      const t = 6.2
      kit.view.time = 3 + t
      kit.reset()
      sceneDef.run(t)
      aim()
      const name = `${TACTICS[s.tactic].id} ${s.title}`
      const { defender } = kit
      expect(defender.visible, name).toBe(true)
      const { x, z } = defender.position
      const shield = new Vector3(x, 3.3, z).project(kit.camera)
      const feet = new Vector3(x, 0.2, z).project(kit.camera)
      expect(Math.abs(shield.x), name).toBeLessThan(0.97)
      expect(shield.y, name).toBeLessThan(0.95)
      expect(feet.y, name).toBeGreaterThan(-0.9)
      // 胴と頭の両方が隠れていたら、見えていないとみなす（壁ごしに下半身だけ隠れるのは構わない）
      expect(hidden(new Vector3(x, 1.2, z), defender) && hidden(new Vector3(x, 2.1, z), defender), name).toBe(
        false,
      )
    }
  })
})

describe('reset', () => {
  it('どの場面のあとでも、舞台を同じ初期状態に戻す', () => {
    kit.view.time = 1
    kit.reset()
    const clean = snapshot()
    const defs = new Map(timeline.map((s) => [`${s.kind} ${s.tactic} ${s.techniqueId ?? ''}`, sceneDefOf(s)]))
    for (const [name, sceneDef] of defs) {
      for (const t of [0.5, 2.5, 4, 6.5]) {
        kit.view.time = 1
        kit.reset()
        sceneDef.run(t)
      }
      kit.view.time = 1
      kit.reset()
      expect(snapshot(), `${name} のあと`).toEqual(clean)
    }
  })
})
