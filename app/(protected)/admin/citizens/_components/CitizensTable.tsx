// ═══════════════════════════════════════════════════════════
// app/admin/citizens/_components/CitizensTable.tsx
// ═══════════════════════════════════════════════════════════

"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Eye, Users, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CitizensTable({ data }: { data: any[] }) {
  if (data.length === 0) {
    return (
      <div className="stone-card border-2 border-dashed py-12 md:py-16 text-center">
        <Users className="w-12 h-12 md:w-16 md:h-16 text-muted-foreground mx-auto mb-4 opacity-20" />
        <h3 className="text-sm md:text-base font-bold text-foreground uppercase tracking-wider">
          No Citizens Found
        </h3>
        <p className="text-xs md:text-sm text-muted-foreground mt-2">
          Adjust your search to find citizens
        </p>
      </div>
    );
  }

  return (
    <>
      {/* DESKTOP TABLE */}
      <div className="hidden lg:block stone-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                  Full Name
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                  Ward
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                  Joined
                </th>
                <th className="px-4 py-3 text-right text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.map((citizen) => (
                <tr
                  key={citizen.id}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-3 font-bold text-foreground">
                    {citizen.profile?.full_name || "N/A"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {citizen.email}
                  </td>
                  <td className="px-4 py-3">
                    {citizen.profile?.ward_id ? (
                      <Badge
                        variant="outline"
                        className="bg-primary/10 text-primary border-primary/30"
                      >
                        Ward {citizen.profile.ward_id}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-xs">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge isActive={citizen.is_active} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {format(new Date(citizen.created_at), "MMM d, yyyy")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/admin/citizens/${citizen.id}`}>
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MOBILE CARDS */}
      <div className="lg:hidden space-y-3">
        {data.map((citizen) => (
          <div key={citizen.id} className="stone-card p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-foreground truncate">
                  {citizen.profile?.full_name || "N/A"}
                </h3>
                <p className="text-sm text-muted-foreground truncate">
                  {citizen.email}
                </p>
              </div>
              <Button variant="ghost" size="icon-sm" asChild>
                <Link href={`/admin/citizens/${citizen.id}`}>
                  <Eye className="w-4 h-4" />
                </Link>
              </Button>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {citizen.profile?.ward_id && (
                <Badge
                  variant="outline"
                  className="text-xs bg-primary/10 text-primary border-primary/30"
                >
                  <MapPin className="w-3 h-3 mr-1" />
                  Ward {citizen.profile.ward_id}
                </Badge>
              )}
              <StatusBadge isActive={citizen.is_active} />
              <span className="text-xs text-muted-foreground">
                {format(new Date(citizen.created_at), "MMM d, yyyy")}
              </span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
        isActive
          ? "bg-success-green/10 text-success-green border-success-green/30"
          : "bg-error-red/10 text-error-red border-error-red/30"
      )}
    >
      {isActive ? "Active" : "Inactive"}
    </span>
  );
}
