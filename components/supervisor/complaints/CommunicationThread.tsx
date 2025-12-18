"use client";

import { useState, useEffect } from "react";
import { Send, MessageSquare, CalendarDays, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { createClient } from "@/lib/supabase/client";
import { supervisorComplaintsQueries } from "@/lib/supabase/queries/supervisor-complaints";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
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

  // Load initial state
  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [key: string]: Message[] } = {};
    messages.forEach((message) => {
      // Safety check for invalid dates
      if (!message.created_at) return;
      try {
        const date = format(new Date(message.created_at), "yyyy-MM-dd");
        if (!groups[date]) groups[date] = [];
        groups[date].push(message);
      } catch (e) {
        console.error("Invalid date in message", message);
      }
    });
    return groups;
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sending) return;

    setSending(true);
    // Generate ID outside to use in both setMessages and catch
    const tempId = `temp-${Date.now()}`;

    try {
      const optimisticMsg: Message = {
        id: tempId,
        content: input,
        author_role: "supervisor",
        created_at: new Date().toISOString(),
        is_internal: false,
        author_name: "You",
      };

      // Optimistic update
      setMessages((prev) => [...prev, optimisticMsg]);
      setInput("");

      await supervisorComplaintsQueries.addComment(
        supabase,
        complaintId,
        optimisticMsg.content,
        false
      );

      toast.success("Message sent");
    } catch (err: any) {
      console.error("Send failed:", err);
      toast.error(err?.message || "Failed to send message");
      // Revert optimistic update on failure
      setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
    } finally {
      setSending(false);
    }
  };

  const sortedMessages = [...messages].sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  const groupedMessages = groupMessagesByDate(sortedMessages);

  return (
    <Card className="flex flex-col h-[600px] overflow-hidden shadow-sm border-gray-200">
      <CardHeader className="pb-3 border-b bg-gray-50/50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">
            Communication Thread
          </CardTitle>
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200 font-normal"
          >
            Visible to Citizen
          </Badge>
        </div>
      </CardHeader>

      <ScrollArea className="flex-1 p-4 bg-white">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-12 w-1/2" />
          </div>
        ) : sortedMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-12 text-center">
            <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <MessageSquare className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-900">No messages yet</p>
            <p className="text-xs text-gray-500 mt-1">
              Updates will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedMessages).map(([date, dateMessages]) => (
              <div key={date} className="space-y-4">
                <div className="flex justify-center">
                  <Badge
                    variant="secondary"
                    className="text-[10px] font-normal px-2 py-0 bg-gray-100 text-gray-500 hover:bg-gray-100"
                  >
                    {format(new Date(date), "MMMM d, yyyy")}
                  </Badge>
                </div>
                {dateMessages.map((msg) => {
                  const isMe =
                    msg.author_role === "supervisor" ||
                    msg.author_name === "You";
                  return (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex gap-3",
                        isMe ? "justify-end" : "justify-start"
                      )}
                    >
                      {!isMe && (
                        <Avatar className="h-8 w-8 mt-1 border border-gray-200">
                          <AvatarImage src={msg.author_avatar} />
                          <AvatarFallback className="text-[10px] bg-gray-100 text-gray-600">
                            U
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={cn(
                          "flex flex-col max-w-[80%]",
                          isMe ? "items-end" : "items-start"
                        )}
                      >
                        <div
                          className={cn(
                            "rounded-2xl px-4 py-2 text-sm shadow-sm",
                            isMe
                              ? "bg-blue-600 text-white rounded-br-none"
                              : "bg-gray-100 text-gray-800 rounded-bl-none border border-gray-200"
                          )}
                        >
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        </div>
                        <span className="text-[10px] text-gray-400 mt-1 px-1">
                          {!isMe && (
                            <span className="font-medium mr-1">
                              {msg.author_name} •
                            </span>
                          )}
                          {format(new Date(msg.created_at), "h:mm a")}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      <div className="border-t p-4 bg-gray-50/30">
        <form onSubmit={handleSend} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            disabled={sending}
            className="bg-white border-gray-200 focus-visible:ring-blue-500"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || sending}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>
    </Card>
  );
}