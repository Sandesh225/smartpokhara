
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load environment variables manually
function loadEnv() {
    const envPath = path.resolve(__dirname, '../../.env.local') || path.resolve(__dirname, '../../.env');
    if (fs.existsSync(envPath)) {
        const envConfig = dotenv.parse(fs.readFileSync(envPath));
        for (const k in envConfig) {
            process.env[k] = envConfig[k];
        }
    }
}
loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase URL or Key");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAdminAccess() {
    console.log("Testing Admin Access...");

    // 1. Test Complaints (Admin Scope Simulation)
    console.log("\n--- Testing Complaints (Direct Query) ---");
    const { data: complaints, error: complaintsError } = await supabase
        .from("complaints")
        .select("id, title, status")
        .limit(5);
    
    if (complaintsError) {
        console.error("Complaints Error:", complaintsError.message);
    } else {
        console.log(`Complaints Found: ${complaints.length}`);
        if(complaints.length > 0) console.log(complaints);
    }

    // 2. Test Notices (Direct Query for Drafts)
    console.log("\n--- Testing Notices (Direct Query for Drafts) ---");
    const { data: notices, error: noticesError } = await supabase
        .from("notices")
        .select("id, title, is_public, published_at")
        .eq("published_at", null) // Drafts simulation
        .limit(5);

    if (noticesError) {
        console.error("Notices Error:", noticesError.message);
    } else {
        console.log(`Draft Notices Found: ${notices.length}`);
        if(notices.length > 0) console.log(notices);
    }

    // 3. Test Tasks (Direct Query)
    console.log("\n--- Testing Tasks (Direct Query) ---");
    const { data: tasks, error: tasksError } = await supabase
        .from("supervisor_tasks")
        .select("id, title")
        .limit(5);

    if (tasksError) {
        console.error("Tasks Error:", tasksError.message);
    } else {
        console.log(`Tasks Found: ${tasks.length}`);
        if(tasks.length > 0) console.log(tasks);
    }
}

testAdminAccess();
