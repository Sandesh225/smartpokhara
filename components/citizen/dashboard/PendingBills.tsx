"use client"

import { useState, type ComponentType } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { format } from "date-fns"
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
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
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

const BILL_TYPE_CONFIG: Record<
  string,
  {
    label: string;
    icon: ComponentType<any>;
    color: string;
  }
> = {
  property_tax: {
    label: "Property Tax",
    icon: FileText,
    color: "bg-primary",
  },
  water_bill: {
    label: "Water Bill",
    icon: TrendingUp,
    color: "bg-secondary",
  },
  waste_management: {
    label: "Waste Management",
    icon: AlertCircle,
    color: "bg-success",
  },
  business_license: {
    label: "Business License",
    icon: AlertCircle,
    color: "bg-accent",
  },
  parking_fine: {
    label: "Parking Fine",
    icon: AlertCircle,
    color: "bg-warning",
  },
  building_permit: {
    label: "Building Permit",
    icon: FileText,
    color: "bg-primary",
  },
  event_permit: {
    label: "Event Permit",
    icon: Calendar,
    color: "bg-accent",
  },
  other_fee: {
    label: "Other Fee",
    icon: DollarSign,
    color: "bg-muted-foreground",
  },
};

export default function PendingBills({
  bills,
  totalPendingAmount,
  loading = false,
}: PendingBillsProps) {
  const [selectedBill, setSelectedBill] = useState<string | null>(null);

  /* Local formatCurrency removed */
  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getBillTypeConfig = (billType: string) => {
    return (
      BILL_TYPE_CONFIG[billType] || {
        label: billType.replace("_", " "),
        icon: FileText,
        color: "bg-muted-foreground",
      }
    );
  };

  const isBillOverdue = (bill: Bill) =>
    bill.is_overdue || new Date(bill.due_date) < new Date();

  const computedTotal = bills.reduce(
    (acc, bill) => acc + Number(bill.total_amount ?? 0),
    0
  );
  const totalDue = totalPendingAmount ?? computedTotal;

  const overdueCount = bills.filter(isBillOverdue).length;
  const onTimeCount = bills.length - overdueCount;

  if (loading) {
    return (
      <Card className="border-2 border-border shadow-sm">
        <CardHeader className="pb-3">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-4 w-48 mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-24 w-full rounded-2xl" />
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
          <Skeleton className="h-3 w-full mt-6" />
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <Card
        className="stone-card hover:shadow-lg transition-all duration-300"
        role="region"
        aria-label="Pending bills summary"
      >
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <CardTitle className="text-xl sm:text-2xl flex items-center gap-3">
                <div className="p-2.5 bg-warning/10 rounded-xl">
                  <CreditCard
                    className="h-5 w-5 text-warning"
                    aria-hidden="true"
                  />
                </div>
                <span className="font-bold">Pending Bills</span>
              </CardTitle>
              <CardDescription className="text-sm font-medium">
                Outstanding municipal payments and fees
              </CardDescription>
            </div>
            <div className="text-right space-y-2 shrink-0">
              <Badge
                variant="outline"
                className="gap-2 justify-center font-bold px-3 py-1 border-2"
              >
                <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                {bills.length} pending
              </Badge>
              {totalDue > 0 && (
                <div className="text-xs space-y-1">
                  <span className="block text-muted-foreground font-bold uppercase tracking-widest text-[10px]">
                    Total Due
                  </span>
                  <span className="font-bold text-xl text-warning tabular-nums tracking-tight">
                    {formatCurrency(totalDue)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {bills.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center justify-center py-12 px-4 text-center bg-linear-to-br from-success/10 via-success/5 to-success/10 rounded-2xl border-2 border-success/30 border-dashed"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="p-5 bg-linear-to-br from-success to-secondary rounded-2xl shadow-xl mb-4"
              >
                <CheckCircle2
                  className="h-12 w-12 text-white"
                  aria-hidden="true"
                />
              </motion.div>
              <h3 className="font-bold text-success text-lg sm:text-xl mb-1">
                All caught up!
              </h3>
              <p className="text-sm text-success/80 mb-5 max-w-xs">
                You have no pending bills. Great job staying on top of your
                payments!
              </p>
              <Button
                variant="outline"
                size="sm"
                asChild
                className="border-success/30 text-success hover:bg-success/10 transition-colors bg-transparent"
              >
                <Link href="/citizen/payments">
                  View Payment History
                  <ArrowUpRight
                    className="ml-2 h-3.5 w-3.5"
                    aria-hidden="true"
                  />
                </Link>
              </Button>
            </motion.div>
          ) : (
            <>
              {/* Total Summary Card */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="bg-linear-to-br from-primary/10 via-primary/5 to-primary/10 border-2 border-primary/30 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-primary/10 rounded-xl shadow-sm">
                        <DollarSign
                          className="h-6 w-6 text-primary"
                          aria-hidden="true"
                        />
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground text-base sm:text-lg">
                          Total Pending
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          All outstanding bills
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl sm:text-3xl font-black text-foreground tabular-nums tracking-tight">
                        {formatCurrency(totalDue)}
                      </div>
                      <p className="text-xs text-muted-foreground font-medium mt-1">
                        {bills.length} bill{bills.length > 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>

                  {overdueCount > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="flex items-start gap-2 mt-4 p-3 bg-destructive/10 border-2 border-destructive/30 rounded-xl"
                    >
                      <AlertCircle
                        className="h-4 w-4 text-destructive shrink-0 mt-0.5 animate-pulse"
                        aria-hidden="true"
                      />
                      <p className="text-xs text-destructive font-medium leading-relaxed">
                        <span className="font-bold">
                          {overdueCount} overdue bill
                          {overdueCount > 1 ? "s" : ""}.
                        </span>{" "}
                        Please pay as soon as possible to avoid penalties.
                      </p>
                    </motion.div>
                  )}
                </div>
              </motion.div>

              {/* Bills List */}
              <div
                className="space-y-3"
                role="list"
                aria-label="List of pending bills"
              >
                {bills.slice(0, 3).map((bill, index) => {
                  const billTypeConfig = getBillTypeConfig(bill.bill_type);
                  const BillTypeIcon = billTypeConfig.icon;
                  const daysUntilDue = getDaysUntilDue(bill.due_date);
                  const overdue = isBillOverdue(bill);
                  const isUrgent = !overdue && daysUntilDue <= 3;
                  const isSelected = selectedBill === bill.id;

                  return (
                    <motion.div
                      key={bill.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        duration: 0.3,
                        delay: index * 0.1,
                        ease: "easeOut",
                      }}
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedBill(bill.id)}
                      className={cn(
                        "cursor-pointer p-4 border-2 rounded-xl transition-all duration-300",
                        isSelected
                          ? "border-primary bg-primary/5 shadow-md scale-[1.01]"
                          : "border-border hover:border-primary/50 hover:bg-muted/50 hover:shadow-sm",
                        overdue &&
                          "border-destructive/30 bg-destructive/5 hover:bg-destructive/10"
                      )}
                      role="listitem"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setSelectedBill(bill.id);
                        }
                      }}
                      aria-label={`${billTypeConfig.label} bill, ${formatCurrency(Number(bill.total_amount))}, due ${format(new Date(bill.due_date), "MMMM d, yyyy")}`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div
                            className={cn(
                              "p-2.5 rounded-xl shrink-0 shadow-sm",
                              `${billTypeConfig.color}/10`
                            )}
                          >
                            <BillTypeIcon
                              className={cn(
                                "h-5 w-5",
                                billTypeConfig.color.replace("bg-", "text-")
                              )}
                              aria-hidden="true"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap mb-1.5">
                              <h4 className="font-semibold text-sm sm:text-base">
                                {billTypeConfig.label}
                              </h4>
                              {overdue ? (
                                <Badge
                                  variant="destructive"
                                  className="text-[10px] h-5 px-2 font-bold animate-pulse"
                                >
                                  Overdue
                                </Badge>
                              ) : isUrgent ? (
                                <Badge className="bg-warning/10 text-warning-foreground hover:bg-warning/10 text-[10px] h-5 px-2 font-medium">
                                  <Clock
                                    className="h-3 w-3 mr-1"
                                    aria-hidden="true"
                                  />
                                  Due in {daysUntilDue} day
                                  {daysUntilDue > 1 ? "s" : ""}
                                </Badge>
                              ) : null}
                            </div>
                            <p className="text-xs text-muted-foreground font-medium">
                              Bill #{bill.bill_number} • Due:{" "}
                              {format(new Date(bill.due_date), "MMM d, yyyy")}
                            </p>
                            {bill.description && (
                              <p className="text-xs text-muted-foreground mt-1.5 line-clamp-1 leading-relaxed">
                                {bill.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right min-w-[130px] shrink-0 space-y-2">
                          <div className="font-black text-base sm:text-lg tabular-nums">
                            {formatCurrency(Number(bill.total_amount))}
                          </div>
                          <Button
                            size="sm"
                            className="w-full shadow-sm hover:shadow-md transition-all"
                            asChild
                          >
                            <Link href={`/citizen/payments/${bill.id}`}>
                              <CreditCard
                                className="h-3 w-3 mr-1.5"
                                aria-hidden="true"
                              />
                              Pay Now
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Payment Status Progress */}
              <div className="pt-5 border-t space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground">
                    Payment Status
                  </span>
                  <Badge
                    variant="outline"
                    className="text-xs font-medium px-2.5 py-1"
                  >
                    {onTimeCount}/{bills.length} not overdue
                  </Badge>
                </div>
                <Progress
                  value={bills.length ? (onTimeCount / bills.length) * 100 : 0}
                  className="h-2.5"
                  aria-label={`${onTimeCount} out of ${bills.length} bills are not overdue`}
                />
              </div>
            </>
          )}
        </CardContent>

        {bills.length > 0 && (
          <CardFooter className="border-t px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <Button
              variant="outline"
              className="w-full sm:w-auto bg-transparent hover:bg-primary/5 transition-colors font-semibold"
              asChild
            >
              <Link href="/citizen/payments">
                View and Pay All Bills
                <ArrowUpRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button
              variant="link"
              size="sm"
              className="justify-start sm:justify-center hover:text-primary transition-colors"
              asChild
            >
              <Link href="/citizen/payments">View Payment History</Link>
            </Button>
          </CardFooter>
        )}
      </Card>
    </motion.div>
  );
}
