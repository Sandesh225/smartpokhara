// ═══════════════════════════════════════════════════════════
// app/(protected)/admin/content/notices/[id]/edit/page.tsx
// ═══════════════════════════════════════════════════════════

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { NoticeForm } from "../../../_components/NoticeForm";
import { useNotice, useNoticeMutations } from "@/features/notices";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertTriangle, Edit3 } from "lucide-react";
import Link from "next/link";

export default function EditNoticePage() {
  const { id } = useParams();
  const { data: notice, isLoading: loading } = useNotice(id as string);
  const { updateNotice } = useNoticeMutations();

  const noticeData = notice ? {
    ...notice,
    ward_id: notice.ward_id || "all",
    expires_at: notice.expires_at
      ? new Date(notice.expires_at).toISOString().slice(0, 16)
      : "",
  } : null;

  const handleUpdate = async (updates: any) => {
    await updateNotice.mutateAsync({ id: id as string, updates });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
        <p className="text-muted-foreground font-medium">Loading notice...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 px-2 sm:px-4 lg:px-6 py-4 md:py-6">
      {/* HEADER */}
      <div className="flex items-center gap-3 md:gap-4">
        <Button variant="ghost" size="icon" asChild className="flex-shrink-0">
          <Link href="/admin/content/notices">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Edit3 className="w-5 h-5 md:w-6 md:h-6 text-primary" />
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-foreground tracking-tighter">
            Edit Notice
          </h1>
        </div>
      </div>

      {/* LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* MAIN FORM */}
        <div className="lg:col-span-2">
          <div className="stone-card overflow-hidden">
            <CardHeader className="border-b-2 border-border bg-muted/30">
              <CardTitle className="text-base md:text-lg font-black text-foreground">
                Notice Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              {noticeData ? (
                <NoticeForm initialData={noticeData as any} onSubmit={handleUpdate} />
              ) : (
                <div className="text-center py-10">
                  <AlertTriangle className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">Notice not found</p>
                </div>
              )}
            </CardContent>
          </div>
        </div>

        {/* SIDEBAR */}
        <div className="space-y-4 md:space-y-6">
          {/* WARNING */}
          <div className="stone-card overflow-hidden border-warning-amber/30 bg-warning-amber/5">
            <CardHeader className="pb-3 border-b-2 border-warning-amber/20 bg-warning-amber/10">
              <CardTitle className="text-sm md:text-base font-black text-warning-amber flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" /> Important Notice
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              <p className="text-xs md:text-sm text-foreground">
                Editing a published notice will <strong>not</strong> re-send
                push notifications to citizens to avoid spam. Only new notices
                trigger notifications.
              </p>
            </CardContent>
          </div>
        </div>
      </div>
    </div>
  );
}
