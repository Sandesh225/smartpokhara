"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";
import { Toaster } from "sonner";
import { TooltipProvider } from "@radix-ui/react-tooltip";
// 1. Alias the Flowbite provider
import { ThemeProvider as FlowbiteThemeProvider } from "flowbite-react";
// 2. Import your CUSTOM provider
import { ThemeProvider as CustomThemeProvider } from "../lib/contexts/ThemeContext";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {/* Wrap everything in your custom provider first */}
      <CustomThemeProvider>
        <FlowbiteThemeProvider>
          <TooltipProvider delayDuration={300}>
            {children}
            <Toaster position="top-center" richColors />
          </TooltipProvider>
        </FlowbiteThemeProvider>
      </CustomThemeProvider>
    </QueryClientProvider>
  );
}