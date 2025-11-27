import { createClient } from "@/lib/supabase/server"
import { getCurrentUserWithRoles } from "@/lib/auth/session"
import { redirect } from "next/navigation"
import { ComplaintFormContainer } from "@/components/citizen/citizen-form-container"

export default async function NewComplaintPage() {
  const user = await getCurrentUserWithRoles()
  if (!user) redirect("/login")

  const supabase = await createClient()

  const { data: categories } = await supabase
    .from("complaint_categories")
    .select("id, name, name_nepali, description, icon, complaint_subcategories(*)")
    .eq("is_active", true)

  const { data: wards } = await supabase.from("wards").select("id, ward_number, name, name_nepali").order("ward_number")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Submit a Complaint</h1>
        <p className="mt-2 text-slate-600">Help us improve the city by reporting issues and concerns</p>
      </div>

      <ComplaintFormContainer categories={categories || []} wards={wards || []} user={user} />
    </div>
  )
}
