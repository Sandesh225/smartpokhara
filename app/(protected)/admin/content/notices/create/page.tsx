"use client";

import { NoticeForm } from "../../_components/NoticeForm";
import { useContentManagement } from "@/hooks/admin/useContentManagement";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Info } from "lucide-react";
import Link from "next/link";

export default function CreateNoticePage() {
  const { createNotice } = useContentManagement();

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          asChild
          className="pl-0 hover:bg-transparent hover:text-blue-600"
        >
          <Link href="/admin/content/notices">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Notices
          </Link>
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Create New Notice
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle>Notice Details</CardTitle>
            </CardHeader>
            <CardContent>
              <NoticeForm onSubmit={createNotice} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-blue-50 border-blue-100 shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-blue-900 text-sm flex items-center gap-2">
                <Info className="h-4 w-4" /> Visibility Guide
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-blue-800 space-y-3">
              <p>
                <strong>Public Notices:</strong> Visible to all citizens
                regardless of their registered ward. Use for city-wide
                announcements.
              </p>
              <p>
                <strong>Ward Specific:</strong> Only visible to citizens
                registered in the selected ward.
              </p>
              <p>
                <strong>Urgent:</strong> Pinned to the top of the citizen
                dashboard and highlighted in red.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}