// components/providers/ToastProvider.tsx
"use client";

import { Toaster } from "react-hot-toast";

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      gutter={8}
      toastOptions={{
        duration: 4000,
        style: {
          background: "#fff",
          color: "#374151",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          borderRadius: "8px",
          fontSize: "0.875rem",
          maxWidth: "400px",
          border: "1px solid #e5e7eb",
        },
        success: {
          iconTheme: {
            primary: "#10B981",
            secondary: "#fff",
          },
          style: {
            borderLeft: "4px solid #10B981",
          },
        },
        error: {
          iconTheme: {
            primary: "#EF4444",
            secondary: "#fff",
          },
          style: {
            borderLeft: "4px solid #EF4444",
          },
        },
        loading: {
          iconTheme: {
            primary: "#6B7280",
            secondary: "#fff",
          },
        },
      }}
    />
  );
}
