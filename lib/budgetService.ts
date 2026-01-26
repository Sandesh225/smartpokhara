import { createClient } from "@/lib/supabase/client";

// ============================================================================
// TYPES
// ============================================================================

export type ProposalCategory = 
  | 'infrastructure' 
  | 'education' 
  | 'health' 
  | 'environment' 
  | 'parks_recreation' 
  | 'culture' 
  | 'safety' 
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
  ward_id: string | null;
  location_point: any | null;
  address_text: string | null;
  estimated_cost: number;
  cover_image_url: string | null;
  status: ProposalStatus;
  vote_count: number;
  created_at: string;
  author?: {
    full_name: string;
  };
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
   */
  async getProposals(cycleId: string, statusFilter: ProposalStatus[] = ['approved_for_voting']): Promise<BudgetProposal[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('budget_proposals')
      .select(`
        *,
        author:users!author_id(
           user_profiles(full_name)
        )
      `)
      .eq('cycle_id', cycleId)
      .in('status', statusFilter)
      .order('vote_count', { ascending: false });

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
    proposal: Omit<BudgetProposal, 'id' | 'author_id' | 'status' | 'vote_count' | 'created_at'>,
    coverImage?: File
  ) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    let coverImageUrl = null;

    // Upload image if provided
    if (coverImage) {
      const ext = coverImage.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('complaint-attachments') // Reusing existing bucket or create new 'proposals' bucket
        .upload(fileName, coverImage);
      
      if (uploadError) throw uploadError;
      
      const { data: publicUrl } = supabase.storage
        .from('complaint-attachments')
        .getPublicUrl(fileName);
        
      coverImageUrl = publicUrl.publicUrl;
    }

    // Insert proposal
    const { data, error } = await supabase
      .from('budget_proposals')
      .insert({
        cycle_id: proposal.cycle_id,
        author_id: user.id,
        title: proposal.title,
        description: proposal.description,
        category: proposal.category,
        ward_id: proposal.ward_id,
        estimated_cost: proposal.estimated_cost,
        address_text: proposal.address_text,
        location_point: proposal.location_point, // Ensure GeoJSON format matches
        cover_image_url: coverImageUrl,
        status: 'submitted'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};