import { useEffect, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { ArrowRight, ArrowsClockwise, CalendarCheck, Gauge, MagnifyingGlass, Stack, Target, type Icon } from '@phosphor-icons/react'

/*
 * One asset, followed through the whole pipeline. Every value below is from
 * the real scan of Zypher's own backend that the screenshots come from:
 * artefact ART-3502572C, RSA-1024 in backend/tests/fixtures/taint/Vault.cs.
 */

function Row({ k, v, tone }: { k: string; v: ReactNode; tone?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-6 border-b border-line py-2.5 last:border-0">
      <dt className="text-[13px] text-ink-muted">{k}</dt>
      <dd className={`text-right font-mono text-[13px] ${tone ?? 'text-ink'}`}>{v}</dd>
    </div>
  )
}

function DiscoverView() {
  return (
    <div className="space-y-4">
      <pre className="overflow-x-auto rounded-[10px] border border-line bg-sunken p-4 font-mono text-[12.5px] leading-[1.8] text-ink-soft">
        <span className="text-ink-muted">{'// Vault.cs'}</span>
        {'\n'}
        <span className="rounded-[4px] bg-accent-soft px-1 text-accent ring-1 ring-accent-line">const int LegacyBits = 1024;</span>
        {'\n\n'}static RSACryptoServiceProvider Build(int bits) {'{'}
        {'\n'}
        {'    '}return new <span className="text-ink">RSACryptoServiceProvider</span>(
        <span className="rounded-[4px] bg-accent-soft px-1 text-accent ring-1 ring-accent-line">bits</span>);
        {'\n'}
        {'}'}
      </pre>
      <dl>
        <Row k="Found at" v="Vault.cs, line 7" />
        <Row k="Key size" v="1024, followed through a variable" />
        <Row k="Surface" v="source_code" />
      </dl>
    </div>
  )
}

function NormaliseView() {
  return (
    <dl>
      <Row k="bom-ref" v="ART-3502572C" />
      <Row k="type" v="algorithm" />
      <Row k="algorithmFamily" v="RSA" />
      <Row k="algorithmClass" v="asymmetric_factoring" />
      <Row k="keyLength" v="1024" />
      <Row k="cryptoUsage" v="key_transport" />
      <Row k="occurrences" v="1" />
    </dl>
  )
}

function Bar({ label, value, max, className }: { label: string; value: number; max: number; className: string }) {
  return (
    <div className="grid grid-cols-[64px_1fr_56px] items-center gap-3">
      <span className="font-mono text-[12.5px] text-ink-muted">{label}</span>
      <span className="relative h-2.5 rounded-full">
        <span className={`absolute inset-y-0 left-0 rounded-full ${className}`} style={{ width: `${(value / max) * 100}%` }} />
      </span>
      <span className="text-right font-mono text-[12.5px] text-ink">{value} y</span>
    </div>
  )
}

function AssessView() {
  return (
    <div className="space-y-5">
      <div className="space-y-2.5">
        <Bar label="X + Y" value={7.31} max={8.5} className="bg-accent" />
        <Bar label="Z" value={8} max={8.5} className="bg-ink-muted" />
      </div>
      <p className="text-[13.5px] leading-relaxed text-ink-soft">
        Mosca alone says this asset has 0.69 years to spare. But RSA-1024 sits below the 112-bit floor, and the
        regulatory model&rsquo;s deadline has already passed, so that model binds.
      </p>
      <dl>
        <Row k="Quantum status" v="Already broken classically" />
        <Row k="Binding model" v="regulatory" />
        <Row k="Risk" v="Critical" tone="text-critical" />
      </dl>
    </div>
  )
}

function PrescribeView() {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3 font-mono">
        <span className="rounded-full border border-line-strong px-3.5 py-1.5 text-[14px] text-critical line-through decoration-2">
          RSA-1024
        </span>
        <ArrowRight size={16} className="text-accent" aria-hidden="true" />
        <span className="rounded-full bg-accent px-3.5 py-1.5 text-[14px] font-medium text-canvas">ML-KEM-768</span>
      </div>
      <dl>
        <Row k="Standard" v="FIPS 203, NIST Category 3" />
        <Row k="Hybrid" v="X25519 + ML-KEM-768" />
        <Row k="Replaces" v="80-bit classical security" />
      </dl>
      <p className="text-[13.5px] leading-relaxed text-ink-soft">
        Strict equivalence would allow Category 1, but Category 3 is what OpenSSL 3.5, Go 1.24 and the IETF hybrid all
        use by default.
      </p>
    </div>
  )
}

function PlanView() {
  return (
    <div className="space-y-5">
      <div className="rounded-[12px] border border-[color-mix(in_oklab,var(--critical)_35%,transparent)] bg-[color-mix(in_oklab,var(--critical)_8%,transparent)] p-4">
        <p className="text-[13px] font-medium text-critical">Deadline already passed</p>
        <p className="mt-1 font-mono text-[22px] font-medium tracking-[-0.02em] text-ink">3.04 years overdue</p>
      </div>
      <dl>
        <Row k="Must start by" v="2023-09-09" tone="text-critical" />
        <Row k="Must complete by" v="2023-12-31" tone="text-critical" />
        <Row k="Migration time, Y" v="0.31 years" />
      </dl>
      <p className="font-mono text-[12px] leading-relaxed text-ink-muted">
        0.25y base x 1.2 negotiation x 1.15 change control x 0.9 indirected = 0.31 years
      </p>
    </div>
  )
}

const DELTA = [
  { k: 'added', label: 'New since last scan' },
  { k: 'removed', label: 'Gone since last scan' },
  { k: 'risk_worsened', label: 'Risk went up' },
  { k: 'risk_improved', label: 'Risk went down' },
  { k: 'parameters_changed', label: 'Parameters changed' },
]

function MonitorView() {
  return (
    <div className="space-y-5">
      <p className="text-[13.5px] leading-relaxed text-ink-soft">
        Run the next scan and compare the two. Every asset lands in one of these buckets, and anything newly Critical is
        called out on its own.
      </p>
      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {DELTA.map((d) => (
          <li key={d.k} className="rounded-[10px] border border-line bg-sunken px-3.5 py-2.5">
            <span className="block font-mono text-[12px] text-accent">{d.k}</span>
            <span className="block text-[13px] text-ink-soft">{d.label}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

type Stage = { verb: string; icon: Icon; body: string; View: () => ReactNode }

const STAGES: Stage[] = [
  {
    verb: 'Discover',
    icon: MagnifyingGlass,
    body: 'Six tiers read the backend. Dataflow follows the key size from a constant into the call that uses it.',
    View: DiscoverView,
  },
  {
    verb: 'Normalise',
    icon: Stack,
    body: 'The finding becomes a typed artefact with a stable identity, so duplicates collapse and evidence is kept.',
    View: NormaliseView,
  },
  {
    verb: 'Assess',
    icon: Gauge,
    body: 'Four risk models run. The one that demands the earliest start is the one that sets the schedule.',
    View: AssessView,
  },
  {
    verb: 'Prescribe',
    icon: Target,
    body: 'A replacement is chosen by what the key is for and the security level it has to match.',
    View: PrescribeView,
  },
  {
    verb: 'Plan',
    icon: CalendarCheck,
    body: 'The deadline goes into a dated wave. A date already behind us is reported as a breach, not a schedule.',
    View: PlanView,
  },
  {
    verb: 'Monitor',
    icon: ArrowsClockwise,
    body: 'The next scan is compared with this one, so a fix, or a new weak key, shows up straight away.',
    View: MonitorView,
  },
]

function StageCard({ index }: { index: number }) {
  const s = STAGES[index]
  const reduce = useReducedMotion()
  return (
    <div className="overflow-hidden rounded-[16px] border border-line bg-surface shadow-lift">
      <div className="flex items-center justify-between gap-4 border-b border-line bg-sunken px-5 py-3.5">
        <span className="font-mono text-[12.5px] text-ink-soft">RSA-1024, Vault.cs:7</span>
        <span className="flex gap-1" aria-hidden="true">
          {STAGES.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all duration-500 ${i === index ? 'w-5 bg-accent' : i < index ? 'w-1.5 bg-accent/50' : 'w-1.5 bg-line-strong'}`}
            />
          ))}
        </span>
      </div>
      <div className="relative min-h-[380px] p-5 md:p-6">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={s.verb}
            initial={reduce ? false : { opacity: 0, y: 12, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={reduce ? undefined : { opacity: 0, y: -8, filter: 'blur(4px)' }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="mb-4 flex items-center gap-2 text-[14px] font-semibold text-ink">
              <s.icon size={17} className="text-accent" />
              {s.verb}
            </p>
            <s.View />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

export function Pipeline() {
  const [active, setActive] = useState(0)
  const steps = useRef<(HTMLLIElement | null)[]>([])

  // The step crossing the middle of the screen drives the card.
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.i))
      },
      { rootMargin: '-45% 0px -45% 0px' },
    )
    steps.current.forEach((el) => el && io.observe(el))
    return () => io.disconnect()
  }, [])

  return (
    <section className="border-t border-line py-24 md:py-32">
      <div className="mx-auto max-w-[1240px] px-4 md:px-8">
        <div className="max-w-[760px]">
          <h2 className="text-[36px] font-semibold leading-[1.05] tracking-[-0.04em] md:text-[52px]">
            From a folder to a dated plan.
          </h2>
          <p className="mt-5 max-w-[56ch] text-[17px] leading-relaxed text-ink-soft">
            Follow one real finding from the scan above, an RSA-1024 key, through every stage of a Zypher scan.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
          <ol className="lg:py-[14vh]">
            {STAGES.map((s, i) => {
              const on = i === active
              return (
                <li
                  key={s.verb}
                  ref={(el) => {
                    steps.current[i] = el
                  }}
                  data-i={i}
                  className="lg:flex lg:min-h-[38vh] lg:items-center"
                >
                  <div className="w-full py-8 lg:py-0">
                    <div className="flex items-center gap-4">
                      <span
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition-colors duration-500 ${
                          on ? 'border-accent bg-accent text-canvas' : 'border-line-strong text-ink-muted'
                        }`}
                      >
                        <s.icon size={20} weight={on ? 'bold' : 'regular'} />
                      </span>
                      <h3
                        className={`text-[30px] font-semibold tracking-[-0.04em] transition-colors duration-500 md:text-[40px] ${
                          on ? 'text-ink' : 'text-ink-muted'
                        }`}
                      >
                        {s.verb}
                      </h3>
                    </div>
                    <p
                      className={`mt-4 max-w-[42ch] text-[16px] leading-relaxed transition-colors duration-500 md:text-[17px] ${
                        on ? 'text-ink-soft' : 'text-ink-muted'
                      }`}
                    >
                      {s.body}
                    </p>
                    {/* On narrow screens each stage carries its own card. */}
                    <div className="mt-6 lg:hidden">
                      <StageCard index={i} />
                    </div>
                  </div>
                </li>
              )
            })}
          </ol>

          <div className="hidden lg:block">
            <div className="sticky top-[calc(50vh-230px)]">
              <StageCard index={active} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
