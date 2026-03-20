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
      color: "text-destructive",
      bg: "bg-destructive/10",
      border: "border-destructive/20",
      btn: "bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-lg shadow-destructive/20",
      accent: "destructive",
    },
    warning: {
      icon: AlertTriangle,
      color: "text-secondary-foreground",
      bg: "bg-secondary/10",
      border: "border-secondary/20",
      btn: "bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-lg shadow-secondary/20",
      accent: "secondary",
    },
    info: {
      icon: Info,
      color: "text-primary",
      bg: "bg-primary/10",
      border: "border-primary/20",
      btn: "bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20",
      accent: "primary",
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
          "relative w-full max-w-md overflow-hidden rounded-2xl bg-card shadow-2xl border border-border",
          "transition-all duration-300 transform animate-[scaleIn_0.3s_ease-out]",
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

            <h3 className="text-xl font-black uppercase tracking-tighter text-foreground">
              {title}
            </h3>

            <p className="mt-3 text-sm font-medium text-muted-foreground leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center gap-3 bg-muted/30 px-6 py-5 border-t border-border">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 rounded-xl border border-input bg-card px-4 py-2.5 text-xs font-black uppercase tracking-widest text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all disabled:opacity-50"
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