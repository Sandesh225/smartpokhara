// ═══════════════════════════════════════════════════════════
// CREATE TASK FORM
// ═══════════════════════════════════════════════════════════

"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreateTaskInput } from "@/types/admin-tasks";
import { Label } from "@/components/ui/label";

const schema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  priority: z.enum(["low", "medium", "high", "critical"]),
  task_type: z.enum([
    "preventive_maintenance",
    "inspection",
    "follow_up",
    "project_work",
    "administrative",
  ]),
  due_date: z
    .string()
    .refine((date) => new Date(date) > new Date(), "Date must be in future"),
  primary_assigned_to: z.string().uuid("Please select a staff member"),
});

interface CreateTaskFormProps {
  staffList: any[];
  onSubmit: (data: CreateTaskInput) => Promise<void>;
}

export function CreateTaskForm({ staffList, onSubmit }: CreateTaskFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const onFormSubmit = (data: any) => {
    onSubmit({ ...data, due_date: new Date(data.due_date).toISOString() });
  };

  return (
    <form
      onSubmit={handleSubmit(onFormSubmit)}
      className="space-y-4 md:space-y-6"
    >
      {/* TITLE */}
      <div className="space-y-2">
        <Label htmlFor="title" className="text-sm font-bold">
          Task Title *
        </Label>
        <Input
          id="title"
          {...register("title")}
          placeholder="e.g. Inspect Ward 4 Potholes"
        />
        {errors.title && (
          <p className="text-error-red text-xs font-medium">
            {errors.title.message as string}
          </p>
        )}
      </div>

      {/* DESCRIPTION */}
      <div className="space-y-2">
        <Label htmlFor="description" className="text-sm font-bold">
          Description *
        </Label>
        <Textarea
          id="description"
          {...register("description")}
          placeholder="Detailed instructions..."
          className="min-h-[100px]"
        />
        {errors.description && (
          <p className="text-error-red text-xs font-medium">
            {errors.description.message as string}
          </p>
        )}
      </div>

      {/* PRIORITY & TYPE */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-bold">Priority *</Label>
          <Select onValueChange={(v) => setValue("priority", v as any)}>
            <SelectTrigger>
              <SelectValue placeholder="Select Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>
          {errors.priority && (
            <p className="text-error-red text-xs font-medium">
              {errors.priority.message as string}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-bold">Type *</Label>
          <Select onValueChange={(v) => setValue("task_type", v as any)}>
            <SelectTrigger>
              <SelectValue placeholder="Task Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="inspection">Inspection</SelectItem>
              <SelectItem value="preventive_maintenance">
                Maintenance
              </SelectItem>
              <SelectItem value="follow_up">Follow-up</SelectItem>
              <SelectItem value="project_work">Project Work</SelectItem>
              <SelectItem value="administrative">Administrative</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* DEADLINE & ASSIGNEE */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="due_date" className="text-sm font-bold">
            Deadline *
          </Label>
          <Input
            id="due_date"
            type="datetime-local"
            {...register("due_date")}
          />
          {errors.due_date && (
            <p className="text-error-red text-xs font-medium">
              {errors.due_date.message as string}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-bold">Assignee *</Label>
          <Select onValueChange={(v) => setValue("primary_assigned_to", v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select Staff" />
            </SelectTrigger>
            <SelectContent>
              {staffList.map((s) => (
                <SelectItem key={s.user_id} value={s.user_id}>
                  {s.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.primary_assigned_to && (
            <p className="text-error-red text-xs font-medium">
              {errors.primary_assigned_to.message as string}
            </p>
          )}
        </div>
      </div>

      {/* SUBMIT */}
      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting}
        size="lg"
      >
        {isSubmitting ? "Creating Task..." : "Create Task"}
      </Button>
    </form>
  );
}
