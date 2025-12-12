"use client";

import { useState, useEffect, useRef } from "react";
import { Send, User } from "lucide-react";
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

export function MessageThread({ conversationId, initialMessages, currentUserId, otherUserName }: MessageThreadProps) {
  const [messages, setMessages] = useState(initialMessages);
  const [inputText, setInputText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }

    const channel = supervisorMessagesSubscription.subscribeToConversation(
      conversationId,
      (newMsg) => {
        setMessages((prev) => [...prev, newMsg]);
        setTimeout(() => {
          if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
          }
        }, 100);
      }
    );

    return () => {
      supervisorMessagesSubscription.unsubscribe(channel);
    };
  }, [conversationId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    try {
      const text = inputText;
      setInputText("");
      await supervisorMessagesQueries.sendMessage(supabase, conversationId, currentUserId, text);
    } catch (error) {
      console.error("Failed to send message", error);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="bg-white px-6 py-3 border-b border-gray-200 flex items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
          <User className="h-4 w-4 text-gray-500" />
        </div>
        <h3 className="font-semibold text-gray-900">{otherUserName}</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4" ref={scrollRef}>
        {messages.map((msg) => {
          const isMe = msg.sender_id === currentUserId;
          return (
            <div key={msg.id} className={cn("flex", isMe ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[70%] px-4 py-2 rounded-2xl text-sm shadow-sm",
                  isMe
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-white text-gray-800 border border-gray-200 rounded-bl-none"
                )}
              >
                <p>{msg.message_text}</p>
                <p className={cn("text-[10px] mt-1 text-right", isMe ? "text-blue-200" : "text-gray-400")}>
                  {format(new Date(msg.created_at), "h:mm a")}
                </p>
              </div>
            </div>
          );
        })}
      </div>

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
            disabled={!inputText.trim()}
            className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
}