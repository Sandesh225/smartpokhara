"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/lib/hooks/use-complaints";
import { isStaff } from "@/lib/auth/role-helpers";
import { Loader2 } from "lucide-react";

export default function StaffAppHomePage() {
  const router = useRouter();
  const { user, loading } = useCurrentUser();

  useEffect(() => {
    if (loading) return;

    if (!user || !isStaff(user)) {
      router.replace("/citizen/dashboard");
      return;
    }

    // Role-based routing
    // Note: user.roles is an array, we check specific includes
    if (user.roles.includes("field_staff")) {
      router.replace("/staff/queue/my-tasks");
    } else if (user.roles.includes("ward_staff")) {
      // Assuming you might add a ward queue later, for now team or my-tasks
      router.replace("/staff/queue/my-tasks");
    } else {
      // Dept staff / General fallback
      router.replace("/staff/queue/team");
    }
  }, [user, loading, router]);

  return (
    <div className="flex h-[50vh] items-center justify-center flex-col gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      <p className="text-gray-500">Loading your workspace...</p>
    </div>
  );
}
