"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Send,
  MessageSquare,
  Loader2,
  User,
  Shield,
  AlertCircle,
  Wifi,
  WifiOff,
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { createClient } from "@/lib/supabase/client";

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
  staffName?: string;
  citizenName?: string;
}

export default function StaffCommunication({
  complaintId,
  currentUserId,
  staffName = "Staff",
  citizenName = "Citizen",
}: StaffCommunicationProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    "connected" | "disconnected"
  >("connecting");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const supabase = createClient();

  // 1. Load Messages Function
  const loadMessages = useCallback(async () => {
    try {
      const { data, error } = await supabase.rpc("rpc_get_complaint_comments", {
        p_complaint_id: complaintId,
      });

      if (error) throw error;

      if (data) {
        setMessages(data as Message[]);
        setConnectionStatus("connected");
      }
    } catch (err) {
      console.error("Chat load failed:", err);
      setConnectionStatus("disconnected");
    } finally {
      setIsLoading(false);
    }
  }, [complaintId, supabase]);

  // 2. Send Message Function
  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const tempContent = newMessage;
    setNewMessage(""); // Clear input immediately
    setIsSending(true);

    try {
      const { error } = await supabase.rpc("rpc_add_complaint_comment_v2", {
        p_complaint_id: complaintId,
        p_content: tempContent,
        p_is_internal: false, // Public message to citizen
      });

      if (error) throw error;

      await loadMessages(); // Refresh list
      toast.success("Message sent");
    } catch (err) {
      console.error("Send failed:", err);
      toast.error("Failed to send. Please retry.");
      setNewMessage(tempContent); // Restore text on error
    } finally {
      setIsSending(false);
    }
  };

  // 3. Real-time Subscription & Polling
  useEffect(() => {
    loadMessages();

    // Subscribe to changes for instant updates
    const channel = supabase
      .channel(`chat-${complaintId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "complaint_comments",
          filter: `complaint_id=eq.${complaintId}`,
        },
        () => loadMessages()
      )
      .subscribe((status) => {
        setConnectionStatus(
          status === "SUBSCRIBED" ? "connected" : "disconnected"
        );
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [complaintId, loadMessages, supabase]);

  // 4. Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col h-[600px]">
      {/* Header */}
      <div className="px-6 py-4 border-b bg-gray-50/50 flex justify-between items-center">
        <div>
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            Chat with {citizenName}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Direct communication channel
          </p>
        </div>
        <div className="flex items-center gap-2">
          {connectionStatus === "connected" ? (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium border border-emerald-100">
              <Wifi className="w-3 h-3" /> Live
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-rose-50 text-rose-700 rounded-full text-xs font-medium border border-rose-100">
              <WifiOff className="w-3 h-3" /> Offline
            </div>
          )}
        </div>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50/50">
        {isLoading ? (
          <div className="flex justify-center pt-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500/50" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-400 pt-20 flex flex-col items-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <MessageSquare className="w-8 h-8 text-gray-300" />
            </div>
            <p className="font-medium text-gray-600">No messages yet</p>
            <p className="text-sm mt-1">
              Start the conversation with the citizen.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.author_id === currentUserId;
            const isSystem =
              msg.author_role === "system" ||
              msg.content.startsWith("[SYSTEM]");
            const isStaffMsg = msg.author_role !== "citizen";

            if (isSystem) {
              return (
                <div key={msg.id} className="flex justify-center my-6">
                  <span className="bg-gray-100 text-gray-500 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-gray-200">
                    {msg.content.replace("[SYSTEM]:", "").trim()}
                  </span>
                </div>
              );
            }

            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isMe ? "justify-end" : "justify-start"} group`}
              >
                {!isMe && (
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm border ${
                      isStaffMsg
                        ? "bg-blue-100 border-blue-200 text-blue-700"
                        : "bg-white border-gray-200 text-gray-600"
                    }`}
                  >
                    {isStaffMsg ? (
                      <Shield className="w-4 h-4" />
                    ) : (
                      <User className="w-4 h-4" />
                    )}
                  </div>
                )}

                <div
                  className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[80%]`}
                >
                  <div className="flex items-center gap-2 mb-1 px-1">
                    <span className="text-[11px] font-medium text-gray-500">
                      {msg.author_name}
                    </span>
                    {isStaffMsg && !isMe && (
                      <span className="text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded border border-blue-200 font-bold uppercase">
                        Staff
                      </span>
                    )}
                  </div>

                  <div
                    className={`px-4 py-3 rounded-2xl text-sm shadow-sm leading-relaxed whitespace-pre-wrap ${
                      isMe
                        ? "bg-blue-600 text-white rounded-br-none"
                        : "bg-white text-gray-800 border border-gray-200 rounded-bl-none"
                    }`}
                  >
                    {msg.content}
                  </div>

                  <span className="text-[10px] text-gray-400 mt-1 px-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {formatDistanceToNow(new Date(msg.created_at), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t">
        <div className="flex gap-3 items-end">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="flex-1 bg-gray-50 border-gray-200 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none resize-none min-h-[50px] max-h-[120px]"
            rows={1}
            disabled={isSending}
          />
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim() || isSending}
            className={`p-3 rounded-xl transition-all shadow-sm flex-shrink-0 ${
              !newMessage.trim() || isSending
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow active:scale-95"
            }`}
          >
            {isSending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
        <div className="text-[10px] text-gray-400 mt-2 px-1 text-right">
          Press{" "}
          <span className="font-mono bg-gray-100 px-1 rounded">Enter</span> to
          send
        </div>
      </div>
    </div>
  );
}
