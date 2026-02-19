import { z } from "zod";

export const ProposalCategorySchema = z.enum([
  "road_infrastructure",
  "water_sanitation",
  "waste_management",
  "electricity",
  "health_safety",
  "parks_environment",
  "building_construction",
  "education_culture",
  "agriculture",
  "other",
]);

export type ProposalCategory = z.infer<typeof ProposalCategorySchema>;

export const ProposalStatusSchema = z.enum([
  "draft",
  "submitted",
  "under_review",
  "approved_for_voting",
  "selected",
  "rejected",
  "in_progress",
  "completed",
]);

export type ProposalStatus = z.infer<typeof ProposalStatusSchema>;

export interface BudgetProposal {
  id: string;
  cycle_id: string;
  author_id: string;
  title: string;
  description: string;
  category: ProposalCategory;
  department_id: string | null;
  ward_id: string | null;
  location_point: any | null;
  address_text: string | null;
  estimated_cost: number;
  technical_cost: number | null;
  cover_image_url: string | null;
  status: ProposalStatus;
  vote_count: number;
  admin_notes?: string | null;
  created_at: string;
  updated_at?: string;
  author?: {
    full_name: string;
    email?: string;
  };
  department?: {
    name: string;
    code: string;
  };
  ward_number?: number | string;
  ward?: {
    ward_number: number | string;
    name: string;
  };
  // Legacy aliases
  author_name?: string;
  department_name?: string;
  ward_name?: string;
}

export interface BudgetCycle {
  id: string;
  title: string;
  description?: string | null;
  is_active: boolean;
  total_budget_amount: number;
  min_project_cost: number;
  max_project_cost: number | null;
  submission_start_at: string;
  submission_end_at: string;
  voting_start_at: string;
  voting_end_at: string;
  max_votes_per_user: number;
  created_at: string;
  finalized_at?: string;
  concluding_message?: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  is_active?: boolean;
}

export interface VoteResponse {
  success: boolean;
  message: string;
  remaining_votes: number;
}

export interface SupervisorProfile {
  user_id: string;
  supervisor_level: "ward" | "department" | "combined" | "senior";
  assigned_departments: string[];
  assigned_wards: string[];
}

export interface CycleAnalytics {
  totalVotes: number;
  totalProposals: number;
  votesByWard: Record<string, number>;
  votesByCategory: Record<string, number>;
  participationRate: number;
}

export interface SimulationResult {
  selectedProposals: BudgetProposal[];
  totalCost: number;
  remainingBudget: number;
  utilizationRate: number;
}

export interface CreateProposalData {
  cycle_id: string;
  title: string;
  description: string;
  category: ProposalCategory;
  department_id?: string | null;
  ward_id?: string | null;
  estimated_cost: number;
  address_text?: string | null;
  location_point?: any | null;
}
