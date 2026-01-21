// ═══════════════════════════════════════════════════════════
// app/(protected)/admin/content/notices/create/page.tsx
// ═══════════════════════════════════════════════════════════

"use client";

import { NoticeForm } from "../../_components/NoticeForm";
import { useContentManagement } from "@/hooks/admin/useContentManagement";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Info, AlertCircle, Megaphone } from "lucide-react";
import Link from "next/link";

export default function CreateNoticePage() {
  const { createNotice } = useContentManagement();

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
            <Megaphone className="w-5 h-5 md:w-6 md:h-6 text-primary" />
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-foreground tracking-tighter">
            Create New Notice
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
              <NoticeForm onSubmit={createNotice} />
            </CardContent>
          </div>
        </div>

        {/* SIDEBAR */}
        <div className="space-y-4 md:space-y-6">
          {/* VISIBILITY GUIDE */}
          <div className="stone-card overflow-hidden border-info-blue/30 bg-info-blue/5">
            <CardHeader className="pb-3 border-b-2 border-info-blue/20 bg-info-blue/10">
              <CardTitle className="text-sm md:text-base font-black text-info-blue flex items-center gap-2">
                <Info className="h-4 w-4" /> Visibility Guide
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6 space-y-3 text-xs md:text-sm text-foreground">
              <div className="space-y-1">
                <p className="font-bold text-info-blue">Public Notices:</p>
                <p className="text-muted-foreground">
                  Visible to all citizens regardless of their registered ward.
                  Use for city-wide announcements.
                </p>
              </div>
              <div className="space-y-1">
                <p className="font-bold text-warning-amber">Ward Specific:</p>
                <p className="text-muted-foreground">
                  Only visible to citizens registered in the selected ward.
                </p>
              </div>
              <div className="space-y-1">
                <p className="font-bold text-error-red">Urgent:</p>
                <p className="text-muted-foreground">
                  Pinned to the top of the citizen dashboard and highlighted in
                  red with push notifications.
                </p>
              </div>
            </CardContent>
          </div>
        </div>
      </div>
    </div>
  );
}
