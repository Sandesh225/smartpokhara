"use client";

import { useState } from "react";
import { updateSystemConfig } from "../actions";
import { Loader2 } from "lucide-react";

interface SecurityConfig {
  require_2fa: boolean;
  session_timeout: number;
  password_expiry: number;
}

export default function SecuritySettings({
  initialData,
}: {
  initialData: SecurityConfig;
}) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    const newData = {
      require_2fa: formData.get("require_2fa") === "on",
      session_timeout: Number(formData.get("session_timeout")),
      password_expiry: Number(formData.get("password_expiry")),
    };

    await updateSystemConfig("security_policy", newData);
    setLoading(false);
  };

  return (
    <form action={handleSubmit} className="stone-card p-6">
      <h3 className="font-bold mb-4 text-foreground">Security Policy</h3>
      <div className="space-y-4">
        <label className="flex items-center justify-between p-3 border border-border rounded bg-white">
          <span className="text-sm font-medium text-foreground">
            Require 2FA for Admins
          </span>
          <input
            name="require_2fa"
            type="checkbox"
            defaultChecked={initialData.require_2fa}
            className="accent-primary w-4 h-4"
          />
        </label>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1">
              Session Timeout (mins)
            </label>
            <input
              name="session_timeout"
              type="number"
              defaultValue={initialData.session_timeout}
              className="dept-input-base w-full"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1">
              Password Expiry (days)
            </label>
            <input
              name="password_expiry"
              type="number"
              defaultValue={initialData.password_expiry}
              className="dept-input-base w-full"
            />
          </div>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <button
          disabled={loading}
          className="px-4 py-2 bg-primary text-white text-sm font-medium rounded hover:bg-primary/90 flex items-center"
        >
          {loading && <Loader2 className="w-3 h-3 mr-2 animate-spin" />}
          Save Changes
        </button>
      </div>
    </form>
  );
}
