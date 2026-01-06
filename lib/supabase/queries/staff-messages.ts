import { SupabaseClient } from "@supabase/supabase-js";

export const staffMessagesQueries = {
  /**
   * Finds the supervisor and returns { conversation, supervisorName }
   */
  async ensureSupervisorChat(client: SupabaseClient, staffId: string) {
    // 1. Get Staff's Info
    const { data: profile } = await client
      .from("staff_profiles")
      .select("department_id, ward_id")
      .eq("user_id", staffId)
      .single();

    if (!profile) return null;

    let supervisorId: string | null = null;

    // 2. Find Supervisor (Ward first, then Dept)
    if (profile.ward_id) {
      const { data: wardSup } = await client
        .from("supervisor_profiles")
        .select("user_id")
        .contains("assigned_wards", [profile.ward_id])
        .limit(1)
        .maybeSingle();
      if (wardSup) supervisorId = wardSup.user_id;
    }

    if (!supervisorId && profile.department_id) {
      const { data: deptSup } = await client
        .from("supervisor_profiles")
        .select("user_id")
        .contains("assigned_departments", [profile.department_id])
        .limit(1)
        .maybeSingle();
      if (deptSup) supervisorId = deptSup.user_id;
    }

    if (!supervisorId || supervisorId === staffId) return null;

    // 3. Get Supervisor Name
    const { data: supervisorProfile } = await client
      .from("user_profiles")
      .select("full_name")
      .eq("user_id", supervisorId)
      .single();

    const supervisorName = supervisorProfile?.full_name || "Supervisor";

    // 4. Find or Create Chat
    let conversation = null;

    const { data: existing } = await client
      .from("message_conversations")
      .select("*")
      .or(
        `and(participant_1.eq.${staffId},participant_2.eq.${supervisorId}),and(participant_1.eq.${supervisorId},participant_2.eq.${staffId})`
      )
      .maybeSingle();

    if (existing) {
      conversation = existing;
    } else {
      const { data: newConv } = await client
        .from("message_conversations")
        .insert({
          participant_1: staffId,
          participant_2: supervisorId,
          last_message_preview: "Conversation started",
        })
        .select()
        .single();
      conversation = newConv;
    }

    return { conversation, supervisorName, supervisorId };
  },

  async getMessages(client: SupabaseClient, conversationId: string) {
    // We use the explicit FK name we set in Step 1
    const { data, error } = await client
      .from("supervisor_staff_messages")
      .select(
        `
        id, conversation_id, sender_id, message_text, created_at, is_read,
        sender:users!supervisor_staff_messages_sender_id_fkey(
           profile:user_profiles(full_name)
        )
      `
      )
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching messages:", error);
      return [];
    }

    return data.map((msg: any) => ({
      id: msg.id,
      content: msg.message_text,
      senderId: msg.sender_id,
      // Handle nested profile data safely
      senderName: msg.sender?.profile?.full_name || "User",
      createdAt: msg.created_at,
    }));
  },

  async sendMessage(
    client: SupabaseClient,
    conversationId: string,
    senderId: string,
    text: string
  ) {
    const { data, error } = await client
      .from("supervisor_staff_messages")
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        message_text: text,
      })
      .select()
      .single();

    if (error) throw error;

    await client
      .from("message_conversations")
      .update({
        last_message_at: new Date().toISOString(),
        last_message_preview: text.substring(0, 50),
      })
      .eq("id", conversationId);

    return data;
  },
};
