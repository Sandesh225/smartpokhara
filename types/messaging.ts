export type MessageVariant = 'default' | 'tactical' | 'gradient';

export type MessageChannelType = 
  | 'COMPLAINT_PUBLIC'       // Citizen <-> Staff (complaint_comments)
  | 'COMPLAINT_INTERNAL'     // Staff Internal (complaint_internal_comments)
  | 'OFFICIAL_NOTE'          // Supervisor Ledger (complaint_notes ? - need to verify table name)
  | 'DIRECT_MESSAGE';        // Staff <-> Staff/Supervisor (messages)

export interface UnifiedMessage {
  id: string;
  content: string;
  created_at: string;
  
  // Author Details
  author_id: string;
  author_name: string;
  author_role: string; // 'citizen' | 'staff' | 'supervisor' | 'admin'
  author_avatar?: string | null;
  
  // Metadata
  is_internal?: boolean;
  is_system_event?: boolean; // For auto-generated logs (e.g. "Status changed to Resolved")
  tags?: string[];           // For internal notes
  visibility?: 'public' | 'internal_only' | 'official';
  
  // Transient State (for optimistic UI)
  is_optimistic?: boolean;
  status?: 'sending' | 'sent' | 'error';
}

export interface SendMessageParams {
  channelId: string;
  content: string;
  isInternal?: boolean;
  // For notes
  tags?: string[];
  visibility?: string;
}
