import { MapPin } from "lucide-react";
import { formatDistance } from "@/lib/utils/location-helpers";

interface Props {
  address: string;
  distanceMeters: number | null;
}

export function DistanceIndicator({ address, distanceMeters }: Props) {
  return (
    <div className="flex items-start gap-1.5 text-xs text-gray-600">
      <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
      <div className="flex flex-col">
        <span className="truncate max-w-[200px]">{address || "No address"}</span>
        {distanceMeters !== null && (
          <span className="text-blue-600 font-medium">{formatDistance(distanceMeters)} away</span>
        )}
      </div>
    </div>
  );
}