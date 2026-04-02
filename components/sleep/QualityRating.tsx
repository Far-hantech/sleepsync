'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

interface QualityRatingProps {
  value: number | null
  onChange: (rating: number) => void
  disabled?: boolean
}

const RATINGS = [
  { value: 1, emoji: '😴', label: 'Terrible' },
  { value: 2, emoji: '😐', label: 'Poor' },
  { value: 3, emoji: '🙂', label: 'OK' },
  { value: 4, emoji: '😊', label: 'Good' },
  { value: 5, emoji: '✨', label: 'Great' },
]

export default function QualityRating({ value, onChange, disabled }: QualityRatingProps) {
  const [hovering, setHovering] = useState<number | null>(null)

  return (
    <div className="flex gap-3 justify-center">
      {RATINGS.map((r) => {
        const isSelected = value === r.value
        const isHovered = hovering === r.value

        return (
          <div key={r.value} className="flex flex-col items-center gap-1.5">
            <motion.button
              onClick={() => !disabled && onChange(r.value)}
              onHoverStart={() => setHovering(r.value)}
              onHoverEnd={() => setHovering(null)}
              whileTap={{ scale: 0.9 }}
              animate={
                isSelected
                  ? { scale: 1.2 }
                  : isHovered
                  ? { scale: 1.1 }
                  : { scale: 1 }
              }
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              disabled={disabled}
              style={{
                width: 56,
                height: 56,
                borderRadius: '999px',
                border: isSelected
                  ? '2px solid var(--color-accent-primary)'
                  : '2px solid var(--color-border)',
                background: isSelected
                  ? 'color-mix(in srgb, var(--color-accent-primary) 15%, var(--color-surface))'
                  : 'var(--color-surface)',
                fontSize: '1.75rem',
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.5 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: isSelected
                  ? '0 0 16px color-mix(in srgb, var(--color-accent-primary) 40%, transparent)'
                  : 'none',
                transition: 'border-color 200ms ease-out, background 200ms ease-out, box-shadow 200ms ease-out',
              }}
            >
              {r.emoji}
            </motion.button>
            <span
              className="font-mono"
              style={{
                fontSize: '0.625rem',
                color: isSelected ? 'var(--color-accent-primary)' : 'var(--color-text-muted)',
                letterSpacing: '0.05em',
              }}
            >
              {r.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}
