"use client";

import { UniversalCombobox } from "@/components/ui/UniversalCombobox";
import { Label } from "@/components/ui/label";

interface AudienceSelectorProps {
  value: string;
  onChange: (value: string) => void;
  wards: any[];
}

export function AudienceSelector({ value, onChange, wards }: AudienceSelectorProps) {
  const items = [
      { id: 'public', value: 'public', label: 'Public (All Citizens)' },
      { id: 'internal', value: 'internal', label: 'Internal Staff Only' },
      ...wards.map(w => ({
          id: w.id.toString(),
          value: w.id.toString(),
          label: `Ward ${w.ward_number}`,
          metadata: { type: 'ward' }
      }))
  ];

  return (
    <div className="space-y-2">
       <Label>Target Audience</Label>
       <UniversalCombobox
          items={items}
          value={value}
          onChange={onChange}
          placeholder="Select audience"
       />
    </div>
  );
}