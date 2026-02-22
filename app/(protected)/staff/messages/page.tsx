"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { messagesApi } from "@/features/messages";
import { UniversalMessaging } from "@/components/complaints/shared/UniversalMessaging";
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

      const convs = await messagesApi.getConversations(
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
      const msgs = await messagesApi.getThreadMessages(
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

    await messagesApi.sendMessage(
      supabase,
      activeChatId,
      userId,
      text
    );
  };

  const handleCreateSupport = async () => {
    const toastId = toast.loading("Connecting to support...");
    try {
      const newId = await messagesApi.createSupportTicket(
        supabase,
        userId
      );
      setActiveChatId(newId);
      // Refresh list
      const convs = await messagesApi.getConversations(
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
      <div className="h-96 flex flex-col items-center justify-center bg-card rounded-2xl border border-border border-dashed m-6">
        <Loader2 className="animate-spin text-primary mb-4" />
        <p className="text-xs font-black text-muted-foreground uppercase tracking-widest animate-pulse italic">
          Syncing conversations...
        </p>
      </div>
    );

  // VIEW: NO CONVERSATIONS
  if (conversations.length === 0 && !loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] p-12 text-center bg-card m-6 rounded-2xl border border-border shadow-xs">
        <div className="bg-info-blue/10 p-5 rounded-2xl mb-6 border border-info-blue/20">
          <MessageSquare className="h-10 w-10 text-info-blue" />
        </div>
        <h3 className="text-sm font-black text-foreground uppercase tracking-widest">No Messages Yet</h3>
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-tight mb-8 max-w-xs opacity-60">
          You don't have any active chats with supervisors. Start a support
          request if needed.
        </p>
        <button
          onClick={handleCreateSupport}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 text-xs"
        >
          <PlusCircle className="h-4 w-4" /> Contact Support
        </button>
      </div>
    );
  }

  // VIEW: CHAT INTERFACE
  const activeConversation = conversations.find((c) => c.id === activeChatId);

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-120px)] bg-card md:rounded-2xl md:border md:border-border md:overflow-hidden m-2 md:m-6 shadow-xs">
      {/* Sidebar List (Mobile: Top Bar, Desktop: Left Col) */}
      <div className="w-full md:w-80 bg-muted/30 border-b md:border-b-0 md:border-r border-border flex flex-col">
        <div className="p-5 font-black text-xs text-muted-foreground uppercase tracking-wider border-b border-border hidden md:block">
          Inbox
        </div>
        <div className="flex md:flex-col overflow-x-auto md:overflow-y-auto p-3 gap-3">
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => setActiveChatId(conv.id)}
              className={`flex items-center gap-4 p-4 rounded-xl text-left min-w-[240px] md:min-w-0 transition-all active:scale-[0.98] ${
                activeChatId === conv.id
                  ? "bg-card shadow-lg ring-1 ring-border border-l-4 border-l-primary"
                  : "hover:bg-muted/50 border-l-4 border-l-transparent"
              }`}
            >
              <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black shrink-0 border border-primary/20 shadow-inner">
                {conv.otherUserName[0]}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-black text-foreground uppercase tracking-tight truncate">
                  {conv.otherUserName}
                </p>
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-tighter truncate opacity-60">
                  {conv.lastMessage || "Click to view"}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Thread */}
      <div className="flex-1 flex flex-col bg-card min-w-0">
        {activeChatId ? (
             <UniversalMessaging
                channelType="DIRECT_MESSAGE"
                channelId={activeChatId}
                currentUserId={userId}
                currentUserRole="staff"
                variant="default"
                title={activeConversation?.otherUserName || "Chat"}
                subtitle={activeConversation?.lastMessage ? "Active Conversation" : "Start chatting"}
                className="h-full border-0 shadow-none rounded-none"
             />
        ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground/30 gap-4 opacity-50">
                <MessageSquare className="w-12 h-12" />
                <p className="text-xs font-black uppercase tracking-widest italic">Select a conversation to start chatting</p>
            </div>
        )}
      </div>
    </div>
  );
}