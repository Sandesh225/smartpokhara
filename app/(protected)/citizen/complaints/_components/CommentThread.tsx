"use client";

import { useState, useEffect, useRef } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  Send,
  MessageSquare,
  User,
  Shield,
  Clock,
  RefreshCw,
  AlertCircle,
  Check,
  Loader2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Message {
  id: string;
  content: string;
  created_at: string;
  author: {
    id: string;
    full_name: string;
    role: string;
    profile_photo_url: string | null;
  };
}

interface CommentThreadProps {
  complaintId: string;
}

export function CommentThread({ complaintId }: CommentThreadProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const supabase = createClient();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase.rpc("rpc_get_complaint_comments", {
        p_complaint_id: complaintId,
      });

      if (error) throw error;
      setMessages(data || []);
      setTimeout(scrollToBottom, 100);
    } catch (err: any) {
      console.error("Error loading messages:", err);
      setError("Failed to load messages");
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    setError(null);

    try {
      const { data, error } = await supabase.rpc(
        "rpc_add_complaint_comment_v2",
        {
          p_complaint_id: complaintId,
          p_content: newMessage.trim(),
          p_is_internal: false,
        }
      );

      if (error) throw error;

      setNewMessage("");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
      await loadMessages();

      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    } catch (err: any) {
      console.error("Error sending message:", err);
      setError(err.message || "Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    // Get current user
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data.user?.id || null);
    });

    loadMessages();

    // Real-time subscription
    const channel = supabase
      .channel(`complaint-chat-${complaintId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "complaint_comments",
          filter: `complaint_id=eq.${complaintId}`,
        },
        (payload) => {
          console.log("New message received:", payload);
          loadMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [complaintId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-xl shadow-sm border relative">
      {/* Header */}
      <div className="px-6 py-4 border-b bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Communication
              </h3>
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <span>{messages.length} messages</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  Real-time
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <MessageSquare className="w-8 h-8 text-gray-400" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              No messages yet
            </h4>
            <p className="text-gray-500 max-w-sm">
              {messages.length === 0
                ? "Once your complaint is assigned to staff, you can communicate here"
                : "Start the conversation by posting your first comment below"}
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isCurrentUser = msg.author.id === currentUserId;
            const isStaff = msg.author.role !== "citizen";

            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isCurrentUser ? "flex-row-reverse" : ""}`}
              >
                {/* Avatar */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 ${
                    isStaff
                      ? "bg-gradient-to-br from-purple-500 to-purple-600"
                      : "bg-gradient-to-br from-blue-500 to-blue-600"
                  }`}
                >
                  {msg.author.profile_photo_url ? (
                    <img
                      src={msg.author.profile_photo_url}
                      alt=""
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : isStaff ? (
                    <Shield className="w-5 h-5" />
                  ) : (
                    <User className="w-5 h-5" />
                  )}
                </div>

                {/* Message Bubble */}
                <div
                  className={`flex-1 max-w-[70%] ${isCurrentUser ? "text-right" : ""}`}
                >
                  <div
                    className={`inline-block px-4 py-3 rounded-2xl ${
                      isCurrentUser
                        ? "bg-blue-500 text-white rounded-br-sm"
                        : "bg-white text-gray-900 border shadow-sm rounded-bl-sm"
                    }`}
                  >
                    {/* Author Info */}
                    <div
                      className={`flex items-center gap-2 mb-1 ${isCurrentUser ? "justify-end" : ""}`}
                    >
                      <span
                        className={`text-xs font-semibold ${
                          isCurrentUser ? "text-blue-100" : "text-gray-900"
                        }`}
                      >
                        {isCurrentUser ? "You" : msg.author.full_name}
                      </span>
                      {isStaff && (
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-bold rounded-full">
                          STAFF
                        </span>
                      )}
                    </div>

                    {/* Message Content */}
                    <p
                      className={`text-sm leading-relaxed whitespace-pre-line ${
                        isCurrentUser ? "text-white" : "text-gray-700"
                      }`}
                    >
                      {msg.content}
                    </p>

                    {/* Timestamp */}
                    <div
                      className={`flex items-center gap-1 mt-2 text-xs ${
                        isCurrentUser
                          ? "text-blue-100 justify-end"
                          : "text-gray-400"
                      }`}
                    >
                      <Clock className="w-3 h-3" />
                      <span>
                        {formatDistanceToNow(new Date(msg.created_at), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
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
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-in slide-in-from-top">
          <Check className="w-4 h-4" />
          <span className="text-sm font-medium">Message sent!</span>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="px-4 py-2 bg-red-50 border-t border-red-200 flex items-center gap-2 text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t bg-white p-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message... (Press Enter to send)"
              className="w-full px-4 py-3 border rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              rows={2}
              disabled={isSending}
            />
          </div>

          <button
            onClick={sendMessage}
            disabled={!newMessage.trim() || isSending}
            className={`px-6 h-full rounded-xl font-medium text-white transition-all flex items-center gap-2 ${
              !newMessage.trim() || isSending
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-lg hover:shadow-xl"
            }`}
          >
            {isSending ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Sending</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Send</span>
              </>
            )}
          </button>
        </div>

        <div className="flex items-center justify-between mt-2 px-1">
          <p className="text-xs text-gray-500">
            Press{" "}
            <kbd className="px-2 py-0.5 bg-gray-100 rounded text-[10px] font-mono">
              Enter
            </kbd>{" "}
            to send,{" "}
            <kbd className="px-2 py-0.5 bg-gray-100 rounded text-[10px] font-mono">
              Shift+Enter
            </kbd>{" "}
            for new line
          </p>
          <p
            className={`text-xs font-mono ${newMessage.length > 1800 ? "text-orange-500 font-semibold" : "text-gray-400"}`}
          >
            {newMessage.length}/2000
          </p>
        </div>
      </div>
    </div>
  );
}