'use client'

import { motion } from 'framer-motion'

interface StreakBadgeProps {
  streak: number
  size?: 'sm' | 'md' | 'lg'
}

const FlameIcon = ({ color = '#F59E6A', size = 40 }: { color?: string; size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 2C12 2 10.5 6 8 8C5.5 10 4 12.5 4 15C4 18.866 7.582 22 12 22C16.418 22 20 18.866 20 15C20 12.5 18.5 10 16 8C13.5 6 12 2 12 2Z"
      fill={color}
      fillOpacity="0.9"
    />
    <path
      d="M12 8C12 8 11 11 9.5 12.5C8 14 8 16 8 16C8 18 9.8 19.5 12 19.5C14.2 19.5 16 18 16 16C16 14 14.5 12 12 8Z"
      fill={color}
      fillOpacity="0.5"
    />
    <path
      d="M12 13C12 13 11.5 15 10.5 15.5C10 15.75 10 16.5 10 17C10 18.1 10.9 19 12 19C13.1 19 14 18.1 14 17C14 16.5 14 16 13.5 15.5C12.5 15 12 13 12 13Z"
      fill="white"
      fillOpacity="0.8"
    />
  </svg>
)

const flickerAnimation = {
  scaleY: [1, 0.97, 1.02, 0.98, 1] as number[],
  opacity: [1, 0.85, 0.92, 0.88, 1] as number[],
}

const flickerTransition = {
  duration: 2.5,
  repeat: Infinity,
  ease: 'easeInOut' as const,
}

export default function StreakBadge({ streak, size = 'md' }: StreakBadgeProps) {
  const sizes = {
    sm: { flame: 28, number: '2rem', label: '0.65rem' },
    md: { flame: 40, number: '3rem', label: '0.75rem' },
    lg: { flame: 56, number: '4.5rem', label: '0.875rem' },
  }

  const s = sizes[size]

  return (
    <div className="flex items-center gap-2">
      <motion.div
        animate={flickerAnimation}
        transition={flickerTransition}
        style={{ transformOrigin: 'bottom center', display: 'inline-flex' }}
      >
        <FlameIcon
          color={streak > 0 ? '#F59E6A' : '#4A4A5A'}
          size={s.flame}
        />
      </motion.div>

      <div className="flex flex-col">
        <motion.span
          key={streak}
          initial={{ scale: 1.3, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          className="font-serif leading-none"
          style={{
            fontSize: s.number,
            color: streak > 0 ? 'var(--color-accent-warm)' : 'var(--color-text-muted)',
          }}
        >
          {streak}
        </motion.span>
        <span
          className="font-mono uppercase tracking-widest"
          style={{ fontSize: s.label, color: 'var(--color-text-muted)' }}
        >
          {streak === 1 ? 'night' : 'nights'}
        </span>
      </div>
    </div>
  )
}
