import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { userApi } from "../api";
import { UserPreferences, UserProfile } from "../types";
import { toast } from "sonner";

// ==========================================
// USER PROFILE HOOKS
// ==========================================

export function useUserProfile(userId?: string) {
  const supabase = createClient();
  const queryClient = useQueryClient();

  // If userId is not provided, we could try to get from session, 
  // but usually for a hook we assume it's passed or we fetch "me"
  // For now let's assume userId is required for fetching specific, 
  // but if we want "current user" we might need a separate mechanism or context.
  // Assuming the caller provides the ID from auth context.

  const query = useQuery({
    queryKey: ["user-profile", userId],
    queryFn: () => userId ? userApi.getProfile(supabase, userId) : Promise.resolve(null),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const updateProfile = useMutation({
    mutationFn: async (updates: Partial<UserProfile> & { phone?: string }) => {
      if (!userId) throw new Error("User ID required");
      return userApi.updateProfile(supabase, userId, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-profile", userId] });
      toast.success("Profile updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update profile");
    },
  });

  const uploadPhoto = useMutation({
    mutationFn: async (file: File) => {
      if (!userId) throw new Error("User ID required");
      return userApi.uploadProfilePhoto(supabase, userId, file);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-profile", userId] });
      toast.success("Photo uploaded successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to upload photo");
    },
  });

  return {
    profile: query.data,
    isLoading: query.isLoading,
    updateProfile,
    uploadPhoto
  };
}

export function useUserPreferences(userId?: string) {
  const supabase = createClient();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["user-preferences", userId],
    queryFn: () => userId ? userApi.getPreferences(supabase, userId) : Promise.resolve(null),
    enabled: !!userId,
  });

  const updatePreferences = useMutation({
    mutationFn: async (updates: Partial<UserPreferences>) => {
      if (!userId) throw new Error("User ID required");
      return userApi.updatePreferences(supabase, userId, updates);
    },
    onMutate: async (newPrefs) => {
      await queryClient.cancelQueries({ queryKey: ["user-preferences", userId] });
      const previous = queryClient.getQueryData(["user-preferences", userId]);
      queryClient.setQueryData(["user-preferences", userId], (old: any) => ({ ...old, ...newPrefs }));
      return { previous };
    },
    onError: (err, newPrefs, context) => {
      queryClient.setQueryData(["user-preferences", userId], context?.previous);
      toast.error("Failed to update preferences");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["user-preferences", userId] });
    },
  });

  return {
    preferences: query.data,
    isLoading: query.isLoading,
    updatePreferences
  };
}
