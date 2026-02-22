// ═══════════════════════════════════════════════════════════
// app/admin/citizens/_components/CitizenWalletView.tsx
// ═══════════════════════════════════════════════════════════

"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Wallet, Receipt, Clock, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

import { PaymentHistoryItem } from "@/features/users/types";

interface CitizenWalletViewProps {
  bills: PaymentHistoryItem[];
}

export default function CitizenWalletView({ bills }: CitizenWalletViewProps) {
  const stats = {
    total: bills.length,
    pending: bills.filter((b) => b.status === "pending").length,
    paid: bills.filter((b) => b.status === "completed").length,
    overdue: bills.filter((b) => {
      if (b.status === "completed") return false;
      if (!b.due_date) return false;
      const dueDate = new Date(b.due_date);
      return dueDate < new Date();
    }).length,
  };

  const totalAmount = bills.reduce((sum, b) => sum + (b.total_amount || 0), 0);
  const paidAmount = bills
    .filter((b) => b.status === "completed")
    .reduce((sum, b) => sum + (b.total_amount || 0), 0);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      <WalletCard
        label="Total Bills"
        value={stats.total.toString()}
        icon={Receipt}
        color="text-primary"
        bg="bg-primary/10"
      />
      <WalletCard
        label="Pending"
        value={stats.pending.toString()}
        icon={Clock}
        color="text-warning-amber"
        bg="bg-warning-amber/10"
      />
      <WalletCard
        label="Paid"
        value={stats.paid.toString()}
        icon={CheckCircle2}
        color="text-success-green"
        bg="bg-success-green/10"
      />
      <WalletCard
        label="Overdue"
        value={stats.overdue.toString()}
        icon={Wallet}
        color="text-error-red"
        bg="bg-error-red/10"
      />
    </div>
  );
}

function WalletCard({
  label,
  value,
  icon: Icon,
  color,
  bg,
}: {
  label: string;
  value: string;
  icon: any;
  color: string;
  bg: string;
}) {
  return (
    <Card className="stone-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
      <CardContent className="p-4 flex items-center justify-between">
        <div>
          <p className="text-xs md:text-sm font-bold text-muted-foreground uppercase tracking-wider">
            {label}
          </p>
          <p className="text-xl md:text-2xl font-black text-foreground mt-0.5">
            {value}
          </p>
        </div>
        <div
          className={cn(
            "p-2 md:p-2.5 rounded-lg md:rounded-xl group-hover:scale-110 transition-transform",
            bg
          )}
        >
          <Icon className={cn("w-4 h-4 md:w-5 md:h-5", color)} />
        </div>
      </CardContent>
    </Card>
  );
}
