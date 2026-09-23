import { useEffect, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion, useInView, useReducedMotion } from 'motion/react'
import { ArrowDown, ArrowRight, Warning } from '@phosphor-icons/react'
import { Reveal } from './ui'

/* ------------------------------------------------------------------ demos */

function Code({ children }: { children: ReactNode }) {
  return (
    <pre className="overflow-x-auto rounded-[10px] border border-line bg-sunken p-5 font-mono text-[13px] leading-[1.8] text-ink-soft">
      {children}
    </pre>
  )
}

function Hit({ children, tone = 'accent' }: { children: ReactNode; tone?: 'accent' | 'critical' }) {
  const cls =
    tone === 'critical'
      ? 'bg-[color-mix(in_oklab,var(--critical)_12%,transparent)] text-critical ring-[color-mix(in_oklab,var(--critical)_35%,transparent)]'
      : 'bg-accent-soft text-accent ring-accent-line'
  return <span className={`rounded-[4px] px-1 py-0.5 ring-1 ${cls}`}>{children}</span>
}

function Finding({ name, meta }: { name: string; meta: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-[10px] border border-line bg-surface px-4 py-3 font-mono text-[12.5px]">
      <span className="text-ink">{name}</span>
      <span className="text-critical">{meta}</span>
    </div>
  )
}

function BaselineDemo() {
  return (
    <div className="space-y-3">
      <Code>
        <span className="text-ink-muted">{'// legacy/checksum.c'}</span>
        {'\n'}#include {'<openssl/des.h>'}
        {'\n\n'}
        <Hit tone="critical">DES_set_key_checked</Hit>(&amp;key, &amp;schedule);{'\n'}
        <Hit tone="critical">MD5</Hit>(buf, len, digest);
      </Code>
      <div className="grid gap-2 sm:grid-cols-2">
        <Finding name="3DES / DES" meta="Critical" />
        <Finding name="MD5" meta="Critical" />
      </div>
    </div>
  )
}

function TreeSitterDemo() {
  return (
    <div className="space-y-3">
      <Code>
        <span className="text-ink-muted">from</span> cryptography.hazmat.primitives.asymmetric{' '}
        <span className="text-ink-muted">import</span> rsa{'\n\n'}
        key = rsa.<span className="text-ink">generate_private_key</span>({'\n'}
        {'    '}public_exponent=65537,{'\n'}
        {'    '}
        <Hit>key_size=1024</Hit>,{'\n'})
      </Code>
      <Finding name="RSA-1024, parameter_source: literal" meta="Critical" />
    </div>
  )
}

const ECOSYSTEMS = [
  { slug: 'npm', name: 'npm' },
  { slug: 'pypi', name: 'PyPI' },
  { slug: 'apachemaven', name: 'Maven' },
  { slug: 'gradle', name: 'Gradle' },
  { slug: 'go', name: 'Go modules' },
  { slug: 'rust', name: 'Cargo' },
  { slug: 'packagist', name: 'Composer' },
  { slug: 'rubygems', name: 'RubyGems' },
]

function ManifestDemo() {
  const rows = [
    { line: 'pycryptodome==3.20.0', purl: 'pkg:pypi/pycryptodome@3.20.0', note: null },
    { line: '"node-forge": "^1.3.1"', purl: 'pkg:npm/node-forge', note: 'A range, not a pinned version' },
    { line: 'liboqs-python==0.10.0', purl: 'pkg:pypi/liboqs-python@0.10.0', note: 'Research library, not a migration target' },
  ]
  return (
    <div className="space-y-4">
      <ul className="space-y-2">
        {rows.map((r) => (
          <li
            key={r.line}
            className="grid items-center gap-2 rounded-[10px] border border-line bg-sunken px-4 py-3 font-mono text-[12.5px] md:grid-cols-[1fr_auto_1.25fr]"
          >
            <span className="text-ink">{r.line}</span>
            <ArrowRight size={14} className="hidden text-accent md:block" aria-hidden="true" />
            <span className="text-ink-soft">
              {r.purl}
              {r.note && (
                <span className="mt-1 flex items-center gap-1.5 font-sans text-[12px] text-high">
                  <Warning size={13} weight="bold" /> {r.note}
                </span>
              )}
            </span>
          </li>
        ))}
      </ul>
      <ul className="flex flex-wrap gap-2 text-ink-soft" aria-label="Supported ecosystems">
        {ECOSYSTEMS.map((e) => (
          <li
            key={e.slug}
            title={e.name}
            className="flex h-11 w-11 items-center justify-center rounded-[10px] border border-line bg-surface transition-colors hover:text-ink"
          >
            <span
              role="img"
              aria-label={e.name}
              className="logo-mask h-5 w-5"
              style={{
                maskImage: `url(https://cdn.simpleicons.org/${e.slug})`,
                WebkitMaskImage: `url(https://cdn.simpleicons.org/${e.slug})`,
              }}
            />
          </li>
        ))}
      </ul>
    </div>
  )
}

// The AES S-box starting four bytes into a row, as it sits in a compiled binary.
const HEX = [
  ['00a3f0', '4c 8b 05 11 63 7c 77 7b f2 6b 6f c5'],
  ['00a3fc', '30 01 67 2b fe d7 ab 76 ca 82 c9 7d'],
  ['00a408', 'fa 59 47 f0 ad d4 a2 af 9c a4 72 c0'],
]
const RULES = ['aes_sbox', 'sha256_constants', 'oid_rsa_encryption', 'openssl_legacy_symbols', 'liboqs_symbols', 'embedded_private_key']

function YaraDemo() {
  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-[10px] bg-inverse p-5 font-mono text-[13px] leading-[1.9] text-on-inverse/45">
        {HEX.map(([off, bytes], row) => (
          <div key={off} className="whitespace-nowrap">
            <span className="mr-5 text-on-inverse/35">{off}</span>
            {bytes.split(' ').map((b, i) => {
              const idx = row * 12 + i
              return (
                <span key={i} className={`mr-2 ${idx >= 4 ? 'text-on-inverse' : ''}`}>
                  {b}
                </span>
              )
            })}
          </div>
        ))}
        <p className="mt-3 border-t border-on-inverse/15 pt-3 text-[12.5px] text-on-inverse/70">
          rule <span className="text-on-inverse">aes_sbox</span> matched at 0x00a3f4
        </p>
      </div>
      <ul className="flex flex-wrap gap-2">
        {RULES.map((r) => (
          <li key={r} className="rounded-full border border-line bg-surface px-3 py-1 font-mono text-[12px] text-ink-soft">
            {r}
          </li>
        ))}
        <li className="px-1 py-1 text-[12.5px] text-ink-muted">and 24 more</li>
      </ul>
    </div>
  )
}

function TaintDemo() {
  return (
    <div className="space-y-3">
      <Code>
        <Hit>KEY_BITS = 1024</Hit>
        {'\n\n'}
        <span className="text-ink-muted">def</span> make_key():{'\n'}
        {'    '}
        <span className="text-ink-muted">return</span> rsa.generate_private_key(65537, <Hit>KEY_BITS</Hit>)
      </Code>
      <p className="flex items-center gap-2 pl-1 text-[13px] text-ink-muted">
        <ArrowDown size={14} className="text-accent" /> The value is followed from the assignment into the call.
      </p>
      <Finding name="RSA-1024, parameter_source: dataflow" meta="Critical" />
    </div>
  )
}

// An example certificate. The bar and X are worked out from today's date.
const NOT_BEFORE = new Date('2025-03-01T00:00:00Z').getTime()
const NOT_AFTER = new Date('2027-03-01T00:00:00Z').getTime()

function CertDemo() {
  const [now] = useState(() => Date.now())
  const pct = Math.min(Math.max((now - NOT_BEFORE) / (NOT_AFTER - NOT_BEFORE), 0), 1)
  const left = Math.max(0, (NOT_AFTER - now) / (365.2425 * 864e5))
  const fields = [
    ['Subject', 'CN=payments.internal (example)'],
    ['Public key', 'RSA 2048'],
    ['Signature', 'sha256WithRSAEncryption'],
    ['Validity', '2025-03-01 to 2027-03-01'],
  ]
  return (
    <div className="space-y-3">
      <dl className="grid gap-x-8 gap-y-2.5 rounded-[10px] border border-line bg-sunken p-5 font-mono text-[12.5px] sm:grid-cols-[auto_1fr]">
        {fields.map(([k, v]) => (
          <div key={k} className="contents">
            <dt className="text-ink-muted">{k}</dt>
            <dd className="mb-2 text-ink sm:mb-0">{v}</dd>
          </div>
        ))}
      </dl>
      <div className="rounded-[10px] border border-line bg-surface p-5">
        <div className="relative h-2 rounded-full bg-accent-soft">
          <div className="absolute inset-y-0 left-0 rounded-full bg-accent" style={{ width: `${pct * 100}%` }} />
          <div className="absolute -top-1.5 h-5 w-[2px] -translate-x-1/2 rounded-full bg-ink" style={{ left: `${pct * 100}%` }} />
        </div>
        <div className="mt-2 flex justify-between font-mono text-[11.5px] text-ink-muted">
          <span>notBefore</span>
          <span>notAfter</span>
        </div>
        <p className="mt-3 font-mono text-[13px] text-ink">X = {left.toFixed(1)} years left, measured</p>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ data */

type Tier = {
  id: string
  tier: string
  engine: string
  covers: string
  title: string
  body: string
  facts: [string, string][]
  Demo: () => ReactNode
}

const TIERS: Tier[] = [
  {
    id: 'baseline',
    tier: 'Baseline',
    engine: 'Regular expressions',
    covers: 'Every file without a grammar',
    title: 'A floor under every file.',
    body: 'One combined prefilter runs before the individual patterns, so the regex floor stays fast enough to leave on everywhere.',
    facts: [
      ['1.9 MB/s', 'throughput on real code'],
      ['0.2 MB/s', 'with fifteen separate regexes'],
      ['Any text', 'C, Go, Rust, config, scripts'],
    ],
    Demo: BaselineDemo,
  },
  {
    id: 'ast',
    tier: 'Tier 1',
    engine: 'tree-sitter',
    covers: 'Python, JavaScript, TypeScript, Java',
    title: 'Reads the real arguments at the call site.',
    body: 'Source is parsed into a syntax tree, so a key size or curve comes from the code itself and is recorded as measured.',
    facts: [
      ['4', 'languages, 8 file extensions'],
      ['literal', 'parameter source recorded'],
      ['Call site', 'arguments, not keywords'],
    ],
    Demo: TreeSitterDemo,
  },
  {
    id: 'deps',
    tier: 'Tier 2',
    engine: 'Manifest parsing',
    covers: '11 manifest formats, 8 ecosystems',
    title: 'Every crypto library, named to the version.',
    body: 'Dependencies resolve to package URLs, so advisories can be matched and research-only libraries get flagged.',
    facts: [
      ['11', 'manifest formats'],
      ['8', 'ecosystems'],
      ['purl', 'identity on every package'],
    ],
    Demo: ManifestDemo,
  },
  {
    id: 'yara',
    tier: 'Tier 3',
    engine: 'YARA-X',
    covers: 'Binaries and firmware',
    title: 'Finds cryptography inside compiled code.',
    body: 'Signatures match the tables, OIDs, symbols and embedded keys that survive compilation. No source is needed.',
    facts: [
      ['30', 'compiled rules'],
      ['~145 MB/s', 'over binaries'],
      ['No source', 'needed at all'],
    ],
    Demo: YaraDemo,
  },
  {
    id: 'taint',
    tier: 'Tier 4',
    engine: 'OpenGrep taint',
    covers: 'Seven languages, within a file',
    title: 'Follows a value to where it is used.',
    body: 'Key sizes, curves and algorithm names that arrive through a variable are traced into the call that uses them.',
    facts: [
      ['19', 'dataflow rules'],
      ['7', 'languages, incl. Go, C#, Ruby, PHP'],
      ['dataflow', 'parameter source recorded'],
    ],
    Demo: TaintDemo,
  },
  {
    id: 'x509',
    tier: 'Tier 5',
    engine: 'X.509 parsing',
    covers: 'Certificates',
    title: 'Certificates, actually parsed.',
    body: 'A certificate is exposed for as long as it is trusted, so its X comes from its own validity window.',
    facts: [
      ['notAfter', 'drives X, not a guess'],
      ['Key + signature', 'algorithm and size read out'],
      ['cryptography', 'the parser underneath'],
    ],
    Demo: CertDemo,
  },
]

/* ------------------------------------------------------------------ view */

const AUTOPLAY_MS = 7000

export function Tiers() {
  const [active, setActive] = useState(0)
  const [auto, setAuto] = useState(true)
  const [paused, setPaused] = useState(false)
  const reduce = useReducedMotion()
  const root = useRef<HTMLDivElement>(null)
  const inView = useInView(root, { amount: 0.4 })
  const playing = auto && !paused && inView && !reduce
  const tier = TIERS[active]

  // Walk through the tiers while the section is on screen, until the visitor
  // picks one themselves.
  useEffect(() => {
    if (!playing) return
    const id = window.setTimeout(() => setActive((a) => (a + 1) % TIERS.length), AUTOPLAY_MS)
    return () => window.clearTimeout(id)
  }, [playing, active])

  const pick = (i: number) => {
    setActive(i)
    setAuto(false)
  }

  return (
    <section id="detection" className="scroll-mt-20 border-t border-line py-24 md:py-32">
      <div className="mx-auto max-w-[1240px] px-4 md:px-8">
        <Reveal className="max-w-[760px]">
          <h2 className="text-[36px] font-semibold leading-[1.05] tracking-[-0.04em] md:text-[52px]">
            Six ways to find cryptography.
          </h2>
          <p className="mt-5 max-w-[58ch] text-[17px] leading-relaxed text-ink-soft">
            Each tier reads a different kind of evidence. Every scan says which tiers ran, so &ldquo;found nothing&rdquo;
            never hides &ldquo;did not look&rdquo;.
          </p>
        </Reveal>

        <div
          ref={root}
          className="mt-14 grid grid-cols-1 gap-5 lg:grid-cols-[340px_1fr]"
          onPointerEnter={(e) => e.pointerType === 'mouse' && setPaused(true)}
          onPointerLeave={() => setPaused(false)}
        >
          <div
            role="tablist"
            aria-label="Detection tiers"
            aria-orientation="vertical"
            className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-1 lg:content-start"
          >
            {TIERS.map((t, i) => {
              const on = i === active
              return (
                <button
                  key={t.id}
                  role="tab"
                  id={`tier-tab-${t.id}`}
                  aria-selected={on}
                  aria-controls="tier-panel"
                  onClick={() => pick(i)}
                  className={`relative overflow-hidden rounded-[12px] border px-4 py-3.5 text-left transition-colors lg:px-5 lg:py-4 ${
                    on ? 'border-line-strong bg-surface shadow-soft' : 'border-transparent hover:bg-surface/60'
                  }`}
                >
                  {on && (
                    <motion.span
                      layoutId="tier-bar"
                      className="absolute inset-y-3 left-0 w-[3px] rounded-full bg-accent"
                      transition={{ type: 'spring', stiffness: 400, damping: 34 }}
                    />
                  )}
                  <span className={`block font-mono text-[12px] ${on ? 'text-accent' : 'text-ink-muted'}`}>{t.tier}</span>
                  <span className={`mt-1 block text-[15px] font-semibold tracking-[-0.01em] ${on ? 'text-ink' : 'text-ink-soft'}`}>
                    {t.engine}
                  </span>
                  <span className="mt-0.5 hidden text-[13px] text-ink-muted lg:block">{t.covers}</span>
                  {on && playing && (
                    <motion.span
                      key={`progress-${active}`}
                      className="absolute inset-x-0 bottom-0 h-[2px] origin-left bg-accent/50"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: AUTOPLAY_MS / 1000, ease: 'linear' }}
                    />
                  )}
                </button>
              )
            })}
          </div>

          <div
            id="tier-panel"
            role="tabpanel"
            aria-labelledby={`tier-tab-${tier.id}`}
            className="relative overflow-hidden rounded-[16px] border border-line bg-surface p-6 shadow-soft md:p-9 lg:min-h-[600px]"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={tier.id}
                initial={reduce ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? undefined : { opacity: 0, y: -10 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              >
                <p className="font-mono text-[12.5px] text-ink-muted">
                  {tier.tier} / {tier.engine}
                </p>
                <h3 className="mt-3 text-[26px] font-semibold leading-tight tracking-[-0.03em] md:text-[32px]">{tier.title}</h3>
                <p className="mt-3 max-w-[60ch] text-[15.5px] leading-relaxed text-ink-soft">{tier.body}</p>
                <div className="mt-7">
                  <tier.Demo />
                </div>
                <dl className="mt-8 grid grid-cols-1 gap-5 border-t border-line pt-6 sm:grid-cols-3">
                  {tier.facts.map(([v, k]) => (
                    <div key={k}>
                      <dt className="font-mono text-[20px] font-medium tracking-[-0.02em] text-ink">{v}</dt>
                      <dd className="mt-1 text-[13px] text-ink-muted">{k}</dd>
                    </div>
                  ))}
                </dl>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}
