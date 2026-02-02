import { createClient } from "@/lib/supabase/client";

// ============================================================================
// 1. TYPES & INTERFACES
// ============================================================================

export type ProposalCategory =
  | "road_infrastructure"
  | "water_sanitation"
  | "waste_management"
  | "electricity"
  | "health_safety"
  | "parks_environment"
  | "building_construction"
  | "education_culture"
  | "agriculture"
  | "other";

export type ProposalStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "approved_for_voting"
  | "selected"
  | "rejected"
  | "in_progress"
  | "completed";

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
  author?: {
    full_name: string;
    email?: string;
  };
  department?: {
    name: string;
    code: string;
  };
}

export interface BudgetCycle {
  id: string;
  title: string;
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
}

export interface Department {
  id: string;
  name: string;
  code: string;
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

// ============================================================================
// 2. INTERNAL UTILITIES (DRY Helpers)
// ============================================================================

const getSupabase = () => createClient();

const getAuthUser = async () => {
  const { data: { user }, error } = await getSupabase().auth.getUser();
  if (error || !user) throw new Error("User not authenticated");
  return user;
};

const handleServiceError = (context: string, error: any) => {
  console.error(`❌ [pbService] ${context} error:`, error?.message || error);
  throw error;
};

// ============================================================================
// 3. PB SERVICE IMPLEMENTATION
// ============================================================================

export const pbService = {
  
  // --- READS: Infrastructure & Cycles ---

  async getDepartments(): Promise<Department[]> {
    try {
      const { data, error } = await getSupabase()
        .from("departments")
        .select("id, name, code")
        .eq("is_active", true);

      if (error) throw error;
      return data as Department[];
    } catch (error) {
      return handleServiceError("getDepartments", error);
    }
  },

  async getActiveCycles(): Promise<BudgetCycle[]> {
    try {
      const { data, error } = await getSupabase()
        .from("budget_cycles")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as BudgetCycle[];
    } catch (error) {
      return handleServiceError("getActiveCycles", error);
    }
  },

  async getCycleById(id: string): Promise<BudgetCycle | null> {
    try {
      const { data, error } = await getSupabase()
        .from("budget_cycles")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as BudgetCycle;
    } catch (error) {
      return handleServiceError("getCycleById", error);
    }
  },

  // --- READS: Proposals ---

  async getProposals(
    cycleId: string,
    statusFilter: ProposalStatus[] | null = ["approved_for_voting"]
  ): Promise<BudgetProposal[]> {
    try {
      let query = getSupabase()
        .from("budget_proposals")
        .select(`
          *, 
          author:users!author_id(email, user_profiles(full_name)), 
          department:departments!department_id(name, code)
        `)
        .eq("cycle_id", cycleId)
        .order("created_at", { ascending: false });

      if (statusFilter && statusFilter.length > 0) {
        query = query.in("status", statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data.map((p: any) => ({
        ...p,
        author: {
          full_name: p.author?.user_profiles?.[0]?.full_name || "Anonymous",
          email: p.author?.email,
        },
        department: p.department,
      })) as BudgetProposal[];
    } catch (error) {
      return handleServiceError("getProposals", error);
    }
  },

  async getProposalById(id: string): Promise<BudgetProposal | null> {
    try {
      // Logic from the most up-to-date diagnostic version
      const user = await getAuthUser();
      const { data, error } = await getSupabase()
        .from("budget_proposals")
        .select(`
          *, 
          author:users!author_id(user_profiles(full_name)), 
          department:departments!department_id(name, code)
        `)
        .eq("id", id)
        .maybeSingle();

      if (error || !data) {
        if (error) console.error("❌ [pbService] Database error:", error.message);
        return null;
      }

      return {
        ...data,
        author: {
          full_name: (data.author as any)?.user_profiles?.[0]?.full_name || "Anonymous",
        },
        department: data.department,
      } as any;
    } catch (error) {
      // We catch quietly here for UI checks, consistent with the previous version
      return null;
    }
  },

  // --- READS: User Specific ---

  async getUserVotes(cycleId: string): Promise<string[]> {
    try {
      const user = await getAuthUser();
      const { data, error } = await getSupabase()
        .from("budget_votes")
        .select("proposal_id")
        .eq("cycle_id", cycleId)
        .eq("voter_id", user.id);

      if (error) throw error;
      return data.map((v: any) => v.proposal_id);
    } catch (error) {
      return handleServiceError("getUserVotes", error);
    }
  },

  async getSupervisorProfile(): Promise<SupervisorProfile | null> {
    try {
      const user = await getAuthUser();
      const { data, error } = await getSupabase()
        .from("supervisor_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) return null;
      return data as SupervisorProfile;
    } catch {
      return null;
    }
  },

  // --- WRITES ---

  async voteForProposal(proposalId: string): Promise<VoteResponse> {
    try {
      const { data, error } = await getSupabase().rpc("rpc_vote_for_proposal", {
        p_proposal_id: proposalId,
      });
      if (error) throw error;
      return data as VoteResponse;
    } catch (error) {
      return handleServiceError("voteForProposal", error);
    }
  },

  async submitProposal(
    proposal: Omit<
      BudgetProposal,
      | "id" | "author_id" | "status" | "vote_count" | "created_at"
      | "admin_notes" | "department" | "technical_cost"
    >,
    coverImage?: File
  ) {
    try {
      const user = await getAuthUser();
      const supabase = getSupabase();
      let coverImageUrl = null;

      if (coverImage) {
        const ext = coverImage.name.split(".").pop();
        const fileName = `${user.id}/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("complaint-attachments")
          .upload(fileName, coverImage);

        if (uploadError) throw uploadError;

        const { data: publicUrl } = supabase.storage
          .from("complaint-attachments")
          .getPublicUrl(fileName);

        coverImageUrl = publicUrl.publicUrl;
      }

      const { data, error } = await supabase
        .from("budget_proposals")
        .insert({
          ...proposal,
          author_id: user.id,
          cover_image_url: coverImageUrl,
          status: "submitted",
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      return handleServiceError("submitProposal", error);
    }
  },

  async updateProposalStatus(
    proposalId: string,
    status: ProposalStatus,
    notes?: string,
    technicalCost?: number
  ) {
    try {
      const updateData: any = {
        status: status,
        updated_at: new Date().toISOString(),
      };

      if (notes) updateData.admin_notes = notes;
      if (technicalCost !== undefined) updateData.technical_cost = technicalCost;

      const { data, error } = await getSupabase()
        .from("budget_proposals")
        .update(updateData)
        .eq("id", proposalId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      return handleServiceError("updateProposalStatus", error);
    }
  },

  // --- ADMIN ACTIONS & ANALYTICS ---

  async createBudgetCycle(cycle: Omit<BudgetCycle, "id" | "created_at">) {
    try {
      const { data, error } = await getSupabase()
        .from("budget_cycles")
        .insert(cycle)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      return handleServiceError("createBudgetCycle", error);
    }
  },

  async updateBudgetCycle(id: string, updates: Partial<BudgetCycle>) {
    try {
      const { data, error } = await getSupabase()
        .from("budget_cycles")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as BudgetCycle;
    } catch (error) {
      return handleServiceError("updateBudgetCycle", error);
    }
  },

  async getCycleAnalytics(cycleId: string): Promise<CycleAnalytics> {
    try {
      const { data: proposals, error } = await getSupabase()
        .from("budget_proposals")
        .select(`
          id, 
          ward_id, 
          category, 
          vote_count,
          wards ( ward_number )
        `)
        .eq("cycle_id", cycleId);

      if (error) throw error;

      const stats: CycleAnalytics = {
        totalVotes: 0,
        totalProposals: proposals.length,
        votesByWard: {},
        votesByCategory: {},
        participationRate: 0,
      };

      proposals.forEach((p: any) => {
        stats.totalVotes += p.vote_count;
        const wardName = p.wards?.ward_number ? `Ward ${p.wards.ward_number}` : "City-Wide";
        stats.votesByWard[wardName] = (stats.votesByWard[wardName] || 0) + p.vote_count;
        stats.votesByCategory[p.category] = (stats.votesByCategory[p.category] || 0) + p.vote_count;
      });

      return stats;
    } catch (error) {
      return handleServiceError("getCycleAnalytics", error);
    }
  },

  async finalizeWinners(
    cycleId: string,
    proposalIds: string[],
    message: string
  ): Promise<void> {
    try {
      const supabase = getSupabase();
      const { error: propError } = await supabase
        .from("budget_proposals")
        .update({ status: "selected" })
        .in("id", proposalIds);

      if (propError) throw propError;

      const { error: cycleError } = await supabase
        .from("budget_cycles")
        .update({
          finalized_at: new Date().toISOString(),
          concluding_message: message,
        })
        .eq("id", cycleId);

      if (cycleError) throw cycleError;
    } catch (error) {
      handleServiceError("finalizeWinners", error);
    }
  },

  async getProposalDetailsForAdmin(id: string): Promise<BudgetProposal | null> {
    try {
      const { data, error } = await getSupabase()
        .from("budget_proposals")
        .select(`
          *,
          author:users!author_id ( email, user_profiles ( full_name ) ),
          department:departments!department_id ( name, code ),
          ward:wards!ward_id ( ward_number, name )
        `)
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      return {
        ...data,
        author: {
          full_name: (data.author as any)?.user_profiles?.[0]?.full_name || "Anonymous",
          email: (data.author as any)?.email,
        },
        ward_number: (data.ward as any)?.ward_number,
      } as any;
    } catch (error) {
      return handleServiceError("getProposalDetailsForAdmin", error);
    }
  },

  async runWinnerSimulation(
    cycleId: string,
    totalBudgetOverride?: number
  ): Promise<SimulationResult> {
    try {
      const cycle = await this.getCycleById(cycleId);
      if (!cycle) throw new Error("Cycle not found");

      const proposals = await this.getProposals(cycleId, ["approved_for_voting"]);
      const budgetLimit = totalBudgetOverride ?? cycle.total_budget_amount;
      const selected: BudgetProposal[] = [];
      let currentSpend = 0;

      const sorted = [...proposals].sort((a, b) => b.vote_count - a.vote_count);

      for (const p of sorted) {
        const cost = p.technical_cost || p.estimated_cost;
        if (currentSpend + cost <= budgetLimit) {
          selected.push(p);
          currentSpend += cost;
        }
      }

      return {
        selectedProposals: selected,
        totalCost: currentSpend,
        remainingBudget: budgetLimit - currentSpend,
        utilizationRate: (currentSpend / budgetLimit) * 100,
      };
    } catch (error) {
      return handleServiceError("runWinnerSimulation", error);
    }
  },
};