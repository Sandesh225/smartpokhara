import { createClient } from "@/lib/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { pbApi } from "../api";
import { CreateProposalData, ProposalStatus, BudgetCycle, CycleAnalytics } from "../types";
import { toast } from "sonner";

export const PB_KEYS = {
  all: ["participatory-budgeting"] as const,
  cycles: () => [...PB_KEYS.all, "cycles"] as const,
  cycle: (id: string) => [...PB_KEYS.cycles(), id] as const,
  proposals: (cycleId: string) => [...PB_KEYS.all, "proposals", cycleId] as const,
  proposal: (id: string) => [...PB_KEYS.all, "proposal", id] as const,
  votes: (cycleId: string) => [...PB_KEYS.all, "votes", cycleId] as const,
  analytics: (cycleId: string) => [...PB_KEYS.all, "analytics", cycleId] as const,
  departments: () => [...PB_KEYS.all, "departments"] as const,
};

export function useBudgetCycles() {
  const supabase = createClient();
  return useQuery({
    queryKey: PB_KEYS.cycles(),
    queryFn: () => pbApi.getActiveCycles(supabase),
  });
}

export function useBudgetCycle(id: string) {
  const supabase = createClient();
  return useQuery({
    queryKey: PB_KEYS.cycle(id),
    queryFn: () => pbApi.getCycleById(supabase, id),
    enabled: !!id,
  });
}

export function usePBProposals(cycleId: string, statusFilter: ProposalStatus[] | null = ["approved_for_voting"]) {
  const supabase = createClient();
  return useQuery({
    queryKey: [...PB_KEYS.proposals(cycleId), { statusFilter }],
    queryFn: () => pbApi.getProposals(supabase, cycleId, statusFilter),
    enabled: !!cycleId,
  });
}

export function usePBProposal(id: string) {
  const supabase = createClient();
  return useQuery({
    queryKey: PB_KEYS.proposal(id),
    queryFn: () => pbApi.getProposalById(supabase, id),
    enabled: !!id,
  });
}

export function usePBVotes(cycleId: string) {
  const supabase = createClient();
  return useQuery({
    queryKey: PB_KEYS.votes(cycleId),
    queryFn: () => pbApi.getUserVotes(supabase, cycleId),
    enabled: !!cycleId,
  });
}

export function usePBDepartments() {
  const supabase = createClient();
  return useQuery({
    queryKey: PB_KEYS.departments(),
    queryFn: () => pbApi.getDepartments(supabase),
  });
}

export function usePBAnalytics(cycleId: string) {
  const supabase = createClient();
  return useQuery({
    queryKey: PB_KEYS.analytics(cycleId),
    queryFn: () => pbApi.getCycleAnalytics(supabase, cycleId),
    enabled: !!cycleId,
  });
}

export function usePBMutations() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  const voteMutation = useMutation({
    mutationFn: (proposalId: string) => pbApi.voteForProposal(supabase, proposalId),
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: PB_KEYS.all });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to submit vote");
    },
  });

  const submitProposalMutation = useMutation({
    mutationFn: ({ data, coverImage }: { data: CreateProposalData; coverImage?: File }) => 
      pbApi.submitProposal(supabase, data, coverImage),
    onSuccess: () => {
      toast.success("Proposal submitted successfully!");
      queryClient.invalidateQueries({ queryKey: PB_KEYS.all });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to submit proposal");
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status, notes, technicalCost }: { id: string; status: ProposalStatus; notes?: string; technicalCost?: number }) =>
      pbApi.updateProposalStatus(supabase, id, status, notes, technicalCost),
    onSuccess: (_, variables) => {
      toast.success(`Proposal status updated to ${variables.status}`);
      queryClient.invalidateQueries({ queryKey: PB_KEYS.all });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update status");
    },
  });

  const updateCycleMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<BudgetCycle> }) =>
      pbApi.updateBudgetCycle(supabase, id, data),
    onSuccess: () => {
      toast.success("Budget cycle updated");
      queryClient.invalidateQueries({ queryKey: PB_KEYS.cycles() });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update cycle");
    },
  });

  const finalizeWinnersMutation = useMutation({
    mutationFn: ({ cycleId, winnerIds, concludingMessage }: { cycleId: string; winnerIds: string[]; concludingMessage: string }) =>
      pbApi.finalizeWinners(supabase, cycleId, winnerIds, concludingMessage),
    onSuccess: () => {
      toast.success("Winners finalized successfully!");
      queryClient.invalidateQueries({ queryKey: PB_KEYS.all });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to finalize winners");
    },
  });

  const createCycleMutation = useMutation({
    mutationFn: (data: any) => pbApi.createBudgetCycle(supabase, data),
    onSuccess: () => {
      toast.success("Budget cycle created successfully! 🎉");
      queryClient.invalidateQueries({ queryKey: PB_KEYS.cycles() });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create cycle");
    },
  });

  const runSimulationMutation = useMutation({
    mutationFn: ({ cycleId, budget }: { cycleId: string; budget: number }) =>
      pbApi.runWinnerSimulation(supabase, cycleId, budget),
  });

  return {
    vote: voteMutation,
    submitProposal: submitProposalMutation,
    updateStatus: updateStatusMutation,
    updateCycle: updateCycleMutation,
    createCycle: createCycleMutation,
    finalizeWinners: finalizeWinnersMutation,
    runSimulation: runSimulationMutation,
  };
}
