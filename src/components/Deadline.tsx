import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react'
import { ArrowCounterClockwise, FastForward, LockSimple, LockSimpleOpen } from '@phosphor-icons/react'
import { Reveal } from './ui'

// NIST IR 8547: 112-bit quantum-vulnerable public-key algorithms are
// deprecated after 2030 and disallowed after 2035.
const DEPRECATED = new Date('2031-01-01T00:00:00')

// Example traffic an adversary could record today. The contents are made up;
// the point is that none of it needs to be sent again to be read later.
const PACKETS = [
  { meta: 'TLS 1.2, ECDHE-RSA-2048', plain: 'GET /accounts/8841/statement' },
  { meta: 'SFTP, RSA-2048 host key', plain: 'salary_2026.csv, 412 rows' },
  { meta: 'TLS 1.2, ECDHE-ECDSA P-256', plain: 'transfer 4,80,000 INR to ..7731' },
  { meta: 'IPsec, DH-2048', plain: 'patient_record_20931.pdf' },
  { meta: 'S/MIME, RSA-2048', plain: 'Re: tender pricing, final figures' },
]

const HEX = '0123456789abcdef'
const randomHex = (n: number) => Array.from({ length: n }, () => HEX[(Math.random() * 16) | 0]).join('')

// Decode timing, shared with the button so its progress matches the rows.
const ROW_STAGGER = 140
const CHAR_MS = 25
const DECODE_MS = (PACKETS.length - 1) * ROW_STAGGER + Math.max(...PACKETS.map((p) => p.plain.length)) * CHAR_MS

function Countdown() {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [])
  const left = Math.max(0, DEPRECATED.getTime() - now)
  const parts = [
    { v: Math.floor(left / 864e5).toLocaleString('en-US'), k: 'days' },
    { v: String(Math.floor(left / 36e5) % 24).padStart(2, '0'), k: 'hours' },
    { v: String(Math.floor(left / 6e4) % 60).padStart(2, '0'), k: 'min' },
    { v: String(Math.floor(left / 1e3) % 60).padStart(2, '0'), k: 'sec' },
  ]
  return (
    <div>
      <p className="text-[13px] text-ink-muted">Until RSA-2048 is deprecated</p>
      <div className="mt-2 flex flex-wrap items-baseline gap-x-4 gap-y-1 font-mono tabular-nums">
        {parts.map((p) => (
          <span key={p.k} className="flex items-baseline gap-1">
            <span className="text-[30px] font-medium leading-none tracking-[-0.03em] text-ink md:text-[36px]">{p.v}</span>
            <span className="text-[12px] text-ink-muted">{p.k}</span>
          </span>
        ))}
      </div>
    </div>
  )
}

// One recorded message: ciphertext that shuffles while it is unreadable, and
// decodes from left to right when the clock jumps to Q-Day.
function Packet({ meta, plain, open, index }: { meta: string; plain: string; open: boolean; index: number }) {
  const reduce = useReducedMotion()
  const [text, setText] = useState(() => randomHex(plain.length))

  useEffect(() => {
    let id = 0
    if (reduce) {
      id = window.setTimeout(() => setText(open ? plain : randomHex(plain.length)), 0)
      return () => window.clearTimeout(id)
    }
    const start = performance.now() + index * ROW_STAGGER
    const tick = () => {
      // About 40 characters a second, after this row's delay.
      const n = open ? Math.max(0, Math.min(plain.length, Math.floor((performance.now() - start) / CHAR_MS))) : 0
      setText(plain.slice(0, n) + randomHex(plain.length - n))
      if (open && n >= plain.length) return
      id = window.setTimeout(tick, open ? 30 : 160)
    }
    tick()
    return () => window.clearTimeout(id)
  }, [open, plain, index, reduce])

  const done = open && text === plain
  return (
    <li className="flex items-start gap-3 border-b border-line py-3.5 last:border-0">
      <span
        className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors duration-500 ${
          done ? 'bg-[color-mix(in_oklab,var(--critical)_14%,transparent)] text-critical' : 'bg-sunken text-ink-muted'
        }`}
      >
        {done ? <LockSimpleOpen size={14} weight="bold" /> : <LockSimple size={14} weight="bold" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[12px] text-ink-muted">{meta}</span>
        <span
          className={`mt-0.5 block truncate font-mono text-[13.5px] transition-colors duration-300 ${
            done ? 'text-ink' : 'text-ink-muted/80'
          }`}
        >
          {text}
        </span>
      </span>
    </li>
  )
}

type Phase = 'closed' | 'working' | 'open'

const LABEL: Record<Phase, string> = {
  closed: 'Fast-forward to Q-Day',
  working: 'Decrypting…',
  open: 'Back to today',
}

// One pill that morphs between its three states: it resizes with a spring,
// the label and icon slide rather than swap, and while the rows decode it
// fills from left to right.
function TimeButton({ phase, onClick }: { phase: Phase; onClick: () => void }) {
  const reduce = useReducedMotion()
  const solid = phase === 'closed'
  const spring = reduce ? { duration: 0 } : { type: 'spring' as const, stiffness: 420, damping: 32 }
  const Icon = phase === 'open' ? ArrowCounterClockwise : FastForward

  return (
    <motion.button
      type="button"
      layout
      onClick={onClick}
      disabled={phase === 'working'}
      aria-live="polite"
      transition={spring}
      whileHover={reduce || phase === 'working' ? undefined : { scale: 1.03 }}
      whileTap={reduce || phase === 'working' ? undefined : { scale: 0.97 }}
      className={`relative isolate inline-flex h-10 shrink-0 items-center overflow-hidden rounded-full border px-4 text-[14px] font-medium transition-colors duration-300 ${
        solid ? 'border-transparent bg-solid text-on-solid' : 'border-line-strong bg-surface text-ink'
      }`}
      style={{ borderRadius: 999 }}
    >
      {/* The progress fill, in the critical colour, while the rows decode. */}
      <AnimatePresence>
        {phase === 'working' && (
          <motion.span
            key="fill"
            aria-hidden="true"
            className="absolute inset-0 -z-10 origin-left bg-[color-mix(in_oklab,var(--critical)_16%,transparent)]"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            exit={{ opacity: 0 }}
            transition={{ scaleX: { duration: DECODE_MS / 1000, ease: 'linear' }, opacity: { duration: 0.3 } }}
          />
        )}
      </AnimatePresence>

      <motion.span layout="position" className="flex items-center gap-2" transition={spring}>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={phase === 'working' ? 'spin' : Icon === FastForward ? 'ff' : 'back'}
            className="flex"
            initial={reduce ? false : { opacity: 0, x: phase === 'open' ? 8 : -8, rotate: phase === 'open' ? 90 : 0 }}
            animate={{ opacity: 1, x: 0, rotate: 0 }}
            exit={reduce ? undefined : { opacity: 0, x: 8 }}
            transition={spring}
          >
            {phase === 'working' ? (
              // The fast-forward mark keeps pulsing forward while the clock runs.
              <motion.span
                className="flex text-critical"
                animate={reduce ? undefined : { x: [0, 3, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, ease: 'easeInOut' }}
              >
                <FastForward size={16} weight="fill" />
              </motion.span>
            ) : (
              <Icon size={16} weight={Icon === FastForward ? 'fill' : 'bold'} />
            )}
          </motion.span>
        </AnimatePresence>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={phase}
            className="whitespace-nowrap"
            initial={reduce ? false : { opacity: 0, y: 10, filter: 'blur(3px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={reduce ? undefined : { opacity: 0, y: -10, filter: 'blur(3px)' }}
            transition={spring}
          >
            {LABEL[phase]}
          </motion.span>
        </AnimatePresence>
      </motion.span>
    </motion.button>
  )
}

function Harvest() {
  const [open, setOpen] = useState(false)
  const [settled, setSettled] = useState(false)
  const reduce = useReducedMotion()

  // The last row finishes decoding after DECODE_MS; then the button settles.
  useEffect(() => {
    if (!open) return
    const id = window.setTimeout(() => setSettled(true), reduce ? 0 : DECODE_MS + 120)
    return () => window.clearTimeout(id)
  }, [open, reduce])

  const toggle = () => {
    setSettled(false)
    setOpen((o) => !o)
  }
  const phase: Phase = !open ? 'closed' : settled ? 'open' : 'working'
  const caption = {
    closed: 'Unreadable today. Stored, it only has to wait.',
    working: 'The key exchange is broken, one message at a time.',
    open: 'All of it readable, years later. Nothing had to be sent again.',
  }[phase]

  return (
    <div className="flex h-full flex-col rounded-[16px] border border-line bg-surface p-6 shadow-lift md:p-7">
      <Countdown />

      <div className="mt-6 border-t border-line pt-5">
        <div className="flex items-center justify-between gap-4">
          <p className="text-[14px] font-semibold text-ink">Recorded today</p>
          <span className="text-[12px] text-ink-muted">Example traffic</span>
        </div>
        <ul className="mt-2">
          {PACKETS.map((p, i) => (
            <Packet key={p.meta} meta={p.meta} plain={p.plain} open={open} index={i} />
          ))}
        </ul>
      </div>

      {/* Caption and button on one row that never reflows: the caption has a
          fixed slot and the button grows or shrinks from the right edge. */}
      <div className="mt-auto flex items-center justify-between gap-4 pt-5">
        <div className="relative min-h-[40px] flex-1">
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={phase}
              initial={reduce ? false : { opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: -4 }}
              transition={{ duration: 0.25 }}
              className={`max-w-[32ch] text-[13px] leading-relaxed ${phase === 'open' ? 'text-critical' : 'text-ink-muted'}`}
            >
              {caption}
            </motion.p>
          </AnimatePresence>
        </div>
        <TimeButton phase={phase} onClick={toggle} />
      </div>
    </div>
  )
}

export function Deadline() {
  const ref = useRef<HTMLElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 85%', 'start 25%'] })
  // The strike through "RSA-2048" is drawn by scrolling into the section.
  const strike = useSpring(useTransform(scrollYProgress, [0.15, 1], [0, 1]), { stiffness: 120, damping: 24 })

  return (
    <section ref={ref} className="relative border-t border-line py-24 md:py-32">
      <div className="mx-auto max-w-[1240px] px-4 md:px-8">
        <h2 className="sr-only">The deadline for RSA-2048</h2>
        <div className="grid grid-cols-1 items-stretch gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
          <div className="flex flex-col justify-center">
            <div className="relative inline-block self-start">
              <p className="font-mono text-[60px] font-medium leading-none tracking-[-0.04em] text-ink sm:text-[96px] lg:text-[112px]">
                RSA-2048
              </p>
              <motion.span
                aria-hidden="true"
                style={{ scaleX: reduce ? 1 : strike }}
                className="absolute left-[-2%] right-[-2%] top-[52%] h-[5px] origin-left rounded-full bg-critical md:h-[6px]"
              />
            </div>
            <div className="mt-8 space-y-1.5 text-[26px] font-medium leading-tight tracking-[-0.03em] sm:text-[36px]">
              <Reveal>
                <p className="text-ink">Deprecated after 2030.</p>
              </Reveal>
              <Reveal delay={0.12}>
                <p className="text-ink-muted">Disallowed after 2035.</p>
              </Reveal>
            </div>
            <p className="mt-6 max-w-[46ch] text-[16px] leading-relaxed text-ink-soft">
              Traffic recorded today can be decrypted the day a quantum computer arrives.{' '}
              <span className="text-ink">The hard part is finding everything that has to move.</span>
            </p>
            <p className="mt-6 text-[13px] text-ink-muted">NIST IR 8547, for 112-bit classical public-key cryptography.</p>
          </div>

          <Reveal delay={0.1} className="h-full">
            <Harvest />
          </Reveal>
        </div>
      </div>
    </section>
  )
}
