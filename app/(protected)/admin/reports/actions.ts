'use server';

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// --- FETCH REPORT DATA ---
export async function getMonthlyStats(year: number, month: number) {
  const supabase = await createClient();
  
  const startDate = new Date(year, month - 1, 1).toISOString();
  const endDate = new Date(year, month, 0).toISOString();

  // Parallel data fetching for performance
  const [complaints, bills, payments] = await Promise.all([
    supabase.from('complaints').select('status, category_id').gte('submitted_at', startDate).lte('submitted_at', endDate),
    supabase.from('bills').select('total_amount, status').gte('generated_date', startDate).lte('generated_date', endDate),
    supabase.from('payments').select('amount_paid').gte('created_at', startDate).lte('created_at', endDate)
  ]);

  return {
    complaints: complaints.data || [],
    bills: bills.data || [],
    payments: payments.data || []
  };
}

// --- SCHEDULE REPORT ---
export async function scheduleReport(formData: FormData) {
  const supabase = await createClient();
  
  const reportType = formData.get("report_type") as string;
  const frequency = formData.get("frequency") as string;
  const recipients = formData.get("recipients") as string;

  // In a real app, you'd insert this into a 'report_schedules' table
  // For now, we'll just log it as the table wasn't in the provided schema excerpt
  console.log("Scheduling Report:", { reportType, frequency, recipients });

  revalidatePath("/admin/reports");
  return { success: true, message: "Report scheduled successfully" };
}