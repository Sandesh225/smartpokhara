"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Send, MessageSquare, Loader2, Sparkles, Lock, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

interface Message {
  id: string;
  content: string;
  author_role: string;
  author_id?: string;
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
  const [isInternal, setIsInternal] = useState(false);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // FIXED: Proper message loading from API
  const loadMessages = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/supabase/rpc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          function: "rpc_get_complaint_comments",
          params: { p_complaint_id: complaintId },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      
      // Handle both response formats
      if (result.success && Array.isArray(result.data)) {
        setMessages(result.data);
      } else if (Array.isArray(result)) {
        setMessages(result);
      } else {
        console.error("Unexpected response format:", result);
      }
    } catch (error) {
      console.error("Error loading messages:", error);
      toast.error("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  // Setup realtime subscription
  useEffect(() => {
    // Initial load
    loadMessages();

    // Setup realtime listener
    const channel = supabase
      .channel(`complaint_comments_${complaintId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "complaint_comments",
          filter: `complaint_id=eq.${complaintId}`,
        },
        (payload) => {
          console.log("New comment via realtime:", payload.new);
          // Reload to get full author data
          loadMessages();
        }
      )
      .subscribe((status) => {
        console.log("Realtime status:", status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [complaintId]);

  // Auto-scroll to latest
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sending) return;

    setSending(true);
    const tempId = `temp-${Date.now()}`;
    const optimisticMsg: Message = {
      id: tempId,
      content: input,
      author_role: "supervisor",
      author_id: currentUserId,
      created_at: new Date().toISOString(),
      is_internal: isInternal,
      author_name: "You",
    };

    // Optimistic update
    setMessages((prev) => [...prev, optimisticMsg]);
    setInput("");

    try {
      const response = await fetch("/api/supabase/rpc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          function: "rpc_add_complaint_comment_v2",
          params: {
            p_complaint_id: complaintId,
            p_content: optimisticMsg.content,
            p_is_internal: isInternal,
          },
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to send message");
      }

      // Remove optimistic update and reload
      setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
      await loadMessages();
      
      toast.success("Message sent");
    } catch (error: any) {
      console.error("Send error:", error);
      toast.error(error.message || "Failed to send message");
      
      // Remove optimistic update on error
      setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
      setInput(optimisticMsg.content);
    } finally {
      setSending(false);
    }
  };

  const sortedMessages = useMemo(
    () =>
      [...messages].sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      ),
    [messages]
  );

  return (
    <div className="flex flex-col h-[700px] overflow-hidden bg-card border border-border rounded-xl shadow-xs transition-colors duration-500">
      {/* Header */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-border bg-muted/20">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 text-primary">
            <MessageSquare className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">
              Communication Thread
            </h3>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">
              Public & Internal dialogue
            </p>
          </div>
        </div>
        <Badge variant="outline" className="text-xs font-semibold bg-success-green/10 text-success-green border-success-green/20">
          Live Connection
        </Badge>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-6 bg-transparent custom-scrollbar">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : sortedMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-20 opacity-50">
            <MessageSquare className="h-10 w-10 text-muted-foreground mb-4" />
            <p className="text-sm font-bold text-muted-foreground">
              No messages yet
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {sortedMessages.map((msg, idx) => {
              const isMe = msg.author_id === currentUserId || msg.author_name === "You";
              const isCitizen = msg.author_role === "citizen";
              const showHeader = idx === 0 || sortedMessages[idx - 1].author_id !== msg.author_id;

              return (
                <div
                  key={msg.id}
                  className={cn("flex gap-4 group", isMe ? "flex-row-reverse" : "flex-row")}
                >
                  {showHeader ? (
                    <Avatar className="h-10 w-10 border-2 border-background shadow-md mt-1 shrink-0">
                      <AvatarImage src={msg.author_avatar} />
                      <AvatarFallback
                        className={cn(
                          "text-xs font-black",
                          isCitizen ? "bg-amber-100 text-amber-700" : "bg-primary/10 text-primary"
                        )}
                      >
                        {msg.author_name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="w-10 shrink-0" />
                  )}

                  <div className={cn("flex flex-col max-w-[80%]", isMe ? "items-end" : "items-start")}>
                    {showHeader && (
                      <div className="flex items-center gap-2 mb-1.5 px-1">
                        <span className="text-xs font-bold text-muted-foreground">
                          {isMe ? "You" : msg.author_name || "Unknown"}
                        </span>
                        {msg.is_internal && (
                          <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-xs h-5 font-bold">
                            INTERNAL
                          </Badge>
                        )}
                      </div>
                    )}

                    <div
                      className={cn(
                        "rounded-2xl px-5 py-3 text-sm transition-all duration-300 shadow-sm leading-relaxed border",
                        isMe
                          ? msg.is_internal
                            ? "bg-warning-amber/10 text-foreground border-warning-amber/20 rounded-tr-none"
                            : "bg-primary text-primary-foreground border-primary rounded-tr-none"
                          : "bg-muted text-foreground rounded-tl-none border-border"
                      )}
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>

                    <span className="text-xs font-bold text-muted-foreground/40 mt-2 px-1">
                      {format(new Date(msg.created_at), "h:mm a")}
                    </span>
                  </div>
                </div>
              );
            })}
            <div ref={scrollRef} />
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <div className="p-4 sm:p-6 bg-card border-t border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {isInternal ? (
              <Lock className="h-4 w-4 text-warning-amber" />
            ) : (
              <Globe className="h-4 w-4 text-success-green" />
            )}
            <span
              className={cn(
                "text-xs font-bold",
                isInternal ? "text-warning-amber" : "text-success-green"
              )}
            >
              {isInternal ? "Internal Note" : "Public Message"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground">Internal Only</span>
            <Switch
              checked={isInternal}
              onCheckedChange={setIsInternal}
            />
          </div>
        </div>

        <form onSubmit={handleSend} className="flex gap-4 relative">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              isInternal ? "Document internal observation..." : "Reply to complaint..."
            }
            disabled={sending}
            className="h-14 bg-background border-primary/10 focus-visible:ring-primary rounded-xl pr-16 text-sm transition-all shadow-inner"
          />
          <Button
            type="submit"
            disabled={!input.trim() || sending}
            className="absolute right-2 top-2 h-10 w-10 bg-primary shadow-lg rounded-lg active:scale-95"
          >
            {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </Button>
        </form>
      </div>
    </div>
  );
}