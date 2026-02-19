import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/lib/types/database.types";
import { ProjectNotification } from "./types";

export const notificationsApi = {
  async getUserNotifications(client: SupabaseClient<Database>, userId: string, limit = 50) {
    const { data, error } = await client
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data as ProjectNotification[];
  },

  async getUnreadCount(client: SupabaseClient<Database>, userId: string) {
    const { count, error } = await client
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);
    
    if (error) throw error;
    return count || 0;
  },

  async markAsRead(client: SupabaseClient<Database>, id: string) {
    const { data, error } = await client
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as ProjectNotification;
  },

  async markAllAsRead(client: SupabaseClient<Database>, userId: string) {
    const { data, error } = await client
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('is_read', false)
      .select();

    if (error) throw error;
    return data as ProjectNotification[];
  }
};
