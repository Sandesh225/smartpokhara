import { createClient } from '@supabase/supabase-js';

// Load environment variables

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("❌ Missing Supabase environment variables. Make sure .env.local exists.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function fixStuckAttendances() {
  console.log("🔍 Scanning for stuck attendance logs (forgot to checkout for > 24 hours)...");

  // Get current time
  const now = new Date();

  // Find users who have been checked in but not checked out
  const { data: stuckLogs, error: fetchError } = await supabase
    .from('attendance_logs')
    .select('*')
    .is('check_out_time', null);

  if (fetchError) {
    console.error("❌ Error fetching attendance logs:", fetchError.message);
    process.exit(1);
  }

  let fixedCount = 0;

  for (const log of stuckLogs) {
    const checkInTime = new Date(log.check_in_time);
    const diffHours = (now.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);

    // If it's been more than 24 hours, they definitely forgot to check out.
    // If they try to checkout now natively, the RPC calculates a massive duration (e.g. 100+ hours)
    // which overflows standard NUMERIC(4,2) limits, causing the "numeric field overflow" error.
    if (diffHours > 24) {
      console.log(`⚠️ Found stuck log for Staff ID: ${log.staff_id} (Checked in: ${checkInTime.toLocaleString()})`);
      
      // Auto-set checkout time to exactly 8 hours after check-in to emulate a regular shift
      const autoCheckOutTime = new Date(checkInTime.getTime() + 8 * 60 * 60 * 1000);
      
      const { error: updateError } = await supabase
        .from('attendance_logs')
        .update({
          check_out_time: autoCheckOutTime.toISOString(),
          total_hours: 8.0, // Force exactly 8 hours to prevent overflow
          status: 'present', // Assumed present
        })
        .eq('id', log.id);

      if (updateError) {
        console.error(`  ❌ Failed to fix log ${log.id}:`, updateError.message);
      } else {
        console.log(`  ✅ Successfully auto-checked out log ${log.id} (capped at 8 hours).`);
        fixedCount++;
      }
    }
  }

  if (fixedCount === 0) {
    console.log("✅ No stuck attendances older than 24 hours found.");
  } else {
    console.log(`🎉 Successfully fixed ${fixedCount} stuck attendance logs.`);
  }
}

fixStuckAttendances().catch(console.error);
