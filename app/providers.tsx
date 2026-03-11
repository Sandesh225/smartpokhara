"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";
import { Toaster } from "sonner";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { ThemeProvider as CustomThemeProvider } from "@/components/providers/theme-provider";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <CustomThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <TooltipProvider delayDuration={300}>
          {children}
          <Toaster
            position="top-center"
            expand={true}
            richColors
            duration={4000}
            closeButton
            theme="system"
            gap={8}
            toastOptions={{
              style: {
                background: "var(--toast-bg)",
                color: "var(--toast-fg)",
                border: "1px solid var(--toast-border)",
                borderRadius: "0.875rem",
                boxShadow: "var(--toast-shadow)",
                backdropFilter: "blur(12px)",
                padding: "14px 18px",
                fontFamily: "var(--font-sans)",
                fontSize: "0.875rem",
                lineHeight: "1.5",
                gap: "12px",
              },
              classNames: {
                success: "!border-[var(--toast-success-border)] !bg-[var(--toast-success-bg)] !text-[var(--toast-success-text)]",
                error: "!border-[var(--toast-error-border)] !bg-[var(--toast-error-bg)] !text-[var(--toast-error-text)]",
                warning: "!border-[var(--toast-warning-border)] !bg-[var(--toast-warning-bg)] !text-[var(--toast-warning-text)]",
                info: "!border-[var(--toast-info-border)] !bg-[var(--toast-info-bg)] !text-[var(--toast-info-text)]",
                loading: "!border-[var(--toast-border)]",
                toast: "group-[.toaster]:shadow-xl",
                title: "font-semibold text-[0.875rem] leading-tight",
                description: "text-[0.8125rem] opacity-80 mt-0.5",
                actionButton:
                  "!bg-[var(--primary)] !text-[var(--primary-foreground)] hover:opacity-90 !rounded-lg !px-3 !py-1.5 !text-sm !font-medium transition-all",
                cancelButton:
                  "!bg-[var(--muted)] !text-[var(--muted-foreground)] hover:opacity-80 !rounded-lg !px-3 !py-1.5 !text-sm !font-medium transition-all",
                closeButton:
                  "!bg-[var(--toast-bg)] !border !border-[var(--toast-border)] hover:!bg-[var(--muted)] transition-colors !rounded-full",
              },
            }}
          />
        </TooltipProvider>
      </CustomThemeProvider>
    </QueryClientProvider>
  );
}