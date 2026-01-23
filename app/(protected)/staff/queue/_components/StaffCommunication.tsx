

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
  ChevronDown,
  Wifi,
  WifiOff,
} from "lucide-react";
import { toast } from "sonner";

interface Message {
  id: string;
  content: string;
  created_at: string;
  is_internal: boolean;
  author: {
    id: string;
    full_name: string;
    role: string;
    profile_photo_url: string | null;
  };
}

interface StaffCommunicationProps {
  complaintId: string;
  currentUserId: string;
  staffName?: string;
  citizenName?: string;
}

export function StaffCommunication({
  complaintId,
  currentUserId,
  staffName = "Staff Member",
  citizenName = "Citizen",
}: StaffCommunicationProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('connecting');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const channelRef = useRef<any>(null);
  const retryCountRef = useRef(0);

  // Format time ago
  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const then = new Date(date);
    const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);
    
    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  // Load messages function
  const loadMessages = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/supabase/rpc", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Cache-Control": "no-cache"
        },
        body: JSON.stringify({
          functionName: "rpc_get_complaint_comments",
          params: { p_complaint_id: complaintId },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }

      if (Array.isArray(result.data)) {
        setMessages(result.data);
        setConnectionStatus('connected');
        retryCountRef.current = 0;
      } else {
        setMessages([]);
      }
    } catch (err: any) {
      console.error("Failed to load messages:", err);
      setError("Failed to load messages. Retrying...");
      setConnectionStatus('disconnected');
      
      // Exponential backoff retry
      if (retryCountRef.current < 5) {
        retryCountRef.current += 1;
        setTimeout(() => loadMessages(), Math.min(1000 * 2 ** retryCountRef.current, 30000));
      }
    } finally {
      setIsLoading(false);
    }
  }, [complaintId]);

  // Send message
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
      author: {
        id: currentUserId,
        full_name: staffName,
        role: "staff",
        profile_photo_url: null,
      },
    };

    setMessages(prev => [...prev, tempMessage]);
    const originalMessage = newMessage;
    setNewMessage("");

    try {
      const response = await fetch("/api/supabase/rpc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          functionName: "rpc_add_complaint_comment_v2",
          params: {
            p_complaint_id: complaintId,
            p_content: originalMessage.trim(),
            p_is_internal: false,
          },
        }),
      });

      const result = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to send message");
      }

      // Remove temp message and reload
      setMessages(prev => prev.filter(m => m.id !== tempMessage.id));
      await loadMessages();
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
      textareaRef.current?.focus();
      
    } catch (err: any) {
      console.error("Send message error:", err);
      setError(err.message || "Failed to send message");
      // Remove optimistic update on error
      setMessages(prev => prev.filter(m => m.id !== tempMessage.id));
      setNewMessage(originalMessage);
      toast.error("Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  // Setup real-time subscription
  useEffect(() => {
    // Initial load
    loadMessages();

    // Setup Supabase real-time
    const setupRealtime = async () => {
      try {
        const supabaseModule = await import("@/lib/supabase/client");
        const supabase = supabaseModule.createClient();
        
        // Subscribe to new comments
        channelRef.current = supabase
          .channel(`complaint_comments_${complaintId}`)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'complaint_comments',
              filter: `complaint_id=eq.${complaintId}`,
            },
            (payload) => {
              console.log('New comment received:', payload.new);
              loadMessages(); // Reload to get full author data
            }
          )
          .subscribe((status) => {
            console.log('Realtime status:', status);
            if (status === 'SUBSCRIBED') {
              setConnectionStatus('connected');
            } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
              setConnectionStatus('disconnected');
            }
          });

      } catch (err) {
        console.error("Realtime setup error:", err);
        setConnectionStatus('disconnected');
      }
    };

    setupRealtime();

    // Cleanup
    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
      }
    };
  }, [complaintId, loadMessages]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current && messages.length > 0) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden transition-all duration-300">
      {/* Header */}
      <div
        className="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b flex items-center justify-between cursor-pointer hover:from-blue-100 hover:to-indigo-100 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            connectionStatus === 'connected' ? 'bg-green-500' : 
            connectionStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
          }`}>
            {connectionStatus === 'connected' ? (
              <Wifi className="w-5 h-5 text-white" />
            ) : connectionStatus === 'connecting' ? (
              <Loader2 className="w-5 h-5 text-white animate-spin" />
            ) : (
              <WifiOff className="w-5 h-5 text-white" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              Chat with Citizen
              <span className={`text-xs px-2 py-1 rounded-full ${
                connectionStatus === 'connected' ? 'bg-green-100 text-green-800' :
                connectionStatus === 'connecting' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {connectionStatus === 'connected' ? 'Live' :
                 connectionStatus === 'connecting' ? 'Connecting...' : 'Offline'}
              </span>
            </h3>
            <p className="text-xs text-gray-600">
              {messages.length} messages • Auto-updates enabled
            </p>
          </div>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 transition-transform ${
            isExpanded ? "rotate-180" : ""
          }`}
        />
      </div>

      {isExpanded && (
        <>
          {/* Messages Container */}
          <div className="h-[400px] overflow-y-auto p-4 space-y-4 bg-gray-50">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Loading messages...</p>
                </div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <MessageSquare className="w-12 h-12 text-gray-300 mb-3" />
                <h4 className="text-lg font-semibold text-gray-900 mb-1">
                  No messages yet
                </h4>
                <p className="text-gray-500 max-w-sm text-sm">
                  Start the conversation by sending your first message
                </p>
              </div>
            ) : (
              messages.map((msg) => {
                const isCurrentUser = msg.author.id === currentUserId;
                const isStaff = msg.author.role !== 'citizen';

                return (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${isCurrentUser ? "flex-row-reverse" : ""}`}
                  >
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        isStaff ? "bg-blue-500" : "bg-green-500"
                      }`}>
                        {isStaff ? (
                          <Shield className="w-4 h-4 text-white" />
                        ) : (
                          <User className="w-4 h-4 text-white" />
                        )}
                      </div>
                    </div>

                    {/* Message Content */}
                    <div className={`flex-1 max-w-[75%] ${isCurrentUser ? "text-right" : ""}`}>
                      <div className={`inline-block px-4 py-3 rounded-2xl ${
                        isCurrentUser
                          ? "bg-blue-500 text-white rounded-br-none"
                          : "bg-white border rounded-bl-none"
                      }`}>
                        {!isCurrentUser && (
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-semibold">
                              {msg.author.full_name}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              isStaff ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
                            }`}>
                              {isStaff ? "STAFF" : "CITIZEN"}
                            </span>
                          </div>
                        )}
                        <p className="whitespace-pre-wrap break-words">
                          {msg.content}
                        </p>
                        <div className={`flex items-center gap-1 mt-2 text-xs ${
                          isCurrentUser ? "text-blue-200" : "text-gray-400"
                        }`}>
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

          {/* Error Alert */}
          {error && (
            <div className="px-4 py-2 bg-red-50 border-t border-red-200">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span className="text-sm text-red-700">{error}</span>
                <button
                  onClick={() => setError(null)}
                  className="ml-auto text-red-700 hover:text-red-900"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          {/* Success Toast */}
          {showSuccess && (
            <div className="absolute top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-in slide-in-from-right-5">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-sm">Message sent!</span>
            </div>
          )}

          {/* Input Area */}
          <div className="border-t bg-white p-4">
            <div className="flex gap-3">
              <textarea
                ref={textareaRef}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message here..."
                className="flex-1 px-4 py-3 border rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                disabled={isSending || connectionStatus === 'disconnected'}
                maxLength={1000}
              />
              <button
                onClick={sendMessage}
                disabled={!newMessage.trim() || isSending || connectionStatus === 'disconnected'}
                className={`self-end px-6 py-3 rounded-xl font-medium text-white transition-all ${
                  !newMessage.trim() || isSending || connectionStatus === 'disconnected'
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600 active:scale-95"
                }`}
              >
                {isSending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
            <div className="flex items-center justify-between mt-2 px-1">
              <p className="text-xs text-gray-500">
                Press <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">Enter</kbd> to send
              </p>
              <p className={`text-xs ${newMessage.length > 900 ? "text-amber-600" : "text-gray-400"}`}>
                {newMessage.length}/1000
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}