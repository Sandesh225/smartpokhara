import { Database } from "@/lib/types/database.types";

export type ProjectNotice = Database["public"]["Tables"]["notices"]["Row"] & {
  is_read?: boolean;
  attachments?: Database["public"]["Tables"]["notice_attachments"]["Row"][];
  ward?: {
    id: string;
    ward_number: number;
    name: string;
  } | null;
  creator?: {
    full_name: string;
  };
};

export type NoticeType = "maintenance" | "event" | "finance" | "traffic" | "health" | "meeting" | "holiday" | "sanitation" | "emergency" | "education";

export interface NoticeFilters {
  search?: string;
  wardId?: string;
  type?: NoticeType | "all";
  page?: number;
  limit?: number;
  publishedOnly?: boolean;
  unreadOnly?: boolean;
  userId?: string;
}

export interface CMSPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  status: "draft" | "published";
  author_id?: string;
  meta_title?: string;
  meta_description?: string;
  published_at?: string | null;
  created_at: string;
  updated_at?: string;
  author_name?: string;
}

export interface CMSPageInput {
  title: string;
  slug: string;
  content: string;
  status: "draft" | "published";
  meta_title?: string;
  meta_description?: string;
}
