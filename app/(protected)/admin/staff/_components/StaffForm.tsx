"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { CreateStaffInput } from "@/types/admin-staff";
import { Label } from "@/components/ui/label";

const schema = z.object({
  full_name: z.string().min(2, "Name required"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(10, "Phone required"),
  staff_role: z.enum(['ward_staff', 'dept_staff', 'field_staff', 'dept_head', 'admin', 'call_center']),
  department_id: z.string().optional(),
  ward_id: z.string().optional(),
  is_supervisor: z.boolean().default(false)
});

interface StaffFormProps {
  departments: any[];
  wards: any[];
  onSubmit: (data: CreateStaffInput) => Promise<void>;
}

export function StaffForm({ departments, wards, onSubmit }: StaffFormProps) {
  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
        is_supervisor: false,
        staff_role: 'ward_staff' as const
    }
  });

  const selectedRole = watch("staff_role");

  return (
    <form onSubmit={handleSubmit((data: any) => onSubmit(data))} className="space-y-6">
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
             <Label>Full Name</Label>
             <Input {...register("full_name")} placeholder="e.g. Ram Bahadur" />
             {errors.full_name && <p className="text-red-500 text-xs">{errors.full_name.message as string}</p>}
          </div>
          <div className="space-y-2">
             <Label>Email</Label>
             <Input {...register("email")} placeholder="staff@pokhara.gov.np" />
             {errors.email && <p className="text-red-500 text-xs">{errors.email.message as string}</p>}
          </div>
       </div>

       <div className="space-y-2">
          <Label>Phone Number</Label>
          <Input {...register("phone")} placeholder="98XXXXXXXX" />
          {errors.phone && <p className="text-red-500 text-xs">{errors.phone.message as string}</p>}
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border">
          <div className="space-y-2">
             <Label>Role</Label>
             <Select onValueChange={(v) => setValue("staff_role", v as any)} defaultValue="ward_staff">
                <SelectTrigger><SelectValue placeholder="Select Role" /></SelectTrigger>
                <SelectContent>
                   <SelectItem value="ward_staff">Ward Staff</SelectItem>
                   <SelectItem value="dept_staff">Department Staff</SelectItem>
                   <SelectItem value="field_staff">Field Technician</SelectItem>
                   <SelectItem value="dept_head">Department Head</SelectItem>
                   <SelectItem value="call_center">Call Center</SelectItem>
                </SelectContent>
             </Select>
          </div>
          
          {['dept_staff', 'dept_head', 'field_staff'].includes(selectedRole) && (
             <div className="space-y-2">
                <Label>Department</Label>
                <Select onValueChange={(v) => setValue("department_id", v)}>
                    <SelectTrigger><SelectValue placeholder="Select Department" /></SelectTrigger>
                    <SelectContent>
                       {departments.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                    </SelectContent>
                </Select>
             </div>
          )}

          {['ward_staff', 'field_staff'].includes(selectedRole) && (
             <div className="space-y-2">
                <Label>Ward Assignment</Label>
                <Select onValueChange={(v) => setValue("ward_id", v)}>
                    <SelectTrigger><SelectValue placeholder="Select Ward" /></SelectTrigger>
                    <SelectContent>
                       {wards.map(w => <SelectItem key={w.id} value={w.id}>{w.ward_number} - {w.name}</SelectItem>)}
                    </SelectContent>
                </Select>
             </div>
          )}
       </div>

       <div className="flex items-center gap-2 pt-2">
          <Checkbox id="supervisor" onCheckedChange={(c) => setValue("is_supervisor", !!c)} />
          <Label htmlFor="supervisor" className="text-sm font-normal text-gray-700">Grant Supervisor Privileges (Can manage other staff)</Label>
       </div>

       <div className="pt-4">
          <Button type="submit" className="w-full" disabled={isSubmitting}>
             {isSubmitting ? "Processing..." : "Register Staff Member"}
          </Button>
       </div>
    </form>
  );
}