// ═══════════════════════════════════════════════════════════
// ASSIGN/REASSIGN TASK PAGE
// ═══════════════════════════════════════════════════════════

"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { staffApi } from "@/features/staff";
import { useTaskMutations } from "@/features/tasks";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, UserCheck, Briefcase, Clock } from "lucide-react";
import Link from "next/link";

export default function AssignTaskPage() {
  const { id } = useParams();
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { assignTask } = useTaskMutations();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function loadStaff() {
      try {
        const data = await staffApi.getAllStaff(supabase);
        setStaff(data);
      } catch (err) {
        toast.error("Failed to load staff");
      } finally {
        setLoading(false);
      }
    }
    loadStaff();
  }, []);

  const handleAssign = async (staffId: string) => {
    try {
      await assignTask.mutateAsync({ taskId: id as string, staffId });
      router.push(`/admin/tasks/${id}`);
    } catch (e) {
      // Error handled in mutation
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Loading staff...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-2 sm:px-4 lg:px-6 py-4 md:py-8 space-y-4 md:space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Button variant="ghost" asChild size="sm" className="mb-2">
            <Link href={`/admin/tasks/${id}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Task
            </Link>
          </Button>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground">
            Reassign Task
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Select a staff member to assign this task
          </p>
        </div>
      </div>

      {/* STAFF GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        {staff.map((s) => (
          <Card
            key={s.user_id}
            className={`cursor-pointer hover:border-primary hover:shadow-md transition-all ${
              assignTask.isPending ? "opacity-50 pointer-events-none" : ""
            }`}
            onClick={() => handleAssign(s.user_id)}
          >
            <CardContent className="flex items-center gap-3 md:gap-4 p-4">
              {/* AVATAR */}
              <Avatar className="h-10 w-10 md:h-12 md:w-12 border-2 border-border flex-shrink-0">
                <AvatarImage src={s.avatar_url} />
                <AvatarFallback className="text-sm md:text-base">
                  {s.full_name[0]}
                </AvatarFallback>
              </Avatar>

              {/* INFO */}
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-sm md:text-base text-foreground truncate">
                  {s.full_name}
                </h4>
                <p className="text-xs text-muted-foreground truncate">
                  {s.staff_role} • {s.department_name}
                </p>
              </div>

              {/* STATUS */}
              <div className="text-right text-xs flex-shrink-0">
                <div className="flex items-center gap-1 text-muted-foreground mb-1">
                  <Briefcase className="w-3 h-3" />
                  <span className="font-bold">
                    Load: {s.current_workload || 0}
                  </span>
                </div>
                <Badge
                  variant={
                    s.availability_status === "available"
                      ? "default"
                      : "outline"
                  }
                  className={`text-[10px] ${
                    s.availability_status === "available"
                      ? "bg-success-green"
                      : "bg-warning-amber"
                  }`}
                >
                  {s.availability_status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {staff.length === 0 && (
        <div className="text-center py-12 stone-card">
          <UserCheck className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
          <p className="text-sm text-muted-foreground">
            No staff members available
          </p>
        </div>
      )}
    </div>
  );
}
