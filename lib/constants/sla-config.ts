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