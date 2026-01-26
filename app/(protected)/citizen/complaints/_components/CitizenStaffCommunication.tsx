"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Send,
  MessageSquare,
  User,
  Shield,
  Clock,
  RefreshCw,
  AlertCircle,
  Loader2,
  CheckCircle2,
  ChevronDown,
  Wifi,
  WifiOff,
  UserCircle,
} from "lucide-react";

// FIXED: Match the actual RPC response structure (flat fields)
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

interface CitizenStaffCommunicationProps {
  complaintId: string;
  currentUserId: string;
  userRole: "citizen" | "staff" | "supervisor" | "admin";
  assignedStaffName?: string;
  citizenName?: string;
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

export default function CitizenStaffCommunication({
  complaintId,
  currentUserId,
  userRole,
  assignedStaffName,
  citizenName,
}: CitizenStaffCommunicationProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
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

    // Optimistic update
    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      content: newMessage.trim(),
      created_at: new Date().toISOString(),
      is_internal: false,
      author_role: userRole,
      author_id: currentUserId,
      author_name: userRole === "citizen" ? "You" : "Staff",
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

      // Remove temp message and reload
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

  // Setup real-time subscription
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

  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current && messages.length > 0) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [messages.length]);

  // Determine chat partner name
  const chatPartnerName = userRole === "citizen" 
    ? (assignedStaffName || "Assigned Staff")
    : (citizenName || "Citizen");

  return (
    <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
      {/* Header */}
      <div
        className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white p-5 cursor-pointer hover:from-indigo-600 hover:to-blue-700 transition-all"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {connectionStatus === "connected" ? (
              <Wifi className="w-5 h-5" />
            ) : connectionStatus === "disconnected" ? (
              <WifiOff className="w-5 h-5" />
            ) : (
              <Loader2 className="w-5 h-5 animate-spin" />
            )}
            <div>
              <h3 className="font-semibold text-lg flex items-center gap-2">
                {userRole === "citizen" ? (
                  <>
                    <Shield className="w-5 h-5" />
                    Chat with {chatPartnerName}
                  </>
                ) : (
                  <>
                    <UserCircle className="w-5 h-5" />
                    Chat with {chatPartnerName}
                  </>
                )}
              </h3>
              <p className="text-xs text-white/80">
                {connectionStatus === "connected"
                  ? "Live • Auto-updating"
                  : connectionStatus === "disconnected"
                  ? "Offline • Reconnecting..."
                  : "Connecting..."}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right text-sm">
              <p className="font-medium">{messages.length} messages</p>
              <p className="text-xs text-white/70">Direct conversation</p>
            </div>
            <ChevronDown
              className={`w-5 h-5 transition-transform ${
                isExpanded ? "rotate-180" : ""
              }`}
            />
          </div>
        </div>
      </div>

      {isExpanded && (
        <>
          {/* Messages Container */}
          <div className="h-[500px] overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-gray-50 to-white">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center space-y-3">
                  <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mx-auto" />
                  <p className="text-sm text-gray-500">Loading conversation...</p>
                </div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center space-y-3 max-w-xs">
                  <MessageSquare className="w-12 h-12 text-gray-300 mx-auto" />
                  <div>
                    <p className="font-medium text-gray-700">Start the conversation</p>
                    <p className="text-sm text-gray-500">
                      {userRole === "citizen" 
                        ? "Send a message to the assigned staff member"
                        : "Send a message to the citizen about their complaint"}
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
                    className={`flex gap-3 ${
                      isCurrentUser ? "flex-row-reverse" : ""
                    }`}
                  >
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      {msg.author_avatar ? (
                        <img
                          src={msg.author_avatar}
                          alt={msg.author_name}
                          className="w-10 h-10 rounded-full object-cover border-2 border-white shadow"
                        />
                      ) : isStaffMessage ? (
                        <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold border-2 border-white shadow">
                          <Shield className="w-5 h-5" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold border-2 border-white shadow">
                          <User className="w-5 h-5" />
                        </div>
                      )}
                    </div>

                    {/* Message Bubble */}
                    <div
                      className={`flex-1 max-w-[75%] ${
                        isCurrentUser ? "items-end" : ""
                      }`}
                    >
                      {!isCurrentUser && (
                        <div className="flex items-center gap-2 mb-1 px-1">
                          <span className="text-xs font-semibold text-gray-700">
                            {msg.author_name}
                          </span>
                          {isStaffMessage && (
                            <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">
                              STAFF
                            </span>
                          )}
                        </div>
                      )}

                      <div
                        className={`rounded-2xl px-4 py-3 shadow-sm ${
                          isCurrentUser
                            ? "bg-gradient-to-br from-indigo-500 to-blue-600 text-white"
                            : "bg-white border"
                        }`}
                      >
                        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                          {msg.content}
                        </p>
                      </div>

                      <div
                        className={`flex items-center gap-1 mt-1 px-1 ${
                          isCurrentUser ? "justify-end" : ""
                        }`}
                      >
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500">
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

          {/* Success Toast */}
          {showSuccess && (
            <div className="mx-6 mb-3 bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
              <p className="text-sm font-medium text-green-800">
                Message sent successfully!
              </p>
            </div>
          )}

          {/* Error Alert */}
          {error && (
            <div className="mx-6 mb-3 bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-800 flex-1">{error}</p>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-700 hover:text-red-900 font-bold text-lg"
              >
                ×
              </button>
            </div>
          )}

          {/* Input Area */}
          <div className="p-6 bg-gray-50 border-t">
            <div className="flex gap-3">
              <textarea
                ref={textareaRef}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Message ${chatPartnerName}...`}
                className="flex-1 px-4 py-3 border rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                rows={3}
                disabled={isSending || connectionStatus === "disconnected"}
                maxLength={1000}
              />
              <button
                onClick={sendMessage}
                disabled={
                  !newMessage.trim() ||
                  isSending ||
                  connectionStatus === "disconnected"
                }
                className={`self-end px-5 py-3 rounded-xl font-medium text-white transition-all flex items-center gap-2 ${
                  !newMessage.trim() ||
                  isSending ||
                  connectionStatus === "disconnected"
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-indigo-500 hover:bg-indigo-600 active:scale-95"
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
            <div className="flex items-center justify-between mt-3 px-1">
              <p className="text-xs text-gray-500">
                Press{" "}
                <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">
                  Enter
                </kbd>{" "}
                to send
              </p>
              <p
                className={`text-xs ${
                  newMessage.length > 800 ? "text-orange-600" : "text-gray-400"
                }`}
              >
                {newMessage.length}/1000
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}