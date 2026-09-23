import { motion, useScroll, useSpring } from 'motion/react'
import { Nav } from './components/Nav'
import { Hero } from './components/Hero'
import { Deadline } from './components/Deadline'
import { Showcase } from './components/Showcase'
import { Tiers } from './components/Tiers'
import { Pipeline } from './components/Pipeline'
import { RiskModel } from './components/RiskModel'
import { Principles } from './components/Principles'
import { Outputs } from './components/Outputs'
import { Download } from './components/Download'
import { Footer } from './components/Footer'
import { useTheme } from './lib/theme'

// z-index scale: nav 40, film dialog 50, grain 60, progress 70.
function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 40, mass: 0.2 })
  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[70] h-[2px] origin-left bg-accent"
    />
  )
}

export default function App() {
  const { theme, toggle } = useTheme()
  return (
    <div className="grain">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[80] focus:rounded-full focus:bg-solid focus:px-4 focus:py-2 focus:text-on-solid"
      >
        Skip to content
      </a>
      <ScrollProgress />
      <Nav theme={theme} onToggleTheme={toggle} />
      <main id="main">
        <Hero theme={theme} />
        <Deadline />
        <Showcase />
        <Tiers />
        <Pipeline />
        <RiskModel />
        <Outputs />
        <Principles />
        <Download />
      </main>
      <Footer />
    </div>
  )
}
