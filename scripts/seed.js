/* ============================================================================
   SMART CITY POKHARA – ENHANCED AUTH USER SEED
   Creates: 2 Admins, 8 Supervisors (1 per dept), 16 Staff (2 per dept), 10 Citizens
   Run via: node seed-users.js
============================================================================ */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = "https://mjluhogcyqdepfualyfa.supabase.co"
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qbHVob2djeXFkZXBmdWFseWZhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTA1ODE0NywiZXhwIjoyMDg0NjM0MTQ3fQ.b2tdgWqRrPmagUPH8xyohJ2xMB6w-P5FIB96ZQLQH1w"

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

const PASSWORD = 'Pokhara@2025'

const users = [
  // ========== ADMINS (2) ==========
  { email: 'admin@pokhara.gov.np', name: 'System Administrator', role: 'admin' },
  { email: 'tech.admin@pokhara.gov.np', name: 'Technical Administrator', role: 'admin' },

  // ========== SUPERVISORS - One per Department (8) ==========
  { email: 'supervisor.road@pokhara.gov.np', name: 'Ram Kumar Shrestha', role: 'supervisor', dept: 'ROAD' },
  { email: 'supervisor.water@pokhara.gov.np', name: 'Sita Devi Gurung', role: 'supervisor', dept: 'WATER' },
  { email: 'supervisor.waste@pokhara.gov.np', name: 'Bishnu Prasad Poudel', role: 'supervisor', dept: 'WASTE' },
  { email: 'supervisor.electric@pokhara.gov.np', name: 'Deepak Thapa', role: 'supervisor', dept: 'ELECTRIC' },
  { email: 'supervisor.health@pokhara.gov.np', name: 'Kamala Sharma', role: 'supervisor', dept: 'HEALTH' },
  { email: 'supervisor.parks@pokhara.gov.np', name: 'Rajendra Gurung', role: 'supervisor', dept: 'PARKS' },
  { email: 'supervisor.building@pokhara.gov.np', name: 'Narayan Poudel', role: 'supervisor', dept: 'BUILDING' },
  { email: 'supervisor.ward@pokhara.gov.np', name: 'Sunita Rai', role: 'supervisor', dept: 'WARD' },

  // ========== STAFF - Two per Department (16) ==========
  
  // Road Department (2)
  { email: 'staff.road.1@pokhara.gov.np', name: 'Mohan Bahadur Thapa', role: 'staff', dept: 'ROAD' },
  { email: 'staff.road.2@pokhara.gov.np', name: 'Krishna Prasad Karki', role: 'staff', dept: 'ROAD' },
  
  // Water Department (2)
  { email: 'staff.water.1@pokhara.gov.np', name: 'Krishna Maya Tamang', role: 'staff', dept: 'WATER' },
  { email: 'staff.water.2@pokhara.gov.np', name: 'Suman Shrestha', role: 'staff', dept: 'WATER' },
  
  // Waste Department (2)
  { email: 'staff.waste.1@pokhara.gov.np', name: 'Laxman Rai', role: 'staff', dept: 'WASTE' },
  { email: 'staff.waste.2@pokhara.gov.np', name: 'Rita Gurung', role: 'staff', dept: 'WASTE' },
  
  // Electric Department (2)
  { email: 'staff.electric.1@pokhara.gov.np', name: 'Prakash Adhikari', role: 'staff', dept: 'ELECTRIC' },
  { email: 'staff.electric.2@pokhara.gov.np', name: 'Ramesh Magar', role: 'staff', dept: 'ELECTRIC' },
  
  // Health Department (2)
  { email: 'staff.health.1@pokhara.gov.np', name: 'Binod Thapa', role: 'staff', dept: 'HEALTH' },
  { email: 'staff.health.2@pokhara.gov.np', name: 'Sarita Poudel', role: 'staff', dept: 'HEALTH' },
  
  // Parks Department (2)
  { email: 'staff.parks.1@pokhara.gov.np', name: 'Arjun Tamang', role: 'staff', dept: 'PARKS' },
  { email: 'staff.parks.2@pokhara.gov.np', name: 'Meena Lama', role: 'staff', dept: 'PARKS' },
  
  // Building Department (2)
  { email: 'staff.building.1@pokhara.gov.np', name: 'Deepak Karki', role: 'staff', dept: 'BUILDING' },
  { email: 'staff.building.2@pokhara.gov.np', name: 'Anita Shahi', role: 'staff', dept: 'BUILDING' },
  
  // Ward Office (2)
  { email: 'staff.ward.1@pokhara.gov.np', name: 'Hari Prasad Sharma', role: 'staff', dept: 'WARD' },
  { email: 'staff.ward.2@pokhara.gov.np', name: 'Sunita Thakali', role: 'staff', dept: 'WARD' },

  // ========== WARD STAFF (3 key wards) ==========
  { email: 'citizen.ward1@pokhara.gov.np', name: 'Ganesh Bahadur KC', role: 'ward_staff', ward: 1 },
  { email: 'citizen.ward6@pokhara.gov.np', name: 'Laxmi Thakali', role: 'ward_staff', ward: 6 },
  { email: 'citizen.ward17@pokhara.gov.np', name: 'Bishnu Magar', role: 'ward_staff', ward: 17 },

  // ========== CITIZENS (10) ==========
  { email: 'citizen.ward1.user@example.com', name: 'Arjun Kumar Karki', role: 'citizen', ward: 1 },
  { email: 'citizen.ward6.user@example.com', name: 'Maya Devi Gurung', role: 'citizen', ward: 6 },
  { email: 'citizen.ward17.user@example.com', name: 'Bikash Rana Magar', role: 'citizen', ward: 17 },
  { email: 'business.ward10@example.com', name: 'Kiran Bahadur Thapa', role: 'business', ward: 10 },
  { email: 'citizen.ward2@example.com', name: 'Anita Shrestha', role: 'citizen', ward: 2 },
  { email: 'citizen.ward8@example.com', name: 'Suresh Pandey', role: 'citizen', ward: 8 },
  { email: 'citizen.ward15@example.com', name: 'Sabina Rai', role: 'citizen', ward: 15 },
  { email: 'citizen.ward25@example.com', name: 'Dinesh Gurung', role: 'citizen', ward: 25 },
  { email: 'business.ward6@example.com', name: 'Rajesh Kumar Shrestha', role: 'business', ward: 6 },
  { email: 'tourist.ward6@example.com', name: 'John Anderson', role: 'tourist', ward: 6 }
]

async function seedAuthUsers() {
  console.log('\n═══════════════════════════════════════════════════════════')
  console.log('   SMART CITY POKHARA - AUTH USER SEEDING')
  console.log('═══════════════════════════════════════════════════════════\n')

  let created = 0
  let skipped = 0
  let failed = 0

  const stats = {
    admins: 0,
    supervisors: 0,
    staff: 0,
    ward_staff: 0,
    citizens: 0
  }

  for (const user of users) {
    const { error } = await supabase.auth.admin.createUser({
      email: user.email,
      password: PASSWORD,
      email_confirm: true,
      user_metadata: { 
        full_name: user.name,
        role: user.role,
        department: user.dept || null,
        ward: user.ward || null
      }
    })

    if (error) {
      if (error.message.includes('already')) {
        console.log(`⚠️  Exists: ${user.email}`)
        skipped++
      } else {
        console.error(`❌ Failed: ${user.email} - ${error.message}`)
        failed++
      }
    } else {
      console.log(`✅ Created: ${user.email} (${user.name})`)
      created++
      
      // Track stats
      if (user.role === 'admin') stats.admins++
      else if (user.role === 'supervisor') stats.supervisors++
      else if (user.role === 'staff') stats.staff++
      else if (user.role === 'ward_staff') stats.ward_staff++
      else stats.citizens++
    }

    await new Promise(r => setTimeout(r, 100))
  }

  console.log('\n═══════════════════════════════════════════════════════════')
  console.log('   SEED SUMMARY')
  console.log('═══════════════════════════════════════════════════════════')
  console.log(`\n📊 Results:`)
  console.log(`   ✅ Created: ${created}`)
  console.log(`   ⚠️  Skipped: ${skipped}`)
  console.log(`   ❌ Failed: ${failed}`)
  console.log(`   📈 Total: ${users.length}`)
  
  console.log(`\n👥 User Breakdown:`)
  console.log(`   • Admins: ${stats.admins}`)
  console.log(`   • Supervisors: ${stats.supervisors}`)
  console.log(`   • Department Staff: ${stats.staff}`)
  console.log(`   • Ward Staff: ${stats.ward_staff}`)
  console.log(`   • Citizens/Business: ${stats.citizens}`)
  
  console.log(`\n🔐 Login Credentials:`)
  console.log(`   Password: ${PASSWORD}`)
  
  console.log(`\n📋 Department Coverage:`)
  console.log(`   ✓ Road: 1 Supervisor + 2 Staff`)
  console.log(`   ✓ Water: 1 Supervisor + 2 Staff`)
  console.log(`   ✓ Waste: 1 Supervisor + 2 Staff`)
  console.log(`   ✓ Electric: 1 Supervisor + 2 Staff`)
  console.log(`   ✓ Health: 1 Supervisor + 2 Staff`)
  console.log(`   ✓ Parks: 1 Supervisor + 2 Staff`)
  console.log(`   ✓ Building: 1 Supervisor + 2 Staff`)
  console.log(`   ✓ Ward Office: 1 Supervisor + 2 Staff`)
  
  console.log(`\n✅ Next Step: Run the SQL profile seeding script`)
  console.log('═══════════════════════════════════════════════════════════\n')
}

seedAuthUsers()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('\n❌ Error:', err)
    process.exit(1)
  })
  