import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  MessageSquare,
  User,
  Shield,
  Clock,
  RefreshCw,
  AlertCircle,
  Check,
  ChevronDown,
  Loader2,
  CheckCircle2,
} from "lucide-react";

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

interface RealTimeCommunicationProps {
  complaintId: string;
  currentUserId: string;
  isStaff?: boolean;
}

// Format relative time
function formatTimeAgo(date: string) {
  const now = new Date().getTime();
  const then = new Date(date).getTime();
  const seconds = Math.floor((now - then) / 1000);
  
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export default function RealTimeCommunication({
  complaintId,
  currentUserId,
  isStaff = false,
}: RealTimeCommunicationProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isConnected, setIsConnected] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const pollIntervalRef = useRef<number | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadMessages = async () => {
    try {
      const response = await fetch("/api/supabase/rpc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          function: "rpc_get_complaint_comments",
          params: { p_complaint_id: complaintId },
        }),
      });

      if (!response.ok) throw new Error("Failed to load messages");

      const data = await response.json();
      setMessages(data || []);
      setIsConnected(true);
      setTimeout(scrollToBottom, 100);
    } catch (err: any) {
      console.error("Error loading messages:", err);
      setError(err.message || "Failed to load messages");
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    setError(null);

    try {
      const response = await fetch("/api/supabase/rpc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          function: "rpc_add_complaint_comment_v2",
          params: {
            p_complaint_id: complaintId,
            p_content: newMessage.trim(),
            p_is_internal: false,
          },
        }),
      });

      if (!response.ok) throw new Error("Failed to send message");

      const data = await response.json();
      if (!data.success) throw new Error(data.message || "Failed to send");

      setNewMessage("");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
      await loadMessages();

      if (textareaRef.current) textareaRef.current.focus();
    } catch (err: any) {
      console.error("Error sending message:", err);
      setError(err.message || "Failed to send message");
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

  // Poll for new messages every 5 seconds
  useEffect(() => {
    loadMessages();

    pollIntervalRef.current = window.setInterval(() => {
      loadMessages();
    }, 5000);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [complaintId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden relative">
      {/* Header */}
      <div
        className="px-4 py-3 bg-gradient-to-r from-blue-50 to-purple-50 border-b flex items-center justify-between cursor-pointer hover:bg-gradient-to-r hover:from-blue-100 hover:to-purple-100 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              {isStaff ? "Chat with Citizen" : "Chat with Staff"}
              {isConnected && (
                <span className="flex items-center gap-1 text-xs text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  Live
                </span>
              )}
            </h3>
            <p className="text-xs text-gray-600">
              {messages.length} messages • Auto-refreshing
            </p>
          </div>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 transition-transform ${
            isExpanded ? "rotate-180" : ""
          }`}
        />
      </div>

      {/* Messages Container */}
      {isExpanded && (
        <>
          <div className="h-[450px] overflow-y-auto p-4 space-y-3 bg-gray-50">
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
                <p className="text-gray-500 max-w-sm text-sm">
                  Start the conversation by posting your first message below
                </p>
              </div>
            ) : (
              messages.map((msg) => {
                const isCurrentUser = msg.author.id === currentUserId;
                const isStaffMessage = msg.author.role !== "citizen";

                return (
                  <div
                    key={msg.id}
                    className={`flex gap-2 ${isCurrentUser ? "flex-row-reverse" : ""}`}
                  >
                    {/* Avatar */}
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 ${
                        isStaffMessage
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
                      ) : isStaffMessage ? (
                        <Shield className="w-4 h-4" />
                      ) : (
                        <User className="w-4 h-4" />
                      )}
                    </div>

                    {/* Message Bubble */}
                    <div
                      className={`flex-1 max-w-[75%] ${isCurrentUser ? "text-right" : ""}`}
                    >
                      <div
                        className={`inline-block px-3 py-2 rounded-xl text-sm shadow-sm ${
                          isCurrentUser
                            ? "bg-blue-500 text-white rounded-br-sm"
                            : "bg-white border rounded-bl-sm"
                        }`}
                      >
                        {!isCurrentUser && (
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-xs font-semibold text-gray-900">
                              {msg.author.full_name}
                            </span>
                            {isStaffMessage && (
                              <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 text-[9px] font-bold rounded">
                                STAFF
                              </span>
                            )}
                          </div>
                        )}
                        <p
                          className={`leading-relaxed whitespace-pre-line ${
                            isCurrentUser ? "text-white" : "text-gray-700"
                          }`}
                        >
                          {msg.content}
                        </p>
                        <div
                          className={`flex items-center gap-1 mt-1 text-[10px] ${
                            isCurrentUser
                              ? "text-blue-100 justify-end"
                              : "text-gray-400"
                          }`}
                        >
                          <Clock className="w-3 h-3" />
                          <span>{formatTimeAgo(msg.created_at)}</span>
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
            <div className="absolute top-16 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-3 py-2 rounded-lg shadow-lg flex items-center gap-2 z-50 text-sm">
              <CheckCircle2 className="w-4 h-4" />
              <span>Message sent!</span>
            </div>
          )}

          {/* Error Alert */}
          {error && (
            <div className="px-4 py-2 bg-red-50 border-t border-red-200 flex items-center gap-2 text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-700 hover:text-red-900"
              >
                ×
              </button>
            </div>
          )}

          {/* Input Area */}
          <div className="border-t bg-white p-3">
            <div className="flex gap-2">
              <textarea
                ref={textareaRef}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                className="flex-1 px-3 py-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                rows={2}
                disabled={isSending}
                maxLength={2000}
              />
              <button
                onClick={sendMessage}
                disabled={!newMessage.trim() || isSending}
                className={`px-4 h-full rounded-lg font-medium text-white transition-all flex items-center gap-2 ${
                  !newMessage.trim() || isSending
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600 shadow-md hover:shadow-lg"
                }`}
              >
                {isSending ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
            <div className="flex items-center justify-between mt-1 px-1">
              <p className="text-xs text-gray-500">
                Press <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-[10px] font-mono">Enter</kbd> to send
              </p>
              <p
                className={`text-xs font-mono ${
                  newMessage.length > 1800
                    ? "text-orange-600 font-semibold"
                    : "text-gray-400"
                }`}
              >
                {newMessage.length}/2000
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}