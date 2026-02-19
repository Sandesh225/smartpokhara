import { Database } from "@/lib/types/database.types";

export type ProjectNotification = Database["public"]["Tables"]["notifications"]["Row"];

export interface NotificationFilters {
  userId: string;
  limit?: number;
}
