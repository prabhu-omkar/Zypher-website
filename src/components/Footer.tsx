import { ArrowUp, ArrowUpRight } from '@phosphor-icons/react'
import { ZypherTile } from './ZypherMark'
import { ISSUES_URL, LICENSE_URL, RELEASE_URL, REPO_URL } from '../lib/site'

type Link = { label: string; href: string; external?: boolean }

const COLUMNS: { title: string; links: Link[] }[] = [
  {
    title: 'Product',
    links: [
      { label: 'The app', href: '#product' },
      { label: 'Detection tiers', href: '#detection' },
      { label: 'Risk model', href: '#risk' },
      { label: 'Download', href: '#download' },
    ],
  },
  {
    title: 'Project',
    links: [
      { label: 'Source on GitHub', href: REPO_URL, external: true },
      { label: 'Releases', href: RELEASE_URL, external: true },
      { label: 'Report an issue', href: ISSUES_URL, external: true },
      { label: 'MIT licence', href: LICENSE_URL, external: true },
    ],
  },
  {
    title: 'Standards',
    links: [
      { label: 'FIPS 203, ML-KEM', href: 'https://csrc.nist.gov/pubs/fips/203/final', external: true },
      { label: 'FIPS 204, ML-DSA', href: 'https://csrc.nist.gov/pubs/fips/204/final', external: true },
      { label: 'FIPS 205, SLH-DSA', href: 'https://csrc.nist.gov/pubs/fips/205/final', external: true },
      { label: 'NIST IR 8547', href: 'https://csrc.nist.gov/pubs/ir/8547/ipd', external: true },
    ],
  },
]

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-line bg-sunken/50">
      <div className="mx-auto max-w-[1240px] px-4 pt-16 md:px-8 md:pt-20">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.3fr_2fr]">
          <div className="max-w-[38ch]">
            <a href="#top" className="inline-flex items-center gap-3" aria-label="Zypher, back to top">
              <ZypherTile />
              <span className="text-[18px] font-semibold tracking-[-0.02em]">Zypher</span>
            </a>
            <p className="mt-5 text-[15.5px] leading-relaxed text-ink-soft">
              Cryptographic discovery and post-quantum migration intelligence, offline.
            </p>
            <p className="mt-5 text-[13.5px] leading-relaxed text-ink-muted">
              Built for Smart India Hackathon 2026, NTRO problem statement 26164.
            </p>
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <h2 className="text-[13px] font-semibold text-ink">{col.title}</h2>
                <ul className="mt-4 space-y-3">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <a
                        href={l.href}
                        target={l.external ? '_blank' : undefined}
                        rel={l.external ? 'noreferrer' : undefined}
                        className="group inline-flex items-center gap-1 text-[14.5px] text-ink-soft transition-colors hover:text-ink"
                      >
                        {l.label}
                        {l.external && (
                          <ArrowUpRight
                            size={12}
                            weight="bold"
                            className="text-ink-muted opacity-0 transition-opacity group-hover:opacity-100"
                          />
                        )}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-16 flex flex-col-reverse items-start justify-between gap-4 border-t border-line py-6 text-[13px] text-ink-muted sm:flex-row sm:items-center">
          <p>&copy; 2026 Omkar Prabhu. Released under the MIT licence.</p>
          <a
            href="#top"
            className="inline-flex items-center gap-2 rounded-full border border-line-strong bg-surface px-3.5 py-1.5 text-ink-soft transition-colors hover:text-ink"
          >
            <ArrowUp size={13} weight="bold" />
            Back to top
          </a>
        </div>
      </div>

      {/* The wordmark, set large and cropped by the bottom edge. */}
      <p
        aria-hidden="true"
        className="pointer-events-none -mb-[0.24em] select-none text-center text-[26vw] font-semibold leading-[0.8] tracking-[-0.06em] text-line lg:text-[300px]"
      >
        Zypher
      </p>
    </footer>
  )
}
