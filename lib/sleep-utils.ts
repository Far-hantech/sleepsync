import { format, differenceInMinutes, parseISO, isAfter, isBefore, addMinutes } from 'date-fns'
import { toZonedTime, fromZonedTime, formatInTimeZone } from 'date-fns-tz'

/**
 * Parse a "HH:MM" time string into hours and minutes.
 */
export function parseTimeString(timeStr: string): { hours: number; minutes: number } {
  const [hours, minutes] = timeStr.split(':').map(Number)
  return { hours, minutes }
}

/**
 * Given a user's sleep goal time (e.g. "23:00") and timezone,
 * returns the UTC Date object for that bedtime on the current day.
 */
export function getBedtimeDate(sleepGoalTime: string, timezone: string): Date {
  const now = toZonedTime(new Date(), timezone)
  const { hours, minutes } = parseTimeString(sleepGoalTime)

  const bedtime = new Date(now)
  bedtime.setHours(hours, minutes, 0, 0)

  // If the bedtime is already past (e.g., midnight sleep time at 11pm check),
  // it might be "tonight" or "next day" — keep it as-is; caller handles logic
  return fromZonedTime(bedtime, timezone)
}

/**
 * Get time remaining until bedtime.
 * Returns { hours, minutes, seconds, totalMinutes, isOverdue }
 */
export function getTimeUntilBedtime(
  sleepGoalTime: string | null,
  timezone: string
): { hours: number; minutes: number; seconds: number; totalMinutes: number; isOverdue: boolean } {
  if (!sleepGoalTime) {
    return { hours: 0, minutes: 0, seconds: 0, totalMinutes: 0, isOverdue: false }
  }

  const now = new Date()
  const bedtime = getBedtimeDate(sleepGoalTime, timezone)
  const diffMs = bedtime.getTime() - now.getTime()

  if (diffMs <= 0) {
    const overdueMins = Math.floor(Math.abs(diffMs) / 60000)
    return {
      hours: Math.floor(overdueMins / 60),
      minutes: overdueMins % 60,
      seconds: Math.floor((Math.abs(diffMs) % 60000) / 1000),
      totalMinutes: -overdueMins,
      isOverdue: true,
    }
  }

  const totalSeconds = Math.floor(diffMs / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return { hours, minutes, seconds, totalMinutes: hours * 60 + minutes, isOverdue: false }
}

/**
 * Returns true if the user is past their bedtime.
 */
export function isOverdue(sleepGoalTime: string | null, timezone: string): boolean {
  if (!sleepGoalTime) return false
  return getTimeUntilBedtime(sleepGoalTime, timezone).isOverdue
}

/**
 * Format a duration in minutes into a human-readable string.
 * e.g. 452 → "7h 32m"
 */
export function formatSleepDuration(minutes: number): string {
  if (minutes <= 0) return '0m'
  const h = Math.floor(Math.abs(minutes) / 60)
  const m = Math.abs(minutes) % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

/**
 * Returns the countdown urgency level based on minutes remaining.
 * Used to drive color changes in the CountdownTimer component.
 */
export type UrgencyLevel = 'safe' | 'warning' | 'danger' | 'overdue'

export function getUrgencyLevel(totalMinutes: number): UrgencyLevel {
  if (totalMinutes < 0) return 'overdue'
  if (totalMinutes <= 30) return 'danger'
  if (totalMinutes <= 60) return 'warning'
  return 'safe'
}

/**
 * Get the color token for a given urgency level.
 */
export function getUrgencyColor(level: UrgencyLevel): string {
  switch (level) {
    case 'safe': return '#4ADE80'    // accent-success
    case 'warning': return '#F59E6A' // accent-warm
    case 'danger': return '#F87171'  // coral/red
    case 'overdue': return '#EF4444' // full red
  }
}

/**
 * Format a time string like "23:00" into a display like "11:00 PM"
 */
export function formatTimeDisplay(timeStr: string | null): string {
  if (!timeStr) return '--:--'
  const { hours, minutes } = parseTimeString(timeStr)
  const period = hours >= 12 ? 'PM' : 'AM'
  const displayHour = hours % 12 || 12
  return `${displayHour}:${String(minutes).padStart(2, '0')} ${period}`
}

/**
 * Get the current time formatted in the user's timezone.
 */
export function getCurrentTimeInZone(timezone: string): string {
  return formatInTimeZone(new Date(), timezone, 'h:mm a')
}

/**
 * Get today's date string (YYYY-MM-DD) in the user's timezone.
 */
export function getTodayInZone(timezone: string): string {
  return formatInTimeZone(new Date(), timezone, 'yyyy-MM-dd')
}

/**
 * Check if the current time is within the morning check-in window.
 * Window: wake_goal_time to wake_goal_time + 2 hours.
 */
export function isInCheckInWindow(wakeGoalTime: string | null, timezone: string): boolean {
  if (!wakeGoalTime) return false
  
  const now = new Date()
  const wakeTime = getBedtimeDate(wakeGoalTime, timezone) // reuse helper
  const windowEnd = addMinutes(wakeTime, 120)
  
  return isAfter(now, wakeTime) && isBefore(now, windowEnd)
}

/**
 * Calculate how many minutes off from goal the actual sleep was.
 * Positive = went to sleep late, negative = went to sleep early.
 */
export function getSleepOffset(actualSleep: string, sleepGoalTime: string, timezone: string): number {
  const actual = parseISO(actualSleep)
  const goal = getBedtimeDate(sleepGoalTime, timezone)
  return differenceInMinutes(actual, goal)
}

/**
 * Returns the last N dates as YYYY-MM-DD strings in the user's timezone.
 */
export function getLastNDates(n: number, timezone: string): string[] {
  const dates: string[] = []
  const now = toZonedTime(new Date(), timezone)
  
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    dates.push(format(d, 'yyyy-MM-dd'))
  }
  
  return dates
}
