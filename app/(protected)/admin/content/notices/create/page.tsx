"use client";

import { NoticeForm } from "../../_components/NoticeForm";
import { useContentManagement } from "@/hooks/admin/useContentManagement";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CreateNoticePage() {
  const { createNotice } = useContentManagement();

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
       <div className="flex items-center gap-4">
          <Button variant="ghost" asChild>
             <Link href="/admin/content/notices"><ArrowLeft className="mr-2 h-4 w-4"/> Back</Link>
          </Button>
          <h1 className="text-2xl font-bold">Create New Notice</h1>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
             <Card>
                <CardHeader><CardTitle>Notice Details</CardTitle></CardHeader>
                <CardContent>
                   <NoticeForm onSubmit={createNotice} />
                </CardContent>
             </Card>
          </div>
          
          <div className="space-y-6">
             <Card className="bg-blue-50 border-blue-100">
                <CardHeader><CardTitle className="text-blue-800 text-sm">Preview</CardTitle></CardHeader>
                <CardContent>
                   <p className="text-sm text-blue-700">
                      Notices are broadcast to the citizen mobile app immediately upon publishing. Urgent notices will trigger a push notification.
                   </p>
                </CardContent>
             </Card>
          </div>
       </div>
    </div>
  );
}