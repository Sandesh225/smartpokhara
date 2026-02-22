"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { User } from "lucide-react";
import { Conversation } from "@/features/messages";

// Local interface removed in favor of @/features/messages

interface ConversationsListProps {
  conversations: Conversation[];
  selectedId?: string;
}

export function ConversationsList({ conversations, selectedId }: ConversationsListProps) {
  return (
    <div className="flex flex-col h-full bg-card border-r border-border w-full md:w-80">
      <div className="p-4 border-b border-border">
        <h2 className="font-bold text-lg text-foreground">Messages</h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground text-sm">
            No conversations yet.
          </div>
        ) : (
          conversations.map((conv) => (
            <Link
              key={conv.id}
              href={`/supervisor/messages/${conv.id}`}
              className={cn(
                "flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors border-b border-border/50 last:border-0",
                selectedId === conv.id && "bg-primary/10 hover:bg-primary/10"
              )}
            >
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                {conv.other_user?.avatar_url ? (
                  <img src={conv.other_user.avatar_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <User className="h-5 w-5 text-muted-foreground/60" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <span className="font-semibold text-sm text-foreground truncate">
                    {conv.other_user?.name || "Unknown"}
                  </span>
                  {conv.last_message_at && (
                    <span className="text-xs text-muted-foreground/70 shrink-0">
                      {formatDistanceToNow(new Date(conv.last_message_at), { addSuffix: false })}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">
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