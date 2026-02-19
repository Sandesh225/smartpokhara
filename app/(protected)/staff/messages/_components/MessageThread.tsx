"use client";

import { useState, useRef, useEffect } from "react";
import { Send, User, Loader2, ArrowLeft } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

import { Message } from "@/features/messages";
import { messagesApi } from "@/features/messages";

interface Props {
  conversationId: string;
  initialMessages: Message[];
  currentUserId: string;
  otherUserName: string; // The Supervisor's name
}

export function MessageThread({
  conversationId,
  initialMessages,
  currentUserId,
  otherUserName,
}: Props) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createClient();

  // Auto-scroll to bottom on load and new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const text = newMessage;
    setNewMessage(""); // Clear input immediately
    setSending(true);

    try {
      // 1. Send to DB
      const sentMsg = await messagesApi.sendMessage(
        supabase,
        conversationId,
        currentUserId,
        text
      );

      // 2. Optimistic Update (Add to list immediately)
      const newMsgObj: Message = {
        id: (sentMsg as any).id,
        conversation_id: conversationId,
        sender_id: currentUserId,
        message_text: text,
        is_read: false,
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, newMsgObj]);
      router.refresh(); // Update server cache
    } catch (error) {
      console.error(error);
      toast.error("Failed to send message");
      setNewMessage(text); // Restore text on error
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <Link
          href="/staff/messages"
          className="md:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700">
          <User className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-bold text-gray-900">{otherUserName}</h2>
          <p className="text-xs text-gray-500">Supervisor</p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/30">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 text-sm py-10">
            Start the conversation...
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_id === currentUserId;
            return (
              <div
                key={msg.id}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm text-sm ${
                    isMe
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-white border border-gray-200 text-gray-800 rounded-bl-none"
                  }`}
                >
                  <p>{msg.message_text}</p>
                  <p
                    className={`text-[10px] mt-1 text-right ${
                      isMe ? "text-blue-100" : "text-gray-400"
                    }`}
                  >
                    {formatDistanceToNow(new Date(msg.created_at), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-100 bg-white">
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-gray-100 border-0 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm shadow-blue-200"
          >
            {sending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
