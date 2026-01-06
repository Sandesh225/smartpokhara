import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserWithRoles } from "@/lib/auth/session";
import { staffMessagesQueries } from "@/lib/supabase/queries/staff-messages";

import { ConversationsList } from "@/app/(protected)/supervisor/messages/_components/ConversationsList";
import { MessageThread } from "../_components/MessageThread";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ConversationPage({ params }: PageProps) {
  const { id } = await params;
  const staff = await getCurrentUserWithRoles();
  if (!staff) redirect("/login");

  const supabase = await createClient();

  // 1. Fetch Conversations List (for the sidebar on desktop)
  const conversations = await staffMessagesQueries.getConversations(
    supabase,
    staff.user_id
  );

  // 2. Fetch Specific Conversation Messages
  const messages = await staffMessagesQueries.getMessages(supabase, id);

  // 3. Find the name of the person we are talking to
  const activeConv = conversations.find((c) => c.id === id);
  const otherUserName = activeConv?.other_user?.name || "Supervisor";

  return (
    <div className="h-[calc(100vh-8rem)] bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex">
      {/* Sidebar: Hidden on mobile, visible on desktop */}
      <div className="hidden md:flex w-80 border-r border-gray-100 flex-col">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
          <h1 className="text-lg font-bold text-gray-900">Inbox</h1>
        </div>
        <div className="flex-1 overflow-y-auto">
          <ConversationsList conversations={conversations} selectedId={id} />
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <MessageThread
          conversationId={id}
          initialMessages={messages}
          currentUserId={staff.user_id}
          otherUserName={otherUserName}
        />
      </div>
    </div>
  );
}
