"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Send, MessageSquare, User, Shield, Clock, AlertCircle,
  Loader2, CheckCircle2, Wifi, WifiOff, Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string; content: string; created_at: string;
  is_internal: boolean; author_role: string;
  author_id: string; author_name: string; author_avatar: string | null;
}
interface Props { complaintId: string; currentUserId: string; isStaff?: boolean; }

function timeAgo(d: string) {
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export default function StaffCommunication({ complaintId, currentUserId, isStaff = false }: Props) {
  const [messages, setMessages]   = useState<Message[]>([]);
  const [text, setText]           = useState("");
  const [loading, setLoading]     = useState(true);
  const [sending, setSending]     = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [success, setSuccess]     = useState(false);
  const [conn, setConn]           = useState<"connected"|"disconnected"|"connecting">("connecting");

  const endRef   = useRef<HTMLDivElement>(null);
  const taRef    = useRef<HTMLTextAreaElement>(null);
  const chanRef  = useRef<any>(null);
  const retry    = useRef(0);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const r = await fetch("/api/supabase/rpc", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Cache-Control": "no-cache" },
        body: JSON.stringify({ function: "rpc_get_complaint_comments", params: { p_complaint_id: complaintId } }),
      });
      if (!r.ok) throw new Error((await r.json()).error ?? `HTTP ${r.status}`);
      const res = await r.json();
      if (res.success && res.data) {
        setMessages(Array.isArray(res.data) ? res.data : []);
        setConn("connected"); retry.current = 0; setError(null);
      } else throw new Error(res.error ?? "Bad response");
    } catch (e: any) {
      setError(e.message ?? "Failed to load");
      setConn("disconnected");
      if (retry.current < 5) { retry.current++; setTimeout(load, Math.min(1000 * 2 ** retry.current, 30000)); }
    } finally { setLoading(false); }
  }, [complaintId]);

  const send = async () => {
    if (!text.trim() || sending) return;
    setSending(true); setError(null);
    const tmp: Message = { id: `tmp-${Date.now()}`, content: text.trim(), created_at: new Date().toISOString(), is_internal: false, author_role: isStaff ? "staff" : "citizen", author_id: currentUserId, author_name: isStaff ? "Staff Member" : "Citizen", author_avatar: null };
    setMessages(m => [...m, tmp]);
    const orig = text; setText("");
    try {
      const r = await fetch("/api/supabase/rpc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ function: "rpc_add_complaint_comment_v2", params: { p_complaint_id: complaintId, p_content: orig.trim(), p_is_internal: false } }),
      });
      const res = await r.json();
      if (!r.ok || !res.success) throw new Error(res.error ?? res.message ?? "Failed");
      setMessages(m => m.filter(x => x.id !== tmp.id));
      await load();
      setSuccess(true); setTimeout(() => setSuccess(false), 2000);
      taRef.current?.focus();
    } catch (e: any) {
      setError(e.message ?? "Failed to send");
      setMessages(m => m.filter(x => x.id !== tmp.id));
      setText(orig);
    } finally { setSending(false); }
  };

  const onKey = (e: React.KeyboardEvent) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } };

  useEffect(() => {
    load();
    (async () => {
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const sb = createClient();
        chanRef.current = sb.channel(`sc-${complaintId}`)
          .on("postgres_changes", { event: "INSERT", schema: "public", table: "complaint_comments", filter: `complaint_id=eq.${complaintId}` }, load)
          .subscribe(s => { setConn(s === "SUBSCRIBED" ? "connected" : (s === "CLOSED" || s === "CHANNEL_ERROR") ? "disconnected" : "connecting"); });
      } catch { setConn("disconnected"); }
    })();
    return () => { chanRef.current?.unsubscribe(); };
  }, [complaintId, load]);

  useEffect(() => {
    if (messages.length) setTimeout(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), 80);
  }, [messages.length]);

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
        <div className="flex items-center gap-3">
          <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0",
            conn === "connected"    ? "bg-emerald-100 dark:bg-emerald-950/30" :
            conn === "disconnected" ? "bg-red-100 dark:bg-red-950/20" :
            "bg-muted")}>
            {conn === "connected"    ? <Wifi    className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> :
             conn === "disconnected" ? <WifiOff className="w-3.5 h-3.5 text-destructive" /> :
                                      <Loader2 className="w-3.5 h-3.5 text-muted-foreground animate-spin" />}
          </div>
          <div>
            <p className="font-semibold text-sm text-foreground leading-none flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-primary" />
              {isStaff ? "Chat with Citizen" : "Department Communication"}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {conn === "connected" ? "Live · Real-time" : conn === "disconnected" ? "Offline · Reconnecting…" : "Connecting…"}
            </p>
          </div>
        </div>
        <span className="text-xs font-bold bg-muted border border-border text-muted-foreground px-2 py-0.5 rounded-full">
          {messages.length} msg
        </span>
      </div>

      {/* Messages */}
      <div className="h-[400px] overflow-y-auto px-5 py-4 space-y-4 bg-background/40 scrollbar-hide">
        {loading ? (
          <div className="flex items-center justify-center h-full gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <span className="text-xs text-muted-foreground">Loading…</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
            <div className="w-11 h-11 rounded-xl bg-accent flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-primary" />
            </div>
            <p className="font-semibold text-sm text-foreground">No messages yet</p>
            <p className="text-xs text-muted-foreground">Start the conversation below.</p>
          </div>
        ) : messages.map((m, i) => {
          const mine    = m.author_id === currentUserId;
          const isStaffMsg = m.author_role !== "citizen";
          return (
            <div key={m.id}
              className={cn("flex gap-3 animate-slide-in-from-bottom-2", mine && "flex-row-reverse")}>
              {/* Avatar */}
              <div className="flex-shrink-0 mt-0.5">
                {m.author_avatar
                  ? <img src={m.author_avatar} alt={m.author_name} className="w-7 h-7 rounded-lg object-cover border border-border" />
                  : isStaffMsg
                    ? <div className="w-7 h-7 rounded-lg bg-primary text-primary-foreground flex items-center justify-center"><Shield className="w-3.5 h-3.5" /></div>
                    : <div className="w-7 h-7 rounded-lg bg-secondary text-secondary-foreground flex items-center justify-center"><User className="w-3.5 h-3.5" /></div>}
              </div>
              {/* Bubble */}
              <div className={cn("max-w-[75%]", mine && "flex flex-col items-end")}>
                {!mine && (
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-sm font-semibold text-foreground">{m.author_name}</span>
                    {isStaffMsg && <span className="text-xs font-bold bg-accent text-accent-foreground border border-border px-1.5 py-0.5 rounded-full">Staff</span>}
                  </div>
                )}
                <div className={cn("rounded-xl px-3.5 py-2.5 text-xs leading-relaxed whitespace-pre-wrap break-words",
                  mine ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-card border border-border text-foreground rounded-tl-sm")}>
                  {m.content}
                </div>
                <div className={cn("flex items-center gap-1 mt-1", mine && "flex-row-reverse")}>
                  <Clock className="w-2.5 h-2.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{timeAgo(m.created_at)}</span>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      {/* Notices */}
      {success && (
        <div className="mx-5 mb-3 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">Message sent!</span>
        </div>
      )}
      {error && (
        <div className="mx-5 mb-3 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
          <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
          <span className="text-xs text-red-700 dark:text-red-300 flex-1">{error}</span>
          <button onClick={() => setError(null)} className="text-destructive font-bold ml-auto leading-none">×</button>
        </div>
      )}

      {/* Input */}
      <div className="px-5 py-4 border-t border-border bg-card">
        <div className="flex gap-2.5 items-end">
          <div className="flex-1 relative">
            <textarea ref={taRef} value={text} onChange={e => setText(e.target.value)} onKeyDown={onKey}
              placeholder="Type your message…" rows={2} maxLength={1000}
              disabled={sending || conn === "disconnected"}
              className="w-full resize-none rounded-xl border border-input bg-background px-4 py-3 pr-12 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary transition-all disabled:opacity-50 scrollbar-hide" />
            <span className={cn("absolute bottom-3 right-3 text-xs font-mono font-semibold",
              text.length > 800 ? "text-amber-500" : "text-muted-foreground")}>
              {text.length}/1000
            </span>
          </div>
          <button onClick={send} disabled={!text.trim() || sending || conn === "disconnected"}
            className={cn("flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all",
              !text.trim() || sending || conn === "disconnected"
                ? "bg-muted text-muted-foreground cursor-not-allowed"
                : "bg-primary text-primary-foreground hover:opacity-90 active:scale-95")}>
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  );
}