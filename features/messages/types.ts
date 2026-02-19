export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  message_text: string;
  is_read: boolean;
  created_at: string;
  sender?: {
    full_name?: string;
    avatar_url?: string;
    profile?: {
      full_name?: string;
      profile_photo_url?: string;
    };
  } | null;
}

export interface Conversation {
  id: string;
  participant_1: string;
  participant_2: string;
  last_message_at?: string;
  last_message_preview?: string;
  created_at: string;
  // UI enrichment
  otherUserName?: string;
  otherUserAvatar?: string;
  other_user?: {
    name: string;
    avatar_url?: string;
  };
}

export interface SendMessageData {
  conversation_id: string;
  sender_id: string;
  message_text: string;
}
