'use client';

import { useState } from "react";
import { updateSystemConfig } from "../actions";
import { Loader2 } from "lucide-react";

interface LocalizationConfig {
  language: string;
  timezone: string;
}

export default function LocalizationSettings({ initialData }: { initialData: LocalizationConfig }) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    await updateSystemConfig("localization", {
      language: formData.get("language"),
      timezone: formData.get("timezone"),
    });
    setLoading(false);
  };

  return (
    <form action={handleSubmit} className="stone-card p-6">
      <h3 className="font-bold mb-4 text-foreground">Localization</h3>
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium block mb-1 text-foreground">System Language</label>
          <select name="language" defaultValue={initialData.language} className="dept-input-base w-full">
            <option value="en">English (US)</option>
            <option value="ne">Nepali (Unicode)</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium block mb-1 text-foreground">Timezone</label>
          <select name="timezone" defaultValue={initialData.timezone} className="dept-input-base w-full">
            <option value="Asia/Kathmandu">Asia/Kathmandu (GMT+5:45)</option>
            <option value="UTC">UTC (GMT+0:00)</option>
          </select>
        </div>
      </div>
      <div className="mt-4 flex justify-end">
        <button disabled={loading} className="px-4 py-2 bg-primary text-white text-sm font-medium rounded hover:bg-primary/90 flex items-center">
          {loading && <Loader2 className="w-3 h-3 mr-2 animate-spin" />}
          Save
        </button>
      </div>
    </form>
  );
}