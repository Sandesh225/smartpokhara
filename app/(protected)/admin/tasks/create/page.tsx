"use client";
import { CreateTaskForm } from "../_components/CreateTaskForm";
import { useTaskManagement } from "@/hooks/admin/useTaskManagement";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { adminStaffQueries } from "@/lib/supabase/queries/admin/staff";
import { toast } from "sonner";

export default function CreateTaskPage() {
  const { createTask } = useTaskManagement();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function loadStaff() {
      try {
        const data = await adminStaffQueries.getStaffForSelection(supabase);
        setStaff(data);
      } catch (err: any) {
        toast.error("Failed to load staff list: " + err.message);
      } finally {
        setLoading(false);
      }
    }
    loadStaff();
  }, []);

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Create New Task</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              Loading available staff...
            </div>
          ) : (
            <CreateTaskForm staffList={staff} onSubmit={createTask} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}