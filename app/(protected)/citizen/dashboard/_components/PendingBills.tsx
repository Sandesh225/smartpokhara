"use client";

import { type ComponentType, memo } from "react";
import Link from "next/link";
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
      <Card className="border border-border rounded-2xl overflow-hidden shadow-sm">
        <CardHeader className="pb-3 bg-muted">
          <Skeleton className="h-4 w-32 rounded-full" />
          <Skeleton className="h-3 w-48 mt-2 rounded-full" />
        </CardHeader>
        <CardContent className="space-y-4 p-5 sm:p-6">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm transition-all duration-200 hover:shadow-md">
      <CardHeader className="pb-4 border-b border-border">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-foreground flex items-center gap-2.5">
              <div className="p-1.5 bg-primary text-primary-foreground rounded-xl">
                <CreditCard className="h-3.5 w-3.5" aria-hidden="true" />
              </div>
              Financial Obligations
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Outstanding municipal levies
            </CardDescription>
          </div>
          {bills.length > 0 && totalDue > 0 && (
            <div className="text-right shrink-0">
              <p className="text-xs font-medium text-muted-foreground mb-1">Total Due</p>
              <p className="text-xl font-bold text-foreground tabular-nums tracking-tight">
                {formatCurrency(totalDue)}
              </p>
            </div>
          )}
        </div>

        {overdueCount > 0 && (
          <div className="flex items-center gap-2.5 mt-4 px-4 py-3 rounded-xl border border-destructive bg-destructive text-destructive-foreground animate-pulse shadow-xs">
            <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
            <p className="text-xs font-bold">
              {overdueCount} {overdueCount === 1 ? 'bill' : 'bills'} past due
            </p>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-0">
        {bills.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <CheckCircle2 className="h-7 w-7 text-primary" aria-hidden="true" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">All Clear</h3>
            <p className="text-xs text-muted-foreground mt-1 px-8">No outstanding municipal dues</p>
            <Button variant="outline" size="sm" asChild className="mt-6 rounded-xl">
              <Link href="/citizen/payments">
                View History
                <ArrowUpRight className="ml-2 h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-border" role="list" aria-label="Pending bills">
            {bills.slice(0, 3).map((bill, index) => {
              const config = getBillTypeConfig(bill.bill_type);
              const BillIcon = config.icon;
              const daysUntilDue = getDaysUntilDue(bill.due_date);
              const overdue = isBillOverdue(bill);
              const urgentSoon = !overdue && daysUntilDue <= 3;

              return (
                <div
                  key={bill.id}
                  role="listitem"
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 75}ms` }}
                >
                  <div className={cn(
                    "flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 transition-all duration-200",
                    "hover:bg-muted/50 group"
                  )}>
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-border/50 transition-colors duration-200",
                        overdue ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                      )}>
                        <BillIcon className="h-4 w-4" aria-hidden="true" />
                      </div>
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-medium text-foreground truncate">
                            {config.label}
                          </p>
                          {overdue ? (
                            <Badge className="bg-destructive text-destructive-foreground text-xs font-bold h-4 px-2 rounded-full border-none animate-pulse">
                              Overdue
                            </Badge>
                          ) : urgentSoon ? (
                            <Badge className="bg-secondary/20 text-secondary border-secondary/30 text-xs font-medium h-4 px-2 rounded-full">
                              Due in {daysUntilDue}d
                            </Badge>
                          ) : null}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          #{bill.bill_number} · {format(new Date(bill.due_date), "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pl-14 sm:pl-0">
                      <span className="text-base font-bold text-foreground tabular-nums group-hover:text-primary transition-colors duration-200">
                        {formatCurrency(Number(bill.total_amount))}
                      </span>
                      <Button size="sm" asChild className="h-9 px-4 rounded-xl shadow-xs hover:shadow-sm transition-all duration-200 active:scale-[0.98]">
                        <Link href={`/citizen/payments/${bill.id}`}>
                          Pay Now
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>

      {bills.length > 0 && (
        <CardFooter className="border-t border-border px-5 sm:px-6 py-4">
          <Button variant="ghost" size="sm" asChild className="w-full text-xs font-medium text-muted-foreground hover:text-primary transition-colors group">
            <Link href="/citizen/payments" className="flex items-center justify-center gap-2">
              View Full History
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
            </Link>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
});
