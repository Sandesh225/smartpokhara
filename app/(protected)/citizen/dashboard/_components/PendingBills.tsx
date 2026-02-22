"use client";

import { type ComponentType, memo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { format } from "date-fns";
import {
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Clock,
  FileText,
  CreditCard,
  Calendar,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils/format";

interface Bill {
  id: string;
  bill_number: string;
  bill_type: string;
  description?: string;
  total_amount: number;
  due_date: string;
  status: string;
  is_overdue: boolean;
}

interface PendingBillsProps {
  bills: Bill[];
  totalPendingAmount?: number;
  loading?: boolean;
}

const BILL_TYPE_CONFIG: Record<string, { label: string; icon: ComponentType<any> }> = {
  property_tax: { label: "Property Tax", icon: FileText },
  water_bill: { label: "Water Bill", icon: TrendingUp },
  waste_management: { label: "Waste Management", icon: AlertCircle },
  business_license: { label: "Business License", icon: AlertCircle },
  parking_fine: { label: "Parking Fine", icon: AlertCircle },
  building_permit: { label: "Building Permit", icon: FileText },
  event_permit: { label: "Event Permit", icon: Calendar },
  other_fee: { label: "Other Fee", icon: DollarSign },
};

export default memo(function PendingBills({ bills, totalPendingAmount, loading = false }: PendingBillsProps) {
  const getDaysUntilDue = (dueDate: string) => {
    const diffTime = new Date(dueDate).getTime() - new Date().getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getBillTypeConfig = (billType: string) =>
    BILL_TYPE_CONFIG[billType] || { label: billType.replace(/_/g, " "), icon: FileText };

  const isBillOverdue = (bill: Bill) => bill.is_overdue || new Date(bill.due_date) < new Date();

  const computedTotal = bills.reduce((acc, bill) => acc + Number(bill.total_amount ?? 0), 0);
  const totalDue = totalPendingAmount ?? computedTotal;
  const overdueCount = bills.filter(isBillOverdue).length;

  if (loading) {
    return (
      <Card className="border border-border rounded-2xl overflow-hidden shadow-inner-sm">
        <CardHeader className="pb-3 bg-muted/20">
          <Skeleton className="h-4 w-32 rounded-full" />
          <Skeleton className="h-3 w-48 mt-2 rounded-full" />
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/95 backdrop-blur-sm border border-border/60 rounded-3xl overflow-hidden shadow-inner-lg transition-all duration-500 hover:shadow-xl group/card relative">
      <div className="absolute inset-0 bg-linear-to-b from-primary/5 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-700 pointer-events-none" />
      <CardHeader className="pb-6 border-b border-border/50 bg-muted/10 relative z-10">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="font-heading text-xs font-black uppercase tracking-wider text-foreground flex items-center gap-2.5">
              <div className="p-1.5 bg-primary/10 text-primary rounded-xl border border-primary/20">
                <CreditCard className="h-3.5 w-3.5" aria-hidden="true" />
              </div>
              Financial Obligations
            </CardTitle>
            <CardDescription className="font-sans text-xs font-bold uppercase tracking-widest text-muted-foreground opacity-60">
              Outstanding municipal levies
            </CardDescription>
          </div>
          {bills.length > 0 && totalDue > 0 && (
            <div className="text-right shrink-0">
              <p className="font-sans text-xs font-black text-muted-foreground uppercase tracking-widest mb-1">Total Payload</p>
              <p className="font-heading text-xl font-black text-foreground tabular-nums tracking-tighter">
                {formatCurrency(totalDue)}
              </p>
            </div>
          )}
        </div>

        {/* Overdue warning */}
        {overdueCount > 0 && (
          <div className="flex items-center gap-2.5 mt-5 px-4 py-3 rounded-xl border border-destructive/20 bg-destructive/10 animate-pulse shadow-inner-sm">
            <AlertCircle className="h-4 w-4 text-destructive shrink-0" aria-hidden="true" />
            <p className="font-sans text-xs font-black text-destructive uppercase tracking-widest">
              Critical: <span className="font-heading">{overdueCount}</span> {overdueCount === 1 ? 'Bill' : 'Bills'} breach deadline
            </p>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-0">
        {bills.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-5 rotate-3 shadow-inner-lg">
              <CheckCircle2 className="h-8 w-8 text-primary" aria-hidden="true" />
            </div>
            <h3 className="font-heading text-xs font-black uppercase tracking-widest text-foreground">Accounts Clear</h3>
            <p className="font-sans text-xs font-bold text-muted-foreground uppercase tracking-tight mt-1 px-8 opacity-60">You have no outstanding municipal dues at this moment</p>
            <Button variant="outline" size="sm" asChild className="mt-8 rounded-xl h-10 px-6 font-heading text-xs font-black uppercase tracking-widest border-border hover:bg-muted shadow-inner-sm transition-all active:scale-95">
              <Link href="/citizen/payments">
                View Ledger
                <ArrowUpRight className="ml-2 h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-border/40" role="list" aria-label="Pending bills">
            {bills.slice(0, 3).map((bill, index) => {
              const config = getBillTypeConfig(bill.bill_type);
              const BillIcon = config.icon;
              const daysUntilDue = getDaysUntilDue(bill.due_date);
              const overdue = isBillOverdue(bill);
              const urgentSoon = !overdue && daysUntilDue <= 3;

              return (
                <motion.div
                  key={bill.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
                  role="listitem"
                  className="relative"
                >
                  <div className={cn(
                    "flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 transition-all duration-500",
                    "hover:bg-muted/40 group outline-none focus-within:bg-muted/50 rounded-2xl mx-2 my-1"
                  )}>
                    <div className="absolute inset-0 bg-linear-to-r from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none" />
                    <div className="flex items-center gap-4 min-w-0 flex-1 relative z-10">
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-inner-sm border border-border/50 transition-all duration-500 group-hover:scale-110",
                        overdue ? "bg-destructive/10 text-destructive rotate-3 group-hover:rotate-6" : "bg-background text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary group-hover:-rotate-3"
                      )}>
                        <BillIcon className="h-5 w-5 transition-transform duration-500 group-hover:scale-110" aria-hidden="true" />
                      </div>
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-heading text-xs font-black uppercase tracking-widest text-foreground truncate">
                            {config.label}
                          </p>
                          {overdue ? (
                            <Badge className="bg-destructive text-destructive-foreground font-sans text-xs font-black uppercase tracking-widest h-4 px-2.5 rounded-full border-none shadow-inner-sm animate-pulse">
                              Critical
                            </Badge>
                          ) : urgentSoon ? (
                            <Badge className="bg-secondary/20 text-secondary border-secondary/30 font-sans text-xs font-black uppercase tracking-widest h-4 px-2.5 rounded-full">
                              Due in <span className="font-heading ml-0.5">{daysUntilDue}d</span>
                            </Badge>
                          ) : null}
                        </div>
                        <p className="font-sans text-xs font-bold text-muted-foreground uppercase tracking-tight opacity-70">
                          Invoice <span className="font-heading">#{bill.bill_number}</span> · <span className="text-foreground/60">{format(new Date(bill.due_date), "MMM d, yyyy")}</span>
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between sm:justify-end gap-6 shrink-0 pl-16 sm:pl-0 relative z-10">
                      <span className="font-heading text-base font-black text-foreground tabular-nums tracking-tight group-hover:text-primary transition-colors">
                        {formatCurrency(Number(bill.total_amount))}
                      </span>
                      <Button size="sm" asChild className="h-9 px-5 rounded-xl font-heading text-xs font-black uppercase tracking-widest bg-primary text-primary-foreground hover:bg-primary/90 shadow-inner-sm hover:shadow-md transition-all duration-300 hover:scale-105 active:scale-95 animate-fade-in origin-right">
                        <Link href={`/citizen/payments/${bill.id}`}>
                          Initiate Pay
                        </Link>
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </CardContent>

      {bills.length > 0 && (
        <CardFooter className="border-t border-border/50 bg-muted/10 px-6 py-4">
          <Button variant="ghost" size="sm" asChild className="w-full text-xs font-black uppercase tracking-wider text-muted-foreground hover:text-primary hover:bg-transparent transition-colors group">
            <Link href="/citizen/payments" className="flex items-center justify-center gap-2">
              Access Full Financial History
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
            </Link>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
});
