import { redirect } from "next/navigation";
import { getCurrentUserWithRoles } from "@/lib/auth/session";
import { supervisorMessagesQueries } from "@/lib/supabase/queries/supervisor-messages";
import { createClient } from "@/lib/supabase/server";
import { ConversationsList } from "@/app/(protected)/supervisor/messages/_components/ConversationsList";
import { MessageThread } from "@/app/(protected)/supervisor/messages/_components/MessageThread";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ conversationId: string }>;
}

export default async function ConversationPage({ params }: PageProps) {
  const { conversationId } = await params;
  const user = await getCurrentUserWithRoles();
  if (!user) redirect("/login");

  const supabase = await createClient();
  
  // 1. Fetch Data
  const [conversations, messages] = await Promise.all([
    supervisorMessagesQueries.getConversations(supabase, user.id),
    supervisorMessagesQueries.getMessages(supabase, conversationId)
  ]);

  // 2. Determine Active Conversation Context
  const activeConv = conversations.find(c => c.id === conversationId);
  
  // Security Check: Ensure user is part of this conversation
  if (!activeConv) {
    redirect("/supervisor/messages");
  }

  const otherUserName = activeConv.other_user.name || "Chat";

  // 3. Mark as Read (Server Action Pattern inside Server Component is tricky, 
  // so we often fire-and-forget or handle it client-side on mount. 
  // Here we do it server-side for initial load)
  await supervisorMessagesQueries.markAsRead(supabase, conversationId, user.id);

  return (
    <div className="flex h-[calc(100vh-6rem)] bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Sidebar - Hidden on mobile when viewing thread */}
      <div className="hidden md:block w-80 border-r border-gray-200">
        <ConversationsList conversations={conversations} selectedId={conversationId} />
      </div>
      
      {/* Main Thread */}
      <div className="flex-1 flex flex-col min-w-0">
        <MessageThread 
          conversationId={conversationId}
          initialMessages={messages}
          currentUserId={user.id}
          otherUserName={otherUserName}
        />
      </div>
    </div>
  );
}