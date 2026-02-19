import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/lib/types/database.types";
import { CurrentUser } from "@/lib/types";

export const authApi = {
  /**
   * Get the full profile of the current user via RPC.
   * This includes roles, staff profile (if applicable), and basic user metadata.
   * Single efficient DB call.
   */
  async getCurrentUser(client: SupabaseClient<Database>): Promise<CurrentUser | null> {
    const { data, error } = await client.rpc("rpc_get_current_user");

    if (error) {
      console.error("Auth Query Error:", error);
      return null;
    }

    if (!data) return null;

    return data as unknown as CurrentUser;
  }
};
