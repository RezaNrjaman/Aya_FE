/** UI-003: StatusBadge — status label with color indicator */
import { clsx } from 'clsx'

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral'

interface StatusBadgeProps {
  label: string
  variant?: BadgeVariant
  className?: string
}

const BADGE_STYLES: Record<BadgeVariant, string> = {
  success: 'bg-success/15 text-success border-success/30',
  warning: 'bg-warning/15 text-warning border-warning/30',
  danger: 'bg-danger/15 text-danger border-danger/30',
  info: 'bg-info/15 text-info border-info/30',
  neutral: 'bg-dark-600/30 text-dark-300 border-dark-500/30',
}

export function StatusBadge({ label, variant = 'neutral', className }: StatusBadgeProps) {
  return (
    <span className={clsx(
      'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border',
      BADGE_STYLES[variant],
      className,
    )}>
      <span className={clsx('w-1.5 h-1.5 rounded-full', {
        'bg-success': variant === 'success',
        'bg-warning': variant === 'warning',
        'bg-danger': variant === 'danger',
        'bg-info': variant === 'info',
        'bg-dark-400': variant === 'neutral',
      })} />
      {label}
    </span>
  )
}

