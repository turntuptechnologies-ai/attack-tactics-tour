// OGP 画像（1200×630）の元になる絵を描く。og.html から読み込む。サイト本体には含まれない。
// サイトと同じ舞台・同じ書体を使うので、舞台の見た目を変えたら、画像も作り直すと揃う。
import * as THREE from 'three'
import '@fontsource/dotgothic16/400.css'
import '@fontsource/press-start-2p/400.css'
import { TACTICS } from './data/tactics'
import { createKit } from './scene/kit'
import { createScenes } from './scene/scenes'
import { createWorld } from './scene/world'

const WIDTH = 1200
const HEIGHT = 630
/** 絵にする場面と時刻。本編の「持ち出し」で、盗んだデータが指令の通り道を流れている瞬間 */
const TACTIC = 'TA0010'
const TECHNIQUE = 'T1041'
const TIME = 2.6

const root = document.getElementById('og')!
root.innerHTML = `
  <canvas width="${WIDTH * 2}" height="${HEIGHT * 2}"></canvas>
  <div class="shade"></div>
  <div class="strip">${TACTICS.map((_, i) => `<i class="${i < 13 ? 'done' : i === 13 ? 'on' : ''}"></i>`).join('')}</div>
  <div class="text">
    <p class="kicker">MITRE ATT&amp;CK Enterprise v20</p>
    <h1><span>ATT&amp;CK</span><span>Tactics Tour</span></h1>
    <p class="lead">15の戦術と227の技術を、<br />ボクセルアニメで見て回る</p>
    <p class="sides"><b class="a">攻撃側のターン</b><b class="d">防御側のターン</b></p>
  </div>`
const style = document.createElement('style')
style.textContent = `
  html, body { margin: 0; background: #101b33; }
  #og { position: relative; width: ${WIDTH}px; height: ${HEIGHT}px; overflow: hidden; background: #101b33; color: #f2f7ff;
        font-family: 'DotGothic16', sans-serif; }
  #og canvas { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
  #og .shade { position: absolute; inset: 0;
        background: linear-gradient(90deg, #101b33 0%, rgba(16, 27, 51, 0.94) 30%, rgba(16, 27, 51, 0) 58%); }
  #og .strip { position: absolute; left: 0; right: 0; top: 0; display: flex; gap: 4px; height: 12px; }
  #og .strip i { flex: 1; background: #3a4a6b; }
  #og .strip i.done { background: #9fb4d8; }
  #og .strip i.on { background: #ff6a5e; }
  #og .text { position: absolute; left: 64px; top: 0; bottom: 0; width: 600px; display: flex; flex-direction: column;
        justify-content: center; gap: 26px; }
  #og p { margin: 0; }
  #og .kicker { font-size: 24px; color: #9fb4d8; letter-spacing: 0.04em; }
  #og h1 { margin: 0; font-family: 'Press Start 2P', 'DotGothic16', monospace; font-weight: 400; font-size: 46px;
        line-height: 1.5; display: flex; flex-direction: column; text-shadow: 4px 4px 0 #0a1122; }
  #og h1 span:first-child { color: #ff8fe0; }
  #og .lead { font-size: 35px; line-height: 1.5; }
  #og .sides { display: flex; gap: 12px; font-size: 22px; }
  #og .sides b { font-weight: 400; padding: 4px 14px; color: #fff; }
  #og .sides .a { background: #d63f35; }
  #og .sides .d { background: #2a63d4; }
`
document.head.appendChild(style)

const canvas = root.querySelector('canvas')!
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true,
  preserveDrawingBuffer: true,
})
renderer.outputEncoding = THREE.sRGBEncoding
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setClearColor(0x101b33, 1)
renderer.setSize(WIDTH * 2, HEIGHT * 2, false)

const kit = createKit(createWorld())
const scene = createScenes(kit).technique(TACTIC, TECHNIQUE)!
kit.view.time = 3 + TIME
kit.reset()
scene.run(TIME)

// 成功の合図（ドクロ）と、防御者の盾も出す。再生機（player.ts）が場面の上に重ねているもの
const actor = kit.view.actor
kit.skull.visible = true
kit.skull.rotation.y = 0.6
kit.skull.position.set(actor.position.x, actor.position.y + 1.1 * actor.scale.y + 1.4, actor.position.z)
kit.shield.visible = true
kit.shield.rotation.y = 0.6
kit.shield.position.set(kit.defender.position.x, 3.3, kit.defender.position.z)

// 文字を左に置くので、舞台は右に寄せる。カメラの「左」向きに注視点をずらすと、絵は右へ動く
const height = 23.5
const shift = 8.6
const target = [1.5 - (13 / 15.81) * shift, 4.5 + (9 / 15.81) * shift]
const aspect = WIDTH / HEIGHT
const { camera } = kit
camera.left = (-height * aspect) / 2
camera.right = (height * aspect) / 2
camera.top = height / 2
camera.bottom = -height / 2
camera.updateProjectionMatrix()
camera.position.set(target[0] + kit.CAMERA_OFFSET.x, kit.CAMERA_OFFSET.y, target[1] + kit.CAMERA_OFFSET.z)
camera.lookAt(target[0], 0, target[1])
camera.updateMatrixWorld()
renderer.render(kit.scene, camera)
document.documentElement.dataset.ready = 'true'
