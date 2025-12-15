"use client";

import { useState, useEffect } from "react";
import {
  Send,
  Paperclip,
  Loader2,
  MessageSquare,
  CalendarDays,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, isSameDay } from "date-fns";
import { createClient } from "@/lib/supabase/client";
import { supervisorComplaintsQueries } from "@/lib/supabase/queries/supervisor-complaints";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface Message {
  id: string;
  content: string;
  author_role: string;
  created_at: string;
  is_internal: boolean;
  author_name?: string;
  author_avatar?: string;
}

interface CommunicationThreadProps {
  complaintId: string;
  initialMessages: Message[];
  currentUserId: string;
}

export function CommunicationThread({
  complaintId,
  initialMessages,
  currentUserId,
}: CommunicationThreadProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  // Group messages by date
  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [key: string]: Message[] } = {};

    messages.forEach((message) => {
      const date = format(new Date(message.created_at), "yyyy-MM-dd");
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });

    return groups;
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sending) return;

    setSending(true);
    try {
      // Optimistic UI Update
      const optimisticMsg: Message = {
        id: `temp-${Date.now()}`,
        content: input,
        author_role: "supervisor",
        created_at: new Date().toISOString(),
        is_internal: false,
        author_name: "You",
      };

      setMessages((prev) => [...prev, optimisticMsg]); // Add to end for chronological order
      setInput("");

      await supervisorComplaintsQueries.addComment(
        supabase,
        complaintId,
        optimisticMsg.content,
        false
      );
      toast.success("Message sent");
    } catch (err) {
      console.error(err);
      toast.error("Failed to send message");
      // Remove optimistic message on error
      setMessages((prev) => prev.filter((msg) => !msg.id.startsWith("temp-")));
    } finally {
      setSending(false);
    }
  };

  // Sort messages: Oldest to newest for chat feel
  const sortedMessages = [...messages].sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  const groupedMessages = groupMessagesByDate(sortedMessages);

  // Initial loading state
  useEffect(() => {
    if (initialMessages.length === 0) {
      setIsLoading(true);
      const timer = setTimeout(() => setIsLoading(false), 800);
      return () => clearTimeout(timer);
    }
  }, [initialMessages]);

  return (
    <Card className="flex flex-col h-[600px] overflow-hidden">
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            Communication Thread
          </CardTitle>
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200"
          >
            Visible to Citizen & Staff
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          All messages are visible to both citizens and staff members
        </p>
      </CardHeader>

      <ScrollArea className="flex-1 p-4">
        {isLoading ? (
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-16 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : sortedMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-12 text-center">
            <div className="mb-4 rounded-full bg-muted p-4">
              <MessageSquare className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">No messages yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Start the conversation by sending a message. All communications
              will be visible here.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedMessages).map(([date, dateMessages]) => (
              <div key={date} className="space-y-4">
                <div className="flex items-center justify-center">
                  <div className="flex items-center gap-2 px-3 py-1 bg-muted rounded-full">
                    <CalendarDays className="h-3 w-3" />
                    <span className="text-xs font-medium">
                      {format(new Date(date), "MMM d, yyyy")}
                    </span>
                  </div>
                </div>

                {dateMessages.map((msg) => {
                  const isMe = msg.author_role === "supervisor";
                  const messageDate = new Date(msg.created_at);

                  return (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex gap-3",
                        isMe ? "justify-end" : "justify-start"
                      )}
                    >
                      {!isMe && (
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={msg.author_avatar} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {msg.author_name?.charAt(0).toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                      )}

                      <div
                        className={cn(
                          "flex flex-col max-w-[80%]",
                          isMe ? "items-end" : "items-start"
                        )}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium">
                            {msg.author_name || msg.author_role}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {format(messageDate, "h:mm a")}
                          </span>
                        </div>

                        <div
                          className={cn(
                            "rounded-2xl px-4 py-2.5 text-sm",
                            isMe
                              ? "bg-primary text-primary-foreground rounded-br-none"
                              : "bg-muted rounded-bl-none"
                          )}
                        >
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        </div>
                      </div>

                      {isMe && (
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={msg.author_avatar} />
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            You
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      <div className="border-t p-4">
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0"
            aria-label="Attach file"
          >
            <Paperclip className="h-4 w-4" />
          </Button>

          <Input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message here..."
            className="flex-1"
            disabled={sending}
          />

          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || sending}
            className="shrink-0"
            aria-label="Send message"
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Press Enter to send • Messages are visible to both parties
        </p>
      </div>
    </Card>
  );
}