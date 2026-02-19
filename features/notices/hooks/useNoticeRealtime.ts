"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { NOTICE_KEYS } from "./useNoticeHooks";

export function useNoticeRealtime() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel("notices-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notices" },
        () => {
          queryClient.invalidateQueries({ queryKey: NOTICE_KEYS.all });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, queryClient]);
}
