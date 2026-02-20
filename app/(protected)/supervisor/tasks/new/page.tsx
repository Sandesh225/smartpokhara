import { redirect } from "next/navigation";
import { getCurrentUserWithRoles } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { supervisorApi } from "@/features/supervisor";
import { TaskCreationForm } from "@/app/(protected)/supervisor/tasks/_components/tasks/TaskCreationForm";

export const dynamic = "force-dynamic";

export default async function CreateTaskPage() {
  const user = await getCurrentUserWithRoles();
  if (!user) redirect("/login");

  const supabase = await createClient();
  const staff = await supervisorApi.getSupervisedStaff(supabase, user.id);
  const managedStaff = staff.map(s => ({
    ...s,
    staff_code: s.staff_code || undefined,
    department_id: s.department_id || undefined,
    ward_id: s.ward_id || undefined,
    avatar_url: s.avatar_url || undefined,
  }));

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create New Task</h1>
        <p className="text-sm text-gray-500">Assign work to your team members.</p>
      </div>
      <TaskCreationForm supervisedStaff={managedStaff} supervisorId={user.id} />
    </div>
  );
}