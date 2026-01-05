'use client';

import { AlertTriangle, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { updateSystemConfig } from '../actions';

export default function MaintenanceMode({ enabled }: { enabled: boolean }) {
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    await updateSystemConfig("maintenance_mode", { enabled: !enabled });
    setLoading(false);
  };

  return (
    <div className={`stone-card p-6 border transition-colors ${enabled ? 'border-red-200 bg-red-50' : 'border-amber-200 bg-amber-50'}`}>
      <div className="flex items-start gap-4">
        <AlertTriangle className={`w-8 h-8 shrink-0 ${enabled ? 'text-red-600' : 'text-amber-600'}`} />
        <div className="flex-1">
          <h3 className={`font-bold ${enabled ? 'text-red-900' : 'text-amber-900'}`}>
            Maintenance Mode
          </h3>
          <p className={`text-sm mt-1 mb-4 ${enabled ? 'text-red-800' : 'text-amber-800'}`}>
            {enabled 
              ? "System is currently LOCKED. Only admins can access." 
              : "System is running normally. Activating this will lock the Citizen Portal."}
          </p>
          <button 
            onClick={handleToggle}
            disabled={loading}
            className={`relative inline-flex items-center cursor-pointer disabled:opacity-50`}
          >
            <div className={`w-11 h-6 rounded-full peer-focus:outline-none ring-4 transition-colors ${
              enabled 
                ? 'bg-red-600 ring-red-300' 
                : 'bg-gray-300 ring-amber-300 peer-focus:ring-4'
            }`}>
              <div className={`absolute top-[2px] left-[2px] bg-white border border-gray-300 rounded-full h-5 w-5 transition-all ${
                enabled ? 'translate-x-full border-white' : ''
              }`}></div>
            </div>
            <span className={`ms-3 text-sm font-medium ${enabled ? 'text-red-900' : 'text-amber-900'}`}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin"/> : (enabled ? "Enabled" : "Disabled")}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}