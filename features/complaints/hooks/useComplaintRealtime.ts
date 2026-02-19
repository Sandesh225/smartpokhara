"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { COMPLAINT_KEYS } from "./useComplaints";
import { toast } from "sonner";

export function useComplaintRealtime() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel("complaints-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "complaints" },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: COMPLAINT_KEYS.all });
          // Also invalidate dashboard metrics
          queryClient.invalidateQueries({ queryKey: ["dashboard"] });
          
          if (payload.eventType === "INSERT") {
            toast.info("New complaint received");
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, queryClient]);
}
