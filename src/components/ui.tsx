import { useRef, useState, type ReactNode } from 'react'
import { motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react'
import { Check, Copy } from '@phosphor-icons/react'

type ButtonProps = {
  href: string
  children: ReactNode
  variant?: 'solid' | 'ghost'
  size?: 'md' | 'lg'
  magnetic?: boolean
  external?: boolean
  download?: boolean
}

const base =
  'inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium transition-[background-color,border-color,color,box-shadow] duration-200 active:scale-[0.98]'
const variants = {
  solid: 'bg-solid text-on-solid hover:bg-solid-hover shadow-lift',
  ghost: 'border border-line-strong bg-surface/70 text-ink hover:border-ink-muted backdrop-blur',
}
const sizes = { md: 'h-10 px-4 text-[14px]', lg: 'h-12 px-6 text-[15px]' }

// Pulls a few pixels toward the pointer. Driven by motion values so pointer
// movement never re-renders React.
export function Button({ href, children, variant = 'solid', size = 'md', magnetic, external, download }: ButtonProps) {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLAnchorElement>(null)
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const x = useSpring(mx, { stiffness: 220, damping: 18, mass: 0.4 })
  const y = useSpring(my, { stiffness: 220, damping: 18, mass: 0.4 })
  const live = magnetic && !reduce

  return (
    <motion.a
      ref={ref}
      href={href}
      download={download || undefined}
      target={external ? '_blank' : undefined}
      rel={external ? 'noreferrer' : undefined}
      style={live ? { x, y } : undefined}
      onPointerMove={(e) => {
        if (!live || !ref.current || e.pointerType !== 'mouse') return
        const r = ref.current.getBoundingClientRect()
        mx.set((e.clientX - (r.left + r.width / 2)) * 0.18)
        my.set((e.clientY - (r.top + r.height / 2)) * 0.28)
      }}
      onPointerLeave={() => {
        mx.set(0)
        my.set(0)
      }}
      className={`${base} ${variants[variant]} ${sizes[size]}`}
    >
      {children}
    </motion.a>
  )
}

export function CopyButton({ value, label }: { value: string; label: string }) {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle')
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value)
          setState('copied')
        } catch {
          setState('failed')
        }
        window.setTimeout(() => setState('idle'), 1800)
      }}
      className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border border-line-strong bg-surface px-3 text-[12.5px] font-medium text-ink-soft transition-colors hover:text-ink active:scale-[0.97]"
      aria-label={label}
    >
      {state === 'copied' ? <Check size={14} weight="bold" className="text-low" /> : <Copy size={14} />}
      <span aria-live="polite">{state === 'copied' ? 'Copied' : state === 'failed' ? 'Select and copy' : 'Copy'}</span>
    </button>
  )
}

// Fade-and-rise on first entry into the viewport.
export function Reveal({
  children,
  delay = 0,
  className,
  as = 'div',
}: {
  children: ReactNode
  delay?: number
  className?: string
  as?: 'div' | 'li' | 'section'
}) {
  const reduce = useReducedMotion()
  const Tag = motion[as]
  return (
    <Tag
      className={className}
      initial={reduce ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </Tag>
  )
}
