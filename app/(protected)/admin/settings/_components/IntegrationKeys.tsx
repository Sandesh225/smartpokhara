"use client";
import { Eye, EyeOff, Key } from "lucide-react";
import { useState } from "react";

const KeyField = ({ label, value }: { label: string; value: string }) => {
  const [visible, setVisible] = useState(false);
  return (
    <div className="mb-4">
      <label className="block text-sm font-semibold mb-1.5">{label}</label>
      <div className="relative">
        <input
          type="text"
          value={visible ? value : "•".repeat(24)}
          readOnly
          className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-input bg-neutral-stone-50 font-mono text-sm"
        />
        <Key className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
        <button
          type="button"
          onClick={() => setVisible(!visible)}
          className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
        >
          {visible ? (
            <EyeOff className="w-4 h-4" />
          ) : (
            <Eye className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
};

export default function IntegrationKeys() {
  return (
    <div className="stone-card p-6">
      <h3 className="font-bold text-lg text-foreground mb-6">
        API & Integration Keys
      </h3>
      <KeyField
        label="Google Maps API Key"
        value="AIzaSyD-fake-key-value-12345"
      />
      <KeyField
        label="SMS Gateway Token (Sparrow SMS)"
        value="v2_live_fake_token_xyz"
      />
      <KeyField
        label="Email Service (SendGrid/AWS)"
        value="SG.fake_key_value_abcdef"
      />
      <div className="mt-4 flex justify-end">
        <button className="px-4 py-2 bg-primary text-white text-sm rounded font-medium">
          Rotate Keys
        </button>
      </div>
    </div>
  );
}
