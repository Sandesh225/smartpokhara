"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { UniversalMessaging } from "@/components/complaints/shared/UniversalMessaging";
import { Message } from "@/features/messages/types";

interface Props {
  conversationId: string;
  initialMessages?: Message[];
  currentUserId: string;
  otherUserName: string;
}

export function MessageThread({
  conversationId,
  currentUserId,
  otherUserName,
}: Props) {
  return (
    <div className="flex flex-col h-full bg-white relative">
      <Link
        href="/staff/messages"
        className="md:hidden absolute top-4 left-4 z-50 p-2 bg-white/80 rounded-full shadow-sm hover:bg-gray-100"
      >
        <ArrowLeft className="w-5 h-5 text-gray-600" />
      </Link>
      <UniversalMessaging
        channelType="DIRECT_MESSAGE"
        channelId={conversationId}
        currentUserId={currentUserId}
        currentUserRole="staff"
        variant="default"
        title={otherUserName}
        subtitle="Direct Message"
        className="h-full border-0"
      />
    </div>
  );
}
