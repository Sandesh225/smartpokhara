// hooks/use-toast.tsx
"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";

export type ToastVariant = "default" | "destructive" | "success";

export interface ToastOptions {
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number; // ms
}

export interface ToastContextType {
  toast: (options: ToastOptions) => void;
}

interface ToastInstance extends ToastOptions {
  id: string;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastInstance[]>([]);

  const toast = useCallback((options: ToastOptions) => {
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : String(Date.now() + Math.random());

    const duration = options.duration ?? 3000;

    const newToast: ToastInstance = { id, ...options };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}

      {/* Toast UI container */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((t) => {
          const base =
            "rounded-md border px-4 py-3 shadow-sm text-sm max-w-sm bg-white";
          const variantClasses =
            t.variant === "destructive"
              ? "border-red-300 bg-red-50 text-red-800"
              : t.variant === "success"
              ? "border-emerald-300 bg-emerald-50 text-emerald-800"
              : "border-slate-200 bg-white text-slate-900";

          return (
            <div key={t.id} className={`${base} ${variantClasses}`}>
              {t.title && (
                <div className="font-semibold leading-snug">{t.title}</div>
              )}
              {t.description && (
                <div className="mt-1 text-xs opacity-90">{t.description}</div>
              )}
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export default ToastContext;
