
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

export const SLA_DEADLINES = {
  // Hours to resolve based on priority
  emergency: {
    response: 1,      // 1 hour to acknowledge
    resolution: 4,    // 4 hours to resolve
    maxExtensions: 1,
    extensionHours: 2
  },
  high: {
    response: 2,      // 2 hours to acknowledge
    resolution: 24,   // 24 hours to resolve
    maxExtensions: 2,
    extensionHours: 12
  },
  medium: {
    response: 4,      // 4 hours to acknowledge
    resolution: 72,   // 72 hours to resolve
    maxExtensions: 3,
    extensionHours: 24
  },
  low: {
    response: 8,      // 8 hours to acknowledge
    resolution: 168,  // 7 days to resolve
    maxExtensions: 4,
    extensionHours: 48
  },

  // Default fallback
  default: {
    response: 4,
    resolution: 48,
    maxExtensions: 2,
    extensionHours: 24
  }
} as const;

export const ALERT_THRESHOLDS = {
  // Percentage of SLA elapsed for alerts
  FIRST_WARNING: 0.75,  // 75% - First warning
  FINAL_WARNING: 0.90,  // 90% - Final warning
  BREACH: 1.00,         // 100% - SLA breached

  // Hours before deadline for notifications
  NOTIFICATION_SCHEDULE: {
    '24_hours': 24,
    '12_hours': 12,
    '6_hours': 6,
    '3_hours': 3,
    '1_hour': 1
  },

  // Escalation thresholds
  ESCALATION_LEVELS: {
    supervisor: 0.85,   // Escalate to supervisor at 85%
    department_head: 0.95, // Escalate to department head at 95%
    city_admin: 1.00    // Escalate to city admin at 100%
  }
} as const;

export const EXTENSION_LIMITS = {
  // Maximum extensions per priority level
  emergency: 1,
  high: 2,
  medium: 3,
  low: 4,

  // Maximum total extension days
  MAX_TOTAL_DAYS: 30,

  // Minimum time before deadline to request extension (hours)
  MIN_REQUEST_TIME: 12,

  // Automatic approval limits
  AUTO_APPROVE: {
    hours: 24,
    priority: ['low', 'medium']
  }
} as const;
