'use client'

import { motion } from 'framer-motion'
import { format, parseISO } from 'date-fns'
import type { StreakDay } from '@/types/supabase'

interface SleepCalendarStripProps {
  days: StreakDay[]
}

export default function SleepCalendarStrip({ days }: SleepCalendarStripProps) {
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="flex items-end gap-3 justify-center">
      {days.map((day, i) => {
        const isToday = day.date === today
        const label = format(parseISO(day.date), 'EEE').charAt(0)

        let dotColor = 'transparent'
        let dotBorder = 'var(--color-border)'
        let glow = ''

        if (day.isHit) {
          dotColor = 'var(--color-accent-primary)'
          dotBorder = 'var(--color-accent-primary)'
          glow = '0 0 10px color-mix(in srgb, var(--color-accent-primary) 60%, transparent)'
        } else if (day.hasMissed) {
          dotBorder = 'var(--color-text-muted)'
        }

        return (
          <div key={day.date} className="flex flex-col items-center gap-2">
            {/* Dot */}
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.06, type: 'spring', stiffness: 400, damping: 25 }}
              style={{
                position: 'relative',
                width: 32,
                height: 32,
                borderRadius: '999px',
                background: dotColor,
                border: `2px solid ${dotBorder}`,
                boxShadow: glow,
              }}
            >
              {/* Today pulse ring */}
              {isToday && (
                <motion.div
                  style={{
                    position: 'absolute',
                    inset: -4,
                    borderRadius: '999px',
                    border: `2px solid var(--color-accent-primary)`,
                    opacity: 0.5,
                  }}
                  animate={{ scale: [1, 1.25, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                />
              )}
            </motion.div>

            {/* Day label */}
            <span
              className="font-mono"
              style={{
                fontSize: '0.625rem',
                color: isToday ? 'var(--color-accent-primary)' : 'var(--color-text-muted)',
                letterSpacing: '0.05em',
              }}
            >
              {label}
            </span>
          </div>
        )
      })}
    </div>
  )
}
