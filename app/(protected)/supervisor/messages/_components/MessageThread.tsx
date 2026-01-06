"use client";

import { useState, useEffect, useRef } from "react";
import { Send, User, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { createClient } from "@/lib/supabase/client";
import { supervisorMessagesQueries } from "@/lib/supabase/queries/supervisor-messages";
import { supervisorMessagesSubscription } from "@/lib/supabase/realtime/supervisor-messages-subscription";

interface Message {
  id: string;
  sender_id: string;
  message_text: string;
  created_at: string;
}

interface MessageThreadProps {
  conversationId: string;
  initialMessages: Message[];
  currentUserId: string;
  otherUserName: string;
}

export function MessageThread({
  conversationId,
  initialMessages,
  currentUserId,
  otherUserName,
}: MessageThreadProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // Scroll to bottom on load and when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Realtime Subscription
  useEffect(() => {
    const channel = supervisorMessagesSubscription.subscribeToConversation(
      conversationId,
      (newMsg) => {
        // CRITICAL FIX: Prevent duplicates.
        // Only add the message from realtime if WE didn't send it.
        // (We handle our own messages in handleSend via optimistic updates)
        if (newMsg.sender_id !== currentUserId) {
          setMessages((prev) => {
            // Double check by ID just in case
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
      }
    );

    return () => {
      supervisorMessagesSubscription.unsubscribe(channel);
    };
  }, [conversationId, currentUserId]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isSending) return;

    const textToSend = inputText.trim();
    setInputText(""); // Clear input immediately
    setIsSending(true);

    // 1. OPTIMISTIC UPDATE: Add message to UI immediately
    const tempId = Math.random().toString();
    const optimisticMessage: Message = {
      id: tempId,
      sender_id: currentUserId,
      message_text: textToSend,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMessage]);

    try {
      // 2. Send to Database
      const sentMessage = await supervisorMessagesQueries.sendMessage(
        supabase,
        conversationId,
        currentUserId,
        textToSend
      );

      // 3. Replace Optimistic Message with Real DB Message (updates ID)
      setMessages((prev) =>
        prev.map((msg) => (msg.id === tempId ? sentMessage : msg))
      );
    } catch (error) {
      console.error("Failed to send message", error);
      // Rollback on error
      setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
      setInputText(textToSend); // Restore text so they can try again
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white px-6 py-3 border-b border-gray-200 flex items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
          <User className="h-4 w-4 text-gray-500" />
        </div>
        <h3 className="font-semibold text-gray-900">{otherUserName}</h3>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4" ref={scrollRef}>
        {messages.map((msg) => {
          const isMe = msg.sender_id === currentUserId;
          return (
            <div
              key={msg.id}
              className={cn("flex", isMe ? "justify-end" : "justify-start")}
            >
              <div
                className={cn(
                  "max-w-[70%] px-4 py-2 rounded-2xl text-sm shadow-sm break-words",
                  isMe
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-white text-gray-800 border border-gray-200 rounded-bl-none"
                )}
              >
                <p>{msg.message_text}</p>
                <p
                  className={cn(
                    "text-[10px] mt-1 text-right",
                    isMe ? "text-blue-200" : "text-gray-400"
                  )}
                >
                  {format(new Date(msg.created_at), "h:mm a")}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-200">
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-gray-50 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isSending}
            className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}