"use client";

import { useState, useEffect, useRef } from "react";
import { Send, MessageSquare, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { createClient } from "@/lib/supabase/client";
import { supervisorComplaintsQueries } from "@/lib/supabase/queries/supervisor-complaints";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

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
  const scrollRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

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

    try {
      const optimisticMsg: Message = {
        id: tempId,
        content: input,
        author_role: "dept_head",
        author_id: currentUserId,
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
        false
      );
    } catch (err: any) {
      toast.error("Transmission failed");
      setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
    } finally {
      setSending(false);
    }
  };

  const sortedMessages = [...messages].sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  return (
    <div className="flex flex-col h-[650px] overflow-hidden stone-card dark:stone-card-elevated border-none shadow-2xl transition-colors-smooth">
      {/* 🏔️ Narrative Header */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-primary/10 bg-primary/5 dark:bg-dark-surface/40 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
            <MessageSquare className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/80">
              Communication Ledger
            </h3>
            <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold">
              Public Transparency Stream
            </p>
          </div>
        </div>
        <Badge
          variant="outline"
          className="text-[9px] font-black uppercase tracking-tighter bg-emerald-500/10 text-emerald-600 border-emerald-500/20 px-2 py-0.5 animate-pulse"
        >
          Live Connection
        </Badge>
      </div>

      {/* 🌊 Message Stream */}
      <ScrollArea className="flex-1 p-6 bg-transparent custom-scrollbar">
        {sortedMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-20 opacity-40">
            <Sparkles className="h-10 w-10 text-primary/30 mb-4" />
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Initiate response sequence
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedMessages.map((msg) => {
              const isMe =
                msg.author_id === currentUserId ||
                (msg.id.startsWith("temp-") && msg.author_name === "You");
              const isCitizen = msg.author_role === "citizen";

              return (
                <div
                  key={msg.id}
                  className={cn(
                    "flex gap-4 group",
                    isMe ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  <Avatar className="h-9 w-9 border-2 border-background shadow-lg mt-1 shrink-0">
                    <AvatarImage src={msg.author_avatar} />
                    <AvatarFallback
                      className={cn(
                        "text-[10px] font-black",
                        isCitizen
                          ? "bg-warning-amber/10 text-warning-amber"
                          : "bg-primary/10 text-primary"
                      )}
                    >
                      {msg.author_name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>

                  <div
                    className={cn(
                      "flex flex-col max-w-[80%]",
                      isMe ? "items-end" : "items-start"
                    )}
                  >
                    {/* Role Label */}
                    <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 mb-1.5 px-1">
                      {isMe
                        ? "Supervisor Command"
                        : isCitizen
                        ? "Citizen Report"
                        : "Operational Staff"}
                    </span>

                    {/* Message Bubble */}
                    <div
                      className={cn(
                        "rounded-2xl px-5 py-3 text-sm transition-all duration-300 shadow-xl",
                        isMe
                          ? "bg-primary text-primary-foreground rounded-tr-none accent-glow border-none"
                          : "glass dark:bg-dark-surface-elevated text-foreground rounded-tl-none border-primary/10"
                      )}
                    >
                      <p className="whitespace-pre-wrap leading-relaxed font-medium">
                        {msg.content}
                      </p>
                    </div>

                    {/* Timestamp */}
                    <span className="text-[9px] font-bold text-muted-foreground/40 mt-2 px-1">
                      {format(new Date(msg.created_at), "h:mm a")} •{" "}
                      {format(new Date(msg.created_at), "MMM d")}
                    </span>
                  </div>
                </div>
              );
            })}
            <div ref={scrollRef} />
          </div>
        )}
      </ScrollArea>

      {/* ⌨️ Input Perimeter */}
      <div className="p-4 bg-muted/20 dark:bg-dark-surface/60 border-t border-primary/10">
        <form onSubmit={handleSend} className="flex gap-3 relative">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Document response to citizen..."
            disabled={sending}
            className="h-12 bg-background/50 border-primary/10 focus-visible:ring-primary focus-visible:border-primary/30 rounded-xl pr-14 transition-all dark:bg-dark-midnight"
          />
          <Button
            type="submit"
            disabled={!input.trim() || sending}
            className="absolute right-1.5 top-1.5 h-9 w-9 bg-primary hover:bg-primary-brand-light shadow-lg accent-glow rounded-lg transition-transform active:scale-90"
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
        <div className="mt-3 flex justify-center">
          <p className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-tighter">
            Official Correspondence Channel • Recorded for Audit
          </p>
        </div>
      </div>
    </div>
  );
}