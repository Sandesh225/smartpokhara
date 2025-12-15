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

interface Bill {
  id: string
  bill_number: string
  bill_type: string
  description?: string
  total_amount: number
  due_date: string
  status: string
  is_overdue: boolean
}

interface PendingBillsProps {
  bills: Bill[]
  totalPendingAmount?: number
  loading?: boolean
}

const BILL_TYPE_CONFIG: Record<
  string,
  {
    label: string
    icon: ComponentType<any>
    color: string
  }
> = {
  property_tax: {
    label: "Property Tax",
    icon: FileText,
    color: "bg-blue-500",
  },
  water_bill: {
    label: "Water Bill",
    icon: TrendingUp,
    color: "bg-cyan-500",
  },
  waste_management: {
    label: "Waste Management",
    icon: AlertCircle,
    color: "bg-emerald-500",
  },
  business_license: {
    label: "Business License",
    icon: AlertCircle,
    color: "bg-purple-500",
  },
  parking_fine: {
    label: "Parking Fine",
    icon: AlertCircle,
    color: "bg-amber-500",
  },
  building_permit: {
    label: "Building Permit",
    icon: FileText,
    color: "bg-orange-500",
  },
  event_permit: {
    label: "Event Permit",
    icon: Calendar,
    color: "bg-pink-500",
  },
  other_fee: {
    label: "Other Fee",
    icon: DollarSign,
    color: "bg-gray-500",
  },
}

export default function PendingBills({ bills, totalPendingAmount, loading = false }: PendingBillsProps) {
  const [selectedBill, setSelectedBill] = useState<string | null>(null)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NP", {
      style: "currency",
      currency: "NPR",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date()
    const due = new Date(dueDate)
    const diffTime = due.getTime() - today.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const getBillTypeConfig = (billType: string) => {
    return (
      BILL_TYPE_CONFIG[billType] || {
        label: billType.replace("_", " "),
        icon: FileText,
        color: "bg-gray-500",
      }
    )
  }

  const isBillOverdue = (bill: Bill) => bill.is_overdue || new Date(bill.due_date) < new Date()

  const computedTotal = bills.reduce((acc, bill) => acc + Number(bill.total_amount ?? 0), 0)
  const totalDue = totalPendingAmount ?? computedTotal

  const overdueCount = bills.filter(isBillOverdue).length
  const onTimeCount = bills.length - overdueCount

  if (loading) {
    return (
      <Card className="border border-border">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-40 mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
          <Skeleton className="h-4 w-1/2" />
        </CardContent>
      </Card>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Card className="border border-border shadow-md" role="region" aria-label="Pending bills">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-amber-600" aria-hidden="true" />
                Pending Bills
              </CardTitle>
              <CardDescription>Outstanding municipal payments and fees</CardDescription>
            </div>
            <div className="text-right space-y-1">
              <Badge variant="outline" className="gap-1 justify-center">
                <Clock className="h-3 w-3" aria-hidden="true" />
                {bills.length} pending
              </Badge>
              {totalDue > 0 && (
                <div className="text-xs">
                  <span className="block text-muted-foreground">Total Due</span>
                  <span className="font-semibold text-amber-600">{formatCurrency(totalDue)}</span>
                </div>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {bills.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-50 rounded-2xl border-2 border-emerald-200 border-dashed">
              <div className="p-4 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-xl mb-3 animate-in fade-in-50 zoom-in-95 duration-500">
                <CheckCircle2 className="h-12 w-12 text-white" aria-hidden="true" />
              </div>
              <p className="font-bold text-emerald-900 text-lg">All caught up!</p>
              <p className="text-sm text-emerald-700 mt-1 mb-4">You have no pending bills.</p>
              <Button variant="link" size="sm" asChild className="text-emerald-700 hover:text-emerald-800">
                <Link href="/citizen/payments">View Payment History</Link>
              </Button>
            </div>
          ) : (
            <>
              <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                <div className="bg-gradient-to-r from-blue-50 via-cyan-50 to-blue-50 border-2 border-blue-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-blue-100 rounded-xl">
                        <DollarSign className="h-6 w-6 text-blue-600" aria-hidden="true" />
                      </div>
                      <div>
                        <h4 className="font-bold text-blue-900 text-base">Total Pending</h4>
                        <p className="text-xs text-blue-700">All outstanding bills</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-black text-blue-900 tabular-nums">{formatCurrency(totalDue)}</div>
                      <p className="text-xs text-blue-700 font-medium mt-0.5">
                        {bills.length} bill{bills.length > 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>

                  {overdueCount > 0 && (
                    <div className="flex items-center gap-2 mt-3 p-3 bg-rose-50 border-2 border-rose-200 rounded-xl">
                      <AlertCircle className="h-4 w-4 text-rose-600 flex-shrink-0" aria-hidden="true" />
                      <p className="text-xs text-rose-700 font-medium">
                        {overdueCount} overdue bill{overdueCount > 1 ? "s" : ""}. Please pay as soon as possible to
                        avoid penalties.
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Bills List */}
              <div className="space-y-3" role="list">
                {bills.slice(0, 3).map((bill, index) => {
                  const billTypeConfig = getBillTypeConfig(bill.bill_type)
                  const BillTypeIcon = billTypeConfig.icon
                  const daysUntilDue = getDaysUntilDue(bill.due_date)
                  const overdue = isBillOverdue(bill)
                  const isUrgent = !overdue && daysUntilDue <= 3

                  return (
                    <motion.div
                      key={bill.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.08 }}
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedBill(bill.id)}
                      className={`cursor-pointer p-4 border-2 rounded-xl transition-all ${
                        selectedBill === bill.id
                          ? "border-primary bg-primary/5 shadow-md"
                          : "border-border hover:border-primary/50 hover:bg-muted/50 hover:shadow-sm"
                      } ${overdue ? "border-rose-200 bg-rose-50 hover:bg-rose-50" : ""}`}
                      role="listitem"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className={`p-2.5 rounded-xl ${billTypeConfig.color}/10 flex-shrink-0`}>
                            <BillTypeIcon
                              className={`h-5 w-5 ${billTypeConfig.color.replace("bg-", "text-")}`}
                              aria-hidden="true"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <h4 className="font-semibold">{billTypeConfig.label}</h4>
                              {overdue ? (
                                <Badge variant="destructive" className="text-[10px] h-5 px-2">
                                  Overdue
                                </Badge>
                              ) : isUrgent ? (
                                <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 text-[10px] h-5 px-2">
                                  Due in {daysUntilDue} days
                                </Badge>
                              ) : null}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Bill #{bill.bill_number} • Due: {format(new Date(bill.due_date), "MMM d, yyyy")}
                            </p>
                            {bill.description && (
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{bill.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right min-w-[120px] flex-shrink-0">
                          <div className="font-black text-base sm:text-lg tabular-nums mb-2">
                            {formatCurrency(Number(bill.total_amount))}
                          </div>
                          <Button size="sm" className="w-full shadow-sm hover:shadow-md transition-shadow" asChild>
                            <Link href={`/citizen/payments/${bill.id}`}>
                              <CreditCard className="h-3 w-3 mr-1" aria-hidden="true" />
                              Pay Now
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>

              <div className="pt-4 border-t space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">Payment Status</span>
                  <Badge variant="outline" className="text-xs">
                    {onTimeCount}/{bills.length} not overdue
                  </Badge>
                </div>
                <Progress value={bills.length ? (onTimeCount / bills.length) * 100 : 0} className="h-2.5" />
              </div>
            </>
          )}
        </CardContent>

        {bills.length > 0 && (
          <CardFooter className="border-t px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <Button
              variant="outline"
              className="w-full sm:w-auto bg-transparent hover:bg-primary/5 transition-colors"
              asChild
            >
              <Link href="/citizen/payments">
                View and Pay All Bills
                <ArrowUpRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button variant="link" size="sm" className="justify-start hover:text-primary transition-colors" asChild>
              <Link href="/citizen/payments">View Payment History</Link>
            </Button>
          </CardFooter>
        )}
      </Card>
    </motion.div>
  )
}
