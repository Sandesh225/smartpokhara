// ═══════════════════════════════════════════════════════════
// CREATE TASK PAGE
// ═══════════════════════════════════════════════════════════

"use client";
import { CreateTaskForm } from "../_components/CreateTaskForm";
import { useTaskMutations } from "@/features/tasks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { staffApi } from "@/features/staff";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CreateTaskPage() {
  const { createTask } = useTaskMutations();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    async function loadStaff() {
      try {
        const data = await staffApi.getStaffForSelection(supabase);
        setStaff(data as any);
      } catch (err: any) {
        toast.error("Failed to load staff list");
      } finally {
        setLoading(false);
      }
    }
    loadStaff();
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-2 sm:px-4 lg:px-6 py-4 md:py-8">
      {/* BACK BUTTON */}
      <Button variant="ghost" asChild size="sm" className="mb-4 md:mb-6">
        <Link href="/admin/tasks">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Tasks
        </Link>
      </Button>

      {/* FORM CARD */}
      <Card className="stone-card">
        <CardHeader className="p-4 md:p-6 border-b border-border bg-muted/30">
          <CardTitle className="text-lg md:text-xl font-black">
            Create New Task
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          {loading ? (
            <div className="py-12 text-center">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">
                Loading available staff...
              </p>
            </div>
          ) : (
            <CreateTaskForm 
              staffList={staff} 
              onSubmit={async (data) => {
                await createTask.mutateAsync(data);
                router.push("/admin/tasks");
              }} 
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
