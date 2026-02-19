export type NotificationType =
  | "complaint_status"
  | "bill_generated"
  | "new_notice"
  | "system_announcement"
  | "general";

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  is_read: boolean;
  created_at: string;
  action_url?: string;
  metadata?: Record<string, any>;
}
