"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { StaffForm } from "../_components/StaffForm";
import { useStaffManagement } from "@/hooks/admin/useStaffManagement";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, UserPlus, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function CreateStaffPage() {
  const { createStaff } = useStaffManagement();
  const [departments, setDepartments] = useState([]);
  const [wards, setWards] = useState([]);
  const [loadingResources, setLoadingResources] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  // Load dependency data (Departments & Wards)
  useEffect(() => {
     const loadData = async () => {
         try {
             const [d, w] = await Promise.all([
                 supabase.from("departments").select("id, name").order("name"),
                 supabase.from("wards").select("id, ward_number, name").order("ward_number")
             ]);
             if(d.data) setDepartments(d.data as any);
             if(w.data) setWards(w.data as any);
         } catch (error) {
             console.error("Failed to load resources", error);
             toast.error("Failed to load departments or wards");
         } finally {
             setLoadingResources(false);
         }
     };
     loadData();
  }, []);

  // Wrapper to handle redirection after successful creation
  const handleCreate = async (data: any) => {
    try {
        // Assume createStaff returns the new staff object or ID. 
        // If your hook currently returns void, you may need to update it to return 'data'.
        const newStaff = await createStaff(data);
        
        // If the hook returns the object (Supabase RPC usually returns the created row)
        if (newStaff && newStaff.user_id) {
            toast.success("Staff profile created successfully");
            router.push(`/admin/staff/${newStaff.user_id}`); // Navigate to Details
        } else {
            // Fallback if no ID is returned
            router.push("/admin/staff");
        }
    } catch (error) {
        // Error handling is likely done in the hook, but safety net here
        console.error("Creation failed", error);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-6">
       {/* Header */}
       <div className="flex items-center justify-between">
         <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full bg-white border shadow-sm hover:bg-slate-50" asChild>
                <Link href="/admin/staff"><ArrowLeft className="h-4 w-4 text-slate-600"/></Link>
            </Button>
            <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Onboard New Staff</h1>
                <p className="text-sm text-slate-500">Register a new employee and assign system permissions.</p>
            </div>
         </div>
       </div>
       
       <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Context Sidebar (Help text) */}
          <div className="md:col-span-4 space-y-4">
             <Card className="bg-blue-50/50 border-blue-100 shadow-sm">
                <CardContent className="p-4">
                   <div className="flex items-start gap-3">
                      <ShieldAlert className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                         <h3 className="font-semibold text-blue-900 text-sm">Access Control</h3>
                         <p className="text-xs text-blue-700/80 mt-1 leading-relaxed">
                            <strong>Ward Staff</strong> can only see data within their assigned ward. <br/><br/>
                            <strong>Department Heads</strong> have broader visibility over their specific sector.
                         </p>
                      </div>
                   </div>
                </CardContent>
             </Card>
             <Card className="border-slate-200 shadow-sm">
                 <CardContent className="p-4 text-sm text-slate-500">
                    <p>Ensure the email address is correct. An invitation will be sent to the user to set their password.</p>
                 </CardContent>
             </Card>
          </div>

          {/* Main Form */}
          <div className="md:col-span-8">
            <Card className="border-slate-200 shadow-sm overflow-hidden">
                <div className="h-1.5 w-full bg-linear-to-r from-blue-600 to-indigo-600" />
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-slate-100 rounded-lg">
                            <UserPlus className="w-5 h-5 text-slate-600" />
                        </div>
                        <div>
                            <CardTitle className="text-lg">Staff Details</CardTitle>
                            <CardDescription>Fill in the required information below.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {!loadingResources ? (
                        <StaffForm 
                            departments={departments} 
                            wards={wards} 
                            onSubmit={handleCreate} 
                        />
                    ) : (
                        <div className="py-10 text-center text-slate-400">
                            Loading form resources...
                        </div>
                    )}
                </CardContent>
            </Card>
          </div>
       </div>
    </div>
  );
}