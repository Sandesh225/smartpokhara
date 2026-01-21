// ═══════════════════════════════════════════════════════════
// app/(protected)/admin/settings/sla/page.tsx
// ═══════════════════════════════════════════════════════════

import Link from "next/link";
import { ArrowLeft, Clock } from "lucide-react";
import SLAConfigurator from "../_components/SLAConfigurator";
import { Button } from "@/components/ui/button";

export default function SLAPage() {
  return (
    <div className="space-y-4 md:space-y-6 px-2 sm:px-4 lg:px-6 py-4 md:py-6">
      {/* HEADER */}
      <div className="flex items-center gap-3 md:gap-4">
        <Button variant="ghost" size="icon" asChild className="flex-shrink-0">
          <Link href="/admin/settings">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Clock className="w-5 h-5 md:w-6 md:h-6 text-primary" />
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-foreground tracking-tighter">
            Service Level Agreements
          </h1>
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-4xl">
        <SLAConfigurator />
      </div>
    </div>
  );
}
