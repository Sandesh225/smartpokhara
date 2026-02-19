import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserWithRoles } from "@/lib/auth/session";
import { complaintsApi } from "@/features/complaints";
import { UnassignedQueue } from "@/app/(protected)/supervisor/complaints/_components/UnassignedQueue";

export const dynamic = "force-dynamic";

export default async function UnassignedComplaintsPage() {
  const user = await getCurrentUserWithRoles();

  if (!user) {
    redirect("/login");
  }

  // Create client with cookies
  const supabase = await createClient();

  // Pass supervisor ID to filter complaints by department
  const complaints = await complaintsApi.getUnassignedComplaints(
    supabase
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <UnassignedQueue
          initialComplaints={complaints}
          supervisorId={user.id}
        />
      </div>
    </div>
  );
}