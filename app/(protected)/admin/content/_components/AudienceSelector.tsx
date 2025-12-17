"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface AudienceSelectorProps {
  value: string;
  onChange: (value: string) => void;
  wards: any[];
}

export function AudienceSelector({ value, onChange, wards }: AudienceSelectorProps) {
  return (
    <div className="space-y-2">
       <Label>Target Audience</Label>
       <Select value={value} onValueChange={onChange}>
          <SelectTrigger>
             <SelectValue placeholder="Select audience" />
          </SelectTrigger>
          <SelectContent>
             <SelectItem value="public">Public (All Citizens)</SelectItem>
             <SelectItem value="internal">Internal Staff Only</SelectItem>
             <div className="p-1">
                <p className="text-xs text-gray-400 px-2 py-1 font-semibold">Specific Wards</p>
                {wards.map(w => (
                    <SelectItem key={w.id} value={w.id}>Ward {w.ward_number}</SelectItem>
                ))}
             </div>
          </SelectContent>
       </Select>
    </div>
  );
}