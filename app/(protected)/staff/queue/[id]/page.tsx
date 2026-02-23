// FILE: app/(protected)/staff/queue/[id]/page.tsx
import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { staffApi } from "@/features/staff/api";
import { getCurrentUserWithRoles } from "@/lib/auth/session";
import { QueueDetailClient } from "./QueueDetailClient";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TaskDetailPage({ params }: PageProps) {
  const { id } = await params;

  // 1. Auth Check (Server-Side)
  const staff = await getCurrentUserWithRoles();
  if (!staff) redirect("/login");

  const supabase = await createClient();

  // 2. Fetch Assignment
  const assignment = await staffApi.getAssignmentById(supabase, id);
  if (!assignment) return notFound();

  // 3. Determine View Mode & IDs
  const currentUserId = staff.id;
  const assignmentStaffId = assignment.staff_id;
  const isAssignee = currentUserId === assignmentStaffId;

  return (
    <QueueDetailClient 
      assignment={assignment} 
      isAssignee={isAssignee} 
      currentUserId={currentUserId} 
    />
  );
}