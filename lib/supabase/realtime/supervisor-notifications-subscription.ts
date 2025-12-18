import { supabase } from '../client';

export const supervisorNotificationsSubscription = {
  // Real-time notifications
  subscribeToSupervisorNotifications(
    supervisorId: string,
    onInsert: (payload: any) => void,
    onUpdate: (payload: any) => void
  ) {
    const subscription = supabase
      .channel(`supervisor-notifications-${supervisorId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'supervisor_notifications',
          filter: `supervisor_id=eq.${supervisorId}`
        },
        (payload) => {
          onInsert(payload);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'supervisor_notifications',
          filter: `supervisor_id=eq.${supervisorId}`
        },
        (payload) => {
          onUpdate(payload);
        }
      )
      .subscribe();

    return subscription;
  },

  // Get notification badge count
  async getUnreadNotificationCount(supervisorId: string) {
    const { count, error } = await supabase
      .from('supervisor_notifications')
      .select('*', { count: 'exact', head: true })
      .eq('supervisor_id', supervisorId)
      .eq('is_read', false);

    if (error) throw error;
    return count || 0;
  }
};