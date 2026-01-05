"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ShieldAlert, ShieldCheck, KeyRound, UserCog } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AccountActions({
  userId,
  isActive,
}: {
  userId: string;
  isActive: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const toggleStatus = async () => {
    if (
      !confirm(
        `Are you sure you want to ${
          isActive ? "suspend" : "activate"
        } this account?`
      )
    )
      return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("users")
        .update({ is_active: !isActive })
        .eq("id", userId);

      if (error) throw error;
      router.refresh();
    } catch (err) {
      alert("Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <h3 className="font-semibold text-gray-900 mb-4">Account Actions</h3>
      <div className="space-y-3">
        <button
          onClick={toggleStatus}
          disabled={loading}
          className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
            isActive
              ? "border-red-200 text-red-700 hover:bg-red-50"
              : "border-green-200 text-green-700 hover:bg-green-50"
          }`}
        >
          {isActive ? (
            <ShieldAlert className="w-4 h-4" />
          ) : (
            <ShieldCheck className="w-4 h-4" />
          )}
          {isActive ? "Suspend Account" : "Activate Account"}
        </button>

        <button className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-medium">
          <KeyRound className="w-4 h-4" />
          Send Password Reset
        </button>

        <button className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-medium">
          <UserCog className="w-4 h-4" />
          Promote to Staff
        </button>
      </div>
    </div>
  );
}
