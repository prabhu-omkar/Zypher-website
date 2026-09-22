import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react'
import { DownloadSimple, GithubLogo, List, Moon, Sun, X } from '@phosphor-icons/react'
import { ZypherTile } from './ZypherMark'
import { DOWNLOAD_URL, REPO_URL } from '../lib/site'
import type { Theme } from '../lib/theme'

const LINKS = [
  { href: '#product', label: 'Product' },
  { href: '#detection', label: 'Detection' },
  { href: '#risk', label: 'Risk model' },
  { href: '#download', label: 'Download' },
]

export function Nav({ theme, onToggleTheme }: { theme: Theme; onToggleTheme: () => void }) {
  const { scrollY } = useScroll()
  const [raised, setRaised] = useState(false)
  const [open, setOpen] = useState(false)
  const [current, setCurrent] = useState('')

  // Mark the link for whichever section is crossing the middle of the screen.
  useEffect(() => {
    const els = LINKS
      .map((l) => document.querySelector(l.href))
      .filter((el): el is Element => !!el)
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setCurrent(`#${e.target.id}`)
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  // Only flips state when the threshold is crossed, not on every frame.
  useMotionValueEvent(scrollY, 'change', (v) => {
    const next = v > 24
    if (next !== raised) setRaised(next)
  })

  return (
    <header className="fixed inset-x-0 top-0 z-40 px-3 pt-3 md:px-6">
      <nav
        className={`mx-auto flex h-14 max-w-[1240px] items-center justify-between rounded-full pl-2.5 pr-2 transition-[background-color,box-shadow,border-color] duration-500 ${
          raised
            ? 'border border-line bg-surface/75 shadow-lift backdrop-blur-xl'
            : 'border border-transparent bg-transparent'
        }`}
        aria-label="Main"
      >
        <a href="#top" className="flex items-center gap-2.5 rounded-full pr-2" aria-label="Zypher home">
          <ZypherTile size="sm" />
          <span className="text-[15px] font-semibold tracking-[-0.02em]">Zypher</span>
        </a>

        <ul className="hidden items-center gap-1 lg:flex">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                aria-current={current === l.href ? 'true' : undefined}
                className={`relative isolate rounded-full px-3.5 py-2 text-[14px] transition-colors hover:text-ink ${
                  current === l.href ? 'text-ink' : 'text-ink-soft'
                }`}
              >
                {current === l.href && (
                  <motion.span
                    layoutId="nav-current"
                    className="absolute inset-0 -z-10 rounded-full bg-sunken"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  />
                )}
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-1.5">
          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer"
            className="hidden h-10 items-center gap-2 rounded-full px-3 text-[14px] text-ink-soft transition-colors hover:text-ink sm:inline-flex"
          >
            <GithubLogo size={18} weight="regular" />
            GitHub
          </a>
          <button
            type="button"
            onClick={onToggleTheme}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-ink-soft transition-colors hover:text-ink active:scale-95"
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={theme}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="inline-flex"
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </motion.span>
            </AnimatePresence>
          </button>
          <a
            href={DOWNLOAD_URL}
            className="hidden h-10 items-center gap-2 rounded-full bg-solid px-4 text-[14px] font-medium text-on-solid transition-colors hover:bg-solid-hover active:scale-[0.98] sm:inline-flex"
          >
            <DownloadSimple size={16} weight="bold" />
            Download
          </a>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-ink lg:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            {open ? <X size={20} /> : <List size={20} />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto mt-2 max-w-[1240px] rounded-[16px] border border-line bg-surface p-2 shadow-pop lg:hidden"
          >
            {[...LINKS, { href: REPO_URL, label: 'GitHub' }].map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="block rounded-[10px] px-4 py-3 text-[15px] text-ink-soft hover:bg-sunken hover:text-ink"
              >
                {l.label}
              </a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
