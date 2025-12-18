export const SUPERVISOR_PERMISSIONS = {
  // Complaint Management
  VIEW_COMPLAINTS: 'view_complaints',
  ASSIGN_COMPLAINTS: 'assign_complaints',
  REASSIGN_COMPLAINTS: 'reassign_complaints',
  UPDATE_COMPLAINT_PRIORITY: 'update_complaint_priority',
  ESCALATE_COMPLAINTS: 'escalate_complaints',
  CLOSE_COMPLAINTS: 'close_complaints',
  ADD_INTERNAL_NOTES: 'add_internal_notes',
  REQUEST_SLA_EXTENSIONS: 'request_sla_extensions',

  // Staff Management
  VIEW_STAFF: 'view_staff',
  UPDATE_STAFF_STATUS: 'update_staff_status',
  CREATE_STAFF_SCHEDULES: 'create_staff_schedules',
  APPROVE_LEAVE_REQUESTS: 'approve_leave_requests',
  VIEW_STAFF_PERFORMANCE: 'view_staff_performance',
  CREATE_PERFORMANCE_REVIEWS: 'create_performance_reviews',

  // Task Management
  CREATE_TASKS: 'create_tasks',
  ASSIGN_TASKS: 'assign_tasks',
  UPDATE_TASKS: 'update_tasks',
  DELETE_TASKS: 'delete_tasks',
  APPROVE_TASK_COMPLETION: 'approve_task_completion',

  // Analytics & Reports
  VIEW_ANALYTICS: 'view_analytics',
  GENERATE_REPORTS: 'generate_reports',
  EXPORT_DATA: 'export_data',

  // Communications
  SEND_MESSAGES: 'send_messages',
  BROADCAST_ANNOUNCEMENTS: 'broadcast_announcements',
  VIEW_MESSAGES: 'view_messages',

  // System
  UPDATE_PROFILE: 'update_profile',
  UPDATE_PREFERENCES: 'update_preferences',
  MANAGE_DASHBOARD: 'manage_dashboard'
} as const;

export type SupervisorPermission = typeof SUPERVISOR_PERMISSIONS[keyof typeof SUPERVISOR_PERMISSIONS];

export const PERMISSION_LEVELS = {
  WARD: [
    SUPERVISOR_PERMISSIONS.VIEW_COMPLAINTS,
    SUPERVISOR_PERMISSIONS.ASSIGN_COMPLAINTS,
    SUPERVISOR_PERMISSIONS.VIEW_STAFF,
    SUPERVISOR_PERMISSIONS.CREATE_TASKS,
    SUPERVISOR_PERMISSIONS.VIEW_ANALYTICS,
    SUPERVISOR_PERMISSIONS.SEND_MESSAGES,
    SUPERVISOR_PERMISSIONS.UPDATE_PROFILE
  ],
  DEPARTMENT: [
    SUPERVISOR_PERMISSIONS.VIEW_COMPLAINTS,
    SUPERVISOR_PERMISSIONS.ASSIGN_COMPLAINTS,
    SUPERVISOR_PERMISSIONS.REASSIGN_COMPLAINTS,
    SUPERVISOR_PERMISSIONS.UPDATE_COMPLAINT_PRIORITY,
    SUPERVISOR_PERMISSIONS.ESCALATE_COMPLAINTS,
    SUPERVISOR_PERMISSIONS.CLOSE_COMPLAINTS,
    SUPERVISOR_PERMISSIONS.VIEW_STAFF,
    SUPERVISOR_PERMISSIONS.UPDATE_STAFF_STATUS,
    SUPERVISOR_PERMISSIONS.CREATE_STAFF_SCHEDULES,
    SUPERVISOR_PERMISSIONS.APPROVE_LEAVE_REQUESTS,
    SUPERVISOR_PERMISSIONS.CREATE_TASKS,
    SUPERVISOR_PERMISSIONS.VIEW_ANALYTICS,
    SUPERVISOR_PERMISSIONS.GENERATE_REPORTS,
    SUPERVISOR_PERMISSIONS.SEND_MESSAGES,
    SUPERVISOR_PERMISSIONS.BROADCAST_ANNOUNCEMENTS,
    SUPERVISOR_PERMISSIONS.UPDATE_PROFILE,
    SUPERVISOR_PERMISSIONS.UPDATE_PREFERENCES
  ],
  COMBINED: [
    ...Object.values(SUPERVISOR_PERMISSIONS).filter(p => 
      p !== SUPERVISOR_PERMISSIONS.MANAGE_DASHBOARD
    )
  ],
  SENIOR: Object.values(SUPERVISOR_PERMISSIONS)
} as const;

export const DEFAULT_SUPERVISOR_PREFERENCES = {
  notification_preferences: {
    email: true,
    sms: true,
    in_app: true,
    digest_frequency: 'daily',
  },
  dashboard_preferences: {
    default_view: 'table',
    refresh_interval: 30,
    widgets: ['complaints_overview', 'team_performance', 'sla_metrics', 'recent_activity']
  },
  assignment_preferences: {
    auto_assign: false,
    prefer_nearest: true,
    consider_workload: true,
    max_distance_km: 50
  }
};