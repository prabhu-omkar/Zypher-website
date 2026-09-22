// The Zypher mark, identical to frontend/src/components/ui/Brand.jsx: a
// geometric Z cut from a shield, drawn in currentColor.
export function ZypherMark({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none">
      <path
        d="M12 2.6 20 5.4v6.1c0 4.7-3.2 8.6-8 9.9-4.8-1.3-8-5.2-8-9.9V5.4L12 2.6Z"
        fill="currentColor"
        opacity="0.14"
      />
      <path
        d="M12 2.6 20 5.4v6.1c0 4.7-3.2 8.6-8 9.9-4.8-1.3-8-5.2-8-9.9V5.4L12 2.6Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M8.6 8.4h6.8L8.6 15.2h6.8"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function ZypherTile({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const box = { sm: 'h-8 w-8 rounded-[9px]', md: 'h-9 w-9 rounded-[10px]', lg: 'h-14 w-14 rounded-[16px]' }[size]
  const mark = { sm: 'h-[17px] w-[17px]', md: 'h-[19px] w-[19px]', lg: 'h-7 w-7' }[size]
  return (
    <span className={`inline-flex shrink-0 items-center justify-center bg-solid text-on-solid ${box}`}>
      <ZypherMark className={mark} />
    </span>
  )
}
