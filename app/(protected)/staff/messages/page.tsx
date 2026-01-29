"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { staffMessagesQueries } from "@/lib/supabase/queries/staff-messages";
import { Send, User, Loader2, PlusCircle, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function StaffMessagesPage() {
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const [userId, setUserId] = useState<string>("");

  const scrollRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // 1. Initial Load
  useEffect(() => {
    async function init() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const convs = await staffMessagesQueries.getConversations(
        supabase,
        user.id
      );
      setConversations(convs);

      // Auto-select first chat if available
      if (convs.length > 0) setActiveChatId(convs[0].id);

      setLoading(false);
    }
    init();
  }, []);

  // 2. Load Messages when Chat Selected
  useEffect(() => {
    if (!activeChatId) return;

    async function loadThread() {
      const msgs = await staffMessagesQueries.getThreadMessages(
        supabase,
        activeChatId!
      );
      setMessages(msgs);
      setTimeout(() => scrollRef.current?.scrollIntoView(), 100);
    }
    loadThread();

    // Realtime Sub for Messages
    const channel = supabase
      .channel(`chat:${activeChatId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "supervisor_staff_messages",
          filter: `conversation_id=eq.${activeChatId}`,
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
                senderName: "Supervisor", // Simplified for realtime
              },
            ]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeChatId, userId]);

  // 3. Handlers
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeChatId) return;

    const text = inputText;
    setInputText("");

    // Optimistic
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
      activeChatId,
      userId,
      text
    );
  };

  const handleCreateSupport = async () => {
    const toastId = toast.loading("Connecting to support...");
    try {
      const newId = await staffMessagesQueries.createSupportTicket(
        supabase,
        userId
      );
      setActiveChatId(newId);
      // Refresh list
      const convs = await staffMessagesQueries.getConversations(
        supabase,
        userId
      );
      setConversations(convs);
      toast.success("Connected!", { id: toastId });
    } catch (e) {
      toast.error("No support staff available right now.", { id: toastId });
    }
  };

  if (loading)
    return (
      <div className="h-96 flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" />
      </div>
    );

  // VIEW: NO CONVERSATIONS
  if (conversations.length === 0 && !loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] p-6 text-center bg-white m-4 rounded-xl border border-gray-200">
        <div className="bg-blue-50 p-4 rounded-full mb-4">
          <MessageSquare className="h-8 w-8 text-blue-600" />
        </div>
        <h3 className="text-lg font-bold text-gray-900">No Messages Yet</h3>
        <p className="text-sm text-gray-500 mb-6 max-w-xs">
          You don't have any active chats with supervisors. Start a support
          request if needed.
        </p>
        <button
          onClick={handleCreateSupport}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          <PlusCircle className="h-5 w-5" /> Contact Support
        </button>
      </div>
    );
  }

  // VIEW: CHAT INTERFACE
  const activeConversation = conversations.find((c) => c.id === activeChatId);

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-100px)] bg-white md:rounded-xl md:border md:border-gray-200 md:overflow-hidden m-2 md:m-6">
      {/* Sidebar List (Mobile: Top Bar, Desktop: Left Col) */}
      <div className="w-full md:w-80 bg-gray-50 border-b md:border-b-0 md:border-r border-gray-200 flex flex-col">
        <div className="p-4 font-bold text-gray-700 border-b border-gray-200 hidden md:block">
          Inbox
        </div>
        <div className="flex md:flex-col overflow-x-auto md:overflow-y-auto p-2 gap-2">
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => setActiveChatId(conv.id)}
              className={`flex items-center gap-3 p-3 rounded-lg text-left min-w-[200px] md:min-w-0 transition-colors ${
                activeChatId === conv.id
                  ? "bg-white shadow-sm border border-blue-100"
                  : "hover:bg-gray-100"
              }`}
            >
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold shrink-0">
                {conv.otherUserName[0]}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">
                  {conv.otherUserName}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {conv.lastMessage || "Click to view"}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Thread */}
      <div className="flex-1 flex flex-col bg-white min-w-0">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex items-center gap-3 shadow-sm z-10">
          <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center text-white">
            <User className="h-4 w-4" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900 text-sm">
              {activeConversation?.otherUserName}
            </h2>
            <p className="text-xs text-green-600 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full" /> Online
            </p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/30">
          {messages.map((msg) => {
            const isMe = msg.senderId === userId;
            return (
              <div
                key={msg.id}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${
                    isMe
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm"
                  }`}
                >
                  <p>{msg.content}</p>
                  <p
                    className={`text-[10px] mt-1 text-right ${isMe ? "text-blue-200" : "text-gray-400"}`}
                  >
                    {format(new Date(msg.createdAt), "h:mm a")}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={scrollRef} />
        </div>

        {/* Input */}
        <form
          onSubmit={handleSend}
          className="p-3 border-t border-gray-100 flex gap-2"
        >
          <input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-gray-100 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
          <button
            disabled={!inputText.trim()}
            className="p-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-md"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
}