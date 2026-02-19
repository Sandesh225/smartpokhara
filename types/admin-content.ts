export type NoticeType = 'announcement' | 'maintenance' | 'payment' | 'event' | 'alert';
export type PageStatus = 'draft' | 'published' | 'archived';
export type AudienceType = 'public' | 'ward_specific';

export interface CMSPage {
  id: string;
  slug: string;
  title: string;
  content: any; // JSONB for rich text
  meta_title?: string;
  meta_description?: string;
  featured_image_url?: string;
  status: PageStatus;
  author_id: string;
  published_at?: string;
  created_at: string;
  author?: {
    full_name: string;
  };
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  notice_type: NoticeType;
  ward_id?: string | null;
  is_public: boolean;
  is_urgent: boolean;
  published_at: string;
  expires_at?: string;
  created_by: string;
  created_at: string;
  ward?: {
    ward_number: number;
    name: string;
  };
  creator?: {
    full_name: string;
  };
}

export interface NoticeInput {
  title: string;
  content: string;
  excerpt?: string | null;
  notice_type: NoticeType;
  ward_id?: string | null;
  is_public: boolean;
  is_urgent: boolean;
  published_at?: string;
  expires_at?: string | null;
}

export interface PageInput {
  title: string;
  slug: string;
  content: any;
  meta_title: string;
  meta_description: string;
  status: PageStatus;
  featured_image_url?: string;
}