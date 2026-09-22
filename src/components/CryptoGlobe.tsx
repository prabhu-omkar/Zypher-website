import { useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import type { Theme } from '../lib/theme'

/*
 * The estate as a globe.
 *
 * Every label is a piece of cryptography Zypher could find, a mix of weak and
 * quantum-safe, all drawn alike. Nothing changes on its own. Clicking the hero
 * sends a scan ring from pole to pole, and each weak algorithm it crosses is
 * picked out softly in the critical colour for a few seconds.
 */

const R = 4
const FOV = 35

// Weak: broken by Shor's algorithm, or already broken classically.
const WEAK = [
  'RSA-2048',
  'ECDSA P-256',
  'SHA-1',
  'X25519',
  'MD5',
  'ECDH P-384',
  'RSA-1024',
  '3DES',
  'Ed25519',
  'DH-2048',
  'TLS 1.0',
  'DSA-1024',
  'RC4',
  'secp192r1',
  'RSA-3072',
  'ECDSA P-384',
]
// Safe: post-quantum by design, or safe at these parameters.
const SAFE = ['ML-KEM-768', 'AES-256-GCM', 'ML-DSA-65', 'SHA-384', 'SLH-DSA', 'ML-KEM-1024', 'SHA3-256', 'ML-DSA-87', 'SHA-512']

// Two weak to every safe one, spread round the globe.
const LABELS: { text: string; weak: boolean }[] = (() => {
  const out: { text: string; weak: boolean }[] = []
  let w = 0
  let s = 0
  for (let i = 0; i < 36; i++) {
    if (i % 3 === 2) out.push({ text: SAFE[s++ % SAFE.length], weak: false })
    else out.push({ text: WEAK[w++ % WEAK.length], weak: true })
  }
  return out
})()

// How long a weak label stays picked out after the ring passes, and how fast
// it fades in and back out.
const HOLD = 2.6
const FADE_IN = 8
const FADE_OUT = 2.2

export type GlobeInput = {
  px: number
  py: number
  vel: number
  burstPending: boolean
  reduced: boolean
  // The hero copy, in normalised device coordinates, which labels stay out of.
  clear: { x0: number; x1: number; y0: number; y1: number }
}

function fibonacci(n: number, r: number) {
  const out = new Float32Array(n * 3)
  const golden = Math.PI * (3 - Math.sqrt(5))
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2
    const rad = Math.sqrt(1 - y * y)
    const th = golden * i
    out.set([Math.cos(th) * rad * r, y * r, Math.sin(th) * rad * r], i * 3)
  }
  return out
}

function smooth(e0: number, e1: number, x: number) {
  const t = Math.min(Math.max((x - e0) / (e1 - e0), 0), 1)
  return t * t * (3 - 2 * t)
}

function cssColor(name: string, fallback: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback
}

const LABEL_PX = 46
const PAD_X = 22
const PAD_Y = 14

// A label, optionally on a faint tinted chip with a hairline edge. Both states
// share one canvas size so they cross-fade in place.
function labelTexture(text: string, color: string, chip?: string) {
  const font = `500 ${LABEL_PX}px "JetBrains Mono", ui-monospace, monospace`
  const c = document.createElement('canvas')
  const ctx = c.getContext('2d')!
  ctx.font = font
  const w = Math.ceil(ctx.measureText(text).width) + PAD_X * 2
  const h = LABEL_PX + PAD_Y * 2
  c.width = w
  c.height = h
  if (chip) {
    ctx.beginPath()
    ctx.roundRect(1.5, 1.5, w - 3, h - 3, 14)
    ctx.globalAlpha = 0.1
    ctx.fillStyle = chip
    ctx.fill()
    ctx.globalAlpha = 0.45
    ctx.lineWidth = 2
    ctx.strokeStyle = chip
    ctx.stroke()
    ctx.globalAlpha = 1
  }
  ctx.font = font
  ctx.fillStyle = color
  ctx.textBaseline = 'middle'
  ctx.fillText(text, PAD_X, h / 2 + 2)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  return { tex, aspect: w / h }
}

function dotTexture() {
  const c = document.createElement('canvas')
  c.width = c.height = 64
  const ctx = c.getContext('2d')!
  ctx.beginPath()
  ctx.arc(32, 32, 28, 0, Math.PI * 2)
  ctx.fillStyle = '#fff'
  ctx.fill()
  return new THREE.CanvasTexture(c)
}

type Label = {
  base: THREE.Vector3
  weak: boolean
  plain: THREE.Sprite
  flag: THREE.Sprite | null
  aspect: number
  hl: number
  hitAt: number
  hitBurst: number
}

function Globe({ input, theme }: { input: RefObject<GlobeInput>; theme: Theme }) {
  const { camera, size, scene } = useThree()
  const tilt = useRef<THREE.Group>(null)
  const spin = useRef<THREE.Group>(null)
  const burstRing = useRef<THREE.Mesh>(null)
  const [fontReady, setFontReady] = useState(false)

  useEffect(() => {
    document.fonts
      .load(`500 ${LABEL_PX}px "JetBrains Mono"`)
      .catch(() => undefined)
      .finally(() => setFontReady(true))
  }, [])

  const colors = useMemo(() => {
    const dark = theme === 'dark'
    const ink = new THREE.Color(cssColor('--ink', '#16181d'))
    const canvas = new THREE.Color(cssColor('--canvas', '#f6f7f9'))
    return {
      dot: ink.clone().lerp(canvas, dark ? 0.45 : 0.35),
      grid: ink.clone(),
      accent: new THREE.Color(cssColor('--accent', '#3d4ed8')),
      canvas,
      label: cssColor('--ink-muted', '#676d7a'),
      critical: cssColor('--critical', '#c42b21'),
      gridOpacity: dark ? 0.09 : 0.07,
    }
    // Re-read the tokens whenever the theme flips.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme])

  const dots = useMemo(() => {
    const n = 1600
    const pos = fibonacci(n, R)
    const geom = new THREE.BufferGeometry()
    geom.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    geom.setAttribute('color', new THREE.BufferAttribute(new Float32Array(n * 3), 3))
    return { geom, n, pos }
  }, [])
  const dotMat = useMemo(
    () =>
      new THREE.PointsMaterial({
        size: 0.055,
        map: dotTexture(),
        vertexColors: true,
        transparent: true,
        alphaTest: 0.3,
        depthWrite: false,
      }),
    [],
  )

  // Faint latitude and longitude lines, every 30 degrees.
  const grid = useMemo(() => {
    const pts: number[] = []
    const seg = 96
    for (let lat = -60; lat <= 60; lat += 30) {
      const y = R * Math.sin((lat * Math.PI) / 180)
      const r = R * Math.cos((lat * Math.PI) / 180)
      for (let i = 0; i < seg; i++) {
        const a0 = (i / seg) * Math.PI * 2
        const a1 = ((i + 1) / seg) * Math.PI * 2
        pts.push(Math.cos(a0) * r, y, Math.sin(a0) * r, Math.cos(a1) * r, y, Math.sin(a1) * r)
      }
    }
    for (let lon = 0; lon < 180; lon += 30) {
      const a = (lon * Math.PI) / 180
      for (let i = 0; i < seg; i++) {
        const t0 = (i / seg) * Math.PI * 2
        const t1 = ((i + 1) / seg) * Math.PI * 2
        pts.push(
          Math.cos(t0) * Math.cos(a) * R,
          Math.sin(t0) * R,
          Math.cos(t0) * Math.sin(a) * R,
          Math.cos(t1) * Math.cos(a) * R,
          Math.sin(t1) * R,
          Math.cos(t1) * Math.sin(a) * R,
        )
      }
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3))
    return g
  }, [])
  const gridMat = useMemo(() => new THREE.LineBasicMaterial({ transparent: true, depthWrite: false }), [])
  const burstMat = useMemo(() => new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false }), [])

  useEffect(() => {
    gridMat.color.copy(colors.grid)
    gridMat.opacity = colors.gridOpacity
    burstMat.color.copy(colors.accent)
  }, [colors, gridMat, burstMat])

  const labels = useMemo(() => {
    if (!fontReady) return null
    const pos = fibonacci(LABELS.length, R * 1.04)
    const group = new THREE.Group()
    const mk = (tex: THREE.Texture) =>
      new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, depthTest: false, fog: false }))
    const list: Label[] = LABELS.map(({ text, weak }, i) => {
      const base = new THREE.Vector3(pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2])
      const tp = labelTexture(text, colors.label)
      const plain = mk(tp.tex)
      plain.position.copy(base)
      group.add(plain)
      let flag: THREE.Sprite | null = null
      if (weak) {
        flag = mk(labelTexture(text, colors.critical, colors.critical).tex)
        flag.position.copy(base)
        flag.renderOrder = 2
        group.add(flag)
      }
      return { base, weak, plain, flag, aspect: tp.aspect, hl: 0, hitAt: -100, hitBurst: -1 }
    })
    return { group, list }
  }, [fontReady, colors])

  useEffect(() => {
    if (!labels) return
    return () => {
      labels.list.forEach((l) => {
        for (const s of [l.plain, l.flag]) {
          if (!s) continue
          s.material.map?.dispose()
          s.material.dispose()
        }
      })
    }
  }, [labels])

  // Frame the globe wider than the headline on landscape screens, so labels
  // orbit round the copy, and to the height on portrait ones.
  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera
    const aspect = size.width / size.height
    const half = Math.tan((FOV * Math.PI) / 360)
    const z = Math.min(40, Math.max(8.5, aspect >= 1 ? R / (half * aspect * 0.84) : R / (half * 0.95)))
    cam.position.set(0, 0, z)
    cam.lookAt(0, 0, 0)
    cam.updateProjectionMatrix()
    scene.fog = new THREE.Fog(colors.canvas, z - R * 0.4, z + R * 1.1)
  }, [camera, size, scene, colors])

  const sim = useMemo(
    () => ({ burstStart: -1, burstId: 0, wp: new THREE.Vector3(), ndc: new THREE.Vector3(), tmp: new THREE.Color() }),
    [],
  )

  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 0.05)
    const inp = input.current
    const t = state.clock.elapsedTime
    const g = spin.current
    const tg = tilt.current
    if (!g || !tg) return

    // Rotation: a slow idle spin plus whatever the visitor flung it with.
    g.rotation.y += (inp.reduced ? 0 : 0.06 * dt) + inp.vel
    inp.vel *= Math.exp(-dt * 3.5)
    const ease = 1 - Math.exp(-dt * 3)
    tg.rotation.x += (0.32 - inp.py * 0.22 - tg.rotation.x) * ease
    tg.rotation.z += (-0.18 + inp.px * 0.12 - tg.rotation.z) * ease

    // A scan: the ring travels from the top of the globe to the bottom.
    if (inp.burstPending) {
      inp.burstPending = false
      sim.burstStart = t
      sim.burstId++
    }
    const burstAge = sim.burstStart < 0 ? -1 : t - sim.burstStart
    const burstDur = inp.reduced ? 0.01 : 1.6
    let burstY = Infinity
    if (burstAge >= 0 && burstAge <= burstDur) burstY = R - (burstAge / burstDur) * 2 * R
    else if (burstAge > burstDur) sim.burstStart = -1
    if (burstRing.current) {
      const on = burstY !== Infinity
      burstRing.current.visible = on
      if (on) {
        const r = Math.sqrt(Math.max(R * R - burstY * burstY, 0.0001)) * 1.01
        burstRing.current.position.y = burstY
        burstRing.current.scale.setScalar(r / R)
        burstMat.opacity = 0.6 * Math.sin(Math.PI * (burstAge / burstDur))
      }
    }

    g.updateWorldMatrix(true, false)
    const box = inp.clear
    const camDist = camera.position.length()

    if (labels) {
      for (const l of labels.list) {
        // The ring has reached this label once the label is at or above it.
        const reached = burstAge >= 0 && (inp.reduced || (burstY !== Infinity && l.base.y >= burstY))
        if (reached && l.hitBurst !== sim.burstId) {
          l.hitBurst = sim.burstId
          if (l.weak) l.hitAt = t
        }
        const on = t - l.hitAt < HOLD
        l.hl += ((on ? 1 : 0) - l.hl) * (1 - Math.exp(-dt * (on ? FADE_IN : FADE_OUT)))

        sim.wp.copy(l.base).applyMatrix4(g.matrixWorld)
        const facing = sim.wp.z / R
        const depth = 0.12 + 0.88 * smooth(-0.35, 0.55, facing)
        sim.ndc.copy(sim.wp).project(camera)
        // Keep the copy block, the strip under the nav and the far edges clear.
        const dx = Math.max(0, box.x0 - sim.ndc.x, sim.ndc.x - box.x1) / 0.12
        const dy = Math.max(0, box.y0 - sim.ndc.y, sim.ndc.y - box.y1) / 0.12
        const clear =
          smooth(0.15, 1, Math.hypot(dx, dy)) *
          (1 - smooth(0.76, 0.88, sim.ndc.y)) *
          (1 - smooth(0.86, 0.97, Math.abs(sim.ndc.x)))
        const op = depth * clear
        l.plain.material.opacity = op * (1 - l.hl)
        if (l.flag) l.flag.material.opacity = op * l.hl
        // Same size on screen wherever the label is; depth shows as fade instead.
        const h = 0.2 * (1 + 0.06 * l.hl) * (camera.position.distanceTo(sim.wp) / camDist)
        l.plain.scale.set(h * l.aspect, h, 1)
        l.flag?.scale.set(h * l.aspect, h, 1)
      }
    }

    // Dots pick up a thin band of accent where the ring is.
    const col = dots.geom.attributes.color as THREE.BufferAttribute
    const arr = col.array as Float32Array
    for (let i = 0; i < dots.n; i++) {
      const glow = burstY === Infinity ? 0 : 0.7 * (1 - Math.min(Math.abs(dots.pos[i * 3 + 1] - burstY) / 0.3, 1))
      sim.tmp.copy(colors.dot).lerp(colors.accent, glow)
      arr[i * 3] = sim.tmp.r
      arr[i * 3 + 1] = sim.tmp.g
      arr[i * 3 + 2] = sim.tmp.b
    }
    col.needsUpdate = true
  })

  return (
    <group ref={tilt} rotation={[0.32, 0, -0.18]}>
      <group ref={spin}>
        <points geometry={dots.geom} material={dotMat} />
        <lineSegments geometry={grid} material={gridMat} />
        <mesh ref={burstRing} material={burstMat} rotation={[Math.PI / 2, 0, 0]} visible={false}>
          <torusGeometry args={[R, 0.014, 6, 180]} />
        </mesh>
        {labels && <primitive object={labels.group} />}
      </group>
    </group>
  )
}

export default function CryptoGlobe({
  theme,
  reduced,
  target,
  copy,
  scanRef,
}: {
  theme: Theme
  reduced: boolean
  target: RefObject<HTMLElement | null>
  copy: RefObject<HTMLElement | null>
  scanRef: RefObject<(() => void) | null>
}) {
  const input = useRef<GlobeInput>({
    px: 0,
    py: 0,
    vel: 0,
    burstPending: false,
    reduced,
    clear: { x0: -0.6, x1: 0.6, y0: -0.55, y1: 0.55 },
  })

  // Measure the copy block so the labels keep out of its way at any size.
  useEffect(() => {
    const box = copy.current
    const stage = wrapEl.current
    if (!box || !stage) return
    const measure = () => {
      const s = stage.getBoundingClientRect()
      const b = box.getBoundingClientRect()
      const pad = 16
      const nx = (x: number) => ((x - s.left) / s.width) * 2 - 1
      const ny = (y: number) => -(((y - s.top) / s.height) * 2 - 1)
      input.current.clear = { x0: nx(b.left - pad), x1: nx(b.right + pad), y0: ny(b.bottom + pad), y1: ny(b.top - pad) }
    }
    measure()
    // Measure again once the entrance scale-in has finished.
    const late = window.setTimeout(measure, 2000)
    const ro = new ResizeObserver(measure)
    ro.observe(box)
    ro.observe(stage)
    return () => {
      ro.disconnect()
      window.clearTimeout(late)
    }
  }, [copy])
  const wrapEl = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    input.current.reduced = reduced
  }, [reduced])

  useEffect(() => {
    scanRef.current = () => (input.current.burstPending = true)
    return () => {
      scanRef.current = null
    }
  }, [scanRef])

  useEffect(() => {
    const el = wrapEl.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // The canvas sits behind the hero copy, so pointer input is read from the
  // hero section itself. Presses on links and buttons are left alone.
  useEffect(() => {
    const el = target.current
    if (!el) return
    let down: { x: number; y: number; lastX: number; mouse: boolean } | null = null
    const interactive = (e: Event) => (e.target as HTMLElement).closest('a,button,input,label')

    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      if (e.pointerType === 'mouse') {
        input.current.px = ((e.clientX - r.left) / r.width) * 2 - 1
        input.current.py = -(((e.clientY - r.top) / r.height) * 2 - 1)
      }
      if (down && down.mouse) {
        input.current.vel = ((e.clientX - down.lastX) / r.width) * 3.2
        down.lastX = e.clientX
      }
    }
    const press = (e: PointerEvent) => {
      if (interactive(e) || e.button !== 0) return
      down = { x: e.clientX, y: e.clientY, lastX: e.clientX, mouse: e.pointerType === 'mouse' }
      if (down.mouse) e.preventDefault()
    }
    const release = (e: PointerEvent) => {
      if (down && Math.hypot(e.clientX - down.x, e.clientY - down.y) < 6) input.current.burstPending = true
      down = null
    }
    const leave = () => {
      input.current.px = 0
      input.current.py = 0
      down = null
    }
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerdown', press)
    window.addEventListener('pointerup', release)
    el.addEventListener('pointerleave', leave)
    return () => {
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerdown', press)
      window.removeEventListener('pointerup', release)
      el.removeEventListener('pointerleave', leave)
    }
  }, [target])

  return (
    <div ref={wrapEl} className="absolute inset-0" aria-hidden="true">
      <Canvas
        frameloop={visible ? 'always' : 'never'}
        dpr={[1, 2]}
        camera={{ position: [0, 0, 14], fov: FOV }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        style={{ pointerEvents: 'none' }}
      >
        <Globe input={input} theme={theme} />
      </Canvas>
    </div>
  )
}
