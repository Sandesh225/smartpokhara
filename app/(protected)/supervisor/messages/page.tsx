import { redirect } from "next/navigation";
import { getCurrentUserWithRoles } from "@/lib/auth/session";
import { supervisorMessagesQueries } from "@/lib/supabase/queries/supervisor-messages";
import { createClient } from "@/lib/supabase/server";
import { ConversationsList } from "@/app/(protected)/supervisor/messages/_components/ConversationsList";
import { MessageSquare } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function MessagesPage() {
  const user = await getCurrentUserWithRoles();
  if (!user) redirect("/login");

  const supabase = await createClient();
  const conversations = await supervisorMessagesQueries.getConversations(supabase, user.id);

  return (
    <div className="flex h-[calc(100vh-6rem)] bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="w-full md:w-80 border-r border-gray-200">
        <ConversationsList conversations={conversations} />
      </div>
      
      <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-gray-50 text-gray-500">
        <div className="h-16 w-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
          <MessageSquare className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Your Messages</h3>
        <p className="text-sm mt-1">Select a conversation to start messaging</p>
      </div>
    </div>
  );
}