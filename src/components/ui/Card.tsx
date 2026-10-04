import type { ReactNode, CSSProperties } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  style?: CSSProperties
}

export function Card({ children, className = '', style }: CardProps) {
  return (
    <div
      className={`bg-[var(--color-surface)] rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] ${className}`}
      style={style}
    >
      {children}
    </div>
  )
}
