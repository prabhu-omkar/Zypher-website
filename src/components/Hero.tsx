import { lazy, Suspense, useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { DownloadSimple, GithubLogo } from '@phosphor-icons/react'
import { Button } from './ui'
import { DOWNLOAD_URL, REPO_URL } from '../lib/site'
import type { Theme } from '../lib/theme'

const CryptoGlobe = lazy(() => import('./CryptoGlobe'))

const rise = (delay: number) => ({
  initial: { opacity: 0, y: 22, filter: 'blur(6px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  transition: { duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] as const },
})

export function Hero({ theme }: { theme: Theme }) {
  const reduce = !!useReducedMotion()
  const m = (d: number) => (reduce ? {} : rise(d))
  const section = useRef<HTMLElement>(null)
  const scan = useRef<(() => void) | null>(null)
  const copy = useRef<HTMLDivElement>(null)

  // The globe sinks and fades a little as the page scrolls away from it.
  const { scrollYProgress } = useScroll({ target: section, offset: ['start start', 'end start'] })
  const globeY = useTransform(scrollYProgress, [0, 1], [0, 140])
  const globeOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0.25])

  return (
    <section
      id="top"
      ref={section}
      className="relative isolate flex min-h-[100dvh] cursor-grab flex-col overflow-hidden active:cursor-grabbing"
    >
      <motion.div className="absolute inset-0 -z-20" style={reduce ? undefined : { y: globeY, opacity: globeOpacity }}>
        <motion.div
          className="absolute inset-0"
          initial={reduce ? false : { opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <Suspense fallback={null}>
            <CryptoGlobe theme={theme} reduced={reduce} target={section} copy={copy} scanRef={scan} />
          </Suspense>
        </motion.div>
      </motion.div>
      {/* A soft pool of canvas colour behind the copy keeps it readable over the globe. */}
      <div aria-hidden="true" className="hero-veil pointer-events-none absolute inset-0 -z-10" />

      <div className="mx-auto flex w-full max-w-[980px] flex-1 flex-col items-center justify-center px-4 pb-20 pt-28 text-center md:px-8">
        <div ref={copy} className="flex flex-col items-center">
          <motion.p
            {...m(0.05)}
            className="mb-7 flex flex-wrap items-center justify-center gap-x-2 gap-y-1.5 text-[13px] font-medium text-ink-soft"
          >
            <span className="whitespace-nowrap rounded-full border border-line-strong bg-surface px-2.5 py-1 text-[12px] text-ink">
              Smart India Hackathon 2026
            </span>
            <span className="whitespace-nowrap">NTRO problem statement 26164</span>
          </motion.p>

          <motion.h1
            {...m(0.15)}
            className="text-[42px] font-semibold leading-[1.02] tracking-[-0.045em] text-ink sm:text-[60px] lg:text-[80px]"
          >
            Every key, found.
            <br />
            <span className="text-ink-muted">Every deadline, dated.</span>
          </motion.h1>

          <motion.p
            {...m(0.28)}
            className="mx-auto mt-7 max-w-[36rem] text-balance text-[17px] leading-relaxed text-ink-soft md:text-[19px]"
          >
            Zypher scans code, binaries, dependencies and certificates offline, scores their quantum risk, and plans your move
            to FIPS 203, 204 and 205.
          </motion.p>

          <motion.div {...m(0.4)} className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Button href={DOWNLOAD_URL} size="lg" magnetic>
              <DownloadSimple size={18} weight="bold" />
              Download for Windows
            </Button>
            <Button href={REPO_URL} size="lg" variant="ghost" external>
              <GithubLogo size={18} />
              View on GitHub
            </Button>
          </motion.div>
        </div>
      </div>

    </section>
  )
}
