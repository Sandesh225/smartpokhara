import { createClient } from "@/lib/supabase/client";

// ============================================================================
// TYPES
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
        `*, author:users!author_id(email, user_profiles(full_name)), department:departments!department_id(name, code)`
      )
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
  },

  async getProposalById(id: string): Promise<BudgetProposal | null> {
    const supabase = createClient();

    console.log("🔍 [pbService] Starting getProposalById for:", id);

    // First, let's check if we're authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("❌ [pbService] Authentication error:", authError);
      return null;
    }

    console.log("✅ [pbService] User authenticated:", user.id);

    // Check supervisor profile
    try {
      const { data: supervisorProfile, error: profileError } = await supabase
        .from("supervisor_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profileError) {
        console.error("⚠️ [pbService] Supervisor profile error:", profileError);
      } else if (supervisorProfile) {
        console.log("✅ [pbService] Supervisor profile found:", {
          level: supervisorProfile.supervisor_level,
          assigned_departments: supervisorProfile.assigned_departments,
          assigned_wards: supervisorProfile.assigned_wards,
        });
      } else {
        console.warn("⚠️ [pbService] No supervisor profile found for user");
      }
    } catch (err) {
      console.error("❌ [pbService] Error checking supervisor profile:", err);
    }

    // Now try to fetch the proposal
    try {
      console.log("🔍 [pbService] Fetching proposal from database...");

      const { data, error, status, statusText } = await supabase
        .from("budget_proposals")
        .select(
          `*, 
           author:users!author_id(user_profiles(full_name)), 
           department:departments!department_id(name, code)`
        )
        .eq("id", id)
        .maybeSingle();

      // Log full response details
      console.log("📦 [pbService] Query response:", {
        hasData: !!data,
        hasError: !!error,
        status,
        statusText,
        errorDetails: error
          ? {
              code: error.code,
              message: error.message,
              details: error.details,
              hint: error.hint,
            }
          : null,
      });

      if (error) {
        console.error("❌ [pbService] Database error:", error);
        console.error("❌ [pbService] Error type:", typeof error);
        console.error("❌ [pbService] Error keys:", Object.keys(error));

        // Check specific error codes
        if (error.code === "42501") {
          console.error("🔒 [pbService] RLS Policy denied access (42501)");
          return null;
        }

        if (error.code === "PGRST116") {
          console.error(
            "🔍 [pbService] No rows returned (PGRST116) - likely filtered by RLS"
          );
          return null;
        }

        // For any other error, return null
        return null;
      }

      if (!data) {
        console.warn(
          "⚠️ [pbService] No data returned - RLS likely filtered it out"
        );

        // Let's verify the proposal exists at all (admin check)
        const { data: proposalExists } = await supabase
          .from("budget_proposals")
          .select("id, department_id, status")
          .eq("id", id)
          .maybeSingle();

        if (!proposalExists) {
          console.error("❌ [pbService] Proposal does not exist in database");
        } else {
          console.error(
            "🔒 [pbService] Proposal exists but RLS blocked access:",
            {
              proposal_department_id: proposalExists.department_id,
              proposal_status: proposalExists.status,
            }
          );
        }

        return null;
      }

      console.log("✅ [pbService] Proposal retrieved successfully:", {
        id: data.id,
        title: data.title,
        status: data.status,
        department_id: data.department_id,
        department_name: data.department?.name || "NO DEPARTMENT",
      });

      return {
        ...data,
        author: {
          full_name:
            (data.author as any)?.user_profiles?.[0]?.full_name || "Anonymous",
        },
        department: data.department,
      } as any;
    } catch (error: any) {
      console.error("❌ [pbService] Unexpected exception:", error);
      console.error("❌ [pbService] Exception type:", typeof error);
      console.error("❌ [pbService] Exception message:", error?.message);
      console.error("❌ [pbService] Exception stack:", error?.stack);

      return null;
    }
  },

  async getUserVotes(cycleId: string): Promise<string[]> {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
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
    const {
      data: { user },
    } = await supabase.auth.getUser();
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
      | "id"
      | "author_id"
      | "status"
      | "vote_count"
      | "created_at"
      | "admin_notes"
      | "department"
      | "technical_cost"
    >,
    coverImage?: File
  ) {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
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

    console.log("🔄 [pbService] Updating proposal status:", {
      proposalId,
      status,
      hasNotes: !!notes,
      technicalCost,
    });

    const updateData: any = {
      status: status,
      updated_at: new Date().toISOString(),
    };

    if (notes) {
      updateData.admin_notes = notes;
    }

    if (technicalCost !== undefined) {
      updateData.technical_cost = technicalCost;
    }

    const { data, error } = await supabase
      .from("budget_proposals")
      .update(updateData)
      .eq("id", proposalId)
      .select()
      .single();

    if (error) {
      console.error("❌ [pbService] Update failed:", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      });
      throw error;
    }

    console.log("✅ [pbService] Proposal updated successfully");
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

    // We join the 'wards' table to get the human-readable number
    const { data: proposals, error } = await supabase
      .from("budget_proposals")
      .select(
        `
        id, 
        ward_id, 
        category, 
        vote_count,
        wards (
          ward_number
        )
      `
      )
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

      // FIX: Use the joined ward_number if available, otherwise "City-Wide"
      const wardName = p.wards?.ward_number
        ? `Ward ${p.wards.ward_number}`
        : "City-Wide / Unassigned";

      stats.votesByWard[wardName] =
        (stats.votesByWard[wardName] || 0) + p.vote_count;

      const catKey = p.category;
      stats.votesByCategory[catKey] =
        (stats.votesByCategory[catKey] || 0) + p.vote_count;
    });

    return stats;
  },
  async finalizeWinners(
    cycleId: string,
    proposalIds: string[],
    message: string
  ): Promise<void> {
    const supabase = createClient();

    // 1. Update winning proposals
    const { error: propError } = await supabase
      .from("budget_proposals")
      .update({ status: "selected" })
      .in("id", proposalIds);

    if (propError) throw propError;

    // 2. Update the cycle status
    const { error: cycleError } = await supabase
      .from("budget_cycles")
      .update({
        finalized_at: new Date().toISOString(),
        concluding_message: message,
      })
      .eq("id", cycleId);

    if (cycleError) throw cycleError;
  },

  async getProposalDetailsForAdmin(id: string): Promise<BudgetProposal | null> {
    const supabase = createClient();

    console.log("🛠️ Admin Fetching ID:", id);

    const { data, error } = await supabase
      .from("budget_proposals")
      .select(
        `
      *,
      author:users!author_id (
        email,
        user_profiles (
          full_name
        )
      ),
      department:departments!department_id (
        name,
        code
      ),
      ward:wards!ward_id (
        ward_number,
        name
      )
    `
      )
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("❌ SQL Error Code:", error.code);
      console.error("❌ SQL Message:", error.message);
      return null;
    }

    if (!data) return null;

    // Formatting the nested data to match your BudgetProposal interface
    return {
      ...data,
      author: {
        full_name:
          (data.author as any)?.user_profiles?.[0]?.full_name || "Anonymous",
        email: (data.author as any)?.email,
      },
      // Adding ward_number to the root for easier UI access
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
