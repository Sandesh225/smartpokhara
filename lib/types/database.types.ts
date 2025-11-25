// lib/types/database.types.ts

/**
 * Base JSON type used in Supabase generated types
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

/**
 * Database type for Supabase (hand-written to match the auth & roles schema)
 *
 * If you later generate official types with:
 *   npx supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/types/database.types.ts
 * you can either replace this file or merge the auth-related parts.
 */
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          phone: string | null;
          external_auth_provider: string | null;
          is_active: boolean;
          is_verified: boolean;
          email_verified_at: string | null;
          phone_verified_at: string | null;
          last_login_at: string | null;
          login_attempts: number;
          locked_until: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          phone?: string | null;
          external_auth_provider?: string | null;
          is_active?: boolean;
          is_verified?: boolean;
          email_verified_at?: string | null;
          phone_verified_at?: string | null;
          last_login_at?: string | null;
          login_attempts?: number;
          locked_until?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          phone?: string | null;
          external_auth_provider?: string | null;
          is_active?: boolean;
          is_verified?: boolean;
          email_verified_at?: string | null;
          phone_verified_at?: string | null;
          last_login_at?: string | null;
          login_attempts?: number;
          locked_until?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'users_id_fkey';
            columns: ['id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };

      user_profiles: {
        Row: {
          id: string;
          user_id: string;
          full_name: string;
          full_name_nepali: string | null;
          date_of_birth: string | null;
          gender: string | null;
          citizenship_number: string | null;
          ward_id: string | null;
          address_line1: string | null;
          address_line2: string | null;
          landmark: string | null;
          profile_photo_url: string | null;
          language_preference: string;
          notification_preferences: {
            sms: boolean;
            email: boolean;
            in_app: boolean;
          };
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          full_name: string;
          full_name_nepali?: string | null;
          date_of_birth?: string | null;
          gender?: string | null;
          citizenship_number?: string | null;
          ward_id?: string | null;
          address_line1?: string | null;
          address_line2?: string | null;
          landmark?: string | null;
          profile_photo_url?: string | null;
          language_preference?: string;
          notification_preferences?: {
            sms: boolean;
            email: boolean;
            in_app: boolean;
          };
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          full_name?: string;
          full_name_nepali?: string | null;
          date_of_birth?: string | null;
          gender?: string | null;
          citizenship_number?: string | null;
          ward_id?: string | null;
          address_line1?: string | null;
          address_line2?: string | null;
          landmark?: string | null;
          profile_photo_url?: string | null;
          language_preference?: string;
          notification_preferences?: {
            sms: boolean;
            email: boolean;
            in_app: boolean;
          };
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'user_profiles_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };

      roles: {
        Row: {
          id: string;
          name: string;
          role_type: Database['public']['Enums']['user_role'];
          description: string | null;
          permissions: Json;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          role_type: Database['public']['Enums']['user_role'];
          description?: string | null;
          permissions?: Json;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          role_type?: Database['public']['Enums']['user_role'];
          description?: string | null;
          permissions?: Json;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      user_roles: {
        Row: {
          id: string;
          user_id: string;
          role_id: string;
          assigned_by: string | null;
          assigned_at: string;
          expires_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          role_id: string;
          assigned_by?: string | null;
          assigned_at?: string;
          expires_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          role_id?: string;
          assigned_by?: string | null;
          assigned_at?: string;
          expires_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'user_roles_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'user_roles_role_id_fkey';
            columns: ['role_id'];
            referencedRelation: 'roles';
            referencedColumns: ['id'];
          }
        ];
      };

      audit_logs: {
        Row: {
          id: string;
          actor_user_id: string | null;
          action: string;
          entity_type: string;
          entity_id: string | null;
          old_data: Json | null;
          new_data: Json | null;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          actor_user_id?: string | null;
          action: string;
          entity_type: string;
          entity_id?: string | null;
          old_data?: Json | null;
          new_data?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          actor_user_id?: string | null;
          action?: string;
          entity_type?: string;
          entity_id?: string | null;
          old_data?: Json | null;
          new_data?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'audit_logs_actor_user_id_fkey';
            columns: ['actor_user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };

      session_logs: {
        Row: {
          id: string;
          user_id: string;
          action: string;
          ip_address: string | null;
          user_agent: string | null;
          success: boolean;
          failure_reason: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          action: string;
          ip_address?: string | null;
          user_agent?: string | null;
          success?: boolean;
          failure_reason?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          action?: string;
          ip_address?: string | null;
          user_agent?: string | null;
          success?: boolean;
          failure_reason?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'session_logs_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
    };

    Views: {
      [_ in never]: never;
    };

    Functions: {
      /**
       * RPC: get_current_user_with_roles()
       *
       * Returns the hydrated user + profile + roles as defined in SQL.
       */
      get_current_user_with_roles: {
        Args: Record<string, never>;
        Returns: {
          user_id: string;
          email: string;
          phone: string | null;
          is_active: boolean;
          is_verified: boolean;
          full_name: string | null;
          profile_photo_url: string | null;
          language_preference: string | null;
          roles: Json | null; // array of { role_type, role_name, permissions }
          primary_role: Database['public']['Enums']['user_role'] | null;
        }[];
      };

      fn_is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };

      fn_is_staff: {
        Args: Record<string, never>;
        Returns: boolean;
      };

      fn_get_user_roles: {
        Args: { p_user_id: string };
        Returns: {
          role_type: Database['public']['Enums']['user_role'];
          role_name: string;
        }[];
      };

      can_access_complaint: {
        Args: { p_complaint_id: string };
        Returns: boolean;
      };
    };

    Enums: {
      user_role:
        | 'admin'
        | 'dept_head'
        | 'dept_staff'
        | 'ward_staff'
        | 'field_staff'
        | 'call_center'
        | 'citizen'
        | 'business_owner'
        | 'tourist';
    };
  };
}

/**
 * Helper generics mirroring the generated Supabase helpers
 */
export type PublicSchema = Database['public'];

export type Tables<
  T extends keyof PublicSchema['Tables']
> = PublicSchema['Tables'][T]['Row'];

export type TablesInsert<
  T extends keyof PublicSchema['Tables']
> = PublicSchema['Tables'][T]['Insert'];

export type TablesUpdate<
  T extends keyof PublicSchema['Tables']
> = PublicSchema['Tables'][T]['Update'];

export type Enums<T extends keyof PublicSchema['Enums']> =
  PublicSchema['Enums'][T];
