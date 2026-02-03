import { createClient } from "@/lib/supabase/client";

// ============================================================================
// TYPES & INTERFACES
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
  updated_at?: string;
  author?: {
    full_name: string;
    email?: string;
  };
  department?: {
    name: string;
    code: string;
  };
  // Optional field added during admin fetch or analytics
  ward_number?: number | string;
  ward?: {
    ward_number: number | string;
    name: string;
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
  finalized_at?: string;
  concluding_message?: string;
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
// SERVICE
// ============================================================================

export const pbService = {
  // --- READS ---

  async getDepartments(): Promise<Department[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("departments")
      .select("id, name, code")
      .eq("is_active", true);

    if (error) throw error;
    return data as Department[];
  },

  async getActiveCycles(): Promise<BudgetCycle[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("budget_cycles")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as BudgetCycle[];
  },

  async getCycleById(id: string): Promise<BudgetCycle | null> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("budget_cycles")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data as BudgetCycle;
  },

  async getProposals(
    cycleId: string,
    statusFilter: ProposalStatus[] | null = ["approved_for_voting"]
  ): Promise<BudgetProposal[]> {
    const supabase = createClient();

    let query = supabase
      .from("budget_proposals")
      .select(
        `*, 
         author:users!author_id(email, user_profiles(full_name)), 
         department:departments!department_id(name, code)`
      )
      .eq("cycle_id", cycleId)
      .order("created_at", { ascending: false });

    if (statusFilter && statusFilter.length > 0) {
      query = query.in("status", statusFilter);
    }

    const { data, error } = await query;
    if (error) throw error;

    return (data as any[]).map((p) => ({
      ...p,
      author: {
        full_name: p.author?.user_profiles?.[0]?.full_name || "Anonymous",
        email: p.author?.email,
      },
      department: p.department,
    })) as BudgetProposal[];
  },

  async getProposalById(id: string): Promise<BudgetProposal | null> {
    const supabase = createClient();
    console.log("🔍 [pbService] Starting getProposalById for:", id);

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("❌ [pbService] Authentication error:", authError);
      return null;
    }

    // Optional: Supervisor check logic (kept from your snippet for debug purposes)
    const { data: supervisorProfile } = await supabase
      .from("supervisor_profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    try {
      const { data, error, status, statusText } = await supabase
        .from("budget_proposals")
        .select(`
          *,
          author:users!author_id(user_profiles(full_name)),
          department:departments!department_id(name, code)
        `)
        .eq("id", id)
        .maybeSingle();

      if (error) {
        console.error("❌ [pbService] Database error:", error.code, error.message);
        return null;
      }

      if (!data) {
        console.warn("⚠️ [pbService] No data returned - RLS likely filtered it out");
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
      console.error("❌ [pbService] Unexpected exception:", error);
      return null;
    }
  },

  async getUserVotes(cycleId: string): Promise<string[]> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from("budget_votes")
      .select("proposal_id")
      .eq("cycle_id", cycleId)
      .eq("voter_id", user.id);

    if (error) throw error;
    return data.map((v: any) => v.proposal_id);
  },

  async getSupervisorProfile(): Promise<SupervisorProfile | null> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from("supervisor_profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) return null;
    return data as SupervisorProfile;
  },

  // --- WRITES ---

  async voteForProposal(proposalId: string): Promise<VoteResponse> {
    const supabase = createClient();
    const { data, error } = await supabase.rpc("rpc_vote_for_proposal", {
      p_proposal_id: proposalId,
    });
    if (error) throw error;
    return data as VoteResponse;
  },

  async submitProposal(
    proposal: Omit<
      BudgetProposal,
      | "id" | "author_id" | "status" | "vote_count" | "created_at" 
      | "admin_notes" | "department" | "technical_cost"
    >,
    coverImage?: File
  ) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

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
        cycle_id: proposal.cycle_id,
        author_id: user.id,
        title: proposal.title,
        description: proposal.description,
        category: proposal.category,
        department_id: proposal.department_id,
        ward_id: proposal.ward_id,
        estimated_cost: proposal.estimated_cost,
        address_text: proposal.address_text,
        location_point: proposal.location_point,
        cover_image_url: coverImageUrl,
        status: "submitted",
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateProposalStatus(
    proposalId: string,
    status: ProposalStatus,
    notes?: string,
    technicalCost?: number
  ) {
    const supabase = createClient();
    const updateData: any = {
      status: status,
      updated_at: new Date().toISOString(),
    };

    if (notes) updateData.admin_notes = notes;
    if (technicalCost !== undefined) updateData.technical_cost = technicalCost;

    const { data, error } = await supabase
      .from("budget_proposals")
      .update(updateData)
      .eq("id", proposalId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // --- ADMIN ACTIONS ---

  async createBudgetCycle(cycle: Omit<BudgetCycle, "id" | "created_at">) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("budget_cycles")
      .insert(cycle)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateBudgetCycle(id: string, updates: Partial<BudgetCycle>) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("budget_cycles")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as BudgetCycle;
  },

  async getCycleAnalytics(cycleId: string): Promise<CycleAnalytics> {
    const supabase = createClient();
    const { data: proposals, error } = await supabase
      .from("budget_proposals")
      .select(`
        id, ward_id, category, vote_count,
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
      const wardName = p.wards?.ward_number ? `Ward ${p.wards.ward_number}` : "City-Wide / Unassigned";
      stats.votesByWard[wardName] = (stats.votesByWard[wardName] || 0) + p.vote_count;
      stats.votesByCategory[p.category] = (stats.votesByCategory[p.category] || 0) + p.vote_count;
    });

    return stats;
  },

  async finalizeWinners(cycleId: string, proposalIds: string[], message: string): Promise<void> {
    const supabase = createClient();
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
        is_active: false // Usually finalized cycles become inactive
      })
      .eq("id", cycleId);

    if (cycleError) throw cycleError;
  },

  async getProposalDetailsForAdmin(id: string): Promise<BudgetProposal | null> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("budget_proposals")
      .select(`
        *,
        author:users!author_id ( email, user_profiles ( full_name ) ),
        department:departments!department_id ( name, code ),
        ward:wards!ward_id ( ward_number, name )
      `)
      .eq("id", id)
      .maybeSingle();

    if (error || !data) return null;

    return {
      ...data,
      author: {
        full_name: (data.author as any)?.user_profiles?.[0]?.full_name || "Anonymous",
        email: (data.author as any)?.email,
      },
      ward_number: (data.ward as any)?.ward_number,
    } as any;
  },

  async runWinnerSimulation(
    cycleId: string,
    totalBudgetOverride?: number
  ): Promise<SimulationResult> {
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
  },
};