import { Database } from "@/lib/types/database.types";

export type Ward = Database["public"]["Tables"]["wards"]["Row"];
export type Department = Database["public"]["Tables"]["departments"]["Row"];
export type ComplaintCategory = Database["public"]["Tables"]["complaint_categories"]["Row"];
export type ComplaintSubcategory = Database["public"]["Tables"]["complaint_subcategories"]["Row"];

export type CategoryWithSubcategories = ComplaintCategory & {
  subcategories?: ComplaintSubcategory[];
};

export interface SLAConfig {
  id: string;
  category_id?: string | null;
  department_id?: string | null;
  priority: string;
  response_time_hours: number;
  resolution_time_hours: number;
  escalation_time_hours?: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  category?: { name: string } | null;
  department?: { name: string } | null;
}

export interface SystemSetting {
  setting_key: string;
  setting_value: any;
  category: string;
  is_public: boolean;
  updated_at: string;
}

export interface MaintenanceModeInput {
  is_active: boolean;
  title?: string;
  description?: string;
  scheduled_end?: string;
}
