"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Send,
  User,
  Shield,
  Clock,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Wifi,
  WifiOff,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  content: string;
  created_at: string;
  is_internal: boolean;
  author_role: string;
  author_id: string;
  author_name: string;
  author_avatar: string | null;
}

interface Props {
  complaintId: string;
  currentUserId: string;
  userRole: "citizen" | "staff" | "supervisor" | "admin";
  assignedStaffName?: string;
  citizenName?: string;
}

function timeAgo(date: string): string {
  const seconds = Math.floor(
    (Date.now() - new Date(date).getTime()) / 1000
  );
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export default function CitizenStaffCommunication({
  complaintId,
  currentUserId,
  userRole,
  assignedStaffName,
  citizenName,
}: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [connection, setConnection] = useState<
    "connected" | "disconnected" | "connecting"
  >("connecting");

  const endRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const channelRef = useRef<any>(null);
  const retryRef = useRef(0);

  const loadMessages = useCallback(async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/supabase/rpc", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
        body: JSON.stringify({
          function: "rpc_get_complaint_comments",
          params: { p_complaint_id: complaintId },
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error ?? `HTTP ${response.status}`);
      }

      setMessages(Array.isArray(result.data) ? result.data : []);
      setConnection("connected");
      retryRef.current = 0;
      setError(null);
    } catch (err: any) {
      setError(err.message ?? "Failed to load messages");
      setConnection("disconnected");

      if (retryRef.current < 5) {
        retryRef.current += 1;
        setTimeout(
          loadMessages,
          Math.min(1000 * 2 ** retryRef.current, 30000)
        );
      }
    } finally {
      setLoading(false);
    }
  }, [complaintId]);

  const sendMessage = async () => {
    if (!text.trim() || sending) return;

    setSending(true);
    setError(null);

    const tempMessage: Message = {
      id: `tmp-${Date.now()}`,
      content: text.trim(),
      created_at: new Date().toISOString(),
      is_internal: false,
      author_role: userRole,
      author_id: currentUserId,
      author_name: userRole === "citizen" ? "You" : "Staff",
      author_avatar: null,
    };

    setMessages((prev) => [...prev, tempMessage]);
    const originalText = text;
    setText("");

    try {
      const response = await fetch("/api/supabase/rpc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          function: "rpc_add_complaint_comment_v2",
          params: {
            p_complaint_id: complaintId,
            p_content: originalText.trim(),
            p_is_internal: false,
          },
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error ?? "Failed to send");
      }

      setMessages((prev) =>
        prev.filter((msg) => msg.id !== tempMessage.id)
      );

      await loadMessages();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
      textareaRef.current?.focus();
    } catch (err: any) {
      setError(err.message ?? "Failed to send");
      setMessages((prev) =>
        prev.filter((msg) => msg.id !== tempMessage.id)
      );
      setText(originalText);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  useEffect(() => {
    loadMessages();

    (async () => {
      try {
        const { createClient } = await import(
          "@/lib/supabase/client"
        );
        const supabase = createClient();

        channelRef.current = supabase
          .channel(`complaint-${complaintId}`)
          .on(
            "postgres_changes",
            {
              event: "INSERT",
              schema: "public",
              table: "complaint_comments",
              filter: `complaint_id=eq.${complaintId}`,
            },
            loadMessages
          )
          .subscribe((status) => {
            if (status === "SUBSCRIBED") {
              setConnection("connected");
            } else if (
              status === "CLOSED" ||
              status === "CHANNEL_ERROR"
            ) {
              setConnection("disconnected");
            } else {
              setConnection("connecting");
            }
          });
      } catch {
        setConnection("disconnected");
      }
    })();

    return () => {
      channelRef.current?.unsubscribe();
    };
  }, [complaintId, loadMessages]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [messages.length]);

  const partnerName =
    userRole === "citizen"
      ? assignedStaffName ?? "Assigned Staff"
      : citizenName ?? "Citizen";

  return (
    <section className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent text-accent-foreground flex items-center justify-center">
            {connection === "connected" ? (
              <Wifi className="w-4 h-4" />
            ) : connection === "disconnected" ? (
              <WifiOff className="w-4 h-4 text-destructive" />
            ) : (
              <Loader2 className="w-4 h-4 animate-spin" />
            )}
          </div>

          <div className="flex flex-col">
            <p className="text-sm font-semibold text-foreground flex items-center gap-2">
              {userRole === "citizen" ? (
                <Shield className="w-4 h-4 text-primary" />
              ) : (
                <User className="w-4 h-4 text-primary" />
              )}
              Chat with {partnerName}
            </p>
            <p className="text-xs text-muted-foreground">
              {connection === "connected"
                ? "Live · Real-time"
                : connection === "disconnected"
                ? "Offline · Reconnecting"
                : "Connecting"}
            </p>
          </div>
        </div>

        <span className="text-xs font-semibold bg-muted text-muted-foreground border border-border px-3 py-1 rounded-full">
          {messages.length} messages
        </span>
      </header>

      {/* Messages */}
      <div className="h-96 overflow-y-auto px-6 py-5 space-y-5 bg-background scrollbar-hide">
        {loading ? (
          <div className="flex items-center justify-center h-full gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <span className="text-xs text-muted-foreground">
              Loading messages
            </span>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-accent text-accent-foreground flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <p className="text-sm font-semibold text-foreground">
              No messages yet
            </p>
            <p className="text-xs text-muted-foreground max-w-xs">
              Start the conversation to coordinate resolution.
            </p>
          </div>
        ) : (
          messages.map((message, index) => {
            const isMine =
              message.author_id === currentUserId;
            const isStaff =
              message.author_role !== "citizen";

            return (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.02 }}
                className={cn(
                  "flex gap-3",
                  isMine && "flex-row-reverse"
                )}
              >
                <div className="flex-shrink-0 mt-1">
                  {message.author_avatar ? (
                    <img
                      src={message.author_avatar}
                      alt={message.author_name}
                      className="w-8 h-8 rounded-lg object-cover border border-border"
                    />
                  ) : isStaff ? (
                    <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
                      <Shield className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-secondary text-secondary-foreground flex items-center justify-center">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>

                <div
                  className={cn(
                    "max-w-[75%] flex flex-col",
                    isMine && "items-end"
                  )}
                >
                  {!isMine && (
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-foreground">
                        {message.author_name}
                      </span>
                      {isStaff && (
                        <span className="text-xs font-semibold bg-accent text-accent-foreground border border-border px-2 py-0.5 rounded-full">
                          Staff
                        </span>
                      )}
                    </div>
                  )}

                  <div
                    className={cn(
                      "rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap break-words",
                      isMine
                        ? "bg-primary text-primary-foreground"
                        : "bg-card border border-border text-foreground"
                    )}
                  >
                    {message.content}
                  </div>

                  <div
                    className={cn(
                      "flex items-center gap-1 mt-1 text-xs text-muted-foreground",
                      isMine && "flex-row-reverse"
                    )}
                  >
                    <Clock className="w-3 h-3" />
                    <span>{timeAgo(message.created_at)}</span>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
        <div ref={endRef} />
      </div>

      {/* Notices */}
      {success && (
        <div className="mx-6 mb-4 flex items-center gap-2 px-4 py-3 rounded-xl bg-accent border border-border">
          <CheckCircle2 className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold text-foreground">
            Message sent successfully
          </span>
        </div>
      )}

      {error && (
        <div className="mx-6 mb-4 flex items-center gap-2 px-4 py-3 rounded-xl bg-destructive/10 border border-destructive">
          <AlertCircle className="w-4 h-4 text-destructive" />
          <span className="text-xs text-destructive flex-1">
            {error}
          </span>
          <button
            onClick={() => setError(null)}
            className="text-destructive font-semibold"
          >
            ×
          </button>
        </div>
      )}

      {/* Input */}
      <footer className="px-6 py-4 border-t border-border bg-card">
        <div className="flex gap-3 items-end">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Message ${partnerName}`}
              rows={2}
              maxLength={1000}
              disabled={
                sending || connection === "disconnected"
              }
              className="w-full resize-none rounded-2xl border border-input bg-background px-4 py-3 pr-14 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary transition-all disabled:opacity-50 scrollbar-hide"
            />
            <span className="absolute bottom-3 right-4 text-xs font-mono text-muted-foreground">
              {text.length}/1000
            </span>
          </div>

          <button
            onClick={sendMessage}
            disabled={
              !text.trim() ||
              sending ||
              connection === "disconnected"
            }
            className={cn(
              "w-10 h-10 rounded-2xl flex items-center justify-center transition-all",
              !text.trim() ||
                sending ||
                connection === "disconnected"
                ? "bg-muted text-muted-foreground cursor-not-allowed"
                : "bg-primary text-primary-foreground hover:opacity-90 active:scale-95"
            )}
          >
            {sending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>

        <p className="text-xs text-muted-foreground mt-2">
          Press Enter to send · Shift + Enter for new line
        </p>
      </footer>
    </section>
  );
}