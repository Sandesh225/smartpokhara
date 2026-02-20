import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { UnifiedMessage, MessageChannelType, SendMessageParams } from '@/types/messaging';
import { toast } from 'sonner';

interface UseUnifiedMessagingProps {
  channelType: MessageChannelType;
  channelId: string; // complaint_id or conversation_id
  currentUserId: string;
  currentUserRole?: string;
}

export function useUnifiedMessaging({
  channelType,
  channelId,
  currentUserId,
  currentUserRole = 'staff'
}: UseUnifiedMessagingProps) {
  const [messages, setMessages] = useState<UnifiedMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const supabase = createClient();
  const subscriptionRef = useRef<any>(null);

  // --- HELPERS to normalize data from different tables ---

  const normalizeComplaintComment = (data: any): UnifiedMessage => ({
    id: data.id,
    content: data.content || data.comment, // handle variations
    created_at: data.created_at,
    author_id: data.author_id || data.user_id,
    author_name: data.author_name || data.user?.user_profiles?.full_name || 'Unknown',
    author_role: data.author_role || 'staff', // simplistic fallback
    author_avatar: data.author_avatar || data.user?.user_profiles?.profile_photo_url,
    is_internal: data.is_internal || false,
  });

  const normalizeInternalNote = (data: any): UnifiedMessage => ({
    id: data.id,
    content: data.text || data.content,
    created_at: data.created_at,
    author_id: data.author_id || data.user_id, // check actual DB column
    author_name: data.author?.profile?.full_name || 'Supervisor',
    author_role: 'supervisor',
    author_avatar: data.author?.profile?.avatar_url,
    is_internal: true,
    tags: data.tags,
    visibility: data.visibility
  });

  const normalizeDirectMessage = (data: any): UnifiedMessage => ({
    id: data.id,
    content: data.message_text,
    created_at: data.created_at,
    author_id: data.sender_id,
    author_name: data.sender?.full_name || 'User', // Requires join
    author_role: 'staff',
    author_avatar: null, // Often not fetched in basic queries
  });


  // --- LOAD MESSAGES ---

  const loadMessages = useCallback(async () => {
    try {
      setIsLoading(true);
      let data: any[] = [];
      let error: any = null;

      if (channelType === 'COMPLAINT_PUBLIC') {
        // Use RPC for comments (as seen in existing code)
        const response = await fetch("/api/supabase/rpc", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              function: "rpc_get_complaint_comments",
              params: { p_complaint_id: channelId },
            }),
        });
        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
            data = result.data.map(normalizeComplaintComment);
        }
      } 
      else if (channelType === 'OFFICIAL_NOTE') {
         // Using the logic from InternalNotes.tsx
         // We might need an API route or direct query if RLS permits
         // For now, let's assume we can query if we are supervisor
         const { data: notes, error: notesError } = await supabase
            .from('complaint_internal_notes') // Need to confirm table name!
            .select(`
                *,
                author:users(
                    profile:user_profiles(full_name, avatar_url, profile_photo_url)
                )
            `)
            .eq('complaint_id', channelId)
            .order('created_at', { ascending: false });
            
         if (notesError) throw notesError;
         data = (notes || []).map(normalizeInternalNote);
      }
      else if (channelType === 'COMPLAINT_INTERNAL') {
          // Staff internal comments
          const { data: comments, error: commError } = await supabase
            .from('complaint_internal_comments')
            .select(`
                *,
                user:users(
                    id, email, 
                    user_profiles(full_name, profile_photo_url)
                )
            `)
            .eq('complaint_id', channelId)
            .order('created_at', { ascending: true });

          if (commError) throw commError;
           data = (comments || []).map(normalizeComplaintComment);
      }
      else if (channelType === 'DIRECT_MESSAGE') {
          // Direct Messages (Supervisor <-> Staff)
          // Table: supervisor_staff_messages (from staff/messages/page.tsx)
          const { data: dms, error: dmError } = await supabase
            .from('supervisor_staff_messages')
            .select('*')
            .eq('conversation_id', channelId)
            .order('created_at', { ascending: true });

          if (dmError) throw dmError;
          data = (dms || []).map(normalizeDirectMessage);
      }

      setMessages(data);
    } catch (err) {
      console.error("Failed to load messages:", err);
      toast.error("Could not load channel history");
    } finally {
      setIsLoading(false);
    }
  }, [channelType, channelId, supabase]);

  // --- SEND MESSAGES ---

  const sendMessage = async (params: SendMessageParams) => {
    setIsSending(true);
    // Optimistic Update
    const tempId = `temp-${Date.now()}`;
    const optimisticMsg: UnifiedMessage = {
        id: tempId,
        content: params.content,
        created_at: new Date().toISOString(),
        author_id: currentUserId,
        author_name: 'You',
        author_role: currentUserRole,
        is_internal: params.isInternal,
        is_optimistic: true,
        tags: params.tags,
        visibility: params.visibility as any,
    };
    
    setMessages(prev => [...prev, optimisticMsg]);

    try {
        if (channelType === 'COMPLAINT_PUBLIC') {
            await fetch("/api/supabase/rpc", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  function: "rpc_add_complaint_comment_v2",
                  params: {
                    p_complaint_id: channelId,
                    p_content: params.content,
                    p_is_internal: params.isInternal || false,
                  },
                }),
            });
        }
        else if (channelType === 'OFFICIAL_NOTE') {
            // Using the API patterns we saw
            // Likely need to insert into complaint_internal_notes
            await supabase.from('complaint_internal_notes').insert({
                complaint_id: channelId,
                user_id: currentUserId,
                text: params.content,
                visibility: params.visibility || 'internal_only',
                tags: params.tags || []
            });
        }
        else if (channelType === 'COMPLAINT_INTERNAL') {
             await supabase.from('complaint_internal_comments').insert({
                complaint_id: channelId,
                user_id: currentUserId,
                comment: params.content,
            });
        }

        // Success - Reload to get real ID and server data
        // Alternatively, we could replace the temp item with the server response if we had it
        // For simplicity with RPCs that might not return everything, we reload.
        await loadMessages();

    } catch (err) {
        console.error("Send failed:", err);
        toast.error("Failed to send message");
        // Revert optimistic
        setMessages(prev => prev.filter(m => m.id !== tempId));
    } finally {
        setIsSending(false);
    }
  };

  // --- REALTIME ---
  useEffect(() => {
    loadMessages();

    const tableMap = {
        'COMPLAINT_PUBLIC': 'complaint_comments',
        'COMPLAINT_INTERNAL': 'complaint_internal_comments',
        'OFFICIAL_NOTE': 'complaint_internal_notes',
        'DIRECT_MESSAGE': 'supervisor_staff_messages'
    };
    
    const tableName = tableMap[channelType];
    const filterCol = channelType === 'DIRECT_MESSAGE' ? 'conversation_id' : 'complaint_id';

    if (!tableName) return;

    const channel = supabase
      .channel(`unified_${channelType}_${channelId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: tableName,
          filter: `${filterCol}=eq.${channelId}`,
        },
        (payload) => {
          // Simplest approach: Reload on any insert to get full relations
          // Optimization: Check if payload.new.user_id !== currentUserId before reloading 
          // (if we trust our optimistic update, but we usually want the server timestamp/enrichment)
          loadMessages(); 
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };

  }, [channelType, channelId, loadMessages, supabase]);

  return {
    messages,
    isLoading,
    isSending,
    sendMessage,
    refresh: loadMessages
  };
}
