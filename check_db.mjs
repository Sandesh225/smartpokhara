import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nbysldtzrlztcicqdjfb.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

let out = "";

async function checkDb() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  
  out += "Fetching complaint CMP-20260221-C748...\n";
  const { data: complaints, error: compErr } = await supabase
    .from('complaints')
    .select('*')
    .eq('tracking_code', 'CMP-20260221-C748');
    
  if (compErr) {
    out += "Error fetching complaint: " + JSON.stringify(compErr) + "\n";
    fs.writeFileSync('db_output.txt', out);
    return;
  }
  
  if (!complaints || complaints.length === 0) {
    out += "No complaint found with that tracking code.\n";
    fs.writeFileSync('db_output.txt', out);
    return;
  }

  const complaint = complaints[0];
  
  out += "Complaint:\n" + JSON.stringify({
    id: complaint.id,
    tracking_code: complaint.tracking_code,
    assigned_staff_id: complaint.assigned_staff_id,
    status: complaint.status
  }, null, 2) + "\n\n";
  
  if (complaint.assigned_staff_id) {
    out += `Fetching user_profile for ${complaint.assigned_staff_id}...\n`;
    const { data: up, error: upErr } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', complaint.assigned_staff_id);
      
    out += "User Profile: " + JSON.stringify(upErr ? upErr : up, null, 2) + "\n\n";
    
    out += `Fetching staff_profile for ${complaint.assigned_staff_id}...\n`;
    const { data: sp, error: spErr } = await supabase
      .from('staff_profiles')
      .select('*')
      .eq('user_id', complaint.assigned_staff_id);
      
    out += "Staff Profile: " + JSON.stringify(spErr ? spErr : sp, null, 2) + "\n\n";
  } else {
    out += "No staff assigned to this complaint in the database (assigned_staff_id is null).\n\n";
  }

  out += `Checking RLS on user_profiles...\n`;
  const anonSupabase = createClient(SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  if (complaint.assigned_staff_id) {
      const { data: anonUP, error: anonUPErr } = await anonSupabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', complaint.assigned_staff_id);
      out += "Anon User Profile Fetch: " + JSON.stringify(anonUPErr || anonUP || "No data", null, 2) + "\n";
      
      const { data: anonSP, error: anonSPErr } = await anonSupabase
        .from('staff_profiles')
        .select('*')
        .eq('user_id', complaint.assigned_staff_id);
      out += "Anon Staff Profile Fetch: " + JSON.stringify(anonSPErr || anonSP || "No data", null, 2) + "\n";
  }
  
  fs.writeFileSync('db_output.txt', out);
}

checkDb().catch(e => {
    fs.writeFileSync('db_output.txt', out + "\nError: " + String(e));
});
