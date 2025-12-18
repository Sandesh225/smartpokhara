import { supabase } from "@/lib/supabase/client";

interface NotificationPayload {
  userId: string;
  title: string;
  message: string;
  type: "complaint_assigned" | "task_assigned" | "alert";
  priority?: "low" | "medium" | "high" | "urgent";
  actionUrl?: string;
  metadata?: any;
}

/**
 * Sends an in-app notification via Supabase.
 * Triggers Real-time event for the recipient.
 */
export async function sendInAppNotification(payload: NotificationPayload) {
  const { error } = await supabase
    .from("notifications")
    .insert({
      user_id: payload.userId,
      type: payload.type,
      title: payload.title,
      message: payload.message,
      // Mapping to DB schema columns if they differ, or assuming 'metadata' JSONB column exists
      // Adjust based on your exact schema:
      // priority: payload.priority || 'medium',
      action_url: payload.actionUrl,
      // metadata: payload.metadata 
    });

  if (error) console.error("Failed to send notification:", error);
}

/**
 * Placeholder for SMS sending logic (e.g. Twilio via Edge Function)
 */
export async function sendSMS(phone: string, message: string) {
  console.log(`[MOCK SMS] To: ${phone} | Msg: ${message}`);
  // In real implementation: fetch('/api/send-sms', ...)
}

/**
 * Placeholder for Email sending logic
 */
export async function sendEmail(email: string, subject: string, body: string) {
  console.log(`[MOCK EMAIL] To: ${email} | Subject: ${subject}`);
  // In real implementation: fetch('/api/send-email', ...)
}

export async function notifyStaffOfAssignment(
  staff: { id: string; phone?: string; email?: string; name: string },
  complaint: { id: string; tracking_code: string; title: string },
  note?: string
) {
  const message = `New Complaint Assignment: ${complaint.tracking_code} - ${complaint.title}. ${note ? `Note: ${note}` : ''}`;

  // 1. In-App
  await sendInAppNotification({
    userId: staff.id,
    title: "New Assignment",
    message: message,
    type: "complaint_assigned",
    actionUrl: `/staff/complaints/${complaint.id}`,
    priority: "high"
  });

  // 2. SMS (if phone exists)
  if (staff.phone) {
    await sendSMS(staff.phone, message);
  }

  // 3. Email (if email exists)
  if (staff.email) {
    await sendEmail(staff.email, "New Complaint Assignment", message);
  }
}