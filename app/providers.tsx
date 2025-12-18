// app/providers.tsx
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";
import { Toaster } from "sonner"; // Swapped from local UI toaster
import { TooltipProvider } from "@radix-ui/react-tooltip";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            gcTime: 5 * 60 * 1000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delayDuration={300}>
        {children}
        {/* Premium Sonner configuration */}
        <Toaster
          position="top-right"
          richColors
          expand={false}
          closeButton
          theme="light"
        />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
