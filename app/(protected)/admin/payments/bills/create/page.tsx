"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createClient } from "@/lib/supabase/client";
import { adminPaymentQueries } from "@/lib/supabase/queries/admin/payments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

const schema = z.object({
  citizen_id: z.string().uuid("Invalid Citizen ID"),
  bill_type: z.enum(['property_tax', 'water_bill', 'waste_management', 'business_license', 'other_fee']),
  base_amount: z.string().transform((val) => Number(val)),
  description: z.string().optional(),
  due_date: z.string()
});

export default function CreateBillPage() {
  const router = useRouter();
  const supabase = createClient();
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema)
  });

  const onSubmit = async (data: any) => {
    try {
      await adminPaymentQueries.createBill(supabase, {
          ...data,
          total_amount: data.base_amount, // Simplified tax logic for demo
          status: 'pending'
      });
      toast.success("Bill generated successfully");
      router.push("/admin/payments/bills");
    } catch (error) {
      toast.error("Failed to create bill");
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
       <Button variant="ghost" asChild className="pl-0">
          <Link href="/admin/payments/bills"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Bills</Link>
       </Button>

       <Card>
          <CardHeader>
             <CardTitle>Generate New Invoice</CardTitle>
          </CardHeader>
          <CardContent>
             <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                   <label className="text-sm font-medium">Citizen User ID</label>
                   <Input {...register("citizen_id")} placeholder="UUID of the citizen" />
                   {errors.citizen_id && <p className="text-red-500 text-xs">{errors.citizen_id.message as string}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="text-sm font-medium">Bill Type</label>
                      <Select onValueChange={(v) => setValue("bill_type", v)}>
                         <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                         </SelectTrigger>
                         <SelectContent>
                            <SelectItem value="property_tax">Property Tax</SelectItem>
                            <SelectItem value="water_bill">Water Bill</SelectItem>
                            <SelectItem value="waste_management">Waste Management</SelectItem>
                            <SelectItem value="business_license">Business License</SelectItem>
                            <SelectItem value="other_fee">Other Fee</SelectItem>
                         </SelectContent>
                      </Select>
                   </div>
                   <div>
                      <label className="text-sm font-medium">Amount (NPR)</label>
                      <Input type="number" {...register("base_amount")} placeholder="0.00" />
                   </div>
                </div>

                <div>
                   <label className="text-sm font-medium">Due Date</label>
                   <Input type="date" {...register("due_date")} />
                </div>

                <div>
                   <label className="text-sm font-medium">Description (Optional)</label>
                   <Input {...register("description")} placeholder="e.g. FY 2080/81 Tax" />
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                   {isSubmitting ? "Generating..." : "Generate Bill"}
                </Button>
             </form>
          </CardContent>
       </Card>
    </div>
  );
}