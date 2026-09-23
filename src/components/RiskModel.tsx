import { useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { PROFILES, addYears, assess, formatMonthYear, formatYears, type Band } from '../lib/risk'
import { Reveal } from './ui'

const BAND_STYLE: Record<Band, string> = {
  Overdue: 'bg-critical text-canvas',
  High: 'bg-high text-canvas',
  Medium: 'bg-medium text-canvas',
  Low: 'bg-low text-canvas',
}

const MODELS = [
  { name: 'Mosca', body: 'X + Y > Z, turned into the latest date work can start.' },
  { name: 'Probabilistic', body: 'The chance a quantum computer lands before protection lapses, as a band.' },
  { name: 'Regulatory', body: 'Fixed dates from IR 8547, SP 800-131A and CNSA 2.0. No estimation at all.' },
  { name: 'Harvest now, decrypt later', body: 'How many years of recorded traffic would be readable.' },
]

// A segment of the timeline, positioned with transforms only.
function Segment({ from, to, max, className }: { from: number; to: number; max: number; className: string }) {
  const reduce = useReducedMotion()
  const a = Math.max(0, Math.min(from / max, 1))
  const b = Math.max(a, Math.min(to / max, 1))
  const t = reduce ? { duration: 0 } : { type: 'spring' as const, stiffness: 170, damping: 26 }
  return (
    <motion.div className="absolute inset-0" animate={{ x: `${a * 100}%` }} transition={t} initial={false}>
      <motion.div
        className={`h-full origin-left rounded-full ${className}`}
        animate={{ scaleX: b - a }}
        transition={t}
        initial={false}
      />
    </motion.div>
  )
}

function Slider({
  label,
  hint,
  value,
  min,
  max,
  step,
  onChange,
  display,
}: {
  label: string
  hint: string
  value: number
  min: number
  max: number
  step: number
  onChange: (v: number) => void
  display: string
}) {
  const id = label.replace(/\W+/g, '-').toLowerCase()
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor={id} className="text-[15px] font-medium text-ink">
          {label}
        </label>
        <span className="font-mono text-[15px] text-ink">{display}</span>
      </div>
      <input
        id={id}
        type="range"
        className="zr"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ ['--fill' as string]: `${((value - min) / (max - min)) * 100}%` }}
      />
      <p className="text-[13.5px] text-ink-muted">{hint}</p>
    </div>
  )
}

export function RiskModel() {
  const [profile, setProfile] = useState('financial')
  const [y, setY] = useState(2)
  const [z, setZ] = useState(8)
  const x = PROFILES.find((p) => p.id === profile)!.years
  const [today] = useState(() => new Date())
  const r = useMemo(() => assess(x, y, z, today), [x, y, z, today])

  // The axis always shows the quantum date and the full protection window.
  const max = Math.max(z, x + y) * 1.08
  const start = Math.max(0, r.slack)
  const pct = (v: number) => `${Math.round(v * 100)}%`
  const fmt = (v: number) => (Math.round(v * 10) / 10).toString()

  return (
    <section id="risk" className="scroll-mt-20 border-t border-line py-24 md:py-32">
      <div className="mx-auto max-w-[1240px] px-4 md:px-8">
        <Reveal className="max-w-[760px]">
          <p className="mb-5 text-[13px] font-medium uppercase tracking-[0.14em] text-accent">The risk model</p>
          <h2 className="text-[36px] font-semibold leading-[1.05] tracking-[-0.04em] md:text-[52px]">
            When does your migration have to start?
          </h2>
          <p className="mt-5 max-w-[58ch] text-[17px] leading-relaxed text-ink-soft">
            Mosca's inequality, run the way Zypher runs it. Change the inputs and watch the date move.
          </p>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <Reveal>
            <div className="flex h-full flex-col gap-9 rounded-[16px] border border-line bg-surface p-6 md:p-8">
              <fieldset>
                <legend className="flex w-full items-baseline justify-between text-[15px] font-medium text-ink">
                  <span>X, how long the data must stay secret</span>
                </legend>
                <div className="mt-3 flex flex-wrap gap-2">
                  {PROFILES.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setProfile(p.id)}
                      aria-pressed={profile === p.id}
                      className={`h-9 rounded-full border px-3.5 text-[13.5px] transition-colors active:scale-[0.97] ${
                        profile === p.id
                          ? 'border-solid bg-solid text-on-solid'
                          : 'border-line-strong bg-surface text-ink-soft hover:text-ink'
                      }`}
                    >
                      {p.label}
                      <span className={`ml-1.5 font-mono text-[12px] ${profile === p.id ? 'opacity-70' : 'text-ink-muted'}`}>
                        {p.years}y
                      </span>
                    </button>
                  ))}
                </div>
                <p className="mt-3 text-[13.5px] text-ink-muted">
                  Retention periods from the regimes that mandate them. Signatures use their validity window instead.
                </p>
              </fieldset>

              <Slider
                label="Y, how long the migration takes"
                hint="In the app Y is computed from ownership, spread and change control. Here you set it."
                value={y}
                min={0.5}
                max={6}
                step={0.1}
                onChange={setY}
                display={formatYears(y)}
              />
              <Slider
                label="Z, years until a quantum computer"
                hint="Eight years sits inside the Global Risk Institute's published 10-year band."
                value={z}
                min={2}
                max={20}
                step={1}
                onChange={setZ}
                display={formatYears(z)}
              />
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="flex h-full flex-col rounded-[16px] border border-line bg-surface p-6 md:p-8" aria-live="polite">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-[14px] text-ink-muted">
                    {r.band === 'Overdue' ? 'Migration should already have started' : 'Migration must begin by'}
                  </p>
                  <p
                    className={`mt-2 text-[40px] font-semibold leading-none tracking-[-0.045em] md:text-[52px] ${
                      r.band === 'Overdue' ? 'text-critical' : 'text-ink'
                    }`}
                  >
                    {r.band === 'Overdue' ? `${formatYears(-r.slack)} ago` : formatMonthYear(r.startDate)}
                  </p>
                </div>
                <span className={`rounded-full px-3 py-1 text-[13px] font-semibold ${BAND_STYLE[r.band]}`}>
                  {r.band}
                </span>
              </div>

              <div className="mt-10">
                <div className="relative h-16 overflow-x-clip">
                  <motion.div
                    className="absolute inset-y-0 left-0 w-full"
                    animate={{ x: `${(z / max) * 100}%` }}
                    transition={{ type: 'spring', stiffness: 170, damping: 26 }}
                    initial={false}
                  >
                    <div className="h-full w-[2px] -translate-x-1/2 bg-ink" />
                    <span className="absolute -top-6 -translate-x-1/2 whitespace-nowrap font-mono text-[12px] text-ink">
                      Z
                    </span>
                  </motion.div>
                  <div className="absolute inset-x-0 top-3 h-4">
                    <Segment from={start} to={start + y} max={max} className="bg-accent" />
                  </div>
                  <div className="absolute inset-x-0 top-9 h-4">
                    <Segment from={start + y} to={start + y + x} max={max} className="bg-accent-line" />
                    {r.exposureYears > 0 && (
                      <Segment from={z} to={start + y + x} max={max} className="bg-critical" />
                    )}
                  </div>
                </div>
                <div className="mt-3 flex justify-between font-mono text-[12px] text-ink-muted">
                  <span>Today</span>
                  <span>{formatMonthYear(addYears(today, max))}</span>
                </div>
                <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-ink-soft">
                  <span className="inline-flex items-center gap-2">
                    <span className="h-2.5 w-5 rounded-full bg-accent" /> Y, migrating
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <span className="h-2.5 w-5 rounded-full bg-accent-line" /> X, data still secret
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <span className="h-2.5 w-5 rounded-full bg-critical" /> Readable after Z
                  </span>
                </div>
              </div>

              <p className="mt-9 font-mono text-[15px] text-ink-soft md:text-[17px]" aria-label="Mosca inequality with these values">
                <span className="text-ink">{fmt(x)}</span> + <span className="text-ink">{fmt(y)}</span>
                {' = '}
                <span className="text-ink">{fmt(x + y)}</span>
                <span className={`mx-2 font-semibold ${x + y > z ? 'text-critical' : 'text-low'}`}>{x + y > z ? '>' : '≤'}</span>
                <span className="text-ink">{fmt(z)}</span>
                <span className="ml-3 font-sans text-[14px] text-ink-muted">
                  {x + y > z ? 'X + Y > Z, so the data outlives its protection.' : 'X + Y fits inside Z, for now.'}
                </span>
              </p>

              <dl className="mt-auto grid grid-cols-1 gap-6 border-t border-line pt-7 sm:grid-cols-3">
                <div>
                  <dt className="text-[13px] text-ink-muted">Quantum computer by</dt>
                  <dd className="mt-1.5 font-mono text-[20px] text-ink">{formatMonthYear(r.crqcDate)}</dd>
                </div>
                <div>
                  <dt className="text-[13px] text-ink-muted">Chance it lands in time</dt>
                  <dd className="mt-1.5 font-mono text-[20px] text-ink">
                    {pct(r.probability.low)} to {pct(r.probability.high)}
                  </dd>
                  <dd className="mt-1 text-[12px] text-ink-muted">GRI 2025, {r.probability.source}</dd>
                </div>
                <div>
                  <dt className="text-[13px] text-ink-muted">Harvest exposure</dt>
                  <dd className={`mt-1.5 font-mono text-[20px] ${r.exposureYears > 0 ? 'text-critical' : 'text-ink'}`}>
                    {r.exposureYears > 0 ? formatYears(r.exposureYears) : 'None'}
                  </dd>
                </div>
              </dl>
            </div>
          </Reveal>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
          {MODELS.map((m, i) => (
            <Reveal key={m.name} delay={i * 0.06} className="border-t border-line-strong pt-5">
              <h3 className="text-[16px] font-semibold tracking-[-0.01em]">{m.name}</h3>
              <p className="mt-2 text-[14.5px] leading-relaxed text-ink-soft">{m.body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
