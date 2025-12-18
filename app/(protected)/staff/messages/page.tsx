import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { staffMessagesQueries } from "@/lib/supabase/queries/staff-messages";
import { ConversationsList } from "@/components/supervisor/messages/ConversationsList"; // Reusing UI
import { getCurrentUserWithRoles } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function StaffMessagesPage() {
  const staff = await getCurrentUserWithRoles();
  if (!staff) redirect("/login");

  const supabase = await createClient();
  const conversations = await staffMessagesQueries.getConversations(supabase, staff.user_id);

  return (
    <div className="h-[calc(100vh-8rem)] bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
       <div className="p-4 border-b border-gray-100">
         <h1 className="text-xl font-bold text-gray-900">Messages</h1>
       </div>
       
       <div className="flex-1 overflow-hidden">
         {/* Reusing existing component but it's built for sidebar layout. Adapting here. */}
         <ConversationsList conversations={conversations} /> 
       </div>
    </div>
  );
}