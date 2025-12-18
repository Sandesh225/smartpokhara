import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { staffMessagesQueries } from "@/lib/supabase/queries/staff-messages";
import { MessageThread } from "@/components/supervisor/messages/MessageThread"; // Reusing UI
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getCurrentUserWithRoles } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function StaffChatPage({ params }: PageProps) {
  const { id } = await params;
  const staff = await getCurrentUserWithRoles();
  if (!staff) redirect("/login");

  const supabase = await createClient();
  const messages = await staffMessagesQueries.getMessages(supabase, id);

  return (
    <div className="h-[calc(100vh-6rem)] bg-white flex flex-col relative">
      <div className="absolute top-4 left-4 z-10 md:hidden">
        <Link href="/staff/messages" className="p-2 bg-white/80 rounded-full shadow-sm border border-gray-200">
           <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
      </div>

      <MessageThread 
        conversationId={id}
        initialMessages={messages}
        currentUserId={staff.user_id}
        otherUserName="Supervisor" // Ideally fetch conversation details to get name
      />
    </div>
  );
}