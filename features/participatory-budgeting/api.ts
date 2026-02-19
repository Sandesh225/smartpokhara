import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/lib/types/database.types";
import { 
  BudgetCycle, 
  BudgetProposal, 
  CreateProposalData, 
  CycleAnalytics, 
  Department, 
  ProposalStatus, 
  SimulationResult, 
  SupervisorProfile, 
  VoteResponse 
} from "./types";

export const pbApi = {
  // --- CYCLES ---

  async getActiveCycles(client: SupabaseClient<Database>): Promise<BudgetCycle[]> {
    const { data, error } = await (client as any)
      .from("budget_cycles")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as BudgetCycle[];
  },

  async getCycleById(client: SupabaseClient<Database>, id: string): Promise<BudgetCycle | null> {
    const { data, error } = await (client as any)
      .from("budget_cycles")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    return data as BudgetCycle;
  },

  async createBudgetCycle(client: SupabaseClient<Database>, cycle: Omit<BudgetCycle, "id" | "created_at">) {
    const { data, error } = await (client as any)
      .from("budget_cycles")
      .insert(cycle)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateBudgetCycle(client: SupabaseClient<Database>, id: string, updates: Partial<BudgetCycle>) {
    const { data, error } = await (client as any)
      .from("budget_cycles")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as BudgetCycle;
  },

  // --- PROPOSALS ---

  async getProposals(
    client: SupabaseClient<Database>,
    cycleId: string,
    statusFilter: ProposalStatus[] | null = ["approved_for_voting"]
  ): Promise<BudgetProposal[]> {
    let query = (client as any)
      .from("budget_proposals")
      .select(
        `*, 
         author:users!author_id(email, profile:user_profiles(full_name)), 
         department:departments!department_id(name, code),
         ward:wards!ward_id(ward_number, name)`
      )
      .eq("cycle_id", cycleId)
      .order("vote_count", { ascending: false });

    if (statusFilter && statusFilter.length > 0) {
      query = query.in("status", statusFilter);
    }

    const { data, error } = await query;
    if (error) throw error;

    return (data as any[]).map((p) => ({
      ...p,
      author: {
        full_name: (p.author as any)?.profile?.[0]?.full_name || "Anonymous",
        email: (p.author as any)?.email,
      },
      author_name: (p.author as any)?.profile?.[0]?.full_name || "Anonymous",
      department_name: (p.department as any)?.name,
      ward_number: (p.ward as any)?.ward_number,
      ward_name: (p.ward as any)?.name,
    })) as BudgetProposal[];
  },

  async getProposalById(client: SupabaseClient<Database>, id: string): Promise<BudgetProposal | null> {
    const { data, error } = await (client as any)
      .from("budget_proposals")
      .select(`
        *,
        author:users!author_id(email, profile:user_profiles(full_name)),
        department:departments!department_id(name, code),
        cycle:budget_cycles(*),
        ward:wards!ward_id(ward_number, name)
      `)
      .eq("id", id)
      .maybeSingle();

    if (error || !data) return null;

    return {
      ...data,
      author: {
        full_name: (data as any).author?.profile?.[0]?.full_name || "Anonymous",
        email: (data as any).author?.email,
      },
      author_name: (data as any).author?.profile?.[0]?.full_name || "Anonymous",
      department_name: (data as any).department?.name,
      ward_number: (data as any).ward?.ward_number,
      ward_name: (data as any).ward?.name,
    } as any;
  },

  async submitProposal(
    client: SupabaseClient<Database>,
    proposal: CreateProposalData,
    coverImage?: File
  ) {
    const { data: { user } } = await client.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    let coverImageUrl = null;
    if (coverImage) {
      const ext = coverImage.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await (client as any).storage
        .from("complaint-attachments") 
        .upload(fileName, coverImage);

      if (uploadError) throw uploadError;

      const { data: publicUrl } = (client as any).storage
        .from("complaint-attachments")
        .getPublicUrl(fileName);

      coverImageUrl = (publicUrl as any).publicUrl;
    }

    const { data, error } = await (client as any)
      .from("budget_proposals")
      .insert({
        ...proposal,
        author_id: user.id,
        cover_image_url: coverImageUrl,
        status: "submitted",
        vote_count: 0
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateProposalStatus(
    client: SupabaseClient<Database>,
    proposalId: string,
    status: ProposalStatus,
    notes?: string,
    technicalCost?: number
  ) {
    const updateData: any = {
      status: status,
      updated_at: new Date().toISOString(),
    };

    if (notes) updateData.admin_notes = notes;
    if (technicalCost !== undefined) updateData.technical_cost = technicalCost;

    const { data, error } = await (client as any)
      .from("budget_proposals")
      .update(updateData)
      .eq("id", proposalId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // --- VOTING ---

  async voteForProposal(client: SupabaseClient<Database>, proposalId: string): Promise<VoteResponse> {
    const { data, error } = await (client as any).rpc("rpc_vote_for_proposal", {
      p_proposal_id: proposalId,
    });
    if (error) throw error;
    return data as VoteResponse;
  },

  async getUserVotes(client: SupabaseClient<Database>, cycleId: string): Promise<string[]> {
    const { data: { user } } = await client.auth.getUser();
    if (!user) return [];

    const { data, error } = await (client as any)
      .from("budget_votes")
      .select("proposal_id")
      .eq("cycle_id", cycleId)
      .eq("voter_id", user.id);

    if (error) throw error;
    return (data as any[]).map((v: any) => v.proposal_id);
  },

  // --- ANALYTICS & SIMULATION ---

  async getCycleAnalytics(client: SupabaseClient<Database>, cycleId: string): Promise<CycleAnalytics> {
    const { data: proposals, error } = await (client as any)
      .from("budget_proposals")
      .select(`
        id, ward_id, category, vote_count,
        wards ( ward_number )
      `)
      .eq("cycle_id", cycleId);

    if (error) throw error;

    const stats: CycleAnalytics = {
      totalVotes: 0,
      totalProposals: (proposals as any[]).length,
      votesByWard: {},
      votesByCategory: {},
      participationRate: 0,
    };

    (proposals as any[]).forEach((p: any) => {
      stats.totalVotes += p.vote_count;
      const wardName = p.wards?.ward_number ? `Ward ${p.wards.ward_number}` : "City-Wide / Unassigned";
      stats.votesByWard[wardName] = (stats.votesByWard[wardName] || 0) + p.vote_count;
      stats.votesByCategory[p.category] = (stats.votesByCategory[p.category] || 0) + p.vote_count;
    });

    return stats;
  },

  async runWinnerSimulation(
    client: SupabaseClient<Database>,
    cycleId: string,
    totalBudgetOverride?: number
  ): Promise<SimulationResult> {
    const cycle = await this.getCycleById(client, cycleId);
    if (!cycle) throw new Error("Cycle not found");

    const proposals = await this.getProposals(client, cycleId, ["approved_for_voting"]);
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

  async finalizeWinners(client: SupabaseClient<Database>, cycleId: string, proposalIds: string[], message: string): Promise<void> {
    const { error: propError } = await (client as any)
      .from("budget_proposals")
      .update({ status: "selected" })
      .in("id", proposalIds);

    if (propError) throw propError;

    const { error: cycleError } = await (client as any)
      .from("budget_cycles")
      .update({
        finalized_at: new Date().toISOString(),
        concluding_message: message,
        is_active: false
      })
      .eq("id", cycleId);

    if (cycleError) throw cycleError;
  },

  // --- LOOKUPS ---

  async getDepartments(client: SupabaseClient<Database>): Promise<Department[]> {
    const { data, error } = await (client as any)
      .from("departments")
      .select("id, name, code")
      .eq("is_active", true)
      .order("name", { ascending: true });

    if (error) throw error;
    return data as Department[];
  },

  async getSupervisorProfile(client: SupabaseClient<Database>, userId: string): Promise<SupervisorProfile | null> {
    const { data, error } = await (client as any)
      .from("supervisor_profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) return null;
    return data as SupervisorProfile;
  },
};
