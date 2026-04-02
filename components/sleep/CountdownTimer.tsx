'use client'

import { useEffect, useState } from 'react'
import { motion, useAnimation } from 'framer-motion'
import {
  getTimeUntilBedtime,
  getUrgencyLevel,
  getUrgencyColor,
  formatSleepDuration,
  type UrgencyLevel,
} from '@/lib/sleep-utils'

interface CountdownTimerProps {
  sleepGoalTime: string | null
  timezone: string
}

const RING_RADIUS = 120
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS

export default function CountdownTimer({ sleepGoalTime, timezone }: CountdownTimerProps) {
  const controls = useAnimation()
  const [timeData, setTimeData] = useState(() => getTimeUntilBedtime(sleepGoalTime, timezone))
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const interval = setInterval(() => {
      setTimeData(getTimeUntilBedtime(sleepGoalTime, timezone))
    }, 1000)
    return () => clearInterval(interval)
  }, [sleepGoalTime, timezone])

  const urgency: UrgencyLevel = getUrgencyLevel(timeData.totalMinutes)
  const color = getUrgencyColor(urgency)

  // Ring progress: full day = 24*60=1440 min, fill as time passes toward bedtime
  // We show how much of the "12hr window" is consumed
  const maxMinutes = 12 * 60
  const remaining = Math.max(0, timeData.totalMinutes)
  const ringProgress = Math.min(1, (maxMinutes - remaining) / maxMinutes)
  const dashOffset = RING_CIRCUMFERENCE * (1 - ringProgress)

  if (!mounted) return null

  return (
    <div className="flex flex-col items-center gap-6">
      {/* SVG Ring + Timer */}
      <div className="relative flex items-center justify-center" style={{ width: 280, height: 280 }}>
        <svg
          width="280"
          height="280"
          viewBox="0 0 280 280"
          style={{ transform: 'rotate(-90deg)' }}
          className="absolute inset-0"
        >
          {/* Background ring */}
          <circle
            cx="140"
            cy="140"
            r={RING_RADIUS}
            fill="none"
            stroke="var(--color-border)"
            strokeWidth="3"
          />
          {/* Progress ring */}
          <motion.circle
            cx="140"
            cy="140"
            r={RING_RADIUS}
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={RING_CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            animate={{ stroke: color, strokeDashoffset: dashOffset }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            style={{ filter: urgency === 'danger' || urgency === 'overdue' ? `drop-shadow(0 0 8px ${color})` : 'none' }}
          />
        </svg>

        {/* Center content */}
        <motion.div
          className="text-center z-10"
          animate={urgency === 'danger' || urgency === 'overdue' ? { scale: [1, 1.02, 1] } : {}}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          {timeData.isOverdue ? (
            <>
              <p className="font-mono text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>
                overdue by
              </p>
              <p className="font-serif text-5xl font-normal leading-none" style={{ color }}>
                {timeData.hours > 0 ? `${timeData.hours}h` : ''}
                {timeData.minutes > 0 ? ` ${timeData.minutes}m` : ''}
              </p>
            </>
          ) : (
            <>
              <p className="font-mono text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>
                until bedtime
              </p>
              <p className="font-serif leading-none" style={{ color, fontSize: timeData.hours > 0 ? '3.5rem' : '4rem' }}>
                {timeData.hours > 0 && (
                  <span>{timeData.hours}<span className="text-2xl">h</span> </span>
                )}
                <span>{timeData.minutes}<span className="text-2xl">m</span></span>
              </p>
              <p className="font-mono text-xs mt-2" style={{ color: 'var(--color-text-muted)' }}>
                {String(timeData.seconds).padStart(2, '0')}s
              </p>
            </>
          )}
        </motion.div>
      </div>

      {/* Urgency label */}
      <motion.p
        key={urgency}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-mono text-xs tracking-widest uppercase"
        style={{ color: 'var(--color-text-muted)' }}
      >
        {urgency === 'safe' && 'You have time'}
        {urgency === 'warning' && 'Start winding down soon'}
        {urgency === 'danger' && 'Wind-down time'}
        {urgency === 'overdue' && "Past bedtime — log it when you're ready"}
      </motion.p>
    </div>
  )
}
