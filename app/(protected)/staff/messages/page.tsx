"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { staffMessagesQueries } from "@/lib/supabase/queries/staff-messages";
import { Send, User, Loader2 } from "lucide-react";
import { format } from "date-fns";

export default function StaffChatPage() {
  const [conversation, setConversation] = useState<any>(null);
  const [supervisorName, setSupervisorName] = useState("Supervisor"); // New State
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    initializeChat();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Real-time listener
  useEffect(() => {
    if (!conversation?.id) return;
    const channel = supabase
      .channel("chat_room")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "supervisor_staff_messages",
          filter: `conversation_id=eq.${conversation.id}`,
        },
        (payload) => {
          const newMsg = payload.new as any;
          if (newMsg.sender_id !== userId) {
            setMessages((prev) => [
              ...prev,
              {
                id: newMsg.id,
                content: newMsg.message_text,
                senderId: newMsg.sender_id,
                createdAt: newMsg.created_at,
                senderName: supervisorName, // Use the fetched name
              },
            ]);
          }
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversation?.id, userId, supervisorName]);

  async function initializeChat() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    setUserId(user.id);

    // 1. Get Chat AND Name
    const result = await staffMessagesQueries.ensureSupervisorChat(
      supabase,
      user.id
    );

    if (result && result.conversation) {
      setConversation(result.conversation);
      setSupervisorName(result.supervisorName); // Set Name

      // 2. Load Messages
      const msgs = await staffMessagesQueries.getMessages(
        supabase,
        result.conversation.id
      );
      setMessages(msgs);
    }
    setLoading(false);
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !conversation || !userId) return;
    const text = newMessage;
    setNewMessage("");

    // Optimistic Update
    setMessages((prev) => [
      ...prev,
      {
        id: Math.random().toString(),
        content: text,
        senderId: userId,
        senderName: "Me",
        createdAt: new Date().toISOString(),
      },
    ]);

    await staffMessagesQueries.sendMessage(
      supabase,
      conversation.id,
      userId,
      text
    );
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  if (loading)
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
      </div>
    );

  if (!conversation)
    return (
      <div className="p-8 text-center bg-gray-50 rounded-lg border border-gray-200">
        <User className="h-12 w-12 mx-auto text-gray-400 mb-2" />
        <h3 className="text-lg font-medium text-gray-900">
          No Supervisor Assigned
        </h3>
        <p className="text-gray-500">
          You are not currently assigned to a department or ward with an active
          supervisor.
        </p>
      </div>
    );

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      {/* Header with Dynamic Name */}
      <div className="bg-gray-50 p-4 border-b border-gray-200 flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
          <User className="h-6 w-6" />
        </div>
        <div>
          {/* DISPLAY NAME HERE */}
          <h2 className="font-semibold text-gray-900">{supervisorName}</h2>
          <p className="text-xs text-green-600 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            Online
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
        {messages.map((msg) => {
          const isMe = msg.senderId === userId;
          return (
            <div
              key={msg.id}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                  isMe
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm"
                }`}
              >
                <p className="text-sm">{msg.content}</p>
                <p
                  className={`text-[10px] mt-1 ${
                    isMe ? "text-blue-200" : "text-gray-400"
                  }`}
                >
                  {format(new Date(msg.createdAt), "h:mm a")}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-gray-200">
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg disabled:opacity-50 transition-colors"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
