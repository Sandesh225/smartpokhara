import { createClient } from "@/lib/supabase/server"
import { getCurrentUserWithRoles } from "@/lib/auth/session"
import { redirect } from "next/navigation"
import { CitizenComplaintsPage } from "@/components/citizen/citizen-complaints-page"

export default async function CitizenComplaintsListPage() {
  const user = await getCurrentUserWithRoles()
  if (!user) redirect("/login")

  const supabase = await createClient()

  const { data: categories } = await supabase.from("complaint_categories").select("id, name")

  const { data: wards } = await supabase.from("wards").select("id, ward_number, name")

  return <CitizenComplaintsPage categories={categories || []} wards={wards || []} />
}
