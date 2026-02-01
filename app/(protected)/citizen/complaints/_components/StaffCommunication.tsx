"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Send,
  MessageSquare,
  User,
  Shield,
  Clock,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Wifi,
  WifiOff,
  Users,
  Zap,
} from "lucide-react";

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

interface StaffCommunicationProps {
  complaintId: string;
  currentUserId: string;
  isStaff?: boolean;
}

function formatTimeAgo(date: string) {
  const now = new Date().getTime();
  const then = new Date(date).getTime();
  const seconds = Math.floor((now - then) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export default function StaffCommunication({
  complaintId,
  currentUserId,
  isStaff = false,
}: StaffCommunicationProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    "connected" | "disconnected" | "connecting"
  >("connecting");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const channelRef = useRef<any>(null);
  const retryCountRef = useRef(0);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadMessages = useCallback(async () => {
    try {
      setIsLoading(true);
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

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.data) {
        const messagesData = Array.isArray(result.data) ? result.data : [];
        setMessages(messagesData);
        setConnectionStatus("connected");
        retryCountRef.current = 0;
        setError(null);
      } else if (result.error) {
        throw new Error(result.error);
      } else {
        setMessages([]);
        setError("Unexpected response format");
      }
    } catch (err: any) {
      console.error("Error loading messages:", err);
      setError(err.message || "Failed to load messages");
      setConnectionStatus("disconnected");

      if (retryCountRef.current < 5) {
        retryCountRef.current += 1;
        setTimeout(
          () => loadMessages(),
          Math.min(1000 * 2 ** retryCountRef.current, 30000)
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, [complaintId]);

  const sendMessage = async () => {
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    setError(null);

    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      content: newMessage.trim(),
      created_at: new Date().toISOString(),
      is_internal: false,
      author_role: isStaff ? "staff" : "citizen",
      author_id: currentUserId,
      author_name: isStaff ? "Staff Member" : "Citizen",
      author_avatar: null,
    };

    setMessages((prev) => [...prev, tempMessage]);
    const originalMessage = newMessage;
    setNewMessage("");

    try {
      const response = await fetch("/api/supabase/rpc", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          function: "rpc_add_complaint_comment_v2",
          params: {
            p_complaint_id: complaintId,
            p_content: originalMessage.trim(),
            p_is_internal: false,
          },
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.error || result.message || "Failed to send message"
        );
      }

      setMessages((prev) => prev.filter((m) => m.id !== tempMessage.id));
      await loadMessages();

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);

      textareaRef.current?.focus();
    } catch (err: any) {
      console.error("Error sending message:", err);
      setError(err.message || "Failed to send message");

      setMessages((prev) => prev.filter((m) => m.id !== tempMessage.id));
      setNewMessage(originalMessage);
    } finally {
      setIsSending(false);
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

    const setupRealtime = async () => {
      try {
        const supabaseModule = await import("@/lib/supabase/client");
        const supabase = supabaseModule.createClient();

        channelRef.current = supabase
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
              console.log("New comment received via realtime:", payload.new);
              loadMessages();
            }
          )
          .subscribe((status) => {
            console.log("Realtime subscription status:", status);
            if (status === "SUBSCRIBED") {
              setConnectionStatus("connected");
            } else if (status === "CLOSED" || status === "CHANNEL_ERROR") {
              setConnectionStatus("disconnected");
            }
          });
      } catch (err) {
        console.error("Realtime setup error:", err);
        setConnectionStatus("disconnected");
      }
    };

    setupRealtime();

    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
      }
    };
  }, [complaintId, loadMessages]);

  useEffect(() => {
    if (messagesEndRef.current && messages.length > 0) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [messages.length]);

  return (
    <div className="glass rounded-3xl overflow-hidden border border-white/50 shadow-2xl">
      {/* Enhanced Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600" />
        <div className="absolute inset-0 bg-grid-pattern opacity-20" />
        
        <div className="relative px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Connection Status */}
              <div className="relative">
                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shadow-lg transition-all ${
                  connectionStatus === "connected" 
                    ? "bg-white text-emerald-600" 
                    : connectionStatus === "disconnected"
                    ? "bg-red-500 text-white"
                    : "bg-amber-500 text-white"
                }`}>
                  {connectionStatus === "connected" ? (
                    <Wifi className="w-6 h-6" />
                  ) : connectionStatus === "disconnected" ? (
                    <WifiOff className="w-6 h-6" />
                  ) : (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  )}
                </div>
                {connectionStatus === "connected" && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-emerald-400 rounded-full border-2 border-white animate-pulse" />
                )}
              </div>

              {/* Header Text */}
              <div>
                <h3 className="font-bold text-white text-xl flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  {isStaff ? "Chat with Citizen" : "Department Communication"}
                </h3>
                <p className="text-sm text-white/80 font-medium">
                  {connectionStatus === "connected"
                    ? "🟢 Live conversation"
                    : connectionStatus === "disconnected"
                    ? "🔴 Reconnecting..."
                    : "🟡 Connecting..."}
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="hidden sm:flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-2xl px-5 py-3">
              <Zap className="w-5 h-5 text-white" />
              <div className="text-right">
                <p className="font-bold text-white text-lg">{messages.length}</p>
                <p className="text-xs text-white/70 font-medium">Messages</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="h-[600px] overflow-y-auto p-8 space-y-6 bg-gradient-to-b from-slate-50 to-white relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />
        
        <div className="relative z-10">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full" />
                  <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto relative" />
                </div>
                <p className="text-sm text-slate-600 font-medium">Loading messages...</p>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-4 max-w-sm">
                <div className="relative">
                  <div className="absolute inset-0 bg-cyan-500/20 blur-3xl rounded-full" />
                  <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-cyan-100 to-teal-100 flex items-center justify-center mx-auto">
                    <MessageSquare className="w-10 h-10 text-cyan-600" />
                  </div>
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-lg mb-2">No messages yet</p>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Start the conversation by posting your first message below
                  </p>
                </div>
              </div>
            </div>
          ) : (
            messages.map((msg) => {
              const isCurrentUser = msg.author_id === currentUserId;
              const isStaffMessage = msg.author_role !== "citizen";

              return (
                <div
                  key={msg.id}
                  className={`flex gap-4 ${isCurrentUser ? "flex-row-reverse" : ""} animate-in slide-in-from-bottom-2`}
                >
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {msg.author_avatar ? (
                      <img
                        src={msg.author_avatar}
                        alt={msg.author_name}
                        className="w-12 h-12 rounded-2xl object-cover border-2 border-white shadow-lg"
                      />
                    ) : isStaffMessage ? (
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white font-bold border-2 border-white shadow-lg">
                        <Shield className="w-6 h-6" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold border-2 border-white shadow-lg">
                        <User className="w-6 h-6" />
                      </div>
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div className={`flex-1 max-w-[75%] ${isCurrentUser ? "items-end" : ""}`}>
                    {!isCurrentUser && (
                      <div className="flex items-center gap-2 mb-2 px-2">
                        <span className="text-sm font-bold text-slate-800">
                          {msg.author_name}
                        </span>
                        {isStaffMessage && (
                          <span className="text-xs bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-3 py-1 rounded-full font-bold shadow-md">
                            STAFF
                          </span>
                        )}
                      </div>
                    )}

                    <div
                      className={`rounded-3xl px-6 py-4 shadow-lg transition-all hover:shadow-xl ${
                        isCurrentUser
                          ? "bg-gradient-to-br from-blue-500 via-cyan-600 to-teal-600 text-white"
                          : "bg-white border-2 border-slate-200 text-slate-900"
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                        {msg.content}
                      </p>
                    </div>

                    <div
                      className={`flex items-center gap-2 mt-2 px-2 ${
                        isCurrentUser ? "justify-end" : ""
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-xs text-slate-500 font-medium">
                        {formatTimeAgo(msg.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Success Toast */}
      {showSuccess && (
        <div className="mx-8 mb-4 bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-200 rounded-2xl p-4 flex items-center gap-3 shadow-lg animate-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
          <p className="text-sm font-bold text-emerald-900">Message sent!</p>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="mx-8 mb-4 bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 rounded-2xl p-4 flex items-center gap-3 shadow-lg">
          <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-900 flex-1 font-medium">{error}</p>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-700 hover:text-red-900 font-bold text-xl transition-colors"
          >
            ×
          </button>
        </div>
      )}

      {/* Input Area */}
      <div className="p-8 bg-gradient-to-b from-slate-50 to-white border-t-2 border-slate-200">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className="w-full px-6 py-4 pr-16 border-2 border-slate-300 rounded-2xl resize-none focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition-all shadow-sm"
              rows={3}
              disabled={isSending || connectionStatus === "disconnected"}
              maxLength={1000}
            />
            <div className="absolute bottom-4 right-4">
              <span
                className={`text-xs font-mono font-bold ${
                  newMessage.length > 800 ? "text-orange-600" : "text-slate-400"
                }`}
              >
                {newMessage.length}/1000
              </span>
            </div>
          </div>
          <button
            onClick={sendMessage}
            disabled={
              !newMessage.trim() ||
              isSending ||
              connectionStatus === "disconnected"
            }
            className={`self-end px-8 py-4 rounded-2xl font-bold text-white transition-all flex items-center gap-3 shadow-lg ${
              !newMessage.trim() ||
              isSending ||
              connectionStatus === "disconnected"
                ? "bg-slate-300 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-500 via-cyan-600 to-teal-600 hover:shadow-2xl hover:scale-105 active:scale-95"
            }`}
          >
            {isSending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span className="hidden sm:inline">Send</span>
              </>
            )}
          </button>
        </div>
        <div className="flex items-center justify-between mt-4 px-2">
          <p className="text-xs text-slate-500 font-medium">
            Press{" "}
            <kbd className="px-3 py-1.5 bg-slate-100 border border-slate-300 rounded-lg text-xs font-mono font-bold">
              Enter
            </kbd>{" "}
            to send • {" "}
            <kbd className="px-3 py-1.5 bg-slate-100 border border-slate-300 rounded-lg text-xs font-mono font-bold">
              Shift + Enter
            </kbd>{" "}
            for new line
          </p>
        </div>
      </div>
    </div>
  );
}