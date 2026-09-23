import { Fragment, useState, type ReactNode } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { ArrowUpRight, BracketsCurly, FileHtml, Table, type Icon } from '@phosphor-icons/react'
import { Reveal } from './ui'
import csvSample from '../lib/csv-sample.json'
import { asset } from '../lib/asset'

// One component from the CycloneDX export of the scan behind the screenshots
// (Zypher scanning its own backend). Only the path prefix has been shortened.
const CBOM = `{
  "bomFormat": "CycloneDX",
  "specVersion": "1.6",
  "components": [
    {
      "bom-ref": "ART-3502572C",
      "type": "cryptographic-asset",
      "name": "RSA-1024",
      "evidence": {
        "occurrences": [
          {
            "location": "backend/tests/fixtures/taint/Vault.cs",
            "line": 7,
            "snippet": "return new RSACryptoServiceProvider(bits);"
          }
        ]
      },
      "cryptoProperties": {
        "assetType": "algorithm",
        "algorithmProperties": {
          "algorithmFamily": "RSA",
          "algorithmClass": "asymmetric_factoring",
          "keyLength": 1024,
          "quantumVulnerability": "classically_broken",
          "brokenBy": "Classical Factorization (NFS) & Shor's Algorithm"
        },
        "classification": {
          "businessCriticality": "High",
          "dataShelfLifeYears": 7.0,
          "estimatedMigrationYears": 0.31,
          "cryptoUsage": "key_transport",
          "migrationEstimateBasis": "0.25y base (source_code ownership) x 1 for 1 occurrence x 1.2 for two-party negotiation x 1.15 for high change control x 0.9 for an already-indirected parameter = 0.31 years."
        }
      }
    }
  ]
}`

// Keys in the accent, strings in ink, numbers warm.
function highlight(line: string) {
  const parts: { t: string; c: string }[] = []
  const re = /("(?:[^"\\]|\\.)*")(\s*:)?|(-?\d+(?:\.\d+)?)|([{}[\],:])/g
  let last = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(line))) {
    if (m.index > last) parts.push({ t: line.slice(last, m.index), c: '' })
    if (m[1] && m[2]) {
      parts.push({ t: m[1], c: 'text-accent' })
      parts.push({ t: m[2], c: 'text-ink-muted' })
    } else if (m[1]) parts.push({ t: m[1], c: 'text-ink' })
    else if (m[3]) parts.push({ t: m[3], c: 'text-high' })
    else parts.push({ t: m[4], c: 'text-ink-muted' })
    last = re.lastIndex
  }
  if (last < line.length) parts.push({ t: line.slice(last), c: '' })
  return parts
}

function CbomPreview() {
  const lines = CBOM.split('\n')
  return (
    <pre className="h-full overflow-auto p-5 font-mono text-[12.5px] leading-[1.75] md:p-6">
      {lines.map((line, i) => {
        const indent = line.match(/^\s*/)?.[0].length ?? 0
        return (
          <div key={i} className="grid grid-cols-[2.25rem_1fr]">
            <span className="select-none text-right text-ink-muted/60 pr-4">{i + 1}</span>
            <span className="whitespace-pre-wrap break-words" style={{ paddingLeft: `${indent}ch`, textIndent: `-${indent}ch` }}>
              {highlight(line).map((p, j) => (
                <Fragment key={j}>
                  <span className={p.c}>{p.t}</span>
                </Fragment>
              ))}
            </span>
          </div>
        )
      })}
    </pre>
  )
}

function HtmlPreview() {
  return (
    <div className="h-full overflow-auto bg-[#eef0f4]">
      <img
        src={asset('shots/report-full.webp')}
        alt="A Zypher HTML audit report: executive summary, risk distribution, scan coverage, methodology and the assets requiring action."
        width={1500}
        height={9345}
        loading="lazy"
        decoding="async"
        className="block w-full"
      />
    </div>
  )
}

// The columns that tell the story first; the rest follow on scroll.
const CSV_ORDER = ['Name', 'Risk', 'Must Start By', 'Recommended PQC Standard', 'Found at', 'Quantum Status', 'X (yrs)', 'Y (yrs)']

function CsvPreview() {
  const order = CSV_ORDER.map((c) => csvSample.columns.indexOf(c))
  const columns = order.map((i) => csvSample.columns[i])
  const rows = csvSample.rows.map((r) => order.map((i) => r[i]))
  const [today] = useState(() => new Date().toISOString().slice(0, 10))
  const tone = (col: string, cell: string) => {
    if (col === 'Risk') return cell === 'Critical' ? 'text-critical' : 'text-high'
    if (col === 'Recommended PQC Standard') return 'text-accent'
    // A start date already behind us is a breach, not a schedule.
    if (col === 'Must Start By') return cell < today ? 'text-critical' : 'text-ink'
    return ''
  }
  return (
    <div className="h-full overflow-auto">
      <table className="w-max min-w-full border-collapse font-mono text-[11.5px]">
        <thead className="sticky top-0 z-10 bg-sunken">
          <tr>
            {columns.map((c, i) => (
              <th
                key={c}
                scope="col"
                className={`whitespace-nowrap border-b border-line px-3.5 py-3 text-left font-medium text-ink-soft ${
                  i === 0 ? 'sticky left-0 z-10 bg-sunken' : ''
                }`}
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, ri) => (
            <tr key={ri} className="border-b border-line last:border-0">
              {r.map((cell, ci) => (
                <td
                  key={ci}
                  className={`px-3.5 py-3 align-top ${
                    ci === 0 ? 'sticky left-0 min-w-[170px] max-w-[170px] bg-surface text-ink' : 'whitespace-nowrap text-ink-soft'
                  } ${tone(columns[ci], cell)}`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

type Output = {
  id: string
  icon: Icon
  name: string
  body: string
  file: string
  note: string
  open?: { label: string; href: string }
  Preview: () => ReactNode
}

const OUTPUTS: Output[] = [
  {
    id: 'cbom',
    icon: BracketsCurly,
    name: 'CycloneDX 1.6 CBOM',
    body: 'One cryptographic-asset component per finding, with its properties, package URL and every occurrence.',
    file: 'zypher-cbom.json',
    note: 'One real component, path shortened',
    Preview: CbomPreview,
  },
  {
    id: 'html',
    icon: FileHtml,
    name: 'HTML audit report',
    body: 'Nine sections, from the executive summary to the full inventory and migration schedule. Prints cleanly to PDF.',
    file: 'zypher-report.html',
    note: 'The real report, scroll inside',
    open: { label: 'Open full size', href: asset('shots/report-full.webp') },
    Preview: HtmlPreview,
  },
  {
    id: 'csv',
    icon: Table,
    name: 'CSV',
    body: 'One row per asset across 47 columns, for spreadsheets and ticketing.',
    file: 'zypher-inventory.csv',
    note: `Selected columns of ${csvSample.total}, ${csvSample.rows.length} of ${csvSample.assets} rows`,
    Preview: CsvPreview,
  },
]

export function Outputs() {
  const [active, setActive] = useState(0)
  const reduce = useReducedMotion()
  const out = OUTPUTS[active]

  return (
    <section className="border-t border-line py-24 md:py-32">
      <div className="mx-auto grid max-w-[1240px] grid-cols-1 items-start gap-12 px-4 md:px-8 lg:grid-cols-[0.9fr_1.25fr] lg:gap-14">
        <div>
          <Reveal>
            <h2 className="text-[36px] font-semibold leading-[1.05] tracking-[-0.04em] md:text-[52px]">
              Evidence an auditor can check.
            </h2>
            <p className="mt-5 max-w-[46ch] text-[17px] leading-relaxed text-ink-soft">
              Every scan exports to open formats, and every number carries the reasoning that produced it. These are real
              exports from a scan of Zypher&rsquo;s own backend.
            </p>
          </Reveal>
          <div role="tablist" aria-label="Export formats" aria-orientation="vertical" className="mt-10 space-y-2">
            {OUTPUTS.map((o, i) => {
              const on = i === active
              const IconC = o.icon
              return (
                <button
                  key={o.id}
                  role="tab"
                  id={`out-tab-${o.id}`}
                  aria-selected={on}
                  aria-controls="out-panel"
                  onClick={() => setActive(i)}
                  className={`relative grid w-full grid-cols-[44px_1fr] gap-4 rounded-[14px] border p-4 text-left transition-colors md:p-5 ${
                    on ? 'border-line-strong bg-surface shadow-soft' : 'border-transparent hover:bg-surface/60'
                  }`}
                >
                  {on && (
                    <motion.span
                      layoutId="out-bar"
                      className="absolute inset-y-4 left-0 w-[3px] rounded-full bg-accent"
                      transition={{ type: 'spring', stiffness: 400, damping: 34 }}
                    />
                  )}
                  <span
                    className={`flex h-11 w-11 items-center justify-center rounded-[12px] transition-colors ${
                      on ? 'bg-accent text-canvas' : 'bg-accent-soft text-accent'
                    }`}
                  >
                    <IconC size={22} />
                  </span>
                  <span>
                    <span className="block text-[17px] font-semibold tracking-[-0.01em] text-ink">{o.name}</span>
                    <span className="mt-1 block max-w-[46ch] text-[14.5px] leading-relaxed text-ink-soft">{o.body}</span>
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        <Reveal delay={0.1} className="lg:sticky lg:top-28">
          <figure
            id="out-panel"
            role="tabpanel"
            aria-labelledby={`out-tab-${out.id}`}
            className="flex h-[560px] flex-col overflow-hidden rounded-[16px] border border-line bg-surface shadow-lift md:h-[620px]"
          >
            <div className="flex h-11 shrink-0 items-center justify-between gap-4 border-b border-line bg-sunken px-4">
              <span className="font-mono text-[12.5px] text-ink-soft">{out.file}</span>
              {out.open ? (
                <a
                  href={out.open.href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex shrink-0 items-center gap-1 text-[12.5px] font-medium text-accent hover:text-accent-hover"
                >
                  {out.open.label}
                  <ArrowUpRight size={12} weight="bold" />
                </a>
              ) : (
                <span className="truncate text-[12px] text-ink-muted">{out.note}</span>
              )}
            </div>
            <div className="relative min-h-0 flex-1">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={out.id}
                  className="absolute inset-0"
                  initial={reduce ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduce ? undefined : { opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                >
                  <out.Preview />
                </motion.div>
              </AnimatePresence>
            </div>
          </figure>
        </Reveal>
      </div>
    </section>
  )
}
