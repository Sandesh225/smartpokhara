"use client";

import { useState, useEffect, useRef } from "react";
import { Send, MessageSquare, Loader2 } from "lucide-react";
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
  author_id?: string; // Added field
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // Load initial state
  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [key: string]: Message[] } = {};
    messages.forEach((message) => {
      if (!message.created_at) return;
      try {
        const date = format(new Date(message.created_at), "yyyy-MM-dd");
        if (!groups[date]) groups[date] = [];
        groups[date].push(message);
      } catch (e) {
        console.error("Invalid date", message);
      }
    });
    return groups;
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sending) return;

    setSending(true);
    const tempId = `temp-${Date.now()}`;

    try {
      // Optimistic update
      const optimisticMsg: Message = {
        id: tempId,
        content: input,
        author_role: "dept_head", // Or whatever the supervisor role is
        author_id: currentUserId, // Critical for alignment
        created_at: new Date().toISOString(),
        is_internal: false,
        author_name: "You",
      };

      setMessages((prev) => [...prev, optimisticMsg]);
      setInput("");

      await supervisorComplaintsQueries.addComment(
        supabase,
        complaintId,
        optimisticMsg.content,
        false // Public comment
      );

      // We don't need to replace the message here; 
      // the realtime subscription (in parent) or page refresh will sync the real ID
    } catch (err: any) {
      console.error("Send failed:", err);
      toast.error("Failed to send message");
      setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
    } finally {
      setSending(false);
    }
  };

  const sortedMessages = [...messages].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  const groupedMessages = groupMessagesByDate(sortedMessages);

  return (
    <Card className="flex flex-col h-[600px] overflow-hidden shadow-sm border-gray-200">
      <CardHeader className="pb-3 border-b bg-gray-50/50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Communication History
          </CardTitle>
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200 font-normal"
          >
            Public Thread
          </Badge>
        </div>
      </CardHeader>

      <ScrollArea className="flex-1 p-4 bg-white">
        {sortedMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-12 text-center">
            <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <MessageSquare className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-900">No messages yet</p>
            <p className="text-xs text-gray-500 mt-1">
              Start the conversation with the citizen
            </p>
          </div>
        ) : (
          <div className="space-y-8 pb-4">
            {Object.entries(groupedMessages).map(([date, dateMessages]) => (
              <div key={date} className="space-y-4">
                <div className="flex justify-center sticky top-0 z-10">
                  <Badge
                    variant="secondary"
                    className="text-[10px] font-normal px-2 py-0.5 bg-gray-100/90 backdrop-blur text-gray-500 shadow-sm"
                  >
                    {format(new Date(date), "MMMM d, yyyy")}
                  </Badge>
                </div>
                {dateMessages.map((msg) => {
                  // ROBUST IS-ME CHECK:
                  // 1. Check ID first (most accurate)
                  // 2. Check role/name fallback for optimistic updates
                  const isMe =
                    msg.author_id === currentUserId ||
                    (msg.id.startsWith("temp-") && msg.author_name === "You");

                  // Determine Role Label
                  const roleLabel = msg.author_role === "citizen" 
                    ? "Citizen" 
                    : msg.author_role.replace("_", " ").toUpperCase();

                  return (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex gap-3",
                        isMe ? "justify-end" : "justify-start"
                      )}
                    >
                      {!isMe && (
                        <Avatar className="h-8 w-8 mt-1 border border-gray-200 shadow-sm">
                          <AvatarImage src={msg.author_avatar} />
                          <AvatarFallback className={cn("text-[10px]", 
                            msg.author_role === 'citizen' ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700"
                          )}>
                            {msg.author_name?.charAt(0).toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      
                      <div
                        className={cn(
                          "flex flex-col max-w-[75%]",
                          isMe ? "items-end" : "items-start"
                        )}
                      >
                        <div
                          className={cn(
                            "rounded-2xl px-4 py-2.5 text-sm shadow-sm relative group",
                            isMe
                              ? "bg-blue-600 text-white rounded-br-none"
                              : "bg-white text-gray-800 rounded-bl-none border border-gray-200"
                          )}
                        >
                          <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                        </div>
                        
                        <div className="flex items-center gap-1.5 mt-1 px-1">
                          <span className="text-[10px] font-medium text-gray-900">
                            {isMe ? "You" : msg.author_name}
                          </span>
                          <span className="text-[10px] text-gray-400">•</span>
                          <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">
                            {isMe ? "Staff" : roleLabel}
                          </span>
                          <span className="text-[10px] text-gray-400">•</span>
                          <span className="text-[10px] text-gray-400">
                            {format(new Date(msg.created_at), "h:mm a")}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
            <div ref={scrollRef} />
          </div>
        )}
      </ScrollArea>

      <div className="border-t p-4 bg-gray-50/50 backdrop-blur supports-[backdrop-filter]:bg-gray-50/50">
        <form onSubmit={handleSend} className="flex gap-3">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message to the citizen..."
            disabled={sending}
            className="bg-white border-gray-200 focus-visible:ring-blue-500 shadow-sm"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || sending}
            className={cn(
              "bg-blue-600 hover:bg-blue-700 shadow-sm transition-all",
              sending && "opacity-80"
            )}
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4 ml-0.5" />
            )}
          </Button>
        </form>
      </div>
    </Card>
  );
}