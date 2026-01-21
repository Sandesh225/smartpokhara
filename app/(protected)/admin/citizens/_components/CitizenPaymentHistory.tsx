"use client";

import { format } from "date-fns";
import { CreditCard, Receipt, Calendar, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

interface Payment {
  id: string;
  bill_type: string;
  bill_number: string;
  total_amount: number;
  status: string;
  generated_date: string;
}

interface CitizenPaymentHistoryProps {
  payments: Payment[];
}

export default function CitizenPaymentHistory({
  payments,
}: CitizenPaymentHistoryProps) {
  return (
    <div className="stone-card overflow-hidden h-auto">
      {/* Header */}
      <div className="px-4 md:px-6 py-3 md:py-4 border-b-2 border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <Receipt className="w-4 h-4 md:w-5 md:h-5 text-primary" />
          </div>
          <h3 className="text-base md:text-lg font-black text-foreground tracking-tight">
            Billing & Payments
          </h3>
        </div>
      </div>

      {/* Content */}
      <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
        {payments.length === 0 ? (
          <div className="p-8 md:p-12 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-full bg-muted mb-3 md:mb-4">
              <CreditCard className="w-6 h-6 md:w-8 md:h-8 text-muted-foreground" />
            </div>
            <p className="text-sm md:text-base text-muted-foreground font-medium">
              No billing history available.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 sticky top-0 z-10">
                <tr className="border-b-2 border-border">
                  <th className="px-4 md:px-6 py-2.5 md:py-3 text-left">
                    <span className="text-[10px] md:text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      Bill Type
                    </span>
                  </th>
                  <th className="px-4 md:px-6 py-2.5 md:py-3 text-left">
                    <span className="text-[10px] md:text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      Amount
                    </span>
                  </th>
                  <th className="px-4 md:px-6 py-2.5 md:py-3 text-left">
                    <span className="text-[10px] md:text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      Status
                    </span>
                  </th>
                  <th className="px-4 md:px-6 py-2.5 md:py-3 text-left">
                    <span className="text-[10px] md:text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      Due Date
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {payments.map((payment) => (
                  <tr
                    key={payment.id}
                    className="hover:bg-accent/50 transition-colors duration-150"
                  >
                    <td className="px-4 md:px-6 py-3 md:py-4">
                      <div className="font-bold text-foreground capitalize text-sm md:text-base">
                        {payment.bill_type.replace(/_/g, " ")}
                      </div>
                      <div className="text-[10px] md:text-xs text-muted-foreground font-mono mt-0.5">
                        #{payment.bill_number}
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-3 md:py-4">
                      <div className="flex items-center gap-1.5">
                        <DollarSign className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="font-black text-foreground text-sm md:text-base">
                          NPR {payment.total_amount.toLocaleString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-3 md:py-4">
                      {payment.status === "completed" ||
                      payment.status === "paid" ? (
                        <span className="inline-flex items-center gap-1 text-[10px] md:text-xs font-bold text-success-green bg-success-green/10 px-2 md:px-2.5 py-1 md:py-1.5 rounded-md border border-success-green/20">
                          <div className="w-1.5 h-1.5 rounded-full bg-success-green animate-pulse" />
                          Paid
                        </span>
                      ) : payment.status === "pending" ? (
                        <span className="inline-flex items-center gap-1 text-[10px] md:text-xs font-bold text-warning-amber bg-warning-amber/10 px-2 md:px-2.5 py-1 md:py-1.5 rounded-md border border-warning-amber/20 capitalize">
                          <div className="w-1.5 h-1.5 rounded-full bg-warning-amber animate-pulse" />
                          {payment.status}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] md:text-xs font-bold text-error-red bg-error-red/10 px-2 md:px-2.5 py-1 md:py-1.5 rounded-md border border-error-red/20 capitalize">
                          <div className="w-1.5 h-1.5 rounded-full bg-error-red" />
                          {payment.status}
                        </span>
                      )}
                    </td>
                    <td className="px-4 md:px-6 py-3 md:py-4">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Calendar className="w-3.5 h-3.5" />
                        <span className="text-xs md:text-sm font-medium">
                          {format(
                            new Date(payment.generated_date),
                            "MMM d, yyyy"
                          )}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
