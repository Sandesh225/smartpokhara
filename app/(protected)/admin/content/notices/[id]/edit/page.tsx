"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { NoticeForm } from "../../_components/NoticeForm";
import { useContentManagement } from "@/hooks/admin/useContentManagement";
import { adminContentQueries } from "@/lib/supabase/queries/admin/content";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { NoticeInput } from "@/types/admin-content";

export default function EditNoticePage() {
  const { id } = useParams();
  const { updateNotice } = useContentManagement();
  const [loading, setLoading] = useState(true);
  const [noticeData, setNoticeData] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    const loadNotice = async () => {
       try {
         const data = await adminContentQueries.getNoticeById(supabase, id as string);
         if (data) {
            // Transform date for input field format (YYYY-MM-DDTHH:mm)
            const formatted = {
                ...data,
                ward_id: data.ward_id || "all",
                expires_at: data.expires_at ? new Date(data.expires_at).toISOString().slice(0, 16) : ""
            };
            setNoticeData(formatted);
         }
       } catch (e) {
         toast.error("Failed to load notice");
       } finally {
         setLoading(false);
       }
    };
    if (id) loadNotice();
  }, [id, supabase]);

  const handleUpdate = async (data: NoticeInput) => {
      await updateNotice(id as string, data);
  };

  if (loading) return <div className="p-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600"/></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
       <div className="flex items-center gap-4">
          <Button variant="ghost" asChild>
             <Link href="/admin/content/notices"><ArrowLeft className="mr-2 h-4 w-4"/> Back</Link>
          </Button>
          <h1 className="text-2xl font-bold">Edit Notice</h1>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
             <Card>
                <CardHeader><CardTitle>Notice Details</CardTitle></CardHeader>
                <CardContent>
                   <NoticeForm initialData={noticeData} onSubmit={handleUpdate} />
                </CardContent>
             </Card>
          </div>
          
          <div className="space-y-6">
             <Card className="bg-amber-50 border-amber-100">
                <CardHeader><CardTitle className="text-amber-800 text-sm">Warning</CardTitle></CardHeader>
                <CardContent>
                   <p className="text-sm text-amber-700">
                      Editing a published notice will <strong>not</strong> re-send push notifications to citizens to avoid spam.
                   </p>
                </CardContent>
             </Card>
          </div>
       </div>
    </div>
  );
}