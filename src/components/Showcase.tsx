import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { Play, X } from '@phosphor-icons/react'
import { asset } from '../lib/asset'

// Real screenshots of the v1 desktop app, captured from a scan of Zypher's own
// backend source with the "Financial records" profile.
const VIEWS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    src: asset('shots/dashboard.webp'),
    caption: 'Quantum readiness, what is already past its start date, and how risk shifts as the horizon moves.',
  },
  {
    id: 'inventory',
    label: 'Inventory',
    src: asset('shots/inventory.webp'),
    caption: 'Every distinct asset with its location, quantum status and risk. Drag Z and the whole list re-bands.',
  },
  {
    id: 'scan',
    label: 'Scan',
    src: asset('shots/scan.webp'),
    caption: 'Point it at a folder, a Git repository or an archive, then say what the cryptography protects.',
  },
] as const

export function Showcase() {
  const [active, setActive] = useState<(typeof VIEWS)[number]['id']>('dashboard')
  const [film, setFilm] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'start 30%'] })
  const rotateX = useTransform(scrollYProgress, [0, 1], [16, 0])
  const scale = useTransform(scrollYProgress, [0, 1], [0.92, 1])
  const view = VIEWS.find((v) => v.id === active)!

  useEffect(() => {
    if (!film) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setFilm(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [film])

  return (
    <section id="product" className="relative scroll-mt-20 py-24 md:py-32">
      <div className="mx-auto max-w-[1240px] px-4 md:px-8">
        <div className="mx-auto max-w-[920px] text-center">
          <h2 className="text-[36px] font-semibold leading-[1.05] tracking-[-0.04em] md:text-[52px]">
            The whole estate, in one window.
          </h2>
          <p className="mx-auto mt-5 max-w-[56ch] text-balance text-[17px] leading-relaxed text-ink-soft">
            Every asset carries its evidence, its risk, and the date its migration has to start.
          </p>
        </div>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <div role="tablist" aria-label="App views" className="inline-flex rounded-full border border-line bg-surface p-1 shadow-soft">
            {VIEWS.map((v) => (
              <button
                key={v.id}
                role="tab"
                aria-selected={active === v.id}
                onClick={() => setActive(v.id)}
                className={`relative h-9 rounded-full px-4 text-[14px] font-medium transition-colors ${
                  active === v.id ? 'text-on-solid' : 'text-ink-soft hover:text-ink'
                }`}
              >
                {active === v.id && (
                  <motion.span
                    layoutId="tab-pill"
                    className="absolute inset-0 rounded-full bg-solid"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  />
                )}
                <span className="relative">{v.label}</span>
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setFilm(true)}
            className="inline-flex h-11 items-center gap-2 rounded-full px-4 text-[14px] font-medium text-accent transition-colors hover:text-accent-hover"
          >
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-accent-soft">
              <Play size={13} weight="fill" />
            </span>
            Watch the film
          </button>
        </div>

        <div ref={ref} className="mt-10 [perspective:1600px]">
          <motion.figure
            style={reduce ? undefined : { rotateX, scale, transformOrigin: '50% 0%' }}
            className="mx-auto max-w-[1120px]"
          >
            <div className="overflow-hidden rounded-[16px] border border-line-strong bg-surface shadow-pop">
              <div className="flex h-9 items-center gap-1.5 border-b border-line bg-sunken px-4" aria-hidden="true">
                <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
                <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
                <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
                <span className="ml-3 text-[12px] text-ink-muted">Zypher</span>
              </div>
              <div className="relative aspect-[16/10] bg-[#f6f7f9]">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.img
                    key={view.id}
                    src={view.src}
                    alt={`Zypher ${view.label} view`}
                    width={2880}
                    height={1800}
                    loading="lazy"
                    decoding="async"
                    initial={reduce ? false : { opacity: 0, scale: 1.015 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute inset-0 h-full w-full object-cover object-top"
                  />
                </AnimatePresence>
              </div>
            </div>
            <figcaption className="mx-auto mt-5 max-w-[62ch] text-center text-[14.5px] text-ink-muted">
              {view.caption}
            </figcaption>
          </motion.figure>
        </div>
      </div>

      <AnimatePresence>
        {film && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(10,12,16,0.72)] p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setFilm(false)}
            role="dialog"
            aria-modal="true"
            aria-label="Zypher launch film"
          >
            <motion.div
              initial={{ scale: 0.94, y: 12 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 26 }}
              className="relative w-full max-w-[1100px] overflow-hidden rounded-[16px] bg-black shadow-pop"
              onClick={(e) => e.stopPropagation()}
            >
              <video src={asset('zypher-film.mp4')} poster={asset('og.jpg')} controls autoPlay playsInline className="aspect-video w-full" />
              <button
                type="button"
                onClick={() => setFilm(false)}
                className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-[rgba(22,24,29,0.7)] text-white backdrop-blur"
                aria-label="Close film"
                autoFocus
              >
                <X size={16} weight="bold" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
