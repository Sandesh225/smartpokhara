import { z } from "zod";

// Zod schema for runtime validation and type inference
export const ComplaintStatusSchema = z.enum(["received", "assigned", "in_progress", "resolved", "escalated", "closed"]);
export const ComplaintPrioritySchema = z.enum(["critical", "high", "medium", "low"]);

export const ComplaintsFiltersSchema = z.object({
  search: z.string().default(""),
  status: z.array(ComplaintStatusSchema).default([]),
  priority: z.array(ComplaintPrioritySchema).default([]),
  ward_id: z.array(z.string()).default([]),
  category: z.array(z.string()).default([]),
  date_range: z.object({
    from: z.string().optional(),
    to: z.string().optional(),
  }).optional(),
});

export type ComplaintsFiltersState = z.infer<typeof ComplaintsFiltersSchema>;
export type ComplaintStatus = z.infer<typeof ComplaintStatusSchema>;
export type ComplaintPriority = z.infer<typeof ComplaintPrioritySchema>;

export interface Complaint {
  id: string;
  tracking_code: string;
  title: string;
  category: { id: string; name: string };
  ward: { id: string; name: string; ward_number: number };
  status: ComplaintStatus;
  priority: ComplaintPriority;
  assigned_staff: { id: string; full_name: string } | null;
  submitted_at: string;
  sla_due_at: string;
  created_at: string;
}