export const AUTO_ASSIGNMENT_RULES = {
  // Priority weights for scoring
  PRIORITY_WEIGHTS: {
    emergency: 100,
    high: 75,
    medium: 50,
    low: 25
  },

  // Workload thresholds (percentage of max capacity)
  WORKLOAD_THRESHOLDS: {
    available: 0.7,      // Below 70% - Available for assignment
    busy: 0.9,          // 70-90% - Can take more with caution
    overloaded: 1.0      // Above 90% - Do not assign
  },

  // Scoring weights (sum should be 1.0)
  DISTANCE_WEIGHT: 0.15,
  WORKLOAD_WEIGHT: 0.35,
  PERFORMANCE_WEIGHT: 0.30,
  SPECIALIZATION_WEIGHT: 0.20,

  // Maximum distance for assignment (in kilometers)
  MAX_DISTANCE_KM: 50,

  // Minimum performance score required (0-100)
  MIN_PERFORMANCE_SCORE: 60,

  // Auto-assignment batch size
  BATCH_SIZE: 5,

  // Retry failed assignments after (minutes)
  RETRY_DELAY_MINUTES: 30,

  // Consider staff unavailable if offline for (minutes)
  OFFLINE_THRESHOLD_MINUTES: 15
} as const;

export const WORKLOAD_THRESHOLDS = {
  // Maximum concurrent complaints per staff
  MAX_CONCURRENT_COMPLAINTS: 10,

  // Maximum concurrent tasks per staff
  MAX_CONCURRENT_TASKS: 5,

  // Maximum hours per day
  DAILY_MAX_HOURS: 8,

  // Maximum hours per week
  WEEKLY_MAX_HOURS: 40,

  // Overtime threshold (hours per week)
  OVERTIME_THRESHOLD: 45,

  // Break between assignments (minutes)
  MIN_BREAK_MINUTES: 30
} as const;

export const PRIORITY_WEIGHTS = {
  // Response time weights (hours)
  RESPONSE_TIME: {
    emergency: 1,
    high: 4,
    medium: 24,
    low: 72
  },

  // Escalation time weights (hours)
  ESCALATION_TIME: {
    emergency: 2,
    high: 8,
    medium: 48,
    low: 120
  },

  // Review frequency weights (hours)
  REVIEW_FREQUENCY: {
    emergency: 1,
    high: 4,
    medium: 12,
    low: 24
  },

  // Assignment urgency scores (0-100)
  URGENCY_SCORE: {
    emergency: 100,
    high: 75,
    medium: 50,
    low: 25
  }
} as const;