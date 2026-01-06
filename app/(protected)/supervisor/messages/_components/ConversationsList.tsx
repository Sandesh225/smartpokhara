"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { User } from "lucide-react";

interface Conversation {
  id: string;
  other_user: {
    name: string;
    avatar_url?: string;
  };
  last_message_preview?: string;
  last_message_at?: string;
}

interface ConversationsListProps {
  conversations: Conversation[];
  selectedId?: string;
}

export function ConversationsList({ conversations, selectedId }: ConversationsListProps) {
  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200 w-full md:w-80">
      <div className="p-4 border-b border-gray-200">
        <h2 className="font-bold text-lg text-gray-900">Messages</h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            No conversations yet.
          </div>
        ) : (
          conversations.map((conv) => (
            <Link
              key={conv.id}
              href={`/supervisor/messages/${conv.id}`}
              className={cn(
                "flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0",
                selectedId === conv.id && "bg-blue-50 hover:bg-blue-50"
              )}
            >
              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {conv.other_user.avatar_url ? (
                  <img src={conv.other_user.avatar_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <User className="h-5 w-5 text-gray-500" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <span className="font-semibold text-sm text-gray-900 truncate">
                    {conv.other_user.name}
                  </span>
                  {conv.last_message_at && (
                    <span className="text-[10px] text-gray-400 flex-shrink-0">
                      {formatDistanceToNow(new Date(conv.last_message_at), { addSuffix: false })}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 truncate">
                  {conv.last_message_preview || "Started a conversation"}
                </p>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}