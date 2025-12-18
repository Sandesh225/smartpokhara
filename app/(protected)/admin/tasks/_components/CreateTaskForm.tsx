"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreateTaskInput } from "@/types/admin-tasks";

const schema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  task_type: z.enum(['preventive_maintenance', 'inspection', 'follow_up', 'project_work', 'administrative']),
  due_date: z.string().refine((date) => new Date(date) > new Date(), "Date must be in future"),
  primary_assigned_to: z.string().uuid()
});

interface CreateTaskFormProps {
  staffList: any[];
  onSubmit: (data: CreateTaskInput) => Promise<void>;
}

export function CreateTaskForm({ staffList, onSubmit }: CreateTaskFormProps) {
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema)
  });

  const onFormSubmit = (data: any) => {
     onSubmit({ ...data, due_date: new Date(data.due_date) });
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
       <div>
         <label className="text-sm font-medium">Task Title</label>
         <Input {...register('title')} placeholder="e.g. Inspect Ward 4 Potholes" />
         {errors.title && <p className="text-red-500 text-xs">{errors.title.message as string}</p>}
       </div>

       <div>
         <label className="text-sm font-medium">Description</label>
         <Textarea {...register('description')} placeholder="Detailed instructions..." />
         {errors.description && <p className="text-red-500 text-xs">{errors.description.message as string}</p>}
       </div>

       <div className="grid grid-cols-2 gap-4">
          <div>
             <label className="text-sm font-medium">Priority</label>
             <Select onValueChange={(v) => setValue('priority', v)}>
                <SelectTrigger><SelectValue placeholder="Select Priority" /></SelectTrigger>
                <SelectContent>
                   <SelectItem value="low">Low</SelectItem>
                   <SelectItem value="medium">Medium</SelectItem>
                   <SelectItem value="high">High</SelectItem>
                   <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
             </Select>
          </div>
          <div>
             <label className="text-sm font-medium">Type</label>
             <Select onValueChange={(v) => setValue('task_type', v)}>
                <SelectTrigger><SelectValue placeholder="Task Type" /></SelectTrigger>
                <SelectContent>
                   <SelectItem value="inspection">Inspection</SelectItem>
                   <SelectItem value="preventive_maintenance">Maintenance</SelectItem>
                   <SelectItem value="administrative">Administrative</SelectItem>
                </SelectContent>
             </Select>
          </div>
       </div>

       <div className="grid grid-cols-2 gap-4">
          <div>
             <label className="text-sm font-medium">Deadline</label>
             <Input type="datetime-local" {...register('due_date')} />
             {errors.due_date && <p className="text-red-500 text-xs">{errors.due_date.message as string}</p>}
          </div>
          <div>
             <label className="text-sm font-medium">Assignee</label>
             <Select onValueChange={(v) => setValue('primary_assigned_to', v)}>
                <SelectTrigger><SelectValue placeholder="Select Staff" /></SelectTrigger>
                <SelectContent>
                   {staffList.map(s => (
                      <SelectItem key={s.user_id} value={s.user_id}>{s.full_name}</SelectItem>
                   ))}
                </SelectContent>
             </Select>
          </div>
       </div>

       <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Task"}
       </Button>
    </form>
  );
}