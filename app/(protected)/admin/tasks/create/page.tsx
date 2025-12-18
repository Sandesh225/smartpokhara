"use client";
import { CreateTaskForm } from "../_components/CreateTaskForm";
import { useTaskManagement } from "@/hooks/admin/useTaskManagement";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { adminStaffQueries } from "@/lib/supabase/queries/admin/staff";

export default function CreateTaskPage() {
  const { createTask } = useTaskManagement();
  const [staff, setStaff] = useState([]);
  const supabase = createClient();

  useEffect(() => {
     // Fetch staff list for dropdown
     adminStaffQueries.getAllStaff(supabase).then(setStaff);
  }, []);

  return (
    <div className="max-w-2xl mx-auto py-8">
       <Card>
          <CardHeader>
             <CardTitle>Create New Task</CardTitle>
          </CardHeader>
          <CardContent>
             <CreateTaskForm staffList={staff} onSubmit={createTask} />
          </CardContent>
       </Card>
    </div>
  );
}