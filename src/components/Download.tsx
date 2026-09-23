import { ArrowUpRight, DownloadSimple, GithubLogo, ShieldCheck, UserCircleMinus, WindowsLogo } from '@phosphor-icons/react'
import { Button, CopyButton, Reveal } from './ui'
import { ZypherTile } from './ZypherMark'
import { DOWNLOAD_URL, ISSUES_URL, LICENSE_URL, RELEASE, RELEASE_URL, REPO_URL, VERIFY_COMMAND } from '../lib/site'

const REQUIREMENTS = [
  { icon: WindowsLogo, text: 'Windows 10 or 11, 64-bit' },
  { icon: ShieldCheck, text: 'Edge WebView2 Runtime, already on Windows 11' },
  { icon: UserCircleMinus, text: 'No administrator rights needed' },
]

export function Download() {
  return (
    <section id="download" className="scroll-mt-20 border-t border-line py-24 md:py-32">
      <div className="mx-auto max-w-[1240px] px-4 md:px-8">
        <Reveal>
          <div className="hero-glow relative overflow-hidden rounded-[16px] border border-line bg-surface shadow-lift">
            <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr]">
              <div className="p-7 md:p-12">
                <ZypherTile size="lg" />
                <h2 className="mt-8 text-[36px] font-semibold leading-[1.05] tracking-[-0.04em] md:text-[52px]">
                  Download Zypher.
                </h2>
                <p className="mt-4 max-w-[44ch] text-[17px] leading-relaxed text-ink-soft">
                  One installer, a per-user install, and your first scan a few minutes later.
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <Button href={DOWNLOAD_URL} size="lg" magnetic>
                    <DownloadSimple size={18} weight="bold" />
                    Download for Windows
                  </Button>
                  <a
                    href={RELEASE_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-12 items-center gap-1.5 px-2 text-[15px] font-medium text-accent hover:text-accent-hover"
                  >
                    Release notes
                    <ArrowUpRight size={15} weight="bold" />
                  </a>
                </div>
                <p className="mt-4 font-mono text-[13px] text-ink-muted">
                  {RELEASE.file}, {RELEASE.version}, {RELEASE.size}
                </p>
                <ul className="mt-10 space-y-3.5">
                  {REQUIREMENTS.map(({ icon: Icon, text }) => (
                    <li key={text} className="flex items-center gap-3 text-[15px] text-ink-soft">
                      <Icon size={20} className="shrink-0 text-ink" />
                      {text}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col gap-8 border-t border-line bg-sunken/60 p-7 md:p-12 lg:border-l lg:border-t-0">
                <div>
                  <h3 className="text-[16px] font-semibold">Check the file before you run it</h3>
                  <p className="mt-2 text-[14.5px] leading-relaxed text-ink-soft">
                    Run this in PowerShell from the download folder. The hash it prints should match the one below.
                  </p>
                  <div className="mt-4 flex items-center justify-between gap-3 rounded-[10px] border border-line bg-surface p-3 pl-4">
                    <code className="overflow-x-auto whitespace-nowrap font-mono text-[13px] text-ink">{VERIFY_COMMAND}</code>
                    <CopyButton value={VERIFY_COMMAND} label="Copy the PowerShell command" />
                  </div>
                  <div className="mt-3 rounded-[10px] border border-line bg-surface p-4">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[12.5px] font-medium text-ink-muted">SHA-256</span>
                      <CopyButton value={RELEASE.sha256} label="Copy the SHA-256 hash" />
                    </div>
                    <code className="mt-2 block break-all font-mono text-[13px] leading-relaxed text-ink">{RELEASE.sha256}</code>
                  </div>
                </div>

                <div>
                  <h3 className="text-[16px] font-semibold">Where it goes</h3>
                  <p className="mt-2 text-[14.5px] leading-relaxed text-ink-soft">
                    The wizard installs to <code className="font-mono text-[13px] text-ink">{RELEASE.installPath}</code>{' '}
                    and keeps scans in local files. A MongoDB connection is optional.
                  </p>
                </div>

                <div className="mt-auto flex flex-wrap gap-x-6 gap-y-3 border-t border-line pt-6 text-[14.5px]">
                  <a href={REPO_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-ink hover:text-accent">
                    <GithubLogo size={17} />
                    Source on GitHub
                  </a>
                  <a href={`${REPO_URL}#4-building-from-source`} target="_blank" rel="noreferrer" className="text-ink-soft hover:text-ink">
                    Build from source
                  </a>
                  <a href={ISSUES_URL} target="_blank" rel="noreferrer" className="text-ink-soft hover:text-ink">
                    Report an issue
                  </a>
                  <a href={LICENSE_URL} target="_blank" rel="noreferrer" className="text-ink-soft hover:text-ink">
                    MIT licence
                  </a>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
