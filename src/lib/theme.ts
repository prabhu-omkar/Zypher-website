import { useCallback, useEffect, useState } from 'react'

export type Theme = 'light' | 'dark'

function systemTheme(): Theme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function readStored(): Theme | null {
  try {
    const t = localStorage.getItem('zypher-theme')
    return t === 'light' || t === 'dark' ? t : null
  } catch {
    return null
  }
}

// The resolved theme, following the system until the visitor picks one.
export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => readStored() ?? systemTheme())

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => {
      if (!readStored()) setThemeState(systemTheme())
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const toggle = useCallback(() => {
    setThemeState((prev) => {
      const next: Theme = prev === 'dark' ? 'light' : 'dark'
      document.documentElement.dataset.theme = next
      try {
        localStorage.setItem('zypher-theme', next)
      } catch {
        /* storage blocked: the choice lasts for this visit only */
      }
      return next
    })
  }, [])

  return { theme, toggle }
}
