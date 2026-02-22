"use client";

import React from "react";
import { UniversalMessaging } from "@/components/complaints/shared/UniversalMessaging";
import { Card } from "@/components/ui/card";
import { StickyNote } from "lucide-react";

interface Note {
  id: string;
  text: string;
  visibility: string;
  created_at: string;
  tags?: string[];
  author: {
    profile: {
      full_name: string;
      avatar_url?: string;
    };
  };
}

interface InternalNotesProps {
  complaintId: string;
  initialNotes?: any;
  currentUserId: string;
}

export function InternalNotes({
  complaintId,
  initialNotes,
  currentUserId
}: InternalNotesProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4 text-foreground/80">
        <StickyNote className="h-5 w-5" />
        <h3 className="font-bold text-sm">Internal Work Log & Notes</h3>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden h-[400px] shadow-xs">
        <UniversalMessaging
          channelType="OFFICIAL_NOTE"
          channelId={complaintId}
          currentUserId={currentUserId}
          variant="tactical"
          title="Internal Ledger"
          subtitle="Supervisory Observations"
        />
      </div>
    </Card>
  );
}