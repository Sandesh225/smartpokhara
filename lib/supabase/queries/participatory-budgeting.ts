import { createClient } from "../client";

// ============================================================================
// TYPES
// ============================================================================

export type ProposalCategory = 
  | 'road_infrastructure' 
  | 'water_sanitation' 
  | 'health_safety' 
  | 'parks_environment' 
  | 'education_culture' 
  | 'agriculture' 
  | 'other';

export type ProposalStatus = 
  | 'draft' 
  | 'submitted' 
  | 'under_review' 
  | 'approved_for_voting' 
  | 'selected' 
  | 'rejected' 
  | 'in_progress' 
  | 'completed';

export interface BudgetCycle {
  id: string;
  title: string;
  description: string | null;
  total_budget_amount: number;
  min_project_cost: number;
  max_project_cost: number | null;
  submission_start_at: string;
  submission_end_at: string;
  voting_start_at: string;
  voting_end_at: string;
  max_votes_per_user: number;
  is_active: boolean;
  created_at: string;
}

export interface BudgetProposal {
  id: string;
  cycle_id: string;
  author_id: string;
  title: string;
  description: string;
  category: ProposalCategory;
  
  // New Fields linked to Departments/Wards
  department_id: string | null;
  ward_id: string | null;
  
  location_point: any | null;
  address_text: string | null;
  estimated_cost: number;
  cover_image_url: string | null;
  status: ProposalStatus;
  vote_count: number;
  
  // Admin/Supervisor specific field
  admin_notes?: string | null;
  
  created_at: string;
  author?: {
    full_name: string;
  };
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

// ============================================================================
// SERVICE
// ============================================================================

export const pbService = {
  
  /**
   * Get list of departments for the proposal form
   */
  async getDepartments(): Promise<Department[]> {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('departments')
        .select('id, name, code')
        .eq('is_active', true);
      
      if (error) throw error;
      return data as Department[];
  },

  /**
   * Get all active budget cycles
   */
  async getActiveCycles(): Promise<BudgetCycle[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('budget_cycles')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as BudgetCycle[];
  },

  /**
   * Get a specific cycle by ID
   */
  async getCycleById(id: string): Promise<BudgetCycle | null> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('budget_cycles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as BudgetCycle;
  },

  /**
   * Get proposals for a specific cycle
   * @param cycleId - The ID of the budget cycle
   * @param statusFilter - Array of statuses to filter by. Pass null to fetch all proposals allowed by RLS (for Supervisors/Admins).
   */
  async getProposals(cycleId: string, statusFilter: ProposalStatus[] | null = ['approved_for_voting']): Promise<BudgetProposal[]> {
    const supabase = createClient();
    
    let query = supabase
      .from('budget_proposals')
      .select(`
        *,
        author:users!author_id(
           user_profiles(full_name)
        )
      `)
      .eq('cycle_id', cycleId)
      .order('vote_count', { ascending: false });

    // Apply filter only if provided. Passing null bypasses this, allowing RLS to control visibility.
    // This allows Supervisors to see 'submitted' proposals for their department.
    if (statusFilter && statusFilter.length > 0) {
      query = query.in('status', statusFilter);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Flatten author name
    return data.map((p: any) => ({
      ...p,
      author: {
        full_name: p.author?.user_profiles?.[0]?.full_name || 'Anonymous'
      }
    })) as BudgetProposal[];
  },

  /**
   * Get the current user's votes for a cycle
   */
  async getUserVotes(cycleId: string): Promise<string[]> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('budget_votes')
      .select('proposal_id')
      .eq('cycle_id', cycleId)
      .eq('voter_id', user.id);

    if (error) throw error;
    return data.map((v: any) => v.proposal_id);
  },

  /**
   * Vote for a proposal
   */
  async voteForProposal(proposalId: string): Promise<VoteResponse> {
    const supabase = createClient();
    const { data, error } = await supabase.rpc('rpc_vote_for_proposal', {
      p_proposal_id: proposalId
    });

    if (error) throw error;
    return data as VoteResponse;
  },

  /**
   * Submit a new proposal
   */
  async submitProposal(
    proposal: Omit<BudgetProposal, 'id' | 'author_id' | 'status' | 'vote_count' | 'created_at' | 'admin_notes'>,
    coverImage?: File
  ) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    let coverImageUrl = null;

    if (coverImage) {
      const ext = coverImage.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('complaint-attachments') 
        .upload(fileName, coverImage);
      
      if (uploadError) throw uploadError;
      
      const { data: publicUrl } = supabase.storage
        .from('complaint-attachments')
        .getPublicUrl(fileName);
        
      coverImageUrl = publicUrl.publicUrl;
    }

    const { data, error } = await supabase
      .from('budget_proposals')
      .insert({
        cycle_id: proposal.cycle_id,
        author_id: user.id,
        title: proposal.title,
        description: proposal.description,
        category: proposal.category,
        department_id: proposal.department_id, // Insert Department ID
        ward_id: proposal.ward_id,
        estimated_cost: proposal.estimated_cost,
        address_text: proposal.address_text,
        location_point: proposal.location_point,
        cover_image_url: coverImageUrl,
        status: 'submitted'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};