// 再生機。時間を進め、いまの場面を描き、画面（React）に「いま何を再生しているか」を伝える。
import * as THREE from 'three'
import { createKit, type Kit } from '../scene/kit'
import { overshoot, progress } from '../scene/motion'
import { createScenes, type Scenes } from '../scene/scenes'
import type { SceneDef } from '../scene/scenes/types'
import { createWorld } from '../scene/world'
import { TACTICS } from '../data/tactics'
import type { Caption } from '../data/types'
import { placeLabels } from './labels'
import {
  buildTimeline,
  captionAt,
  hashFor,
  LEAD,
  parseHash,
  step,
  stepWithin,
  type TimelineScene,
} from './timeline'

/** 毎フレーム位置を変える重ね表示。React を通さず、要素を直接動かす */
export type Overlay = {
  stage: HTMLElement
  attacker: HTMLElement
  defender: HTMLElement
  malware: HTMLElement
  fade: HTMLElement
}

export type NowPlaying = { index: number; scene: TimelineScene; caption: Caption }

export type PlayerHooks = {
  /** 場面か字幕が切り替わったとき */
  onChange(now: NowPlaying): void
  /** 再生・一時停止が切り替わったとき */
  onPlaying(playing: boolean): void
}

export class Player {
  readonly timeline = buildTimeline()
  private readonly renderer: THREE.WebGLRenderer
  private readonly kit: Kit
  private readonly scenes: Scenes
  private readonly overlay: Overlay
  private readonly hooks: PlayerHooks
  private readonly projected = new THREE.Vector3()
  private index = 0
  private time = 0
  /** 次の場面に入る前の「間」の残り秒数。この間は暗転したまま、次の技術の名前を見せる */
  private lead = 0
  private playing = true
  private includeExtras = false
  /** 決めた場面だけを順にたどるときの、場面の添字の並び（攻撃グループの技術など）。無ければ null */
  private playlist: number[] | null = null
  private raf = 0
  private last = 0
  private width = 0
  private height = 0
  private captionKey = ''

  /** WebGL が使えない環境では例外を投げる */
  constructor(canvas: HTMLCanvasElement, overlay: Overlay, hooks: PlayerHooks) {
    this.overlay = overlay
    this.hooks = hooks
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
    this.renderer.outputEncoding = THREE.sRGBEncoding
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    this.renderer.setClearColor(0x000000, 0)
    this.kit = createKit(createWorld())
    this.scenes = createScenes(this.kit)

    // 動きを減らす設定の人には、最初から止めた状態で見せる
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      this.playing = false
      this.index = 1
      this.time = 3
    }
    this.readHash()
  }

  start() {
    window.addEventListener('hashchange', this.readHash)
    this.hooks.onPlaying(this.playing)
    this.raf = requestAnimationFrame(this.frame)
  }

  dispose() {
    cancelAnimationFrame(this.raf)
    window.removeEventListener('hashchange', this.readHash)
    this.renderer.dispose()
  }

  toggle() {
    this.setPlaying(!this.playing)
  }

  /** 場面の先頭から再生する。利用者の操作なら、URL の # を書き換えて舞台を画面内に寄せる */
  show(index: number, fromUser = false) {
    this.index = index
    this.time = 0.02
    this.lead = 0
    this.setPlaying(true)
    if (!fromUser) return
    const hash = hashFor(this.timeline, index)
    try {
      history.replaceState(null, '', hash || location.pathname + location.search)
    } catch {
      // 埋め込み先によっては履歴を書き換えられない。再生には影響しない
    }
    this.overlay.stage.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }

  next() {
    this.show(this.neighbour(1))
  }

  /** 場面の途中なら先頭に戻し、先頭付近なら前の場面へ */
  prev() {
    this.show(this.time > 1.5 ? this.index : this.neighbour(-1))
  }

  setIncludeExtras(on: boolean) {
    this.includeExtras = on
  }

  /** 決めた場面だけを順にたどる（null で、ふつうの順に戻す）。いま再生している場面は変えない */
  setPlaylist(playlist: number[] | null) {
    this.playlist = playlist?.length ? playlist : null
  }

  /** 次（dir=1）または前（dir=-1）に再生する場面 */
  private neighbour(dir: 1 | -1) {
    return this.playlist
      ? stepWithin(this.playlist, this.index, dir)
      : step(this.timeline, this.index, dir, this.includeExtras)
  }

  private setPlaying(playing: boolean) {
    if (this.playing === playing) return
    this.playing = playing
    this.hooks.onPlaying(playing)
  }

  private readHash = () => {
    const target = parseHash(this.timeline, location.hash)
    if (!target) return
    this.index = target.index
    this.time = target.pauseAt ?? 0.02
    this.lead = 0
    if (target.pauseAt != null) this.setPlaying(false)
  }

  private frame = (now: number) => {
    const dt = Math.min(0.05, (now - this.last) / 1000 || 0)
    this.last = now
    if (this.playing) {
      this.kit.view.time += dt
      if (this.lead > 0) this.lead -= dt
      else this.time += dt
      if (this.time >= this.timeline[this.index].duration) {
        this.index = this.neighbour(1)
        this.time = 0
        // 技術が替わったことが分かるよう、名前を見せる間を置く（導入とまとめには名前が無いので置かない）
        this.lead = this.timeline[this.index].techniqueId ? LEAD : 0
      }
    }
    this.draw()
    this.raf = requestAnimationFrame(this.frame)
  }

  private sceneDef(scene: TimelineScene): SceneDef {
    if (scene.kind === 'intro') return this.scenes.intro
    if (scene.kind === 'outro') return this.scenes.outro
    return this.scenes.technique(TACTICS[scene.tactic].id, scene.techniqueId!)!
  }

  private resize() {
    const { stage } = this.overlay
    const w = stage.clientWidth
    const h = stage.clientHeight
    if ((w === this.width && h === this.height) || !w) return
    this.width = w
    this.height = h
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    this.renderer.setSize(w, h, false)
  }

  /**
   * 物の頭上に、ラベルを追従させる。物どうしが近いときは、重ならないようにずらす。
   * 先に渡したものほど、元の位置を優先する。show が false のものは隠す。
   */
  private labels(items: { el: HTMLElement; o: THREE.Object3D; above: number; show?: boolean }[]) {
    const shown = items.filter(({ el, o, show }) => {
      el.hidden = !o.visible || show === false
      return !el.hidden
    })
    const wanted = shown.map(({ el, o, above }) => {
      const v = this.projected.set(o.position.x, o.position.y + above, o.position.z).project(this.kit.camera)
      return {
        x: ((v.x + 1) / 2) * this.width,
        y: ((1 - v.y) / 2) * this.height,
        w: el.offsetWidth,
        h: el.offsetHeight,
      }
    })
    placeLabels(wanted, this.width, this.height).forEach((l, i) => {
      shown[i].el.style.transform = `translate(-50%,-100%) translate(${l.x.toFixed(1)}px,${l.y.toFixed(1)}px)`
    })
  }

  private draw() {
    this.resize()
    const { kit } = this
    const { view, camera } = kit
    const scene = this.timeline[this.index]
    const sceneDef = this.sceneDef(scene)
    const t = this.time

    kit.reset()
    sceneDef.run(t)

    const caption = captionAt(scene, t)
    const side = caption[2]
    const actor = view.actor

    // 番が来ている側の足もとに輪を出す
    const who = side === 'a' ? actor : side === 'd' ? kit.defender : null
    if (who?.visible) {
      const color = side === 'a' ? 0xff5a4d : 0x6f9dff
      kit.turnRings.forEach((g, j) => {
        const ph = (view.time * 0.7 + j * 0.5) % 1
        const k = 1 + ph * 5.5
        g.visible = true
        g.material.color.setHex(color)
        g.scale.set(k, 0.02, k)
        g.position.set(who.position.x, 0.07, who.position.z)
        g.material.opacity = 0.6 * (1 - ph)
      })
    }
    // 攻撃が成功したら赤いドクロ
    if (side === 'a' && actor.visible) {
      const hit = sceneDef.hits.find((h) => h >= caption[0] && h < caption[1])
      if (hit != null && t >= hit) {
        const onAttacker = actor === kit.attacker
        const k = overshoot(progress(t, hit, hit + 0.3)) * (onAttacker ? 1 : 0.9)
        const above = onAttacker ? 4.1 : 1.1 * actor.scale.y + 1.4
        kit.skull.visible = true
        kit.skull.scale.set(k, k, k)
        kit.skull.rotation.y = 0.6
        kit.skull.position.set(
          actor.position.x,
          actor.position.y + above + Math.sin(view.time * 5) * 0.08,
          actor.position.z,
        )
      }
    }
    // 防御側の番には青い盾
    if (side === 'd') {
      const k = overshoot(progress(t, caption[0], caption[0] + 0.3))
      kit.shield.visible = true
      kit.shield.scale.set(k, k, k)
      kit.shield.rotation.y = 0.6
      kit.shield.position.set(
        kit.defender.position.x,
        3.3 + Math.sin(view.time * 4) * 0.08,
        kit.defender.position.z,
      )
    }

    const aspect = this.width / this.height || 16 / 9
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
    this.renderer.render(kit.scene, camera)

    const { overlay } = this
    // 防御側の番は、防御者の頭上に盾が出るので、ラベルは出さない
    this.labels([
      { el: overlay.malware, o: kit.malware, above: 1.1 * kit.malware.scale.y + 0.2 },
      { el: overlay.attacker, o: kit.attacker, above: 2.3 },
      { el: overlay.defender, o: kit.defender, above: 2.3, show: side !== 'd' },
    ])
    // 場面の変わり目は暗転でつなぐ
    overlay.fade.style.opacity = Math.max(0, 1 - Math.min(t, scene.duration - t) / 0.35).toFixed(2)
    overlay.stage.classList.toggle('lead', this.lead > 0)

    const key = `${this.index}:${caption[0]}`
    if (key !== this.captionKey) {
      this.captionKey = key
      this.hooks.onChange({ index: this.index, scene, caption })
    }
  }
}
