import { useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform, type MotionValue } from 'motion/react'
import {
  ChartBar,
  CheckCircle,
  FileText,
  GitBranch,
  Globe,
  MagnifyingGlass,
  Path,
  WifiHigh,
  WifiSlash,
  type Icon,
} from '@phosphor-icons/react'
import { Reveal } from './ui'

const STATEMENT = 'Everything runs with the network cable unplugged. Nothing goes online unless you ask it to.'

// The four stages of a scan, and the only two features that can reach the
// network: cloning a Git repository, and the OSV lookup, which is off by default.
const LOCAL: { icon: Icon; name: string }[] = [
  { icon: MagnifyingGlass, name: 'Scan six detection tiers' },
  { icon: ChartBar, name: 'Score four risk models' },
  { icon: Path, name: 'Plan dated migration waves' },
  { icon: FileText, name: 'Export CBOM, HTML and CSV' },
]
const ONLINE: { icon: Icon; name: string; note: string }[] = [
  { icon: Globe, name: 'OSV advisory lookup', note: 'Off by default' },
  { icon: GitBranch, name: 'Clone a Git repository', note: 'Only when you scan one' },
]

function Word({ word, range, progress }: { word: string; range: [number, number]; progress: MotionValue<number> }) {
  const opacity = useTransform(progress, range, [0.18, 1])
  return (
    <motion.span style={{ opacity }} className="inline-block">
      {word}&nbsp;
    </motion.span>
  )
}

function NetworkSwitch() {
  const [online, setOnline] = useState(false)
  const reduce = useReducedMotion()
  const spring = reduce ? { duration: 0 } : { type: 'spring' as const, stiffness: 500, damping: 34 }

  return (
    <div className="rounded-[16px] border border-line bg-surface p-6 shadow-lift md:p-7">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[15px] font-semibold text-ink">Network</p>
          <p className="mt-0.5 text-[13px] text-ink-muted">Flip it and see what changes.</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={online}
          aria-label="Network access"
          onClick={() => setOnline((o) => !o)}
          className={`relative inline-flex h-9 w-[92px] shrink-0 items-center rounded-full px-1 transition-colors duration-300 ${
            online ? 'bg-accent' : 'bg-line-strong'
          }`}
        >
          <motion.span
            layout
            transition={spring}
            className={`relative z-10 flex h-7 w-7 items-center justify-center rounded-full bg-surface text-ink shadow-soft ${
              online ? 'ml-auto' : ''
            }`}
          >
            {online ? <WifiHigh size={15} weight="bold" /> : <WifiSlash size={15} weight="bold" />}
          </motion.span>
          <span
            className={`absolute text-[11.5px] font-semibold ${online ? 'left-3.5 text-canvas' : 'right-3.5 text-ink-soft'}`}
            aria-hidden="true"
          >
            {online ? 'ON' : 'OFF'}
          </span>
        </button>
      </div>

      <ul className="mt-6 space-y-1">
        {LOCAL.map(({ icon: I, name }) => (
          <li key={name} className="flex items-center justify-between gap-4 rounded-[10px] px-3 py-2.5">
            <span className="flex items-center gap-3 text-[14.5px] text-ink">
              <I size={18} className="text-ink-muted" />
              {name}
            </span>
            <span className="flex shrink-0 items-center gap-1.5 text-[12.5px] font-medium text-low">
              <CheckCircle size={16} weight="fill" />
              Works
            </span>
          </li>
        ))}
      </ul>

      <ul className="mt-3 space-y-1 border-t border-line pt-3">
        {ONLINE.map(({ icon: I, name, note }) => (
          <li
            key={name}
            className={`flex items-center justify-between gap-4 rounded-[10px] px-3 py-2.5 transition-colors duration-300 ${
              online ? 'bg-accent-soft' : ''
            }`}
          >
            <span className="flex min-w-0 items-center gap-3">
              <I size={18} className={`shrink-0 ${online ? 'text-accent' : 'text-ink-muted'}`} />
              <span className="min-w-0">
                <span className={`block text-[14.5px] ${online ? 'text-ink' : 'text-ink-muted'}`}>{name}</span>
                <span className="block text-[12px] text-ink-muted">{note}</span>
              </span>
            </span>
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={online ? 'on' : 'off'}
                initial={reduce ? false : { opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? undefined : { opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
                className={`shrink-0 text-[12.5px] font-medium ${online ? 'text-accent' : 'text-ink-muted'}`}
              >
                {online ? 'Available' : 'Needs network'}
              </motion.span>
            </AnimatePresence>
          </li>
        ))}
      </ul>

      <p className="mt-5 text-[13px] leading-relaxed text-ink-muted" aria-live="polite">
        {online
          ? 'Two optional extras become available. The analysis itself is exactly the same.'
          : 'The whole analysis still runs. Only the two optional extras wait for a connection.'}
      </p>
    </div>
  )
}

export function Principles() {
  const ref = useRef<HTMLParagraphElement>(null)
  const reduce = !!useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 85%', 'end 50%'] })
  const words = STATEMENT.split(' ')

  return (
    <section className="border-t border-line py-24 md:py-32">
      <div className="mx-auto max-w-[1240px] px-4 md:px-8">
        <h2 className="sr-only">Offline by construction</h2>
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
          <div>
            <p
              ref={ref}
              className="max-w-[18ch] text-[34px] font-semibold leading-[1.1] tracking-[-0.035em] sm:text-[46px] lg:text-[54px]"
            >
              {reduce
                ? STATEMENT
                : words.map((w, i) => (
                    <Word key={i} word={w} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]} />
                  ))}
            </p>
            <p className="mt-6 max-w-[44ch] text-[17px] leading-relaxed text-ink-soft">
              Built for estates where source code cannot leave the building. Scans are stored as local files, and a
              database is optional.
            </p>
          </div>
          <Reveal>
            <NetworkSwitch />
          </Reveal>
        </div>
      </div>
    </section>
  )
}
