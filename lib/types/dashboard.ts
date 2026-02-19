import { Database } from "@/lib/types/database.types";
import { Complaint } from "@/features/complaints";

export type Bill = Database["public"]["Tables"]["bills"]["Row"];
export type Notice = Database["public"]["Tables"]["notices"]["Row"];

export interface DashboardStats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
}

export interface DashboardProfile {
  name: string;
  wardNumber: number | null;
  wardName: string;
  wardId: string | null;
}

export interface DashboardState {
  profile: DashboardProfile;
  complaints: Complaint[];
  bills: Bill[];
  notices: Notice[];
  stats: DashboardStats;
  loading: boolean;
  error: string | null;
}

export interface DashboardGreetingProps {
  name: string;
  wardName?: string;
  wardNumber?: number | null;
  onRefresh: () => void;
  isRefreshing: boolean;
}
