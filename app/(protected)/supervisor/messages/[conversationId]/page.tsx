import { redirect, notFound } from "next/navigation";
import { getCurrentUserWithRoles } from "@/lib/auth/session";
import { messagesApi } from "@/features/messages";
import { createClient } from "@/lib/supabase/server";
import { ConversationsList } from "@/app/(protected)/supervisor/messages/_components/ConversationsList";
import { MessageThread } from "@/app/(protected)/supervisor/messages/_components/MessageThread";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ conversationId: string }>;
  searchParams: Promise<{ staffId?: string }>;
}

export default async function ConversationPage({
  params,
  searchParams,
}: PageProps) {
  const user = await getCurrentUserWithRoles();
  if (!user) redirect("/login");

  const { conversationId } = await params;
  const { staffId } = await searchParams;
  const supabase = await createClient();

  // ------------------------------------------------------------------
  // 1. HANDLE "NEW" CHAT CREATION (BYPASS DB QUERY FOR "new" STRING)
  // ------------------------------------------------------------------
  if (conversationId === "new") {
    if (!staffId) redirect("/supervisor/messages");

    let createdId: string | null = null;

    try {
      // Find or create a conversation between the Supervisor and Staff
      createdId = await messagesApi.createConversation(
        supabase,
        [user.id, staffId]
      );
    } catch (error: any) {
      console.error(
        "Critical: Could not initialize conversation:",
        error.message
      );
    }

    // Perform redirect OUTSIDE of the try/catch block
    if (createdId) {
      redirect(`/supervisor/messages/${createdId}`);
    } else {
      redirect("/supervisor/messages");
    }
  }

  // ------------------------------------------------------------------
  // 2. UUID VALIDATION & DATA FETCHING
  // ------------------------------------------------------------------
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(conversationId)) return notFound();

  const [conversations, messages] = await Promise.all([
    messagesApi.getConversations(supabase, user.id),
    messagesApi.getMessages(supabase, conversationId),
  ]);

  const activeConv = conversations.find((c) => c.id === conversationId);
  if (!activeConv) redirect("/supervisor/messages");

  const otherUserName = activeConv.other_user?.name || "Staff Member";

  // Fire-and-forget: Mark messages as read
  messagesApi.markAsRead(supabase, conversationId, user.id);

  return (
    <div className="flex h-[calc(100vh-6rem)] bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Inbox Sidebar */}
      <div className="hidden md:block w-80 border-r border-gray-200">
        <ConversationsList
          conversations={conversations}
          selectedId={conversationId}
        />
      </div>

      {/* Real-time Message Thread */}
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
