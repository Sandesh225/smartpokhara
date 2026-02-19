"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { complaintsApi } from "../api";
import { CreateComplaintData, ComplaintStatus } from "../types";
import { COMPLAINT_KEYS } from "./useComplaints";

export function useCreateComplaint() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateComplaintData) => {
      // 1. Create Complaint
      const result = await complaintsApi.createComplaint(supabase, data);

      // 2. Upload Attachments if any
      if (data.media && data.media.length > 0) {
        const uploadPromises = data.media.map((file) =>
          complaintsApi.uploadAttachment(supabase, result.complaint_id, file)
        );
        await Promise.all(uploadPromises);
      }

      return result;
    },
    onSuccess: () => {
      toast.success("Complaint submitted successfully");
      queryClient.invalidateQueries({ queryKey: COMPLAINT_KEYS.lists() });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to submit complaint");
    },
  });
}

export function useUpdateComplaintStatus() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      status, 
      note 
    }: { 
      id: string; 
      status: ComplaintStatus; 
      note?: string; 
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      return complaintsApi.updateStatus(supabase, id, status, user.id, note);
    },
    onSuccess: (_, variables) => {
      toast.success("Status updated successfully");
      queryClient.invalidateQueries({ queryKey: COMPLAINT_KEYS.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: COMPLAINT_KEYS.lists() });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update status");
    },
  });
}


export function useAddComment() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      id, 
      content, 
      isInternal = false 
    }: { 
      id: string; 
      content: string; 
      isInternal?: boolean 
    }) => complaintsApi.addComment(supabase, id, content, isInternal),
    onSuccess: (_, variables) => {
      toast.success("Comment added");
      queryClient.invalidateQueries({ queryKey: COMPLAINT_KEYS.detail(variables.id) });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to add comment");
    },
  });
}

export function useAssignComplaint() {
    const supabase = createClient();
    const queryClient = useQueryClient();
  
    return useMutation({
      mutationFn: async ({ 
        id, 
        staffId, 
        note 
      }: { 
        id: string; 
        staffId: string; 
        note?: string; 
      }) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");
        return complaintsApi.assignComplaint(supabase, id, staffId, user.id, note);
      },
      onSuccess: (_, variables) => {
        toast.success("Complaint assigned successfully");
        queryClient.invalidateQueries({ queryKey: COMPLAINT_KEYS.detail(variables.id) });
        queryClient.invalidateQueries({ queryKey: COMPLAINT_KEYS.lists() });
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to assign complaint");
      },
    });
}

export function useBulkUpdateComplaintStatus() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ids, status }: { ids: string[]; status: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      return complaintsApi.bulkUpdateStatus(supabase, ids, status, user.id);
    },
    onSuccess: () => {
      toast.success("Bulk status update successful");
      queryClient.invalidateQueries({ queryKey: COMPLAINT_KEYS.lists() });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to bulk update status");
    },
  });
}

export function useSubmitFeedback() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      complaintId, 
      feedback 
    }: { 
      complaintId: string; 
      feedback: { 
        rating: number; 
        issue_resolved: boolean; 
        would_recommend: boolean; 
        feedback_text?: string 
      } 
    }) => {
      return complaintsApi.submitFeedback(supabase, complaintId, feedback);
    },
    onSuccess: (_, variables) => {
      toast.success("Feedback submitted successfully");
      queryClient.invalidateQueries({ queryKey: COMPLAINT_KEYS.detail(variables.complaintId) });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to submit feedback");
    },
  });
}

