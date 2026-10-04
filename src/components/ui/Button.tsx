import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'md' | 'lg'
}

const variantStyles: Record<string, string> = {
  primary:
    'bg-[var(--color-sun)] text-white shadow-[0_6px_0_var(--color-sun-dark)] active:shadow-[0_2px_0_var(--color-sun-dark)] active:translate-y-1',
  secondary:
    'bg-white text-[var(--color-ink)] border-2 border-[var(--color-leaf)] shadow-[0_6px_0_rgba(47,182,140,0.35)] active:shadow-[0_2px_0_rgba(47,182,140,0.35)] active:translate-y-1',
  ghost: 'bg-transparent text-[var(--color-ink-soft)] hover:bg-black/5',
}

const sizeStyles: Record<string, string> = {
  md: 'text-base px-5 py-3 min-h-[56px]',
  lg: 'text-xl px-8 py-4 min-h-[64px]',
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`font-display font-bold rounded-[var(--radius-md)] transition-transform duration-[var(--duration-fast)] ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}
