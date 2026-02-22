"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn } from "@/lib/utils";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

// Icons
import { ShieldCheck, UserPlus, Building2, MapPin, Phone } from "lucide-react";
import { CreateStaffInput } from "@/features/staff/types";

const schema = z.object({
  full_name: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid official email address"),
  phone: z.string().min(10, "Valid phone number required"),
  staff_role: z.enum([
    "ward_staff",
    "dept_staff",
    "field_staff",
    "dept_head",
    "admin",
    "call_center",
  ]),
  department_id: z.string().optional(),
  ward_id: z.string().optional(),
  is_supervisor: z.boolean(),
  specializations: z.array(z.string()),
});

interface StaffFormProps {
  departments: { id: string; name: string }[];
  wards: { id: string; name: string; ward_number: number }[];
  onSubmit: (data: CreateStaffInput) => Promise<void>;
}

export function StaffForm({ departments, wards, onSubmit }: StaffFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      is_supervisor: false,
      staff_role: "ward_staff",
      specializations: [],
    },
  });

  const selectedRole = watch("staff_role");

  return (
    <form
      onSubmit={handleSubmit((data) => onSubmit(data as any))}
      className="space-y-8"
    >
      {/* 1. Identity Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Badge className="bg-primary/10 text-primary border-none p-1.5">
            <UserPlus className="w-4 h-4" />
          </Badge>
          <h3 className="text-sm font-black uppercase tracking-widest text-foreground">
            Identity & Contact
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase text-muted-foreground">
              Full Legal Name
            </Label>
            <Input
              {...register("full_name")}
              className="h-11 rounded-xl border-2 focus:ring-primary/20"
              placeholder="e.g. Ram Bahadur Gurung"
            />
            {errors.full_name && (
              <p className="text-destructive text-xs font-bold">
                {errors.full_name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase text-muted-foreground">
              Official Email
            </Label>
            <Input
              {...register("email")}
              type="email"
              className="h-11 rounded-xl border-2"
              placeholder="staff.name@pokhara.gov.np"
            />
            {errors.email && (
              <p className="text-destructive text-xs font-bold">
                {errors.email.message}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
            <Phone className="w-3 h-3" /> Mobile Number
          </Label>
          <Input
            {...register("phone")}
            className="h-11 rounded-xl border-2"
            placeholder="98XXXXXXXX"
          />
          {errors.phone && (
            <p className="text-destructive text-xs font-bold">
              {errors.phone.message}
            </p>
          )}
        </div>
      </section>

      {/* 2. Assignment Section */}
      <section className="p-6 rounded-2xl bg-muted/30 border-2 border-border border-dashed space-y-6">
        <div className="flex items-center gap-2 mb-2">
          <Badge className="bg-accent-nature/10 text-accent-nature border-none p-1.5">
            <Building2 className="w-4 h-4" />
          </Badge>
          <h3 className="text-sm font-black uppercase tracking-widest text-foreground">
            Role & Assignment
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase text-muted-foreground">
              Functional Role
            </Label>
            <Select
              onValueChange={(v) => setValue("staff_role", v as any)}
              defaultValue="ward_staff"
            >
              <SelectTrigger className="h-11 rounded-xl border-2 bg-card">
                <SelectValue placeholder="Select Role" />
              </SelectTrigger>
              <SelectContent className="glass">
                <SelectItem value="ward_staff">Ward Staff</SelectItem>
                <SelectItem value="dept_staff">Department Staff</SelectItem>
                <SelectItem value="field_staff">Field Technician</SelectItem>
                <SelectItem value="dept_head">Department Head</SelectItem>
                <SelectItem value="call_center">
                  Call Center Operator
                </SelectItem>
                <SelectItem value="admin">System Administrator</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Conditional Department Select */}
          {["dept_staff", "dept_head", "field_staff"].includes(
            selectedRole
          ) && (
            <div className="space-y-2 animate-in fade-in slide-in-from-left-2">
              <Label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
                <Building2 className="w-3 h-3" /> Assigned Department
              </Label>
              <Select onValueChange={(v) => setValue("department_id", v)}>
                <SelectTrigger className="h-11 rounded-xl border-2 bg-card">
                  <SelectValue placeholder="Choose Department" />
                </SelectTrigger>
                <SelectContent className="glass">
                  {departments.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Conditional Ward Select */}
          {["ward_staff", "field_staff"].includes(selectedRole) && (
            <div className="space-y-2 animate-in fade-in slide-in-from-right-2">
              <Label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
                <MapPin className="w-3 h-3" /> Jurisdiction (Ward)
              </Label>
              <Select onValueChange={(v) => setValue("ward_id", v)}>
                <SelectTrigger className="h-11 rounded-xl border-2 bg-card">
                  <SelectValue placeholder="Choose Ward" />
                </SelectTrigger>
                <SelectContent className="glass">
                  {wards.map((w) => (
                    <SelectItem key={w.id} value={w.id}>
                      Ward No. {w.ward_number} — {w.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </section>

      {/* 3. Privileges */}
      <div className="flex items-start gap-4 p-4 rounded-xl border-2 border-primary/20 bg-primary/5 group transition-colors hover:bg-primary/10">
        <div className="pt-0.5">
          <Checkbox
            id="supervisor"
            onCheckedChange={(c) => setValue("is_supervisor", !!c)}
            className="w-5 h-5 rounded-md border-2 border-primary data-[state=checked]:bg-primary"
          />
        </div>
        <div className="grid gap-1.5 leading-none">
          <label
            htmlFor="supervisor"
            className="text-sm font-bold flex items-center gap-2 text-primary"
          >
            <ShieldCheck className="w-4 h-4" />
            Grant Supervisor Privileges
          </label>
          <p className="text-xs text-muted-foreground font-medium">
            Supervisors can reassign tasks, approve department resolutions, and
            manage junior staff.
          </p>
        </div>
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-12 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg elevation-2 hover:scale-[1.01] active:scale-[0.98] transition-all"
      >
        {isSubmitting
          ? "Cryptographic Registration in Progress..."
          : "Finalize Staff Registration"}
      </Button>
    </form>
  );
}