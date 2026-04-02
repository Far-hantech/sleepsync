// ============================================================
// This file defines the Supabase Database schema types.
// These are hand-written based on migration 001_initial_schema.sql.
// Run `supabase gen types typescript` to regenerate after schema changes.
// ============================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string | null
          sleep_goal_time: string | null
          wake_goal_time: string | null
          timezone: string
          onboarding_complete: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          sleep_goal_time?: string | null
          wake_goal_time?: string | null
          timezone?: string
          onboarding_complete?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          sleep_goal_time?: string | null
          wake_goal_time?: string | null
          timezone?: string
          onboarding_complete?: boolean
          updated_at?: string
        }
      }
      sleep_entries: {
        Row: {
          id: string
          user_id: string
          date: string
          planned_sleep: string | null
          actual_sleep: string | null
          wake_time: string | null
          quality_rating: number | null
          notes: string | null
          streak_count: number
          is_hit: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          planned_sleep?: string | null
          actual_sleep?: string | null
          wake_time?: string | null
          quality_rating?: number | null
          notes?: string | null
          streak_count?: number
          is_hit?: boolean
          created_at?: string
        }
        Update: {
          planned_sleep?: string | null
          actual_sleep?: string | null
          wake_time?: string | null
          quality_rating?: number | null
          notes?: string | null
          streak_count?: number
          is_hit?: boolean
        }
      }
      accountability_pairs: {
        Row: {
          id: string
          user_a: string
          user_b: string | null
          invite_token: string
          status: 'pending' | 'active' | 'declined'
          created_at: string
        }
        Insert: {
          id?: string
          user_a: string
          user_b?: string | null
          invite_token?: string
          status?: 'pending' | 'active' | 'declined'
          created_at?: string
        }
        Update: {
          user_b?: string | null
          status?: 'pending' | 'active' | 'declined'
        }
      }
      push_subscriptions: {
        Row: {
          id: string
          user_id: string
          endpoint: string
          keys: Json
          notification_prefs: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          endpoint: string
          keys: Json
          notification_prefs?: Json
          created_at?: string
        }
        Update: {
          endpoint?: string
          keys?: Json
          notification_prefs?: Json
        }
      }
      wind_down_steps: {
        Row: {
          id: string
          user_id: string
          steps: Json
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          steps?: Json
          updated_at?: string
        }
        Update: {
          steps?: Json
          updated_at?: string
        }
      }
    }
  }
}

// Convenience row type aliases
export type UserRow = Database['public']['Tables']['users']['Row']
export type SleepEntryRow = Database['public']['Tables']['sleep_entries']['Row']
// Backward compat alias
export type SleepEntry = SleepEntryRow
export type AccountabilityPairRow = Database['public']['Tables']['accountability_pairs']['Row']
export type PushSubscriptionRow = Database['public']['Tables']['push_subscriptions']['Row']
export type WindDownStepsRow = Database['public']['Tables']['wind_down_steps']['Row']

export interface WindDownStep {
  id: string
  label: string
  completed: boolean
}

export interface NotificationPrefs {
  t_minus_60: boolean
  t_minus_30: boolean
  bedtime: boolean
  overdue: boolean
  morning: boolean
}

export interface StreakDay {
  date: string
  isHit: boolean
  hasMissed: boolean
  streakCount: number
}
