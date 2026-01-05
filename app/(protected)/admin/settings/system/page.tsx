import { createClient } from "@/lib/supabase/server";
import { toggleMaintenanceMode, saveSecuritySettings } from "../actions"; // Adjust path to your actions file
import { redirect } from "next/navigation";

export default async function SystemSettingsPage() {
  const supabase = await createClient();

  // 1. Fetch all configurations at once
  const { data: configs, error } = await supabase
    .from("system_configurations")
    .select("*");

  if (error) {
    console.error("Error fetching settings:", error);
    return <div>Error loading settings.</div>;
  }

  // 2. Helper to find specific config by key
  const getConfig = (key: string) =>
    configs?.find((c) => c.key === key)?.value || {};

  // 3. Extract values based on your JSON structure
  const maintenance = getConfig("maintenance_mode");
  const security = getConfig("security_policy");

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-bold mb-6">System Configuration</h1>

      {/* --- MAINTENANCE MODE CARD --- */}
      <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
        <h2 className="text-lg font-semibold mb-4 text-red-600">
          Maintenance Mode
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          When enabled, only admins can access the site. Public users will see a
          maintenance page.
        </p>

        <form action={toggleMaintenanceMode}>
          <div className="flex items-center space-x-3">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="enabled"
                className="sr-only peer"
                defaultChecked={maintenance.enabled} // Matches JSON {"enabled": boolean}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
              <span className="ml-3 text-sm font-medium text-gray-900">
                Enable Maintenance Mode
              </span>
            </label>
            <button
              type="submit"
              className="ml-auto px-4 py-2 bg-gray-900 text-white text-sm rounded hover:bg-gray-800"
            >
              Save Change
            </button>
          </div>
        </form>
      </div>

      {/* --- SECURITY SETTINGS CARD --- */}
      <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">
          Security Policies
        </h2>

        <form action={saveSecuritySettings} className="space-y-4">
          {/* Session Timeout */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Session Timeout (Minutes)
            </label>
            <input
              type="number"
              name="session_timeout"
              defaultValue={security.session_timeout} // Matches JSON {"session_timeout": number}
              className="w-full max-w-xs p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Auto-logout inactive users after this time.
            </p>
          </div>

          {/* Password Expiry */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password Expiry (Days)
            </label>
            <input
              type="number"
              name="password_expiry"
              defaultValue={security.password_expiry} // Matches JSON {"password_expiry": number}
              className="w-full max-w-xs p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* 2FA Toggle */}
          <div className="pt-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                name="require_2fa"
                defaultChecked={security.require_2fa} // Matches JSON {"require_2fa": boolean}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Enforce Two-Factor Authentication (2FA) for Staff
              </span>
            </label>
          </div>

          <div className="pt-4 border-t">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700"
            >
              Update Security Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
