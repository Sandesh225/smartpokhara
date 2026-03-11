"use client";

import { useEffect } from "react";
import { AlertTriangle, Info, Loader2, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  variant?: "danger" | "warning" | "info";
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
}

export function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  variant = "warning",
  confirmLabel = "Confirm Action",
  cancelLabel = "Abort",
  isLoading = false,
}: ConfirmationDialogProps) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const config = {
    danger: {
      icon: ShieldAlert,
      color: "text-red-500",
      bg: "bg-red-500/10",
      border: "border-red-500/20",
      btn: "bg-red-600 hover:bg-red-700 text-white shadow-glow-sm shadow-red-500/20",
      accent: "red",
    },
    warning: {
      icon: AlertTriangle,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
      btn: "bg-amber-500 hover:bg-amber-600 text-white shadow-glow-sm shadow-amber-500/20",
      accent: "amber",
    },
    info: {
      icon: Info,
      color: "text-primary",
      bg: "bg-primary/10",
      border: "border-primary/20",
      btn: "bg-primary hover:bg-primary/90 text-white shadow-glow-sm",
      accent: "blue",
    },
  };

  const { icon: Icon, color, bg, border, btn } = config[variant];

  return (
    <div className={cn(
      "fixed inset-0 z-100 flex items-center justify-center p-4 transition-all duration-300",
      isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
    )}>
      {/* Tactical Backdrop */}
      <div
        onClick={isLoading ? undefined : onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-md"
      />

      {/* Dialog Surface */}
      <div
        className={cn(
          "relative w-full max-w-md overflow-hidden rounded-2xl bg-white dark:bg-dark-surface shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] border border-white/10 dark:border-primary/10",
          "ring-1 ring-black/5 transition-all duration-300 transform",
          isOpen ? "scale-100 translate-y-0 opacity-100" : "scale-95 translate-y-4 opacity-0"
        )}
      >
        <div className="p-8">
          <div className="flex flex-col items-center text-center">
            {/* Icon Hexagon/Circle Container */}
            <div
              className={cn(
                "mb-5 rounded-2xl p-4 border transition-colors",
                bg,
                border
              )}
            >
              <Icon className={cn("h-8 w-8", color)} strokeWidth={2.5} />
            </div>

            <h3 className="text-xl font-black uppercase tracking-tighter text-gray-900 dark:text-dark-text-primary">
              {title}
            </h3>

            <p className="mt-3 text-sm font-medium text-gray-500 dark:text-dark-text-secondary leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center gap-3 bg-gray-50/50 dark:bg-dark-surface-lighter px-6 py-5 border-t border-gray-100 dark:border-primary/10">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 rounded-xl border border-gray-300 dark:border-primary/20 bg-white dark:bg-transparent px-4 py-2.5 text-xs font-black uppercase tracking-widest text-gray-700 dark:text-dark-text-tertiary hover:bg-gray-50 dark:hover:bg-primary/5 transition-all disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-70",
              btn
            )}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </div>
  );
}