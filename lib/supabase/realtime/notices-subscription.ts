import { supabase } from '@/lib/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';
import { Database } from '@/lib/types/database.types';

type Notice = Database['public']['Tables']['notices']['Row'];
type NoticeInsert = Database['public']['Tables']['notices']['Insert'];

interface NoticeSubscriptionCallback {
  onNewNotice?: (notice: Notice) => void;
  onError?: (error: Error) => void;
}

/**
 * Subscribe to real-time notices for the current user
 */
export function subscribeToUserNotices(
  callbacks: NoticeSubscriptionCallback
): RealtimeChannel {
  try {
    const userId = supabase.auth.getUser().then(({ data }) => data.user?.id);
    
    // Subscribe to notices table
    const channel = supabase
      .channel('user-notices')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notices',
          filter: `is_public=eq.true`
        },
        async (payload) => {
          const newNotice = payload.new as NoticeInsert;
          
          // Check if notice is relevant to user
          const { data: userProfile } = await supabase
            .from('user_profiles')
            .select('ward_id')
            .eq('user_id', (await userId) || '')
            .single();

          if (
            newNotice.is_public ||
            newNotice.ward_id === userProfile?.ward_id
          ) {
            callbacks.onNewNotice?.(payload.new as Notice);
          }
        }
      )
      .subscribe();

    return channel;
  } catch (error) {
    console.error('Error subscribing to notices:', error);
    callbacks.onError?.(error as Error);
    throw error;
  }
}

/**
 * Unsubscribe from notices channel
 */
export function unsubscribeFromNotices(channel: RealtimeChannel): void {
  try {
    supabase.removeChannel(channel);
  } catch (error) {
    console.error('Error unsubscribing from notices:', error);
  }
}