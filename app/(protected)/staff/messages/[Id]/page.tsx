import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserWithRoles } from "@/lib/auth/session";
import { messagesApi } from "@/features/messages";

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
  const conversations = await messagesApi.getConversations(
    supabase,
    staff.id
  );

  // 2. Fetch Specific Conversation Messages
  const messages = await messagesApi.getMessages(supabase, id);

  // 3. Find the name of the person we are talking to
  const activeConv = conversations.find((c: any) => c.id === id);
  const otherUserName = activeConv?.other_user?.name || "Supervisor";

  return (
    <div className="h-[calc(100vh-8rem)] bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <MessageThread
          conversationId={id}
          initialMessages={messages}
          currentUserId={staff.id}
          otherUserName={otherUserName}
        />
      </div>
    </div>
  );
}
