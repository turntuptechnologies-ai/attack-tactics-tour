// 舞台と小道具。ボクセル（箱）を組み合わせて、建物・人物・マルウェアなどをすべてここで作る。
// 場面（src/scene/scenes/）は、ここで作った物を動かすだけで、新しく物を作らない。
// 座標系: x が左右、y が高さ、z が奥行き。z の大きいほうが外（インターネット側）、
// 壁が z=6.5、執務室が z=-1〜6、サーバー室が z=-9〜-1。
import * as THREE from 'three'

/** 光らせて使う箱（影を受けず、色や透明度を場面から変える） */
export type Glow = THREE.Mesh<THREE.BoxGeometry, THREE.MeshBasicMaterial>

export function createWorld() {
  const scene = new THREE.Scene()
  const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 500)
  const OFF = new THREE.Vector3(9, 15, 13).normalize().multiplyScalar(150)
  scene.add(new THREE.AmbientLight(0xffffff, 0.62))
  const sun = new THREE.DirectionalLight(0xffffff, 0.78)
  sun.position.set(-14, 26, 10)
  sun.castShadow = true
  sun.shadow.mapSize.set(2048, 2048)
  const sc = sun.shadow.camera
  sc.left = -22
  sc.right = 22
  sc.top = 22
  sc.bottom = -22
  sc.near = 1
  sc.far = 80
  sun.shadow.bias = -0.0006
  scene.add(sun)
  scene.add(sun.target)
  sun.target.position.set(0, 0, 3)

  // ---------- voxel helpers ----------
  const GEO = new THREE.BoxGeometry(1, 1, 1)
  const mats: Record<number, THREE.MeshLambertMaterial> = {}
  const M = (c: number) => mats[c] || (mats[c] = new THREE.MeshLambertMaterial({ color: c }))
  function B(
    p: THREE.Object3D,
    w: number,
    h: number,
    d: number,
    c: number | THREE.Material,
    x: number,
    y: number,
    z: number,
  ) {
    const m = new THREE.Mesh(GEO, typeof c === 'number' ? M(c) : c)
    m.scale.set(w, h, d)
    m.position.set(x, y, z)
    m.castShadow = true
    m.receiveShadow = true
    p.add(m)
    return m
  }
  const G = () => new THREE.Group()
  function add<T extends THREE.Object3D>(g: T) {
    scene.add(g)
    return g
  }

  // ---------- ground ----------
  const ground = add(G())
  B(ground, 22, 1.6, 24, 0x1b2540, 0, -1.3, 3.5) // island soil
  function strips(z0: number, z1: number, c1: number, c2: number, y?: number) {
    for (let z = z0; z < z1; z++) {
      B(ground, 22, 0.5, 1, (z - z0) & 1 ? c2 : c1, 0, (y || 0) - 0.25, z + 0.5).castShadow = false
    }
  }
  strips(7, 16, 0x2b4170, 0x314a7e)
  const glow = (c: number) => new THREE.MeshBasicMaterial({ color: c }),
    gridM = glow(0x3f8fd6)
  function L(w: number, d: number, x: number, z: number, m?: THREE.Material, y?: number) {
    const o = new THREE.Mesh(GEO, m || gridM)
    o.scale.set(w, 0.02, d)
    o.position.set(x, y || 0.02, z)
    ground.add(o)
    return o
  }
  for (let z = 8; z <= 15; z++) L(22, 0.05, 0, z)
  for (let x = -10; x <= 10; x += 2) L(0.05, 9, x, 11.5)
  B(ground, 22, 0.5, 1, 0xb9bfc9, 0, -0.25, 6.5).castShadow = false
  strips(-1, 6, 0xdde6f3, 0xcfdbec)
  strips(-9, -1, 0x3d4c66, 0x364459)
  B(ground, 22, 0.5, 0.5, 0x364459, 0, -0.25, -8.75).castShadow = false
  B(ground, 3, 0.06, 9, 0x4667ad, 0, 0.02, 11.5).castShadow = false // access path
  const amb: THREE.Mesh[] = []
  function tree(x: number, z: number, h: number) {
    B(ground, 0.5, 0.5, 0.5, 0x1b2540, x, 0.25, z)
    const c = new THREE.Mesh(GEO, glow(h > 1.2 ? 0xff6fd8 : 0x5ff0ff))
    c.scale.set(0.6, 0.6, 0.6)
    c.position.set(x, 1.3, z)
    c.userData.y = 1.1 + h * 0.4
    scene.add(c)
    amb.push(c)
  }
  for (let i = 0; i < 16; i++) {
    const a = i * 2.4,
      c = new THREE.Mesh(GEO, glow([0x2f6fb8, 0x5ff0ff, 0x7a5fd8][i % 3])),
      k = 0.3 + (i % 3) * 0.2
    c.scale.set(k, k, k)
    c.position.set(Math.cos(a) * (15 + (i % 4) * 2), 0, 3.5 + Math.sin(a) * (16 + (i % 3) * 2))
    c.userData.y = -3 + (i % 5) * 1.6
    scene.add(c)
    amb.push(c)
  }
  function ambient(time: number) {
    amb.forEach((c, i) => {
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

  // wall + gate
  const wm: Record<number, THREE.MeshLambertMaterial> = {}
  for (let x = -10; x <= 10; x++) {
    if (Math.abs(x) < 2) continue
    B(ground, 1, 1.7, 1, (wm[x] = new THREE.MeshLambertMaterial({ color: 0xd9dde4 })), x, 0.85, 6.5)
    if (x & 1) B(ground, 1, 0.35, 1, 0x2a63d4, x, 1.87, 6.5)
    else B(ground, 1, 0.2, 1, 0xaeb5c0, x, 1.8, 6.5)
  }
  B(ground, 0.5, 2.4, 1.1, 0xaeb5c0, -1.75, 1.2, 6.5)
  B(ground, 0.5, 2.4, 1.1, 0xaeb5c0, 1.75, 1.2, 6.5)
  B(ground, 4, 0.4, 1.1, 0x2a63d4, 0, 2.6, 6.5)
  const doorL = B(ground, 1.5, 1.9, 0.25, 0x8a5a36, -0.75, 0.95, 6.6),
    doorR = B(ground, 1.5, 1.9, 0.25, 0x8a5a36, 0.75, 0.95, 6.6)

  // characters
  function person(body: number, head: number, hair: number | null, legs: number) {
    const g = G()
    B(g, 0.28, 0.3, 0.3, legs, -0.2, 0.15, 0)
    B(g, 0.28, 0.3, 0.3, legs, 0.2, 0.15, 0)
    B(g, 0.8, 0.6, 0.55, body, 0, 0.6, 0)
    B(g, 0.7, 0.6, 0.65, head, 0, 1.2, 0)
    if (hair != null) B(g, 0.74, 0.22, 0.69, hair, 0, 1.52, 0)
    B(g, 0.1, 0.12, 0.05, 0x222222, -0.17, 1.25, 0.34)
    B(g, 0.1, 0.12, 0.05, 0x222222, 0.17, 1.25, 0.34)
    return g
  }
  function mkAttacker(scarf: number) {
    const g = G()
    B(g, 0.28, 0.3, 0.3, 0x1c1b22, -0.2, 0.15, 0)
    B(g, 0.28, 0.3, 0.3, 0x1c1b22, 0.2, 0.15, 0)
    B(g, 0.85, 0.65, 0.6, 0x2f2d3a, 0, 0.62, 0)
    B(g, 0.9, 0.2, 0.65, scarf, 0, 0.95, 0)
    B(g, 0.9, 0.75, 0.8, 0x2f2d3a, 0, 1.4, 0)
    B(g, 0.66, 0.4, 0.1, 0x121117, 0, 1.36, 0.38)
    B(g, 0.14, 0.12, 0.06, 0xff4a3d, -0.16, 1.38, 0.44)
    B(g, 0.14, 0.12, 0.06, 0xff4a3d, 0.16, 1.38, 0.44)
    B(g, 0.3, 0.3, 0.3, 0x2f2d3a, 0, 1.9, -0.15)
    return add(g)
  }
  const atk = mkAttacker(0x8a4be0),
    clone = mkAttacker(0xd63f35)
  const def = (function () {
    const g = person(0x2f6fe4, 0xf2c9a0, null, 0x1d3f8a)
    B(g, 0.78, 0.3, 0.72, 0xf4f6fa, 0, 1.55, 0)
    B(g, 0.2, 0.32, 0.74, 0x2f6fe4, 0, 1.56, 0)
    B(g, 0.12, 0.75, 0.6, 0xf6c531, 0.5, 0.7, 0.1)
    return add(g)
  })()
  const emps = [
    [-6, 3.5, 0xe58a3c, 0x4a2f1c],
    [-3.5, 2, 0x45b08c, 0x1d1d1d],
    [3.5, 3.5, 0xd65a9a, 0x6b3d1e],
    [6, 2, 0x8d8fe0, 0x1d1d1d],
  ].map((e) => {
    const g = person(e[2], 0xf2c9a0, e[3], 0x39404d)
    g.position.set(e[0], 0, e[1])
    ground.add(g)
    B(ground, 1.4, 0.6, 0.7, 0xa9794f, e[0], 0.3, e[1] + 0.9)
    B(ground, 0.7, 0.5, 0.1, 0x23272f, e[0], 0.9, e[1] + 0.95)
    B(ground, 0.6, 0.4, 0.04, 0x7fe0ff, e[0], 0.9, e[1] + 0.89)
    return g
  })

  // props
  function mkLock() {
    const g = G()
    B(g, 0.8, 0.6, 0.35, 0xf6c531, 0, 0, 0)
    B(g, 0.12, 0.4, 0.12, 0xb8bcc6, -0.25, 0.45, 0)
    B(g, 0.12, 0.4, 0.12, 0xb8bcc6, 0.25, 0.45, 0)
    B(g, 0.62, 0.12, 0.12, 0xb8bcc6, 0, 0.68, 0)
    B(g, 0.14, 0.2, 0.06, 0x3a2c00, 0, 0, 0.19)
    return g
  }
  const mfa = add(G())
  B(mfa, 1.5, 1.5, 0.15, 0x2a63d4, 0, 0, -0.05)
  B(mfa, 1.2, 1.2, 0.16, 0x6f9dff, 0, 0, 0)
  ;(function () {
    const l = mkLock()
    l.position.set(0, -0.15, 0.2)
    mfa.add(l)
  })()
  const letters = [0, 1, 2, 3].map(() => {
      const g = add(G())
      B(g, 0.7, 0.45, 0.1, 0xffffff, 0, 0, 0)
      B(g, 0.18, 0.18, 0.12, 0xd63f35, 0, 0, 0)
      return g
    }),
    letter = letters[0]
  const key = add(G())
  B(key, 0.4, 0.4, 0.12, 0xf6c531, 0, 0.2, 0)
  B(key, 0.14, 0.6, 0.12, 0xf6c531, 0, -0.25, 0)
  B(key, 0.25, 0.12, 0.12, 0xf6c531, 0.16, -0.35, 0)
  const bangs = [0, 1, 2, 3].map(() => {
      const g = add(G())
      B(g, 0.22, 0.6, 0.22, 0xf6c531, 0, 0.35, 0)
      B(g, 0.22, 0.2, 0.22, 0xf6c531, 0, -0.15, 0)
      return g
    }),
    bang = bangs[0]
  const user = (function () {
    const g = person(0x2fbf6b, 0xf2c9a0, 0x3a2a1c, 0x2b3a55)
    B(g, 0.22, 0.28, 0.06, 0xffffff, 0.2, 0.62, 0.3)
    return add(g)
  })()
  const okM = new THREE.MeshBasicMaterial({ color: 0x4dff9a })
  const check = add(G())
  B(check, 0.26, 0.6, 0.2, okM, -0.34, -0.12, 0).rotation.z = 0.75
  B(check, 0.26, 1.15, 0.2, okM, 0.18, 0.08, 0).rotation.z = -0.6
  const grant = B(scene, 0.5, 0.5, 0.5, new THREE.MeshBasicMaterial({ color: 0x5ff0ff }), 0, 0, 0)
  const fake = (function () {
    const g = person(0x2fbf6b, 0xf2c9a0, 0x3a2a1c, 0x2b3a55)
    B(g, 0.22, 0.28, 0.06, 0xffffff, 0.2, 0.62, 0.3)
    B(g, 0.12, 0.14, 0.06, 0xff4a3d, -0.17, 1.25, 0.36)
    B(g, 0.12, 0.14, 0.06, 0xff4a3d, 0.17, 1.25, 0.36)
    B(g, 0.84, 0.14, 0.6, 0x8a4be0, 0, 0.93, 0)
    B(g, 0.34, 0.34, 0.3, 0x2f2d3a, 0, 1.45, -0.38)
    return add(g)
  })()
  const field = new THREE.Mesh(
    GEO,
    new THREE.MeshBasicMaterial({ color: 0x7fc4ff, transparent: true, opacity: 0.5 }),
  )
  field.scale.set(4, 2.6, 0.12)
  field.position.set(3, 3.25, 7.0)
  scene.add(field)
  const hammer = add(G())
  B(hammer, 0.12, 0.9, 0.12, 0x8a5a36, 0, 0.45, 0)
  B(hammer, 0.5, 0.32, 0.32, 0x8d95a3, 0, 0.95, 0)
  const orb = new THREE.Mesh(GEO, new THREE.MeshBasicMaterial({ color: 0xff6fd8 }))
  orb.scale.set(0.55, 0.55, 0.55)
  scene.add(orb)
  const links: Glow[] = []
  for (let i = 0; i < 20; i++) {
    const l = new THREE.Mesh(
      GEO,
      new THREE.MeshBasicMaterial({ color: 0xff6fd8, transparent: true, opacity: 0.7 }),
    )
    scene.add(l)
    links.push(l)
  }
  const rings = [0, 1].map(() => {
    const r = new THREE.Mesh(
      GEO,
      new THREE.MeshBasicMaterial({ color: 0xff6fd8, transparent: true, opacity: 0.5, depthWrite: false }),
    )
    scene.add(r)
    return r
  })
  const cross = add(G())
  B(cross, 1.1, 0.22, 0.22, 0xe0352b, 0, 0, 0).rotation.z = Math.PI / 4
  B(cross, 1.1, 0.22, 0.22, 0xe0352b, 0, 0, 0).rotation.z = -Math.PI / 4
  function mkBot() {
    const g = G()
    B(g, 0.5, 0.45, 0.5, 0xb476ff, 0, 0.35, 0)
    B(g, 0.34, 0.1, 0.06, 0xff4a3d, 0, 0.42, 0.26)
    B(g, 0.14, 0.14, 0.14, 0x4a2a80, -0.14, 0.07, 0)
    B(g, 0.14, 0.14, 0.14, 0x4a2a80, 0.14, 0.07, 0)
    return add(g)
  }
  const NB = 20,
    bots: THREE.Group[] = []
  for (let i = 0; i < NB; i++) bots.push(mkBot())
  const drones: THREE.Group[] = [],
    beams: Glow[] = [],
    DX = [-6, -3, 0, 3, 6]
  const beamMat = new THREE.MeshBasicMaterial({ color: 0x7ff3ff })
  DX.forEach(() => {
    const g = G()
    B(g, 0.6, 0.32, 0.6, 0x6fb4ff, 0, 0, 0)
    B(g, 0.3, 0.1, 0.06, 0xffffff, 0, 0, 0.31)
    g.userData.rot = B(g, 1.1, 0.06, 0.18, 0xf4f6fa, 0, 0.24, 0)
    drones.push(add(g))
    const b = new THREE.Mesh(GEO, beamMat)
    scene.add(b)
    beams.push(b)
  })
  function mkTruck(c: number) {
    const g = G()
    B(g, 1.6, 1.1, 1.0, 0xf4f6fa, 0, 0.85, -1.3)
    B(g, 1.2, 0.4, 0.06, 0x7fe0ff, 0, 1.05, -1.82)
    B(g, 1.7, 1.5, 2.4, c, 0, 1.15, 0.5)
    B(g, 1.72, 0.3, 2.42, 0xf4f6fa, 0, 1.2, 0.5)
    ;[
      [-0.8, -1.2],
      [0.8, -1.2],
      [-0.8, 1.1],
      [0.8, 1.1],
    ].forEach((w) => B(g, 0.25, 0.5, 0.6, 0x1d1f25, w[0], 0.25, w[1]))
    return add(g)
  }
  const truckA = mkTruck(0x3fa7d6),
    truckB = mkTruck(0x45b08c),
    botB = mkBot()
  const archMat = new THREE.MeshLambertMaterial({ color: 0xaeb5c0 })
  const arch = add(G())
  B(arch, 0.4, 3, 0.4, archMat, -2.1, 1.5, 0)
  B(arch, 0.4, 3, 0.4, archMat, 2.1, 1.5, 0)
  B(arch, 4.6, 0.4, 0.4, archMat, 0, 3.2, 0)
  arch.position.set(0, 0, 9.3)
  const scan = new THREE.Mesh(
    GEO,
    new THREE.MeshBasicMaterial({ color: 0x7dffb0, transparent: true, opacity: 0.45 }),
  )
  scan.scale.set(3.8, 2.9, 0.08)
  scene.add(scan)
  // server room
  const RX = [-6, -3.6, -1.2, 1.2, 3.6, 6],
    RZ = -5.5,
    racks = RX.map((x) => {
      const lm = new THREE.MeshBasicMaterial({ color: 0x4dff9a })
      B(ground, 1.3, 2.4, 1.1, 0x232a36, x, 1.2, RZ)
      for (let k = 0; k < 3; k++)
        B(ground, 0.9, 0.14, 0.05, lm, x, 0.6 + k * 0.6, RZ + 0.57).castShadow = false
      const lock = mkLock()
      lock.position.set(x, 2.75, RZ)
      scene.add(lock)
      const cube = B(scene, 0.6, 0.6, 0.6, 0x58d7ff, x, 2.72, RZ)
      const bk = B(scene, 0.6, 0.6, 0.6, 0x4dff9a, x, 2.72, RZ)
      return { x, lm, lock, cube, bk }
    })
  const segMat = new THREE.MeshLambertMaterial({ color: 0x6f9dff })
  const segW = B(scene, 0.4, 3, 6.5, segMat, 2.4, -2, -4.75)

  // ---------- ATT&CK props ----------
  const A = [2.7, 12.9],
    TWP = [4.5, 12.5],
    H = [1.8, 3.0],
    S = [-1.2, -3.4],
    IS = 1.6,
    IC = 2.0
  const basic = (c: number, o?: number) =>
    new THREE.MeshBasicMaterial(
      o == null ? { color: c } : { color: c, transparent: true, opacity: o, depthWrite: false },
    )
  const tower = add(G())
  tower.position.set(TWP[0], 0, TWP[1])
  B(tower, 1.3, 0.5, 1.3, 0x2f2d3a, 0, 0.25, 0)
  B(tower, 0.9, 1.6, 0.9, 0x3a3750, 0, 1.3, 0)
  B(tower, 1.1, 0.25, 1.1, 0x8a4be0, 0, 2.22, 0)
  B(tower, 0.5, 0.5, 0.5, basic(0xff6fd8), 0, 2.6, 0)
  B(tower, 0.1, 0.6, 0.1, 0x2f2d3a, 0, 3.15, 0)
  const imp = mkBot(),
    crown = G(),
    shell = G()
  imp.add(crown)
  imp.add(shell)
  B(crown, 0.56, 0.1, 0.56, 0xf6c531, 0, 0.63, 0)
  ;[-0.2, 0, 0.2].forEach((x, i) =>
    B(crown, 0.12, i === 1 ? 0.2 : 0.14, 0.12, 0xf6c531, x, i === 1 ? 0.78 : 0.75, 0),
  )
  B(shell, 0.62, 0.58, 0.62, 0xdde6f3, 0, 0.33, 0)
  B(shell, 0.4, 0.22, 0.06, 0x58a6ff, 0, 0.38, 0.32)
  const anchor = add(G())
  anchor.position.set(3.2, 0, 1.6)
  B(anchor, 0.45, 0.45, 0.45, 0x6a3fb0, 0, 0.23, 0)
  B(anchor, 0.08, 0.22, 0.05, 0xf6c531, 0, 0.3, 0.24)
  B(anchor, 0.16, 0.08, 0.05, 0xf6c531, 0.05, 0.22, 0.24)
  const steps = add(G())
  B(steps, 0.8, 0.5, 0.8, 0x8d95a3, 0.9, 0.25, 3.0)
  B(steps, 0.8, 1.0, 0.8, 0x9aa2b0, 0.1, 0.5, 3.0)
  B(steps, 0.8, 1.5, 0.8, 0xaab2c0, -0.7, 0.75, 3.0)
  const shield = add(G())
  ;[
    [1.2, 0.55, 0.32],
    [1.04, 0.3, -0.1],
    [0.76, 0.24, -0.37],
    [0.42, 0.2, -0.59],
  ].forEach((r) => {
    B(shield, r[0], r[1], 0.14, 0xf4f6fa, 0, r[2], -0.04)
    B(shield, r[0] - 0.2, r[1] + 0.02, 0.16, 0x2a63d4, 0, r[2] - 0.02, 0)
  })
  B(shield, 0.16, 0.9, 0.1, 0x9fc2ff, 0, 0.02, 0.07)
  B(shield, 0.7, 0.16, 0.1, 0x9fc2ff, 0, 0.24, 0.07)
  const skull = add(G())
  B(skull, 0.95, 0.62, 0.2, 0xe0352b, 0, 0.2, 0)
  B(skull, 0.6, 0.3, 0.2, 0xe0352b, 0, -0.24, 0)
  B(skull, 0.24, 0.24, 0.08, 0x2a0c0a, -0.21, 0.2, 0.08)
  B(skull, 0.24, 0.24, 0.08, 0x2a0c0a, 0.21, 0.2, 0.08)
  B(skull, 0.1, 0.12, 0.08, 0x2a0c0a, 0, -0.04, 0.08)
  ;[-0.15, 0, 0.15].forEach((x) => B(skull, 0.05, 0.2, 0.08, 0x2a0c0a, x, -0.26, 0.08))
  skull.traverse((m) => {
    m.castShadow = false
  })
  shield.traverse((m) => {
    m.castShadow = false
  })
  const keys3 = [0, 1, 2].map(() => {
    const g = add(G())
    B(g, 0.4, 0.4, 0.12, 0xf6c531, 0, 0.2, 0)
    B(g, 0.14, 0.6, 0.12, 0xf6c531, 0, -0.25, 0)
    B(g, 0.25, 0.12, 0.12, 0xf6c531, 0.16, -0.35, 0)
    return g
  })
  const marks = racks.map((r, i) => {
    const m = new THREE.Mesh(GEO, basic(i === 2 ? 0xf6c531 : 0xff6fd8))
    m.position.set(r.x, 3.6, RZ)
    scene.add(m)
    return m
  })
  const pk: Glow[] = []
  for (let i = 0; i < 7; i++) {
    const m = new THREE.Mesh(GEO, basic(0xff6fd8))
    scene.add(m)
    pk.push(m)
  }
  const EX = [-7, -3, 4],
    exps = EX.map((x) => {
      const m = new THREE.Mesh(GEO, basic(0xf6c531))
      m.position.set(x, 2.5, 6.5)
      scene.add(m)
      return m
    })
  const ascan = new THREE.Mesh(GEO, basic(0xff6fd8, 0.4))
  ascan.scale.set(0.5, 1.8, 1.6)
  scene.add(ascan)
  const c2 = new THREE.Mesh(GEO, basic(0xff6fd8, 0.6))
  scene.add(c2)
  const drings = [0, 1].map(() => {
    const r = new THREE.Mesh(GEO, basic(0xff6fd8, 0.5))
    scene.add(r)
    return r
  })
  const plock = add(mkLock())
  const cloud = add(G())
  B(cloud, 2.2, 0.7, 1.2, 0xf4f6fa, 0, 0, 0)
  B(cloud, 1.3, 0.6, 1.0, 0xf4f6fa, -0.3, 0.6, 0)
  B(cloud, 0.8, 0.5, 0.9, 0xffffff, 0.65, 0.5, 0)
  cloud.traverse((m) => {
    m.castShadow = false
  })
  const docs = [0, 1, 2, 3].map(() => {
    const g = add(G())
    B(g, 0.5, 0.64, 0.08, 0xf4f6fa, 0, 0, 0)
    B(g, 0.32, 0.07, 0.1, 0x58a6ff, 0, 0.14, 0)
    B(g, 0.32, 0.07, 0.1, 0x58a6ff, 0, -0.04, 0)
    return g
  })
  const dbx = add(G())
  ;[0, 1, 2].forEach((i) => {
    B(dbx, 1.2, 0.36, 1.2, 0x58a6ff, 0, 0.2 + i * 0.5, 0)
    B(dbx, 1.24, 0.08, 1.24, 0xf4f6fa, 0, 0.42 + i * 0.5, 0)
  })
  const proc = add(G())
  B(proc, 0.62, 0.58, 0.62, 0xdde6f3, 0, 0.33, 0)
  B(proc, 0.4, 0.22, 0.06, 0x58a6ff, 0, 0.38, 0.32)
  B(proc, 0.56, 0.1, 0.56, 0xf6c531, 0, 0.68, 0)
  const procEye = B(proc, 0.42, 0.12, 0.07, 0xff4a3d, 0, 0.38, 0.33)
  const clock = add(G()),
    hand = G()
  clock.add(hand)
  B(clock, 1.36, 1.36, 0.08, 0x2f2d3a, 0, 0, -0.04)
  B(clock, 1.2, 1.2, 0.12, 0xf4f6fa, 0, 0, 0)
  B(hand, 0.1, 0.5, 0.1, 0x2f2d3a, 0, 0.25, 0.09)
  B(clock, 0.14, 0.14, 0.12, 0xd63f35, 0, 0, 0.08)

  return {
    scene,
    cam,
    OFF,
    ambient,
    wm,
    doorL,
    doorR,
    atk,
    clone,
    def,
    emps,
    mfa,
    letters,
    letter,
    key,
    bangs,
    bang,
    user,
    check,
    grant,
    fake,
    field,
    hammer,
    orb,
    links,
    rings,
    cross,
    bots,
    drones,
    beams,
    truckA,
    truckB,
    botB,
    arch,
    scan,
    RZ,
    racks,
    segMat,
    segW,
    A,
    TWP,
    H,
    S,
    IS,
    IC,
    tower,
    imp,
    crown,
    shell,
    anchor,
    steps,
    shield,
    skull,
    keys3,
    marks,
    pk,
    EX,
    exps,
    ascan,
    c2,
    drings,
    plock,
    cloud,
    docs,
    dbx,
    proc,
    procEye,
    clock,
    hand,
  }
}

export type World = ReturnType<typeof createWorld>
