"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";
import { Toaster } from "sonner";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { ThemeProvider as FlowbiteThemeProvider } from "flowbite-react";
import { ThemeProvider as CustomThemeProvider } from "../lib/contexts/ThemeContext";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <CustomThemeProvider>
        <FlowbiteThemeProvider>
          <TooltipProvider delayDuration={300}>
            {children}
            <Toaster
              position="top-center"
              expand={true}
              richColors
              duration={4000}
              closeButton
              toastOptions={{
                style: {
                  background: "rgb(var(--card))",
                  border: "1px solid rgb(var(--border))",
                  color: "rgb(var(--foreground))",
                  borderRadius: "0.75rem",
                  boxShadow:
                    "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                },
                className: "animate-in slide-in-from-top-4 duration-300",
                classNames: {
                  success:
                    "border-green-500/50 bg-green-50 dark:bg-green-950/30",
                  error: "border-red-500/50 bg-red-50 dark:bg-red-950/30",
                  warning:
                    "border-amber-500/50 bg-amber-50 dark:bg-amber-950/30",
                  info: "border-blue-500/50 bg-blue-50 dark:bg-blue-950/30",
                  loading: "border-primary/50",
                  icon: "text-green-600 dark:text-green-400",
                  toast: "group-[.toaster]:shadow-xl",
                  title: "font-semibold text-sm",
                  description: "text-sm opacity-90",
                  actionButton:
                    "bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-3 py-1.5 text-sm font-medium transition-all",
                  cancelButton:
                    "bg-muted text-muted-foreground hover:bg-muted/80 rounded-lg px-3 py-1.5 text-sm font-medium transition-all",
                  closeButton:
                    "bg-card border border-border hover:bg-muted transition-colors",
                },
              }}
            />
          </TooltipProvider>
        </FlowbiteThemeProvider>
      </CustomThemeProvider>
    </QueryClientProvider>
  );
}