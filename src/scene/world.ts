// 舞台と小道具。ボクセル（箱）を組み合わせて、建物・人物・マルウェアなどをすべてここで作る。
// 場面（src/scene/scenes/）は、ここで作った物を動かすだけで、新しく物を作らない。
// 座標系: x が左右、y が高さ、z が奥行き。z の大きいほうが外（インターネット側）、
// 壁が z=6.5、執務室が z=-1〜6、サーバー室が z=-9〜-1。
import * as THREE from 'three'

/** 光らせて使う箱（影を受けず、色や透明度を場面から変える） */
export type Glow = THREE.Mesh<THREE.BoxGeometry, THREE.MeshBasicMaterial>

export function createWorld() {
  const scene = new THREE.Scene()
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 500)
  const CAMERA_OFFSET = new THREE.Vector3(9, 15, 13).normalize().multiplyScalar(150)
  scene.add(new THREE.AmbientLight(0xffffff, 0.62))
  const sun = new THREE.DirectionalLight(0xffffff, 0.78)
  sun.position.set(-14, 26, 10)
  sun.castShadow = true
  sun.shadow.mapSize.set(2048, 2048)
  const shadowCamera = sun.shadow.camera
  shadowCamera.left = -22
  shadowCamera.right = 22
  shadowCamera.top = 22
  shadowCamera.bottom = -22
  shadowCamera.near = 1
  shadowCamera.far = 80
  sun.shadow.bias = -0.0006
  scene.add(sun)
  scene.add(sun.target)
  sun.target.position.set(0, 0, 3)

  // ---------- voxel helpers ----------
  const UNIT_BOX = new THREE.BoxGeometry(1, 1, 1)
  const lambertCache: Record<number, THREE.MeshLambertMaterial> = {}
  const lambert = (c: number) =>
    lambertCache[c] || (lambertCache[c] = new THREE.MeshLambertMaterial({ color: c }))
  function box(
    p: THREE.Object3D,
    w: number,
    h: number,
    d: number,
    c: number | THREE.Material,
    x: number,
    y: number,
    z: number,
  ) {
    const m = new THREE.Mesh(UNIT_BOX, typeof c === 'number' ? lambert(c) : c)
    m.scale.set(w, h, d)
    m.position.set(x, y, z)
    m.castShadow = true
    m.receiveShadow = true
    p.add(m)
    return m
  }
  const group = () => new THREE.Group()
  function add<T extends THREE.Object3D>(g: T) {
    scene.add(g)
    return g
  }

  // ---------- ground ----------
  const ground = add(group())
  box(ground, 22, 1.6, 24, 0x1b2540, 0, -1.3, 3.5) // island soil
  function strips(z0: number, z1: number, c1: number, c2Link: number, y?: number) {
    for (let z = z0; z < z1; z++) {
      box(ground, 22, 0.5, 1, (z - z0) & 1 ? c2Link : c1, 0, (y || 0) - 0.25, z + 0.5).castShadow = false
    }
  }
  strips(7, 16, 0x2b4170, 0x314a7e)
  const flatMaterial = (c: number) => new THREE.MeshBasicMaterial({ color: c }),
    gridMaterial = flatMaterial(0x3f8fd6)
  function gridLine(w: number, d: number, x: number, z: number, m?: THREE.Material, y?: number) {
    const o = new THREE.Mesh(UNIT_BOX, m || gridMaterial)
    o.scale.set(w, 0.02, d)
    o.position.set(x, y || 0.02, z)
    ground.add(o)
    return o
  }
  for (let z = 8; z <= 15; z++) gridLine(22, 0.05, 0, z)
  for (let x = -10; x <= 10; x += 2) gridLine(0.05, 9, x, 11.5)
  box(ground, 22, 0.5, 1, 0xb9bfc9, 0, -0.25, 6.5).castShadow = false
  strips(-1, 6, 0xdde6f3, 0xcfdbec)
  strips(-9, -1, 0x3d4c66, 0x364459)
  box(ground, 22, 0.5, 0.5, 0x364459, 0, -0.25, -8.75).castShadow = false
  box(ground, 3, 0.06, 9, 0x4667ad, 0, 0.02, 11.5).castShadow = false // access keyframes
  const floaters: THREE.Mesh[] = []
  function tree(x: number, z: number, h: number) {
    box(ground, 0.5, 0.5, 0.5, 0x1b2540, x, 0.25, z)
    const c = new THREE.Mesh(UNIT_BOX, flatMaterial(h > 1.2 ? 0xff6fd8 : 0x5ff0ff))
    c.scale.set(0.6, 0.6, 0.6)
    c.position.set(x, 1.3, z)
    c.userData.y = 1.1 + h * 0.4
    scene.add(c)
    floaters.push(c)
  }
  for (let i = 0; i < 16; i++) {
    const a = i * 2.4,
      c = new THREE.Mesh(UNIT_BOX, flatMaterial([0x2f6fb8, 0x5ff0ff, 0x7a5fd8][i % 3])),
      k = 0.3 + (i % 3) * 0.2
    c.scale.set(k, k, k)
    c.position.set(Math.cos(a) * (15 + (i % 4) * 2), 0, 3.5 + Math.sin(a) * (16 + (i % 3) * 2))
    c.userData.y = -3 + (i % 5) * 1.6
    scene.add(c)
    floaters.push(c)
  }
  function ambient(time: number) {
    floaters.forEach((c, i) => {
      c.position.y = c.userData.y + Math.sin(time * 1.5 + i) * 0.18
      c.rotation.y = time * 0.6 + i
    })
  }
  tree(-9.5, 14.6, 1.4)
  tree(-7, 13.7, 1)
  tree(8.2, 14.5, 1.6)
  tree(9.8, 13.6, 1)
  tree(-10, 15, 0.9)
  tree(6.6, 15, 1.1)

  // wall + openGate
  const wallMaterials: Record<number, THREE.MeshLambertMaterial> = {}
  for (let x = -10; x <= 10; x++) {
    if (Math.abs(x) < 2) continue
    box(
      ground,
      1,
      1.7,
      1,
      (wallMaterials[x] = new THREE.MeshLambertMaterial({ color: 0xd9dde4 })),
      x,
      0.85,
      6.5,
    )
    if (x & 1) box(ground, 1, 0.35, 1, 0x2a63d4, x, 1.87, 6.5)
    else box(ground, 1, 0.2, 1, 0xaeb5c0, x, 1.8, 6.5)
  }
  box(ground, 0.5, 2.4, 1.1, 0xaeb5c0, -1.75, 1.2, 6.5)
  box(ground, 0.5, 2.4, 1.1, 0xaeb5c0, 1.75, 1.2, 6.5)
  box(ground, 4, 0.4, 1.1, 0x2a63d4, 0, 2.6, 6.5)
  const doorL = box(ground, 1.5, 1.9, 0.25, 0x8a5a36, -0.75, 0.95, 6.6),
    doorR = box(ground, 1.5, 1.9, 0.25, 0x8a5a36, 0.75, 0.95, 6.6)

  // characters
  function person(body: number, head: number, hair: number | null, legs: number) {
    const g = group()
    box(g, 0.28, 0.3, 0.3, legs, -0.2, 0.15, 0)
    box(g, 0.28, 0.3, 0.3, legs, 0.2, 0.15, 0)
    box(g, 0.8, 0.6, 0.55, body, 0, 0.6, 0)
    box(g, 0.7, 0.6, 0.65, head, 0, 1.2, 0)
    if (hair != null) box(g, 0.74, 0.22, 0.69, hair, 0, 1.52, 0)
    box(g, 0.1, 0.12, 0.05, 0x222222, -0.17, 1.25, 0.34)
    box(g, 0.1, 0.12, 0.05, 0x222222, 0.17, 1.25, 0.34)
    return g
  }
  function makeAttacker(scarf: number) {
    const g = group()
    box(g, 0.28, 0.3, 0.3, 0x1c1b22, -0.2, 0.15, 0)
    box(g, 0.28, 0.3, 0.3, 0x1c1b22, 0.2, 0.15, 0)
    box(g, 0.85, 0.65, 0.6, 0x2f2d3a, 0, 0.62, 0)
    box(g, 0.9, 0.2, 0.65, scarf, 0, 0.95, 0)
    box(g, 0.9, 0.75, 0.8, 0x2f2d3a, 0, 1.4, 0)
    box(g, 0.66, 0.4, 0.1, 0x121117, 0, 1.36, 0.38)
    box(g, 0.14, 0.12, 0.06, 0xff4a3d, -0.16, 1.38, 0.44)
    box(g, 0.14, 0.12, 0.06, 0xff4a3d, 0.16, 1.38, 0.44)
    box(g, 0.3, 0.3, 0.3, 0x2f2d3a, 0, 1.9, -0.15)
    return add(g)
  }
  const attacker = makeAttacker(0x8a4be0),
    secondAttacker = makeAttacker(0xd63f35)
  const defender = (function () {
    const g = person(0x2f6fe4, 0xf2c9a0, null, 0x1d3f8a)
    box(g, 0.78, 0.3, 0.72, 0xf4f6fa, 0, 1.55, 0)
    box(g, 0.2, 0.32, 0.74, 0x2f6fe4, 0, 1.56, 0)
    box(g, 0.12, 0.75, 0.6, 0xf6c531, 0.5, 0.7, 0.1)
    return add(g)
  })()
  const employees = [
    [-6, 3.5, 0xe58a3c, 0x4a2f1c],
    [-3.5, 2, 0x45b08c, 0x1d1d1d],
    [3.5, 3.5, 0xd65a9a, 0x6b3d1e],
    [6, 2, 0x8d8fe0, 0x1d1d1d],
  ].map((e) => {
    const g = person(e[2], 0xf2c9a0, e[3], 0x39404d)
    g.position.set(e[0], 0, e[1])
    ground.add(g)
    box(ground, 1.4, 0.6, 0.7, 0xa9794f, e[0], 0.3, e[1] + 0.9)
    box(ground, 0.7, 0.5, 0.1, 0x23272f, e[0], 0.9, e[1] + 0.95)
    box(ground, 0.6, 0.4, 0.04, 0x7fe0ff, e[0], 0.9, e[1] + 0.89)
    return g
  })

  // props
  function makeLock() {
    const g = group()
    box(g, 0.8, 0.6, 0.35, 0xf6c531, 0, 0, 0)
    box(g, 0.12, 0.4, 0.12, 0xb8bcc6, -0.25, 0.45, 0)
    box(g, 0.12, 0.4, 0.12, 0xb8bcc6, 0.25, 0.45, 0)
    box(g, 0.62, 0.12, 0.12, 0xb8bcc6, 0, 0.68, 0)
    box(g, 0.14, 0.2, 0.06, 0x3a2c00, 0, 0, 0.19)
    return g
  }
  const mfaPanel = add(group())
  box(mfaPanel, 1.5, 1.5, 0.15, 0x2a63d4, 0, 0, -0.05)
  box(mfaPanel, 1.2, 1.2, 0.16, 0x6f9dff, 0, 0, 0)
  ;(function () {
    const l = makeLock()
    l.position.set(0, -0.15, 0.2)
    mfaPanel.add(l)
  })()
  const mails = [0, 1, 2, 3].map(() => {
      const g = add(group())
      box(g, 0.7, 0.45, 0.1, 0xffffff, 0, 0, 0)
      box(g, 0.18, 0.18, 0.12, 0xd63f35, 0, 0, 0)
      return g
    }),
    mail = mails[0]
  const key = add(group())
  box(key, 0.4, 0.4, 0.12, 0xf6c531, 0, 0.2, 0)
  box(key, 0.14, 0.6, 0.12, 0xf6c531, 0, -0.25, 0)
  box(key, 0.25, 0.12, 0.12, 0xf6c531, 0.16, -0.35, 0)
  const alertMarks = [0, 1, 2, 3].map(() => {
      const g = add(group())
      box(g, 0.22, 0.6, 0.22, 0xf6c531, 0, 0.35, 0)
      box(g, 0.22, 0.2, 0.22, 0xf6c531, 0, -0.15, 0)
      return g
    }),
    alertMark = alertMarks[0]
  const user = (function () {
    const g = person(0x2fbf6b, 0xf2c9a0, 0x3a2a1c, 0x2b3a55)
    box(g, 0.22, 0.28, 0.06, 0xffffff, 0.2, 0.62, 0.3)
    return add(g)
  })()
  const checkMaterial = new THREE.MeshBasicMaterial({ color: 0x4dff9a })
  const checkMark = add(group())
  box(checkMark, 0.26, 0.6, 0.2, checkMaterial, -0.34, -0.12, 0).rotation.z = 0.75
  box(checkMark, 0.26, 1.15, 0.2, checkMaterial, 0.18, 0.08, 0).rotation.z = -0.6
  const token = box(scene, 0.5, 0.5, 0.5, new THREE.MeshBasicMaterial({ color: 0x5ff0ff }), 0, 0, 0)
  const impostor = (function () {
    const g = person(0x2fbf6b, 0xf2c9a0, 0x3a2a1c, 0x2b3a55)
    box(g, 0.22, 0.28, 0.06, 0xffffff, 0.2, 0.62, 0.3)
    box(g, 0.12, 0.14, 0.06, 0xff4a3d, -0.17, 1.25, 0.36)
    box(g, 0.12, 0.14, 0.06, 0xff4a3d, 0.17, 1.25, 0.36)
    box(g, 0.84, 0.14, 0.6, 0x8a4be0, 0, 0.93, 0)
    box(g, 0.34, 0.34, 0.3, 0x2f2d3a, 0, 1.45, -0.38)
    return add(g)
  })()
  const glass = new THREE.Mesh(
    UNIT_BOX,
    new THREE.MeshBasicMaterial({ color: 0x7fc4ff, transparent: true, opacity: 0.5 }),
  )
  glass.scale.set(4, 2.6, 0.12)
  glass.position.set(3, 3.25, 7.0)
  scene.add(glass)
  const hammer = add(group())
  box(hammer, 0.12, 0.9, 0.12, 0x8a5a36, 0, 0.45, 0)
  box(hammer, 0.5, 0.32, 0.32, 0x8d95a3, 0, 0.95, 0)
  const operatorOrb = new THREE.Mesh(UNIT_BOX, new THREE.MeshBasicMaterial({ color: 0xff6fd8 }))
  operatorOrb.scale.set(0.55, 0.55, 0.55)
  scene.add(operatorOrb)
  const pinkBeams: Glow[] = []
  for (let i = 0; i < 20; i++) {
    const l = new THREE.Mesh(
      UNIT_BOX,
      new THREE.MeshBasicMaterial({ color: 0xff6fd8, transparent: true, opacity: 0.7 }),
    )
    scene.add(l)
    pinkBeams.push(l)
  }
  const turnRings = [0, 1].map(() => {
    const r = new THREE.Mesh(
      UNIT_BOX,
      new THREE.MeshBasicMaterial({ color: 0xff6fd8, transparent: true, opacity: 0.5, depthWrite: false }),
    )
    scene.add(r)
    return r
  })
  const crossMark = add(group())
  box(crossMark, 1.1, 0.22, 0.22, 0xe0352b, 0, 0, 0).rotation.z = Math.PI / 4
  box(crossMark, 1.1, 0.22, 0.22, 0xe0352b, 0, 0, 0).rotation.z = -Math.PI / 4
  function makeBot() {
    const g = group()
    box(g, 0.5, 0.45, 0.5, 0xb476ff, 0, 0.35, 0)
    box(g, 0.34, 0.1, 0.06, 0xff4a3d, 0, 0.42, 0.26)
    box(g, 0.14, 0.14, 0.14, 0x4a2a80, -0.14, 0.07, 0)
    box(g, 0.14, 0.14, 0.14, 0x4a2a80, 0.14, 0.07, 0)
    return add(g)
  }
  const BOT_COUNT = 20,
    bots: THREE.Group[] = []
  for (let i = 0; i < BOT_COUNT; i++) bots.push(makeBot())
  const drones: THREE.Group[] = [],
    cyanBeams: Glow[] = [],
    DRONE_X = [-6, -3, 0, 3, 6]
  const cyanMaterial = new THREE.MeshBasicMaterial({ color: 0x7ff3ff })
  DRONE_X.forEach(() => {
    const g = group()
    box(g, 0.6, 0.32, 0.6, 0x6fb4ff, 0, 0, 0)
    box(g, 0.3, 0.1, 0.06, 0xffffff, 0, 0, 0.31)
    g.userData.rot = box(g, 1.1, 0.06, 0.18, 0xf4f6fa, 0, 0.24, 0)
    drones.push(add(g))
    const b = new THREE.Mesh(UNIT_BOX, cyanMaterial)
    scene.add(b)
    cyanBeams.push(b)
  })
  function makeTruck(c: number) {
    const g = group()
    box(g, 1.6, 1.1, 1.0, 0xf4f6fa, 0, 0.85, -1.3)
    box(g, 1.2, 0.4, 0.06, 0x7fe0ff, 0, 1.05, -1.82)
    box(g, 1.7, 1.5, 2.4, c, 0, 1.15, 0.5)
    box(g, 1.72, 0.3, 2.42, 0xf4f6fa, 0, 1.2, 0.5)
    ;[
      [-0.8, -1.2],
      [0.8, -1.2],
      [-0.8, 1.1],
      [0.8, 1.1],
    ].forEach((w) => box(g, 0.25, 0.5, 0.6, 0x1d1f25, w[0], 0.25, w[1]))
    return add(g)
  }
  const truckA = makeTruck(0x3fa7d6),
    truckB = makeTruck(0x45b08c),
    relayBot = makeBot()
  const checkpointMaterial = new THREE.MeshLambertMaterial({ color: 0xaeb5c0 })
  const checkpoint = add(group())
  box(checkpoint, 0.4, 3, 0.4, checkpointMaterial, -2.1, 1.5, 0)
  box(checkpoint, 0.4, 3, 0.4, checkpointMaterial, 2.1, 1.5, 0)
  box(checkpoint, 4.6, 0.4, 0.4, checkpointMaterial, 0, 3.2, 0)
  checkpoint.position.set(0, 0, 9.3)
  const scanPlane = new THREE.Mesh(
    UNIT_BOX,
    new THREE.MeshBasicMaterial({ color: 0x7dffb0, transparent: true, opacity: 0.45 }),
  )
  scanPlane.scale.set(3.8, 2.9, 0.08)
  scene.add(scanPlane)
  // server room
  const RACK_X = [-6, -3.6, -1.2, 1.2, 3.6, 6],
    RACK_Z = -5.5,
    racks = RACK_X.map((x) => {
      const lights = new THREE.MeshBasicMaterial({ color: 0x4dff9a })
      box(ground, 1.3, 2.4, 1.1, 0x232a36, x, 1.2, RACK_Z)
      for (let k = 0; k < 3; k++)
        box(ground, 0.9, 0.14, 0.05, lights, x, 0.6 + k * 0.6, RACK_Z + 0.57).castShadow = false
      const lock = makeLock()
      lock.position.set(x, 2.75, RACK_Z)
      scene.add(lock)
      const data = box(scene, 0.6, 0.6, 0.6, 0x58d7ff, x, 2.72, RACK_Z)
      const backup = box(scene, 0.6, 0.6, 0.6, 0x4dff9a, x, 2.72, RACK_Z)
      return { x, lights, lock, data, backup }
    })
  const segmentWallMaterial = new THREE.MeshLambertMaterial({ color: 0x6f9dff })
  const segmentWall = box(scene, 0.4, 3, 6.5, segmentWallMaterial, 2.4, -2, -4.75)

  // ---------- ATT&CK props ----------
  const ATTACKER_SPOT = [2.7, 12.9],
    TOWER_SPOT = [4.5, 12.5],
    HOST_SPOT = [1.8, 3.0],
    SERVER_SPOT = [-1.2, -3.4],
    MALWARE_SIZE = 1.6,
    ADMIN_MALWARE_SIZE = 2.0
  const glowMaterial = (c: number, o?: number) =>
    new THREE.MeshBasicMaterial(
      o == null ? { color: c } : { color: c, transparent: true, opacity: o, depthWrite: false },
    )
  const c2Tower = add(group())
  c2Tower.position.set(TOWER_SPOT[0], 0, TOWER_SPOT[1])
  box(c2Tower, 1.3, 0.5, 1.3, 0x2f2d3a, 0, 0.25, 0)
  box(c2Tower, 0.9, 1.6, 0.9, 0x3a3750, 0, 1.3, 0)
  box(c2Tower, 1.1, 0.25, 1.1, 0x8a4be0, 0, 2.22, 0)
  box(c2Tower, 0.5, 0.5, 0.5, glowMaterial(0xff6fd8), 0, 2.6, 0)
  box(c2Tower, 0.1, 0.6, 0.1, 0x2f2d3a, 0, 3.15, 0)
  const malware = makeBot(),
    crown = group(),
    disguise = group()
  malware.add(crown)
  malware.add(disguise)
  box(crown, 0.56, 0.1, 0.56, 0xf6c531, 0, 0.63, 0)
  ;[-0.2, 0, 0.2].forEach((x, i) =>
    box(crown, 0.12, i === 1 ? 0.2 : 0.14, 0.12, 0xf6c531, x, i === 1 ? 0.78 : 0.75, 0),
  )
  box(disguise, 0.62, 0.58, 0.62, 0xdde6f3, 0, 0.33, 0)
  box(disguise, 0.4, 0.22, 0.06, 0x58a6ff, 0, 0.38, 0.32)
  const implant = add(group())
  implant.position.set(3.2, 0, 1.6)
  box(implant, 0.45, 0.45, 0.45, 0x6a3fb0, 0, 0.23, 0)
  box(implant, 0.08, 0.22, 0.05, 0xf6c531, 0, 0.3, 0.24)
  box(implant, 0.16, 0.08, 0.05, 0xf6c531, 0.05, 0.22, 0.24)
  const stairs = add(group())
  box(stairs, 0.8, 0.5, 0.8, 0x8d95a3, 0.9, 0.25, 3.0)
  box(stairs, 0.8, 1.0, 0.8, 0x9aa2b0, 0.1, 0.5, 3.0)
  box(stairs, 0.8, 1.5, 0.8, 0xaab2c0, -0.7, 0.75, 3.0)
  const shield = add(group())
  ;[
    [1.2, 0.55, 0.32],
    [1.04, 0.3, -0.1],
    [0.76, 0.24, -0.37],
    [0.42, 0.2, -0.59],
  ].forEach((r) => {
    box(shield, r[0], r[1], 0.14, 0xf4f6fa, 0, r[2], -0.04)
    box(shield, r[0] - 0.2, r[1] + 0.02, 0.16, 0x2a63d4, 0, r[2] - 0.02, 0)
  })
  box(shield, 0.16, 0.9, 0.1, 0x9fc2ff, 0, 0.02, 0.07)
  box(shield, 0.7, 0.16, 0.1, 0x9fc2ff, 0, 0.24, 0.07)
  const skull = add(group())
  box(skull, 0.95, 0.62, 0.2, 0xe0352b, 0, 0.2, 0)
  box(skull, 0.6, 0.3, 0.2, 0xe0352b, 0, -0.24, 0)
  box(skull, 0.24, 0.24, 0.08, 0x2a0c0a, -0.21, 0.2, 0.08)
  box(skull, 0.24, 0.24, 0.08, 0x2a0c0a, 0.21, 0.2, 0.08)
  box(skull, 0.1, 0.12, 0.08, 0x2a0c0a, 0, -0.04, 0.08)
  ;[-0.15, 0, 0.15].forEach((x) => box(skull, 0.05, 0.2, 0.08, 0x2a0c0a, x, -0.26, 0.08))
  skull.traverse((m) => {
    m.castShadow = false
  })
  shield.traverse((m) => {
    m.castShadow = false
  })
  const spareKeys = [0, 1, 2].map(() => {
    const g = add(group())
    box(g, 0.4, 0.4, 0.12, 0xf6c531, 0, 0.2, 0)
    box(g, 0.14, 0.6, 0.12, 0xf6c531, 0, -0.25, 0)
    box(g, 0.25, 0.12, 0.12, 0xf6c531, 0.16, -0.35, 0)
    return g
  })
  const rackMarks = racks.map((r, i) => {
    const m = new THREE.Mesh(UNIT_BOX, glowMaterial(i === 2 ? 0xf6c531 : 0xff6fd8))
    m.position.set(r.x, 3.6, RACK_Z)
    scene.add(m)
    return m
  })
  const pinkCubes: Glow[] = []
  for (let i = 0; i < 7; i++) {
    const m = new THREE.Mesh(UNIT_BOX, glowMaterial(0xff6fd8))
    scene.add(m)
    pinkCubes.push(m)
  }
  const YELLOW_CUBE_X = [-7, -3, 4],
    yellowCubes = YELLOW_CUBE_X.map((x) => {
      const m = new THREE.Mesh(UNIT_BOX, glowMaterial(0xf6c531))
      m.position.set(x, 2.5, 6.5)
      scene.add(m)
      return m
    })
  const attackerScan = new THREE.Mesh(UNIT_BOX, glowMaterial(0xff6fd8, 0.4))
  attackerScan.scale.set(0.5, 1.8, 1.6)
  scene.add(attackerScan)
  const c2Link = new THREE.Mesh(UNIT_BOX, glowMaterial(0xff6fd8, 0.6))
  scene.add(c2Link)
  const pulseRings = [0, 1].map(() => {
    const r = new THREE.Mesh(UNIT_BOX, glowMaterial(0xff6fd8, 0.5))
    scene.add(r)
    return r
  })
  const padlock = add(makeLock())
  const cloud = add(group())
  box(cloud, 2.2, 0.7, 1.2, 0xf4f6fa, 0, 0, 0)
  box(cloud, 1.3, 0.6, 1.0, 0xf4f6fa, -0.3, 0.6, 0)
  box(cloud, 0.8, 0.5, 0.9, 0xffffff, 0.65, 0.5, 0)
  cloud.traverse((m) => {
    m.castShadow = false
  })
  const documents = [0, 1, 2, 3].map(() => {
    const g = add(group())
    box(g, 0.5, 0.64, 0.08, 0xf4f6fa, 0, 0, 0)
    box(g, 0.32, 0.07, 0.1, 0x58a6ff, 0, 0.14, 0)
    box(g, 0.32, 0.07, 0.1, 0x58a6ff, 0, -0.04, 0)
    return g
  })
  const database = add(group())
  ;[0, 1, 2].forEach((i) => {
    box(database, 1.2, 0.36, 1.2, 0x58a6ff, 0, 0.2 + i * 0.5, 0)
    box(database, 1.24, 0.08, 1.24, 0xf4f6fa, 0, 0.42 + i * 0.5, 0)
  })
  const trustedProcess = add(group())
  box(trustedProcess, 0.62, 0.58, 0.62, 0xdde6f3, 0, 0.33, 0)
  box(trustedProcess, 0.4, 0.22, 0.06, 0x58a6ff, 0, 0.38, 0.32)
  box(trustedProcess, 0.56, 0.1, 0.56, 0xf6c531, 0, 0.68, 0)
  const trustedProcessEyes = box(trustedProcess, 0.42, 0.12, 0.07, 0xff4a3d, 0, 0.38, 0.33)
  const clock = add(group()),
    clockHand = group()
  clock.add(clockHand)
  box(clock, 1.36, 1.36, 0.08, 0x2f2d3a, 0, 0, -0.04)
  box(clock, 1.2, 1.2, 0.12, 0xf4f6fa, 0, 0, 0)
  box(clockHand, 0.1, 0.5, 0.1, 0x2f2d3a, 0, 0.25, 0.09)
  box(clock, 0.14, 0.14, 0.12, 0xd63f35, 0, 0, 0.08)

  return {
    scene,
    camera,
    CAMERA_OFFSET,
    ambient,
    wallMaterials,
    doorL,
    doorR,
    attacker,
    secondAttacker,
    defender,
    employees,
    mfaPanel,
    mails,
    mail,
    key,
    alertMarks,
    alertMark,
    user,
    checkMark,
    token,
    impostor,
    glass,
    hammer,
    operatorOrb,
    pinkBeams,
    turnRings,
    crossMark,
    bots,
    drones,
    cyanBeams,
    truckA,
    truckB,
    relayBot,
    checkpoint,
    scanPlane,
    RACK_Z,
    racks,
    segmentWallMaterial,
    segmentWall,
    ATTACKER_SPOT,
    TOWER_SPOT,
    HOST_SPOT,
    SERVER_SPOT,
    MALWARE_SIZE,
    ADMIN_MALWARE_SIZE,
    c2Tower,
    malware,
    crown,
    disguise,
    implant,
    stairs,
    shield,
    skull,
    spareKeys,
    rackMarks,
    pinkCubes,
    YELLOW_CUBE_X,
    yellowCubes,
    attackerScan,
    c2Link,
    pulseRings,
    padlock,
    cloud,
    documents,
    database,
    trustedProcess,
    trustedProcessEyes,
    clock,
    clockHand,
  }
}

export type World = ReturnType<typeof createWorld>
